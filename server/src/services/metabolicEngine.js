/**
 * metabolicEngine.js — Deterministic Metabolic Engine (Server / Node Edition)
 *
 * Implements exact medical-grade formulas for:
 *   Step 1: Net Carbs per Ingredient NC_i = max(0, Total Carbs - Fiber)
 *   Step 2: Effective GI (GI_effective) via Preparation Multipliers
 *   Step 3: Individual Glycemic Load GL_i = (GI_effective * NC_i) / 100
 *   Step 4: Composite Recipe GI_recipe = sum(GI_effective_i * (NC_i / NC_total))
 *   Step 5: Recipe GL per Serving GL_recipe = round((GI_recipe * (NC_total / Servings)) / 100)
 */

export const PREP_MULTIPLIERS = {
  raw: 1.00,
  steamed: 1.02,
  sauteed: 1.05,
  roasted: 1.15,
  boiled: 1.20,
  mashed_processed: 1.25,
  cooled: 0.85,
};

export function getPrepStateMultiplier(prepState) {
  if (!prepState) return 1.00;
  const key = String(prepState).toLowerCase().trim();
  return PREP_MULTIPLIERS[key] ?? 1.00;
}

export function safeNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export function calculateNetCarbs(carbs, fiber) {
  const c = safeNum(carbs);
  const f = safeNum(fiber);
  return Math.max(0, Math.round((c - f) * 10) / 10);
}

export function calculateIngredientGL(giEffective, netCarbs) {
  const gi = safeNum(giEffective);
  const nc = safeNum(netCarbs);
  if (nc <= 0 || gi <= 0) return 0;
  return (gi * nc) / 100;
}

/**
 * Deterministic Recipe Metabolic Calculator
 *
 * @param {Array<object>} ingredients — array of recipe ingredient items
 * @param {number} [servings=1] — target recipe serving count
 * @returns {object} — { kcal, protein, fat, carbs, fiber, netCarbs, glycemicIndex, glycemicLoad }
 */
export function calculateMetabolicProfile(ingredients = [], servings = 1) {
  const safeServings = Math.max(1, safeNum(servings));

  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalNetCarbs = 0;

  let weightedGISum = 0;
  let totalCarbWeight = 0;

  const list = Array.isArray(ingredients) ? ingredients : [];

  list.forEach(item => {
    if (!item) return;

    const ing = item.ingredient || item;
    const defaultAmount = safeNum(ing?.defaultAmount) || 100;
    const amount = safeNum(item?.amount);
    const ratio = defaultAmount > 0 ? (amount / defaultAmount) : 0;

    const carbs = safeNum(ing?.carbs ?? ing?.nutrition?.carbs) * ratio;
    const fiber = safeNum(ing?.fiber ?? ing?.nutrition?.fiber) * ratio;
    const nc = Math.max(0, carbs - fiber);

    const kcal = safeNum(ing?.kcal ?? ing?.nutrition?.kcal) * ratio;
    const protein = safeNum(ing?.protein ?? ing?.nutrition?.protein) * ratio;
    const fat = safeNum(ing?.fat ?? ing?.nutrition?.fat) * ratio;

    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalCarbs += carbs;
    totalFiber += fiber;
    totalNetCarbs += nc;

    // Glycemic Index & Prep Multiplier
    const baseGI = nc <= 0 ? 0 : safeNum(ing?.glycemicIndex ?? ing?.nutrition?.glycemicIndex);
    const prepMultiplier = getPrepStateMultiplier(item?.prepState || ing?.defaultPrepState || 'raw');
    const giEffective = nc <= 0 ? 0 : baseGI * prepMultiplier;

    if (nc > 0 && giEffective > 0) {
      weightedGISum += giEffective * nc;
      totalCarbWeight += nc;
    }
  });

  const roundedNetCarbs = Math.max(0, Math.round(totalNetCarbs * 10) / 10);

  let recipeGI = 0;
  if (totalCarbWeight > 0) {
    recipeGI = Math.round(weightedGISum / totalCarbWeight);
  }

  // Step 5: Recipe GL per Serving
  // GL_recipe = round((GI_recipe * (NC_total / Servings)) / 100)
  const netCarbsPerServing = roundedNetCarbs / safeServings;
  const recipeGLPerServing = Math.round((recipeGI * netCarbsPerServing) / 100);

  return {
    kcal: Math.round(totalKcal * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    netCarbs: roundedNetCarbs,
    glycemicIndex: recipeGI > 0 ? recipeGI : (roundedNetCarbs === 0 ? 0 : null),
    glycemicLoad: Math.max(0, recipeGLPerServing),
  };
}

export default {
  PREP_MULTIPLIERS,
  getPrepStateMultiplier,
  safeNum,
  calculateNetCarbs,
  calculateIngredientGL,
  calculateMetabolicProfile,
};
