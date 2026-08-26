// Ingredient registry is managed by ingredientStore.js — do not import ingredients.json here.
import { getIngredientById as _getIngredientById, getIngredientsRegistry, saveCustomIngredient as _saveCustomIngredient } from './ingredientStore';

// Re-export for external consumers (backward-compatible API)
export { getIngredientsRegistry as getIngredients, _getIngredientById as getIngredientById, _saveCustomIngredient as saveCustomIngredient };

/** Internal shorthand — used by calculateRecipeNutrition below */
const getIngredientById = _getIngredientById;

/**
 * Preparation state options and their GI multipliers.
 * Based on research: dry heat (roasting/baking) increases starch gelatinization → higher GI,
 * cooling after cooking (retrogradation) creates resistant starch → lower GI.
 */
export const PREP_STATES = [
  { value: 'raw',              label: 'Raw',              giMultiplier: 1.00, icon: 'eco' },
  { value: 'steamed',          label: 'Steamed',          giMultiplier: 1.02, icon: 'air' },
  { value: 'sauteed',          label: 'Sautéed',          giMultiplier: 1.05, icon: 'skillet' },
  { value: 'roasted',          label: 'Roasted',          giMultiplier: 1.15, icon: 'local_fire_department' },
  { value: 'boiled',           label: 'Boiled',           giMultiplier: 1.20, icon: 'water_drop' },
  { value: 'mashed_processed', label: 'Mashed/Processed', giMultiplier: 1.25, icon: 'blender' },
  { value: 'cooled',           label: 'Cooled',           giMultiplier: 0.85, icon: 'ac_unit' },
];

export const DEFAULT_PREP_STATE = 'raw';

/** Get the GI multiplier for a given prep state string */
export function getPrepStateMultiplier(prepState) {
  if (!prepState) return 1.0;
  const key = String(prepState).toLowerCase().trim();
  const found = PREP_STATES.find(p => p.value.toLowerCase() === key);
  return found ? found.giMultiplier : 1.0;
}

/** Get the display label for a prep state */
export function getPrepStateLabel(prepState) {
  const found = PREP_STATES.find(p => p.value === prepState);
  return found ? found.label : 'Raw';
}

/**
 * Safe numeric parser — returns 0 on any non-finite input.
 * Prevents NaN propagation from incomplete Strapi draft payloads.
 * @param {*} val
 * @returns {number}
 */
function safeNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = parseFloat(val);
  return isFinite(n) ? n : 0;
}

/**
 * Safe nullable numeric parser — returns null on any non-finite input.
 * Used for optional fields like glycemicIndex that distinguish "no data" from "zero".
 * @param {*} val
 * @returns {number|null}
 */
function safeNullableNum(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isFinite(n) ? n : null;
}

/**
 * Utility function returning Glycemic Load categorization and styling tokens.
 * - GL <= 10: "Low GL" (text-primary-fixed-dim / Sage Accent)
 * - GL 11-19: "Medium GL" (text-tertiary / Copper Accent)
 * - GL >= 20: "High GL" (text-error / High Warning Accent)
 *
 * @param {number|null|undefined} gl
 * @returns {{ category: string, label: string, colorClass: string, bgClass: string }}
 */
export function getGlycemicLoadCategory(gl) {
  const numericGL = safeNum(gl);
  if (numericGL <= 10) {
    return {
      category: 'Low GL',
      label: 'Low GL',
      colorClass: 'text-primary',
      bgClass: 'bg-primary-container/15',
    };
  }
  if (numericGL <= 19) {
    return {
      category: 'Medium GL',
      label: 'Medium GL',
      colorClass: 'text-tertiary',
      bgClass: 'bg-tertiary-container/15',
    };
  }
  return {
    category: 'High GL',
    label: 'High GL',
    colorClass: 'text-error',
    bgClass: 'bg-error-container/15',
  };
}

/**
 * Calculates aggregate nutrition for a recipe's ingredient array.
 *
 * Handles Strapi relational ingredient formats:
 *   - { ingredientId: string, amount: number, unit: string, prepState?: string }
 *   - { ingredient: { id: string }, amount: number, unit: string }
 *   - { id: string, amount: number, unit: string }
 *
 * Null-safety: uses optional chaining (?.) and `safeNum()` fallbacks so
 * incomplete draft payloads never trigger NaN errors or UI crashes.
 *
 * @param {Array<object>} recipeIngredients
 * @returns {object}
 */
