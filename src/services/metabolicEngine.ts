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

export default {
  PREP_MULTIPLIERS,
  getPrepStateMultiplier,
  safeNum,
  roundToOneDecimal,
  calculateNetCarbs,
  calculateIngredientGL,
  calculateMetabolicProfile,
};
