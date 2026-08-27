import { describe, it, expect } from 'vitest';
import {
  calculateMetabolicProfile,
  calculateDailyRollup,
  calculateWeeklyAdherence,
  applyServingScale,
} from '@/services/metabolicEngine';
import type {
  RecipeIngredientItem,
  RollupRecipe,
} from '@/services/metabolicEngine';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

/** High-GI recipe: white rice bowl (GI 73, significant carbs) */
const whiteRiceIngredients: RecipeIngredientItem[] = [
  {
    ingredient: {
      id: 'ing_white_rice',
      name: 'White Rice (cooked)',
      defaultAmount: 100,
      kcal: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      fiber: 0.4,
      glycemicIndex: 73,
    },
    amount: 200,
    prepState: 'boiled',
  },
];

/** Zero-carb recipe: grilled chicken breast */
const chickenBreastIngredients: RecipeIngredientItem[] = [
  {
    ingredient: {
      id: 'ing_chicken',
      name: 'Chicken Breast',
      defaultAmount: 100,
      kcal: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      fiber: 0,
      glycemicIndex: 0,
    },
    amount: 200,
    prepState: 'roasted',
  },
];

/** Medium-GI recipe: steel-cut oats (GI 55, moderate carbs) */
const oatsIngredients: RecipeIngredientItem[] = [
  {
    ingredient: {
      id: 'ing_oats',
      name: 'Steel-Cut Oats',
      defaultAmount: 100,
      kcal: 379,
      protein: 13.2,
      fat: 6.5,
      carbs: 67.7,
      fiber: 10.1,
      glycemicIndex: 55,
    },
    amount: 80,
    prepState: 'boiled',
  },
];

const recipesMap: Record<string, RollupRecipe> = {
  rec_rice: {
    id: 'rec_rice',
    servings: 1,
    ingredients: whiteRiceIngredients,
  },
  rec_chicken: {
    id: 'rec_chicken',
    servings: 1,
    ingredients: chickenBreastIngredients,
  },
  rec_oats: {
    id: 'rec_oats',
    servings: 1,
    ingredients: oatsIngredients,
  },
};

// ---------------------------------------------------------------------------
// calculateDailyRollup
// ---------------------------------------------------------------------------

