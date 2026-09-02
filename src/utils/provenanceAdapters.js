/**
 * provenanceAdapters.js — Non-Disruptive Provenance & Ingredient Line Adapters
 *
 * Transforms legacy, internal, USDA, and custom user ingredients into
 * standardized `ProvenanceReadyRecipeIngredientLine` data shapes.
 *
 * Invariants:
 * - Anti-Upgrade Rule: User-authored ingredients strictly map to "user_entered".
 * - Verification Rule: Internal ingredients require all 5 core nutrients to be "internal_verified".
 * - Missing Data is not Zero: Missing nutrient fields are preserved as null/undefined.
 * - No False GI: Missing GI is never coerced to 0 on carbohydrate contributors.
 * - Non-mutating: All transformation functions return fresh immutable objects.
 */

import { validateIngredientLine } from './provenanceEvaluator';

const OZ_TO_G = 28.3495;
const LB_TO_G = 453.592;
const CUP_TO_ML = 236.588;
const TBSP_TO_ML = 14.7868;
const TSP_TO_ML = 4.92892;
const FL_OZ_TO_ML = 29.5735;

/**
 * Normalizes culinary amounts and units to grams.
 *
 * @param {number} quantity - Culinary amount
 * @param {string} unit - Measurement unit (g, oz, cup, tbsp, tsp, piece, etc.)
 * @param {number} [densityGPerMl=1.0] - Optional liquid/bulk density
 * @param {number} [pieceWeightG=100] - Optional weight per discrete piece/unit
 * @returns {number|null} - Normalized grams or null if unconvertible
 */
export function normalizeUnitToGrams(quantity, unit, densityGPerMl = 1.0, pieceWeightG = 100) {
  const q = parseFloat(quantity);
  if (isNaN(q) || !isFinite(q) || q <= 0) {
    return null;
  }

  const u = String(unit || '').toLowerCase().trim();

  // Metric mass
  if (u === 'g' || u === 'gram' || u === 'grams') return q;
  if (u === 'mg' || u === 'milligram' || u === 'milligrams') return q / 1000;
  if (u === 'kg' || u === 'kilogram' || u === 'kilograms') return q * 1000;

  // Imperial mass
  if (u === 'oz' || u === 'ounce' || u === 'ounces') return q * OZ_TO_G;
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return q * LB_TO_G;

  // Volume conversions (scaled by density)
  const density = typeof densityGPerMl === 'number' && densityGPerMl > 0 ? densityGPerMl : 1.0;
  if (u === 'ml' || u === 'milliliter' || u === 'milliliters') return q * density;
  if (u === 'l' || u === 'liter' || u === 'liters') return q * 1000 * density;
  if (u === 'cup' || u === 'cups') return q * CUP_TO_ML * density;
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') return q * TBSP_TO_ML * density;
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') return q * TSP_TO_ML * density;
  if (u === 'fl oz' || u === 'floz') return q * FL_OZ_TO_ML * density;

  // Discrete culinary counts with reference weights
  if (u === 'clove' || u === 'cloves') return q * 3;
  if (u === 'bunch' || u === 'bunches') return q * 30;
  if (u === 'slice' || u === 'slices') return q * 30;
  if (u === 'piece' || u === 'pieces' || u === 'item' || u === 'items' || u === 'serving' || u === 'servings') {
    return q * (pieceWeightG > 0 ? pieceWeightG : 100);
  }

  return null;
}

/**
 * Maps raw nutrient field preserving null/undefined (missing is not zero).
 */
function mapNutrientVal(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isFinite(n) ? n : null;
}

/**
 * Validates if an ingredient object has all 5 complete numeric core nutrients.
 */
function hasCompleteCoreNutrition(ing) {
  if (!ing || typeof ing !== 'object') return false;
  const fields = ['kcal', 'protein', 'fat', 'carbs', 'fiber'];
  return fields.every((f) => typeof ing[f] === 'number' && isFinite(ing[f]) && ing[f] >= 0);
}

/**
 * Adapts an internal master ingredient into a ProvenanceReadyRecipeIngredientLine.
 *
 * @param {object} ingredient - Master or catalog ingredient from ingredientStore
 * @param {object} [lineDetails={}] - Line-specific quantity, unit, and id
 * @returns {object} - ProvenanceReadyRecipeIngredientLine
 */
