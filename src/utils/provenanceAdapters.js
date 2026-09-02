/**
 * provenanceAdapters.js — Non-Disruptive Provenance & Ingredient Line Adapters
 *
 * Transforms legacy, internal, USDA, and custom user ingredients into
 * standardized `ProvenanceReadyRecipeIngredientLine` data shapes.
 *
 * Provenance & Line Identity Architecture:
 * - `ingredientId` / `fdcId` identify the underlying biological food source / composition catalog entity.
 * - `line.id` identifies a specific recipe occurrence / line-item instance in a recipe.
 * - Precedence: `lineDetails.id` is the canonical recipe-line ID when supplied.
 * - Fallback: When no line ID is passed, adapters assign a deterministic, time-independent
 *   fallback ID (e.g. `line_internal_${ingredient.id}`) for read-only / preview adaptation, and
 *   attach an explicit identity warning (`Recipe line requires a persistent unique line ID before editing or saving.`).
 * - Future workflow: Recipe editor and draft persistence code will generate unique per-line IDs at user action time.
 *
 * Invariants:
 * - Anti-Upgrade Rule: User-authored ingredients strictly map to "user_entered".
 * - Verification Rule: Internal ingredients require all 5 core nutrients to be "internal_verified".
 * - Missing Data is not Zero: Missing nutrient fields are preserved as null/undefined.
 * - GI Not Applicable: Non-carbohydrate lines (carbs <= 0.5g) receive glycemicIndex: null and giEvidenceStatus: "not_applicable".
 * - No False GI: Missing GI is never coerced to 0 on carbohydrate contributors.
 * - Non-fabrication of mass: Volume units require explicit densityGPerMl; count units require explicit pieceWeightG.
 * - Determinism: Pure transformations with no Date.now(), new Date(), random values, or global state.
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
 * Rules:
 * 1. Mass units (g, mg, kg, oz, lb) normalize directly and deterministically.
 * 2. Volume units (ml, l, cup, tbsp, tsp, fl oz) normalize ONLY when a valid densityGPerMl (> 0) is supplied.
 * 3. Count units (piece, item, serving, slice, clove, bunch, etc.) normalize ONLY when a valid pieceWeightG (> 0) is supplied.
 * 4. In all other cases (missing/invalid conversion metadata or unrecognized unit), returns null.
 *
 * @param {number} quantity - Culinary amount
 * @param {string} unit - Measurement unit (g, oz, cup, tbsp, tsp, piece, etc.)
 * @param {number} [densityGPerMl] - Optional ingredient-specific liquid/bulk density in g/ml
 * @param {number} [pieceWeightG] - Optional ingredient-specific weight per discrete unit in grams
 * @returns {number|null} - Normalized grams or null if unconvertible
 */