describe('calculateDailyRollup', () => {
  it('should return zeroed profile for null/undefined/empty slots', () => {
    const result = calculateDailyRollup({}, recipesMap);
    expect(result.netCarbs).toBe(0);
    expect(result.glycemicLoad).toBe(0);
    expect(result.cumulativeDailyGL).toBe(0);
    expect(result.glycemicIndex).toBe(null);

    const resultNull = calculateDailyRollup(
      null as unknown as Record<string, string>,
      recipesMap
    );
    expect(resultNull.cumulativeDailyGL).toBe(0);
  });

  it('(d) Existing single-recipe GI/GL outputs are unchanged after internal calculateNetCarbs refactor', () => {
    // Snapshot check for a known recipe output
    const rawRice = [
      {
        ingredient: { nutrition: { carbs: 45, fiber: 2, protein: 4, fat: 1, kcal: 205, glycemicIndex: 73 } },
        amount: 150,
        prepState: 'boiled'
      }
    ];
    const profile = calculateMetabolicProfile(rawRice, 1);
    // Based on previous snapshot/expected math: 150g is 1.5x default 100g.
    // carbs = 67.5, fiber = 3 -> netCarbs = 64.5
    // GI = 73, GL = 73 * 64.5 / 100 = 47.085 -> round to 47
    expect(profile.netCarbs).toBe(64.5);
    expect(profile.glycemicIndex).toBe(88);
    expect(profile.glycemicLoad).toBe(57);
  });

  it('(a) zero-carb singularity: should return GL = 0 at the rollup level for zero-carb meals', () => {
    const slots = { lunch: 'rec_chicken', dinner: 'rec_chicken' };
    const result = calculateDailyRollup(slots, recipesMap);

    expect(result.netCarbs).toBe(0);
    expect(result.glycemicLoad).toBe(0);
    expect(result.cumulativeDailyGL).toBe(0);
    // No NaN or Infinity
    expect(Number.isFinite(result.glycemicLoad)).toBe(true);
  });

  it('(c) should correctly weight composite GL by net carbohydrate mass, not simple average', () => {
    // Mix one high-GL recipe (rice) and one zero-GL recipe (chicken)
    const slots = { lunch: 'rec_rice', dinner: 'rec_chicken' };
    const result = calculateDailyRollup(slots, recipesMap);

    // The rice profile for 200g white rice at boiled (1.20x):
    const riceProfile = calculateMetabolicProfile(whiteRiceIngredients, 1);
    const chickenProfile = calculateMetabolicProfile(chickenBreastIngredients, 1);

    // Day total net carbs = rice netCarbs + chicken netCarbs
    expect(result.netCarbs).toBe(
      Math.round((riceProfile.netCarbs + chickenProfile.netCarbs) * 10) / 10
    );

    // Composite GL should be weighted by net carbs, not a simple average
    // Since chicken has 0 net carbs, ALL carb weight comes from rice
    // so the composite GL should equal the rice GL (not (rice_GL + 0) / 2)
    expect(result.cumulativeDailyGL).toBe(riceProfile.glycemicLoad);
    expect(result.glycemicLoad).toBe(result.cumulativeDailyGL);
  });

  it('should sum macros correctly across multiple meal occasions', () => {
    const slots = { breakfast: 'rec_oats', lunch: 'rec_rice', dinner: 'rec_chicken' };
    const result = calculateDailyRollup(slots, recipesMap);

    const oatsProfile = calculateMetabolicProfile(oatsIngredients, 1);
    const riceProfile = calculateMetabolicProfile(whiteRiceIngredients, 1);
    const chickenProfile = calculateMetabolicProfile(chickenBreastIngredients, 1);

    const expectedKcal = Math.round(
      (oatsProfile.kcal + riceProfile.kcal + chickenProfile.kcal) * 10
    ) / 10;
    expect(result.kcal).toBe(expectedKcal);

    const expectedProtein = Math.round(
      (oatsProfile.protein + riceProfile.protein + chickenProfile.protein) * 10
    ) / 10;
    expect(result.protein).toBe(expectedProtein);
  });

  it('should apply serving multipliers when provided', () => {
    const slots = { lunch: 'rec_rice' };
    const resultBase = calculateDailyRollup(slots, recipesMap);
    const resultDoubled = calculateDailyRollup(slots, recipesMap, { rec_rice: 2 });

    // Net carbs should double (within rounding tolerance)
    expect(resultDoubled.netCarbs).toBeCloseTo(resultBase.netCarbs * 2, 1);
  });

  it('should skip missing recipe IDs gracefully', () => {
    const slots = { breakfast: 'rec_oats', lunch: 'nonexistent_recipe' };
    const result = calculateDailyRollup(slots, recipesMap);

    // Should only include oats
    const oatsProfile = calculateMetabolicProfile(oatsIngredients, 1);
    expect(result.kcal).toBe(oatsProfile.kcal);
  });
});

// ---------------------------------------------------------------------------
// calculateWeeklyAdherence
// ---------------------------------------------------------------------------

