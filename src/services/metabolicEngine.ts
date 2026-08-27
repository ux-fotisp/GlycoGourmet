/**
 * GlycoGourmet - Deterministic Metabolic Math Engine
 * Standardized Clinical Implementation
 */

export interface MacroNutrients {
  kcal?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  fiber?: number | null;
  netCarbs?: number | null;
  glycemicIndex?: number | null;
  glycemicLoad?: number | null;
}

export interface IngredientPayload {
  id?: string | number;
  name?: string;
  defaultAmount?: number;
  amount?: number;
  kcal?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  glycemicIndex?: number | null;
  nutrition?: MacroNutrients;
  defaultPrepState?: string;
}

export interface RecipeIngredientItem {
  ingredient?: IngredientPayload;
  amount?: number;
  prepState?: string;
  [key: string]: any;
}

export interface MetabolicProfileResult {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  netCarbs: number;
  glycemicIndex: number | null;
  glycemicLoad: number;
}

export const PREP_MULTIPLIERS: Record<string, number> = {
  raw: 1.00,
  steamed: 1.02,
  sauteed: 1.05,
  roasted: 1.15,
  boiled: 1.20,
  mashed_processed: 1.25,
  cooled: 0.85,
};

export function getPrepStateMultiplier(prepState?: string | null): number {
  if (!prepState) return 1.00;
  const key = String(prepState).toLowerCase().trim();
  return PREP_MULTIPLIERS[key] ?? 1.00;
}

export function safeNum(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export function roundToOneDecimal(val: any): number {
  const n = safeNum(val);
  return Math.round(n * 10) / 10;
}

export function calculateNetCarbs(carbs: any, fiber: any): number {
  const c = safeNum(carbs);
  const f = safeNum(fiber);
  return Math.max(0, Math.round((c - f) * 10) / 10);
}

export function calculateIngredientGL(giEffective: any, netCarbs: any): number {
  const gi = safeNum(giEffective);
  const nc = safeNum(netCarbs);
  if (nc <= 0 || gi <= 0) return 0;
  return (gi * nc) / 100;
}

export function calculateMetabolicProfile(
  ingredients: RecipeIngredientItem[] = [],
  servings: number = 1
): MetabolicProfileResult {
  const safeServings = Math.max(1, safeNum(servings, 1));
  const list = Array.isArray(ingredients) ? ingredients : [];

  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalNetCarbs = 0;

  let weightedGISum = 0;
  let totalCarbWeight = 0;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item) continue;

    const ing: IngredientPayload = (item.ingredient || item) as IngredientPayload;
    const defaultAmount = safeNum(ing.defaultAmount, 100);
    const rawAmount = safeNum(item.amount, 0);
    const ratio = defaultAmount > 0 ? (rawAmount / defaultAmount) : 0;

    const nutrition = ing.nutrition || ing;
    const carbs = safeNum(nutrition.carbs) * ratio;
    const fiber = safeNum(nutrition.fiber) * ratio;
    const nc = Math.max(0, carbs - fiber);

    const kcal = safeNum(nutrition.kcal) * ratio;
    const protein = safeNum(nutrition.protein) * ratio;
    const fat = safeNum(nutrition.fat) * ratio;

    totalKcal += kcal;
    totalProtein += protein;
    totalFat += fat;
    totalCarbs += carbs;
    totalFiber += fiber;
    totalNetCarbs += nc;

    const baseGI = safeNum(nutrition.glycemicIndex, 0);
    const prepKey = item.prepState || ing.defaultPrepState || 'raw';
    const multiplier = getPrepStateMultiplier(prepKey);
    const effectiveGI = nc <= 0 ? 0 : Math.min(100, Math.max(0, baseGI * multiplier));

    if (nc > 0 && effectiveGI > 0) {
      weightedGISum += effectiveGI * nc;
      totalCarbWeight += nc;
    }
  }

  const roundedNetCarbsTotal = Math.max(0, Math.round(totalNetCarbs * 10) / 10);

  let recipeGI: number | null = null;
  if (totalCarbWeight > 0) {
    recipeGI = Math.round(weightedGISum / totalCarbWeight);
  } else if (roundedNetCarbsTotal === 0) {
    recipeGI = 0;
  }

  const netCarbsPerServing = roundedNetCarbsTotal / safeServings;
  let recipeGLPerServing = 0;
  if (recipeGI !== null && recipeGI > 0 && netCarbsPerServing > 0) {
    recipeGLPerServing = Math.max(0, Math.round((recipeGI * netCarbsPerServing) / 100));
  }

  return {
    kcal: Math.round(totalKcal * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    netCarbs: roundedNetCarbsTotal,
    glycemicIndex: recipeGI,
    glycemicLoad: recipeGLPerServing,
  };
}