export function normalizeUnitToGrams(quantity, unit, densityGPerMl, pieceWeightG) {
  const q = parseFloat(quantity);
  if (isNaN(q) || !isFinite(q) || q <= 0) {
    return null;
  }

  const u = String(unit || '').toLowerCase().trim();

  // 1. Metric mass (direct conversion)
  if (u === 'g' || u === 'gram' || u === 'grams') return q;
  if (u === 'mg' || u === 'milligram' || u === 'milligrams') return q / 1000;
  if (u === 'kg' || u === 'kilogram' || u === 'kilograms') return q * 1000;

  // 2. Imperial mass (direct conversion)
  if (u === 'oz' || u === 'ounce' || u === 'ounces') return q * OZ_TO_G;
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return q * LB_TO_G;

  // 3. Volume conversions (requires explicit valid densityGPerMl)
  const hasValidDensity = typeof densityGPerMl === 'number' && isFinite(densityGPerMl) && densityGPerMl > 0;
  if (hasValidDensity) {
    if (u === 'ml' || u === 'milliliter' || u === 'milliliters') return q * densityGPerMl;
    if (u === 'l' || u === 'liter' || u === 'liters') return q * 1000 * densityGPerMl;
    if (u === 'cup' || u === 'cups') return q * CUP_TO_ML * densityGPerMl;
    if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') return q * TBSP_TO_ML * densityGPerMl;
    if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') return q * TSP_TO_ML * densityGPerMl;
    if (u === 'fl oz' || u === 'floz') return q * FL_OZ_TO_ML * densityGPerMl;
  }

  // 4. Discrete culinary counts (requires explicit valid pieceWeightG)
  const hasValidPieceWeight = typeof pieceWeightG === 'number' && isFinite(pieceWeightG) && pieceWeightG > 0;
  if (hasValidPieceWeight) {
    if (
      u === 'piece' || u === 'pieces' ||
      u === 'item' || u === 'items' ||
      u === 'serving' || u === 'servings' ||
      u === 'slice' || u === 'slices' ||
      u === 'clove' || u === 'cloves' ||
      u === 'bunch' || u === 'bunches'
    ) {
      return q * pieceWeightG;
    }
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

  const density = typeof lineDetails.densityGPerMl === 'number' && lineDetails.densityGPerMl > 0
    ? lineDetails.densityGPerMl
    : (typeof ingredient.densityGPerMl === 'number' && ingredient.densityGPerMl > 0 ? ingredient.densityGPerMl : undefined);

  const pieceWeight = typeof lineDetails.pieceWeightG === 'number' && lineDetails.pieceWeightG > 0
    ? lineDetails.pieceWeightG
    : (typeof ingredient.pieceWeightG === 'number' && ingredient.pieceWeightG > 0 ? ingredient.pieceWeightG : undefined);

  const normalizedGrams = normalizeUnitToGrams(quantity, unit, density, pieceWeight);

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
    glycemicIndex = null; // Non-carb ingredients have no GI basis; sentinel 0 is never used
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

  // Recipe-line identity vs Food source identity
  const hasExplicitLineId = Boolean(lineDetails.id && typeof lineDetails.id === 'string' && lineDetails.id.trim().length > 0);
  const lineId = hasExplicitLineId ? lineDetails.id : (ingredient.id ? 'line_internal_' + ingredient.id : 'line_unidentified_internal');
  const isFallbackId = !hasExplicitLineId;

  const sourceRetrievedAt = lineDetails.sourceRetrievedAt || ingredient.sourceRetrievedAt || ingredient.updatedAt || undefined;

  const line = {
    id: lineId,
    ingredientId: ingredient.id ? String(ingredient.id) : undefined,
    fdcId: ingredient.fdcId || undefined,
    displayName: ingredient.name || lineDetails.name || 'Unnamed Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source,
    sourceRetrievedAt,
    sourceVersion: ingredient.version || '1.0',
    nutritionPer100g,
    glycemicIndex,
    giEvidenceStatus,
    isFallbackId,
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

  const density = typeof lineDetails.densityGPerMl === 'number' && lineDetails.densityGPerMl > 0
    ? lineDetails.densityGPerMl
    : (typeof usdaFood.densityGPerMl === 'number' && usdaFood.densityGPerMl > 0 ? usdaFood.densityGPerMl : undefined);

  const pieceWeight = typeof lineDetails.pieceWeightG === 'number' && lineDetails.pieceWeightG > 0
    ? lineDetails.pieceWeightG
    : (typeof usdaFood.pieceWeightG === 'number' && usdaFood.pieceWeightG > 0 ? usdaFood.pieceWeightG : undefined);

  const normalizedGrams = normalizeUnitToGrams(quantity, unit, density, pieceWeight);

  const carbs = typeof usdaFood.carbs === 'number' ? usdaFood.carbs : 0;
  const isCarbContributor = carbs > 0.5;

  let giEvidenceStatus = 'unavailable';
  let glycemicIndex = null;

  if (!isCarbContributor) {
    giEvidenceStatus = 'not_applicable';
    glycemicIndex = null; // Non-carb ingredients have no GI basis; sentinel 0 is never used
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

  // Recipe-line identity vs Food source identity
  const hasExplicitLineId = Boolean(lineDetails.id && typeof lineDetails.id === 'string' && lineDetails.id.trim().length > 0);
  const lineId = hasExplicitLineId ? lineDetails.id : (usdaFood.fdcId ? 'line_usda_' + usdaFood.fdcId : 'line_unidentified_usda');
  const isFallbackId = !hasExplicitLineId;

  const sourceRetrievedAt = lineDetails.sourceRetrievedAt || usdaFood.sourceRetrievedAt || usdaFood.retrievedAt || undefined;

  const line = {
    id: lineId,
    ingredientId: undefined,
    fdcId: usdaFood.fdcId || undefined,
    displayName: usdaFood.description || lineDetails.name || 'USDA Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source: 'usda_fooddata_central',
    sourceRetrievedAt,
    sourceVersion: usdaFood.brandOwner || 'USDA FoodData Central',
    nutritionPer100g,
    glycemicIndex,
    giEvidenceStatus,
    isFallbackId,
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
      id: 'line_unresolved_invalid',
      displayName: 'Invalid Line',
      quantity: 0,
      unit: 'g',
      normalizedGrams: null,
      source: 'needs_review',
      giEvidenceStatus: 'unavailable',
      isFallbackId: true,
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
  const density = typeof rawLine.densityGPerMl === 'number' && rawLine.densityGPerMl > 0 ? rawLine.densityGPerMl : undefined;
  const pieceWeight = typeof rawLine.pieceWeightG === 'number' && rawLine.pieceWeightG > 0 ? rawLine.pieceWeightG : undefined;
  const normalizedGrams = normalizeUnitToGrams(quantity, unit, density, pieceWeight);

  const hasExplicitLineId = Boolean(rawLine.id && typeof rawLine.id === 'string' && rawLine.id !== rawLine.ingredientId);
  const fallbackLineId = hasExplicitLineId ? rawLine.id : (ingredientId ? 'line_unresolved_' + ingredientId : 'line_unresolved_unknown');
  const isFallbackId = !hasExplicitLineId;

  const fallbackLine = {
    id: fallbackLineId,
    ingredientId: ingredientId ? String(ingredientId) : undefined,
    displayName: rawLine.name || rawLine.displayName || 'Unresolved Ingredient',
    quantity: isNaN(quantity) ? 0 : quantity,
    unit,
    normalizedGrams,
    source: 'needs_review',
    giEvidenceStatus: 'needs_review',
    isFallbackId,
    validation: {
      status: 'incomplete',
      reasons: ['Ingredient data could not be resolved from catalog'],
    },
  };

  if (isFallbackId) {
    fallbackLine.validation.reasons.push('Recipe line requires a persistent unique line ID before editing or saving.');
  }

  return fallbackLine;
}

export const adaptInternalIngredientToProvenanceLine = adaptInternalIngredient;
export const adaptUsdaResultToProvenanceLine = adaptUsdaFood;
export const adaptCustomIngredientToProvenanceLine = adaptCustomIngredient;
export const adaptLegacyRecipeIngredientLine = adaptLegacyRecipeLine;

export default {
  normalizeUnitToGrams,
  adaptInternalIngredient,
  adaptUsdaFood,
  adaptCustomIngredient,
  adaptLegacyRecipeLine,
  adaptInternalIngredientToProvenanceLine,
  adaptUsdaResultToProvenanceLine,
  adaptCustomIngredientToProvenanceLine,
  adaptLegacyRecipeIngredientLine,
};