export function adaptInternalIngredient(ingredient = {}, lineDetails = {}) {
  const quantity = parseFloat(lineDetails.quantity ?? lineDetails.amount ?? ingredient.defaultAmount ?? 100);
  const unit = lineDetails.unit || ingredient.defaultUnit || 'g';
  const pieceWeight = ingredient.defaultAmount && ingredient.defaultAmount > 0 ? ingredient.defaultAmount : 100;
  const normalizedGrams = normalizeUnitToGrams(quantity, unit, 1.0, pieceWeight);

  const isUserAuthored = Boolean(ingredient.isUserAuthored);
  const isCoreComplete = hasCompleteCoreNutrition(ingredient);

  // Anti-Upgrade Rule: User authored ingredients cannot be internal_verified
  let source = 'needs_review';
  if (isUserAuthored) {
    source = 'user_entered';
  } else if (isCoreComplete) {
    source = 'internal_verified';
  }

  const carbs = typeof ingredient.carbs === 'number' ? ingredient.carbs : 0;
  const isCarbContributor = carbs > 0.5;

  let giEvidenceStatus = 'needs_review';
  let glycemicIndex = null;

  if (!isCarbContributor) {
    giEvidenceStatus = 'not_applicable';
    glycemicIndex = typeof ingredient.glycemicIndex === 'number' ? ingredient.glycemicIndex : 0;
  } else if (typeof ingredient.glycemicIndex === 'number' && isFinite(ingredient.glycemicIndex) && ingredient.glycemicIndex >= 0) {
    giEvidenceStatus = 'available';
    glycemicIndex = ingredient.glycemicIndex;
  } else {
    giEvidenceStatus = 'unavailable';
    glycemicIndex = null;
  }

  const nutritionPer100g = {
    energyKcal: mapNutrientVal(ingredient.kcal),
    carbohydrateG: mapNutrientVal(ingredient.carbs),
    fiberG: mapNutrientVal(ingredient.fiber),
    proteinG: mapNutrientVal(ingredient.protein),
    fatG: mapNutrientVal(ingredient.fat),
    sugarsG: mapNutrientVal(ingredient.sugars) ?? undefined,
    sodiumMg: mapNutrientVal(ingredient.sodiumMg) ?? undefined,
  };

  const line = {
    id: lineDetails.id || `line_${ingredient.id || 'ing'}_${Date.now()}`,
    ingredientId: ingredient.id ? String(ingredient.id) : undefined,
    fdcId: ingredient.fdcId || undefined,
    displayName: ingredient.name || lineDetails.name || 'Unnamed Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source,
    sourceRetrievedAt: ingredient.updatedAt || undefined,
    sourceVersion: ingredient.version || '1.0',
    nutritionPer100g,
    glycemicIndex,
    giEvidenceStatus,
    validation: { status: 'complete', reasons: [] },
  };

  line.validation = validateIngredientLine(line);
  return line;
}

/**
 * Adapts a USDA FoodData Central item into a ProvenanceReadyRecipeIngredientLine.
 *
 * @param {object} usdaFood - Normalized USDA item from usdaClient.js
 * @param {object} [lineDetails={}] - Line-specific quantity, unit, and id
 * @param {number|null} [explicitGi=null] - Optional verified GI value
 * @returns {object} - ProvenanceReadyRecipeIngredientLine
 */