// ---------------------------------------------------------------------------
// 5. Plan-Level Clinical Rollup Types & Functions (Chunk 3)
// ---------------------------------------------------------------------------

/**
 * Aggregate daily metabolic profile: the standard MetabolicProfileResult
 * plus the cumulative daily Glycemic Load.
 */
export interface DailyRollupResult extends MetabolicProfileResult {
  cumulativeDailyGL: number;
}

/**
 * Weekly adherence summary comparing planned GL against clinical targets.
 */
export interface WeeklyAdherenceResult {
  daysOverBudget: number;
  avgDailyGL: number;
  adherencePercent: number;
}

/**
 * Serving-scale result: the recalculated profile plus the multiplier used
 * and the scaled ingredient list.
 */
export interface ServingScaleResult {
  profile: MetabolicProfileResult;
  scaledIngredients: RecipeIngredientItem[];
  multiplier: number;
}

/**
 * Minimal recipe shape required by the rollup functions.
 * Kept local to the engine to avoid circular imports with domain.ts.
 */
export interface RollupRecipe {
  id: string;
  servings: number;
  ingredients: RecipeIngredientItem[];
}

/**
 * calculateDailyRollup
 *
 * Aggregates metabolic profiles across all scheduled meal occasions for a
 * single day. Recomputes a carbohydrate-weighted composite Glycemic Load.
 *
 * @param scheduledSlotsForDay - Map of occasion to recipe ID (e.g. { breakfast: 'rec_1', lunch: 'rec_2' })
 * @param recipesMap           - Lookup map of recipe ID to full recipe object
 * @param servingsMultipliers  - Optional per-recipe-ID serving multiplier overrides
 * @returns DailyRollupResult  - Summed macros + composite GL for the day
 */