export function calculateRecipeNutrition(recipeIngredients = []) {
  let kcal = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let netCarbs = 0;
  let fiber = 0;

  let totalCarbWeight = 0;
  let weightedGISum = 0;

  // Defensive check for array — Strapi may return null or undefined for empty drafts
  const ingredientsArray = Array.isArray(recipeIngredients) ? recipeIngredients : [];

  ingredientsArray.forEach(item => {
    if (!item) return;

    // Resolve ingredient ID across relational structures (flat ID, component ingredientId, or Strapi relation)
    const rawId = item.ingredientId || item.ingredient?.id || item.ingredient?.documentId || item.id;
    if (!rawId) return;

    const ingId = String(rawId);
    const ing = getIngredientById(ingId);
    if (!ing) return;

    // Calculate ratio relative to defaultAmount with null-safe parsing
    const defaultAmount = safeNum(ing?.defaultAmount) || 100;
    const amount = safeNum(item?.amount);
    const ratio = defaultAmount > 0 ? (amount / defaultAmount) : 0;

    // Accumulate basic macros with defensive null-safety
    const nutrition = ing?.nutrition;

    kcal += safeNum(nutrition?.kcal ?? ing?.kcal) * ratio;
    protein += safeNum(nutrition?.protein ?? ing?.protein) * ratio;
    fat += safeNum(nutrition?.fat ?? ing?.fat) * ratio;
    carbs += safeNum(nutrition?.carbs ?? ing?.carbs) * ratio;
    fiber += safeNum(nutrition?.fiber ?? ing?.fiber) * ratio;
    netCarbs += safeNum(nutrition?.netCarbs ?? ing?.netCarbs) * ratio;

    // Glycemic Index calculation
    let gi = safeNullableNum(nutrition?.glycemicIndex ?? ing?.glycemicIndex);

    // Apply prep-state adjustment to GI
    const prepMultiplier = getPrepStateMultiplier(
      item?.prepState || ing?.defaultPrepState || DEFAULT_PREP_STATE
    );
    if (gi !== null) {
      gi = gi * prepMultiplier;
    }

    const ingCarbs = safeNum(nutrition?.carbs ?? ing?.carbs) * ratio;

    if (gi !== null && gi !== undefined && ingCarbs > 0) {
      weightedGISum += gi * ingCarbs;
      totalCarbWeight += ingCarbs;
    }
  });

  // Calculate final GI
  let finalGI = null;
  if (totalCarbWeight > 0) {
    finalGI = weightedGISum / totalCarbWeight;
  }

  // Calculate GL: Math.round((finalGI * netCarbs) / 100)
  let finalGL = 0;
  if (finalGI !== null && netCarbs > 0) {
    finalGL = Math.round((finalGI * netCarbs) / 100);
  }

  const roundToOneDecimal = (val) => {
    if (val === null || val === undefined || !isFinite(val)) return 0;
    return Math.round(val * 10) / 10;
  };

  return {
    kcal: roundToOneDecimal(kcal),
    protein: roundToOneDecimal(protein),
    fat: roundToOneDecimal(fat),
    carbs: roundToOneDecimal(carbs),
    glycemicIndex: finalGI !== null ? roundToOneDecimal(finalGI) : null,
    glycemicLoad: Math.max(0, safeNum(finalGL)),
    netCarbs: roundToOneDecimal(netCarbs),
    fiber: roundToOneDecimal(fiber)
  };
}

export function scaleNutrition(nutrition, multiplier) {
  const roundToOneDecimal = (val) => {
    if (val === null || val === undefined || !isFinite(val)) return 0;
    return Math.round(val * 10) / 10;
  };

  const scaleValue = (val) => {
    const parsed = safeNum(val);
    return roundToOneDecimal(parsed * multiplier);
  };

  const giVal = safeNullableNum(nutrition?.glycemicIndex);
  const glVal = safeNum(nutrition?.glycemicLoad);

  return {
    kcal: scaleValue(nutrition?.kcal),
    protein: scaleValue(nutrition?.protein),
    fat: scaleValue(nutrition?.fat),
    carbs: scaleValue(nutrition?.carbs),
    glycemicIndex: giVal !== null ? roundToOneDecimal(giVal) : null,
    glycemicLoad: Math.round(glVal * multiplier),
    netCarbs: scaleValue(nutrition?.netCarbs),
    fiber: scaleValue(nutrition?.fiber)
  };
}