export function adaptUsdaFood(usdaFood = {}, lineDetails = {}, explicitGi = null) {
  const quantity = parseFloat(lineDetails.quantity ?? lineDetails.amount ?? 100);
  const unit = lineDetails.unit || 'g';
  const normalizedGrams = normalizeUnitToGrams(quantity, unit, 1.0, 100);

  const carbs = typeof usdaFood.carbs === 'number' ? usdaFood.carbs : 0;
  const isCarbContributor = carbs > 0.5;

  let giEvidenceStatus = 'unavailable';
  let glycemicIndex = null;

  if (!isCarbContributor) {
    giEvidenceStatus = 'not_applicable';
    glycemicIndex = 0;
  } else if (typeof explicitGi === 'number' && isFinite(explicitGi) && explicitGi >= 0) {
    giEvidenceStatus = 'available';
    glycemicIndex = explicitGi;
  }

  const nutritionPer100g = {
    energyKcal: mapNutrientVal(usdaFood.kcal),
    carbohydrateG: mapNutrientVal(usdaFood.carbs),
    fiberG: mapNutrientVal(usdaFood.fiber),
    proteinG: mapNutrientVal(usdaFood.protein),
    fatG: mapNutrientVal(usdaFood.fat),
    sugarsG: mapNutrientVal(usdaFood.sugars) ?? undefined,
    sodiumMg: mapNutrientVal(usdaFood.sodiumMg) ?? undefined,
  };

  const line = {
    id: lineDetails.id || `line_usda_${usdaFood.fdcId || Date.now()}`,
    ingredientId: undefined,
    fdcId: usdaFood.fdcId || undefined,
    displayName: usdaFood.description || lineDetails.name || 'USDA Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source: 'usda_fooddata_central',
    sourceRetrievedAt: new Date().toISOString(),
    sourceVersion: usdaFood.brandOwner || 'USDA FoodData Central',
    nutritionPer100g,
    glycemicIndex,
    giEvidenceStatus,
    validation: { status: 'complete', reasons: [] },
  };

  line.validation = validateIngredientLine(line);
  return line;
}

/**
 * Adapts a user-authored custom ingredient into a ProvenanceReadyRecipeIngredientLine.
 *
 * @param {object} customIngredient - Custom ingredient from user
 * @param {object} [lineDetails={}] - Line-specific quantity, unit, and id
 * @returns {object} - ProvenanceReadyRecipeIngredientLine
 */
export function adaptCustomIngredient(customIngredient = {}, lineDetails = {}) {
  const modifiedIngredient = {
    ...customIngredient,
    isUserAuthored: true, // Guarantees anti-upgrade rule
  };
  return adaptInternalIngredient(modifiedIngredient, lineDetails);
}

/**
 * Adapts legacy recipe line item, resolving ingredient data if resolver is provided.
 *
 * @param {object} rawLine - Legacy recipe line item
 * @param {Function} [resolveIngredient=null] - Lookup function (id) => ingredient
 * @returns {object} - ProvenanceReadyRecipeIngredientLine
 */
export function adaptLegacyRecipeLine(rawLine = {}, resolveIngredient = null) {
  if (!rawLine || typeof rawLine !== 'object') {
    return {
      id: 'invalid-line',
      displayName: 'Invalid Line',
      quantity: 0,
      unit: 'g',
      normalizedGrams: null,
      source: 'needs_review',
      giEvidenceStatus: 'unavailable',
      validation: {
        status: 'incomplete',
        reasons: ['Line item is not an object'],
      },
    };
  }

  // Check embedded ingredient payload first
  if (rawLine.ingredient && typeof rawLine.ingredient === 'object') {
    return adaptInternalIngredient(rawLine.ingredient, rawLine);
  }

  // Resolve via lookup
  const ingredientId = rawLine.ingredientId || rawLine.id;
  if (ingredientId && typeof resolveIngredient === 'function') {
    const resolved = resolveIngredient(String(ingredientId));
    if (resolved) {
      return adaptInternalIngredient(resolved, rawLine);
    }
  }

  // Fallback: unresolvable legacy line
  const quantity = parseFloat(rawLine.amount ?? rawLine.quantity ?? 0);
  const unit = rawLine.unit || 'g';
  const normalizedGrams = normalizeUnitToGrams(quantity, unit);

  const fallbackLine = {
    id: rawLine.id || `line_unresolved_${Date.now()}`,
    ingredientId: ingredientId ? String(ingredientId) : undefined,
    displayName: rawLine.name || rawLine.displayName || 'Unresolved Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source: 'needs_review',
    giEvidenceStatus: 'needs_review',
    validation: {
      status: 'incomplete',
      reasons: ['Ingredient data could not be resolved from catalog'],
    },
  };

  return fallbackLine;
}

export default {
  normalizeUnitToGrams,
  adaptInternalIngredient,
  adaptUsdaFood,
  adaptCustomIngredient,
  adaptLegacyRecipeLine,
};