export function calculateDailyRollup(
  scheduledSlotsForDay: Partial<Record<string, string>>,
  recipesMap: Record<string, RollupRecipe>,
  servingsMultipliers?: Record<string, number>
): DailyRollupResult {
  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalNetCarbs = 0;

  let weightedGLSum = 0;
  let totalNetCarbWeight = 0;

  if (!scheduledSlotsForDay || typeof scheduledSlotsForDay !== 'object') {
    return {
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      glycemicIndex: null,
      glycemicLoad: 0,
      cumulativeDailyGL: 0,
    };
  }

  const slots = Object.entries(scheduledSlotsForDay);

  for (const [, recipeId] of slots) {
    if (!recipeId || typeof recipeId !== 'string') continue;

    const recipe = recipesMap[recipeId];
    if (!recipe || !recipe.ingredients) continue;

    // Determine effective servings
    const servingsMultiplier = servingsMultipliers?.[recipeId] ?? 1;
    const effectiveServings = Math.max(1, safeNum(recipe.servings, 1));

    // Calculate per-recipe metabolic profile using the existing engine function
    const profile = calculateMetabolicProfile(recipe.ingredients, effectiveServings);

    // Scale by the serving multiplier
    const scaledKcal = profile.kcal * servingsMultiplier;
    const scaledProtein = profile.protein * servingsMultiplier;
    const scaledFat = profile.fat * servingsMultiplier;
    const scaledCarbs = profile.carbs * servingsMultiplier;
    const scaledFiber = profile.fiber * servingsMultiplier;
    const scaledNetCarbs = profile.netCarbs * servingsMultiplier;
    const scaledGL = profile.glycemicLoad * servingsMultiplier;

    totalKcal += scaledKcal;
    totalProtein += scaledProtein;
    totalFat += scaledFat;
    totalCarbs += scaledCarbs;
    totalFiber += scaledFiber;
    totalNetCarbs += scaledNetCarbs;

    // Accumulate GL weighted by net carbs for composite calculation
    if (scaledNetCarbs > 0 && scaledGL > 0) {
      weightedGLSum += scaledGL * scaledNetCarbs;
      totalNetCarbWeight += scaledNetCarbs;
    }
  }

  // Composite day-level GL: carbohydrate-weighted average
  let cumulativeDailyGL = 0;
  if (totalNetCarbWeight > 0) {
    cumulativeDailyGL = Math.round(weightedGLSum / totalNetCarbWeight);
  }

  // Composite GI is not meaningful at the day level; set to null
  return {
    kcal: Math.round(totalKcal * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    netCarbs: Math.round(totalNetCarbs * 10) / 10,
    glycemicIndex: null,
    glycemicLoad: cumulativeDailyGL,
    cumulativeDailyGL,
  };
}

/**
 * calculateWeeklyAdherence
 *
 * Evaluates a prescribed meal plan against clinical GL targets.
 * Uses the pre-computed cumulativeDailyGL map from the plan.
 *
 * @param plan        - The prescribed meal plan with cumulativeDailyGL data
 * @param calibration - Object containing at least { glTargetDaily: number }
 * @returns WeeklyAdherenceResult
 */
export function calculateWeeklyAdherence(
  plan: { cumulativeDailyGL: Record<string, number | undefined> },
  calibration: { glTargetDaily: number }
): WeeklyAdherenceResult {
  const glTarget = safeNum(calibration.glTargetDaily, 0);

  const dailyGLEntries = Object.values(plan.cumulativeDailyGL || {}).filter(
    (v): v is number => v !== undefined && v !== null && Number.isFinite(v)
  );

  const totalActiveDays = dailyGLEntries.length;

  if (totalActiveDays === 0) {
    return {
      daysOverBudget: 0,
      avgDailyGL: 0,
      adherencePercent: 100,
    };
  }

  let daysOverBudget = 0;
  let glSum = 0;

  for (const dayGL of dailyGLEntries) {
    glSum += dayGL;
    if (dayGL > glTarget) {
      daysOverBudget++;
    }
  }

  const avgDailyGL = Math.round((glSum / totalActiveDays) * 10) / 10;
  const daysWithinBudget = totalActiveDays - daysOverBudget;
  const adherencePercent = Math.round((daysWithinBudget / totalActiveDays) * 1000) / 10;

  return {
    daysOverBudget,
    avgDailyGL,
    adherencePercent,
  };
}

/**
 * applyServingScale
 *
 * Scales ingredient amounts by a multiplier and recalculates the metabolic
 * profile. GI remains invariant (carb-weighted ratio); GL and NetCarbs
 * scale proportionally with the mass multiplier.
 *
 * @param recipeIngredients - The original ingredient list
 * @param multiplier        - Scale factor (0.5, 1, 1.5, or 2)
 * @returns ServingScaleResult
 */
export function applyServingScale(
  recipeIngredients: RecipeIngredientItem[],
  multiplier: 0.5 | 1 | 1.5 | 2
): ServingScaleResult {
  const ingredients = Array.isArray(recipeIngredients) ? recipeIngredients : [];

  // Deep-clone and scale each ingredient's amount
  const scaledIngredients: RecipeIngredientItem[] = ingredients.map((item) => {
    if (!item) return item;
    const cloned = { ...item };
    cloned.amount = safeNum(item.amount, 0) * multiplier;
    // Preserve original ingredient reference (not mutated)
    if (item.ingredient) {
      cloned.ingredient = { ...item.ingredient };
    }
    return cloned;
  });

  // Recalculate profile with scaled amounts (servings = 1 since amounts are pre-scaled)
  const profile = calculateMetabolicProfile(scaledIngredients, 1);

  return {
    profile,
    scaledIngredients,
    multiplier,
  };
}

export default {
  PREP_MULTIPLIERS,
  getPrepStateMultiplier,
  safeNum,
  roundToOneDecimal,
  calculateNetCarbs,
  calculateIngredientGL,
  calculateMetabolicProfile,
  calculateDailyRollup,
  calculateWeeklyAdherence,
  applyServingScale,
};