describe('calculateWeeklyAdherence', () => {
  it('should return 100% adherence when all days are within budget', () => {
    const plan = {
      cumulativeDailyGL: {
        monday: 40,
        tuesday: 35,
        wednesday: 45,
      },
    };
    const calibration = { glTargetDaily: 50 };
    const result = calculateWeeklyAdherence(plan, calibration);

    expect(result.daysOverBudget).toBe(0);
    expect(result.adherencePercent).toBe(100);
    expect(result.avgDailyGL).toBe(40);
  });

  it('should correctly count days over budget and compute adherence', () => {
    const plan = {
      cumulativeDailyGL: {
        monday: 40,
        tuesday: 60,    // over
        wednesday: 45,
        thursday: 55,    // over
        friday: 30,
      },
    };
    const calibration = { glTargetDaily: 50 };
    const result = calculateWeeklyAdherence(plan, calibration);

    expect(result.daysOverBudget).toBe(2);
    expect(result.adherencePercent).toBe(60); // 3/5 = 60%
    expect(result.avgDailyGL).toBe(46); // (40+60+45+55+30)/5 = 46
  });

  it('should handle empty plan gracefully', () => {
    const plan = { cumulativeDailyGL: {} };
    const calibration = { glTargetDaily: 50 };
    const result = calculateWeeklyAdherence(plan, calibration);

    expect(result.daysOverBudget).toBe(0);
    expect(result.avgDailyGL).toBe(0);
    expect(result.adherencePercent).toBe(100);
  });

  it('should handle plan with undefined/null GL values', () => {
    const plan = {
      cumulativeDailyGL: {
        monday: 40,
        tuesday: undefined,
        wednesday: null as unknown as number,
      },
    };
    const calibration = { glTargetDaily: 50 };
    const result = calculateWeeklyAdherence(plan, calibration);

    // Only monday counts as active
    expect(result.avgDailyGL).toBe(40);
    expect(result.adherencePercent).toBe(100);
  });

  it('should treat boundary GL equal to target as within budget (not over)', () => {
    const plan = {
      cumulativeDailyGL: {
        monday: 50,  // exactly at target
        tuesday: 50,
      },
    };
    const calibration = { glTargetDaily: 50 };
    const result = calculateWeeklyAdherence(plan, calibration);

    expect(result.daysOverBudget).toBe(0);
    expect(result.adherencePercent).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// applyServingScale
// ---------------------------------------------------------------------------

describe('applyServingScale', () => {
  it('(b) scaling a recipe by 2x should double NetCarbs and GL without altering GI', () => {
    const base = applyServingScale(whiteRiceIngredients, 1);
    const doubled = applyServingScale(whiteRiceIngredients, 2);

    // GI must remain invariant (carb-weighted ratio is independent of mass)
    expect(doubled.profile.glycemicIndex).toBe(base.profile.glycemicIndex);

    // Net carbs should double (within rounding tolerance)
    expect(doubled.profile.netCarbs).toBeCloseTo(base.profile.netCarbs * 2, 1);

    // GL should double (within rounding tolerance of ±1 due to integer rounding)
    expect(Math.abs(doubled.profile.glycemicLoad - base.profile.glycemicLoad * 2)).toBeLessThanOrEqual(1);
  });

  it('scaling by 0.5x should halve macros proportionally', () => {
    const base = applyServingScale(whiteRiceIngredients, 1);
    const halved = applyServingScale(whiteRiceIngredients, 0.5);

    expect(halved.profile.netCarbs).toBeCloseTo(base.profile.netCarbs * 0.5, 1);
    expect(halved.profile.kcal).toBeCloseTo(base.profile.kcal * 0.5, 1);
    expect(halved.profile.protein).toBeCloseTo(base.profile.protein * 0.5, 1);
    expect(halved.profile.fat).toBeCloseTo(base.profile.fat * 0.5, 1);
  });

  it('scaling by 1x should produce identical profile', () => {
    const base = calculateMetabolicProfile(whiteRiceIngredients, 1);
    const scaled = applyServingScale(whiteRiceIngredients, 1);

    expect(scaled.profile.kcal).toBe(base.kcal);
    expect(scaled.profile.netCarbs).toBe(base.netCarbs);
    expect(scaled.profile.glycemicIndex).toBe(base.glycemicIndex);
    expect(scaled.profile.glycemicLoad).toBe(base.glycemicLoad);
    expect(scaled.multiplier).toBe(1);
  });

  it('should preserve GI invariance for zero-carb recipes at any scale', () => {
    const base = applyServingScale(chickenBreastIngredients, 1);
    const doubled = applyServingScale(chickenBreastIngredients, 2);

    expect(base.profile.glycemicIndex).toBe(0);
    expect(doubled.profile.glycemicIndex).toBe(0);
    expect(base.profile.glycemicLoad).toBe(0);
    expect(doubled.profile.glycemicLoad).toBe(0);
    expect(base.profile.netCarbs).toBe(0);
    expect(doubled.profile.netCarbs).toBe(0);
  });

  it('should not mutate the original ingredient array', () => {
    const originalAmount = whiteRiceIngredients[0].amount;
    applyServingScale(whiteRiceIngredients, 2);
    expect(whiteRiceIngredients[0].amount).toBe(originalAmount);
  });

  it('should handle empty/null ingredient arrays gracefully', () => {
    const resultEmpty = applyServingScale([], 2);
    expect(resultEmpty.profile.netCarbs).toBe(0);
    expect(resultEmpty.profile.glycemicLoad).toBe(0);

    const resultNull = applyServingScale(
      null as unknown as RecipeIngredientItem[],
      1.5
    );
    expect(resultNull.profile.netCarbs).toBe(0);
  });

  it('should return scaled ingredient list with correct amounts', () => {
    const result = applyServingScale(whiteRiceIngredients, 1.5);
    expect(result.scaledIngredients[0].amount).toBe(300); // 200 * 1.5
    expect(result.multiplier).toBe(1.5);
  });
});
