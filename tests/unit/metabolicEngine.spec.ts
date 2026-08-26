import { describe, it, expect } from 'vitest';
import defaultEngine, {
  PREP_MULTIPLIERS,
  getPrepStateMultiplier,
  safeNum,
  roundToOneDecimal,
  calculateNetCarbs,
  calculateIngredientGL,
  calculateMetabolicProfile,
} from '@/services/metabolicEngine';

describe('Deterministic Metabolic Math Engine', () => {
  describe('safeNum and roundToOneDecimal utilities', () => {
    it('should parse valid numbers and fallback on invalid/null/undefined inputs', () => {
      expect(safeNum(42)).toBe(42);
      expect(safeNum('42.5')).toBe(42.5);
      expect(safeNum(null)).toBe(0);
      expect(safeNum(undefined)).toBe(0);
      expect(safeNum('', 10)).toBe(10);
      expect(safeNum(NaN, 5)).toBe(5);
      expect(safeNum('invalid', 3)).toBe(3);
    });

    it('should round numbers to one decimal place accurately', () => {
      expect(roundToOneDecimal(7.2222)).toBe(7.2);
      expect(roundToOneDecimal(7.2666)).toBe(7.3);
      expect(roundToOneDecimal(null)).toBe(0);
      expect(roundToOneDecimal(undefined)).toBe(0);
    });
  });

  describe('Net Carbs Non-Negative Clamping (NC = max(0, Carbs - Fiber))', () => {
    it('should calculate standard net carbs correctly when carbs > fiber', () => {
      const result = calculateNetCarbs(25.0, 5.0);
      expect(result).toBe(20.0);
    });

    it('should clamp net carbs to exactly 0.0g when fiber strictly exceeds total carbs', () => {
      const result = calculateNetCarbs(4.0, 7.0);
      expect(result).toBe(0.0);
      expect(Object.is(result, -0)).toBe(false);
    });

    it('should return 0.0g when both carbohydrates and fiber are 0g', () => {
      const result = calculateNetCarbs(0, 0);
      expect(result).toBe(0.0);
    });

    it('should handle decimal precision safely without floating point artifacts', () => {
      const result = calculateNetCarbs(10.3333, 3.1111);
      expect(result).toBe(7.2);
    });

    it('should handle null, undefined, and non-numeric inputs defensively', () => {
      expect(calculateNetCarbs(null, 5)).toBe(0.0);
      expect(calculateNetCarbs(undefined, undefined)).toBe(0.0);
      expect(calculateNetCarbs('not-a-number', 'invalid')).toBe(0.0);
    });
  });

  describe('Thermal Preparation Multipliers & Effective GI', () => {
    const baseGI = 50;

    it('should maintain 1.00x multiplier for Raw preparation state', () => {
      const multiplier = getPrepStateMultiplier('raw');
      expect(multiplier).toBe(1.00);
      expect(baseGI * multiplier).toBe(50.0);
    });

    it('should apply 1.02x multiplier for Steamed preparation state', () => {
      const multiplier = getPrepStateMultiplier('steamed');
      expect(multiplier).toBe(1.02);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(51.0);
    });

    it('should apply 1.05x multiplier for Sauteed preparation state', () => {
      const multiplier = getPrepStateMultiplier('sauteed');
      expect(multiplier).toBe(1.05);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(52.5);
    });

    it('should apply 1.15x multiplier for Roasted preparation state', () => {
      const multiplier = getPrepStateMultiplier('roasted');
      expect(multiplier).toBe(1.15);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(57.5);
    });

    it('should apply 1.20x multiplier for Boiled preparation state', () => {
      const multiplier = getPrepStateMultiplier('boiled');
      expect(multiplier).toBe(1.20);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(60.0);
    });

    it('should apply 1.25x multiplier for Mashed/Processed preparation state', () => {
      const multiplier = getPrepStateMultiplier('mashed_processed');
      expect(multiplier).toBe(1.25);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(62.5);
    });

    it('should apply 0.85x multiplier for Cooled state', () => {
      const multiplier = getPrepStateMultiplier('cooled');
      expect(multiplier).toBe(0.85);
      expect(Math.round(baseGI * multiplier * 10) / 10).toBe(42.5);
    });

    it('should fallback to 1.00x multiplier when prepState is unrecognized, empty, or undefined', () => {
      expect(getPrepStateMultiplier('')).toBe(1.00);
      expect(getPrepStateMultiplier(null)).toBe(1.00);
      expect(getPrepStateMultiplier(undefined)).toBe(1.00);
      expect(getPrepStateMultiplier('unknown_method')).toBe(1.00);
    });
  });

  describe('calculateIngredientGL helper', () => {
    it('should calculate ingredient GL correctly', () => {
      expect(calculateIngredientGL(50, 20)).toBe(10);
    });

    it('should return 0 when netCarbs <= 0 or giEffective <= 0', () => {
      expect(calculateIngredientGL(50, 0)).toBe(0);
      expect(calculateIngredientGL(50, -5)).toBe(0);
      expect(calculateIngredientGL(0, 20)).toBe(0);
      expect(calculateIngredientGL(-10, 20)).toBe(0);
    });
  });

  describe('Zero-Division Protection & Edge Case Trapping', () => {
    it('should return GI = 0 and GL = 0 without NaN or Infinity for zero-carb recipes', () => {
      const ribeyeRecipe = [
        {
          ingredient: {
            id: 'ing_steak',
            name: 'Ribeye Beef Steak',
            defaultAmount: 100,
            kcal: 250,
            protein: 26,
            fat: 17,
            carbs: 0,
            fiber: 0,
            glycemicIndex: 0,
          },
          amount: 250,
          prepState: 'sauteed',
        },
        {
          ingredient: {
            id: 'ing_oil',
            name: 'Extra Virgin Olive Oil',
            defaultAmount: 100,
            kcal: 884,
            protein: 0,
            fat: 100,
            carbs: 0,
            fiber: 0,
            glycemicIndex: 0,
          },
          amount: 15,
          prepState: 'raw',
        },
      ];

      const profile = calculateMetabolicProfile(ribeyeRecipe, 1);

      expect(profile.netCarbs).toBe(0);
      expect(profile.glycemicIndex).toBe(0);
      expect(profile.glycemicLoad).toBe(0);
      expect(Number.isNaN(profile.glycemicIndex)).toBe(false);
      expect(Number.isNaN(profile.glycemicLoad)).toBe(false);
      expect(Number.isFinite(profile.glycemicIndex)).toBe(true);
      expect(Number.isFinite(profile.glycemicLoad)).toBe(true);
    });

    it('should handle completely empty or non-array ingredient input safely', () => {
      const profileEmpty = calculateMetabolicProfile([], 1);
      expect(profileEmpty.netCarbs).toBe(0);

      const profileNull = calculateMetabolicProfile(null as unknown as any[], 1);
      expect(profileNull.netCarbs).toBe(0);
      expect(profileNull.glycemicIndex).toBe(0);
      expect(profileNull.glycemicLoad).toBe(0);
    });

    it('should handle null/empty items in ingredients array gracefully', () => {
      const dirtyArray = [null as any, undefined as any, {} as any];
      const profile = calculateMetabolicProfile(dirtyArray, 1);
      expect(profile.netCarbs).toBe(0);
      expect(profile.glycemicIndex).toBe(0);
      expect(profile.glycemicLoad).toBe(0);
    });

    it('should guard against serving counts <= 0 by clamping minimum servings to 1', () => {
      const simpleRecipe = [
        {
          ingredient: {
            id: 'ing_apple',
            name: 'Gala Apple',
            defaultAmount: 100,
            kcal: 52,
            protein: 0.3,
            fat: 0.2,
            carbs: 14.0,
            fiber: 2.4,
            glycemicIndex: 36,
          },
          amount: 100,
          prepState: 'raw',
        },
      ];

      const profileZeroServings = calculateMetabolicProfile(simpleRecipe, 0);
      const profileNegativeServings = calculateMetabolicProfile(simpleRecipe, -5);

      expect(profileZeroServings.netCarbs).toBe(11.6);
      expect(profileNegativeServings.netCarbs).toBe(11.6);
      expect(profileZeroServings.glycemicLoad).toBe(4);
    });

    it('should handle ingredient with zero GI and positive net carbs (recipeGI = null)', () => {
      const zeroGIRecipe = [
        {
          amount: 50,
          nutrition: {
            carbs: 10,
            fiber: 2,
            glycemicIndex: 0,
            kcal: 40,
            protein: 1,
            fat: 0,
          },
          defaultPrepState: 'steamed',
        },
      ];

      const profile = calculateMetabolicProfile(zeroGIRecipe, 1);
      expect(profile.netCarbs).toBe(4);
      expect(profile.glycemicIndex).toBe(null);
      expect(profile.glycemicLoad).toBe(0);
    });

    it('should handle nested ingredient with defaultPrepState and amount fallback', () => {
      const itemWithFallback = [
        {
          id: 'ing_raw_nut',
          amount: 0,
          defaultAmount: 0,
          defaultPrepState: 'roasted',
          nutrition: {
            carbs: 20,
            fiber: 5,
            glycemicIndex: 25,
            kcal: 100,
            protein: 5,
            fat: 10,
          },
        },
      ];

      const profile = calculateMetabolicProfile(itemWithFallback, 1);
      expect(profile.netCarbs).toBe(0);
    });
  });

  describe('Multi-Ingredient Scaling & Composite Glycemic Index', () => {
    it('should calculate weighted composite GI and scale macros across multi-serving portions', () => {
      const multiIngredientRecipe = [
        {
          ingredient: {
            id: 'farro',
            name: 'Farro',
            defaultAmount: 100,
            kcal: 170,
            protein: 6,
            fat: 1.5,
            carbs: 27,
            fiber: 4,
            glycemicIndex: 45,
          },
          amount: 200,
          prepState: 'boiled',
        },
        {
          ingredient: {
            id: 'broccoli',
            name: 'Broccoli Florets',
            defaultAmount: 100,
            kcal: 35,
            protein: 2.5,
            fat: 0.4,
            carbs: 7,
            fiber: 3,
            glycemicIndex: 15,
          },
          amount: 150,
          prepState: 'steamed',
        },
        {
          ingredient: {
            id: 'chicken',
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

      const profile = calculateMetabolicProfile(multiIngredientRecipe, 2);

      expect(profile.netCarbs).toBe(52.0);
      expect(profile.glycemicIndex).toBe(50);
      expect(profile.glycemicLoad).toBe(13);
      expect(profile.kcal).toBe(722.5);
      expect(profile.protein).toBe(77.8);
    });

    it('should verify default export object functionality', () => {
      expect(defaultEngine.PREP_MULTIPLIERS).toBe(PREP_MULTIPLIERS);
      expect(defaultEngine.getPrepStateMultiplier('raw')).toBe(1.00);
      expect(defaultEngine.safeNum('10')).toBe(10);
      expect(defaultEngine.roundToOneDecimal(5.55)).toBe(5.6);
      expect(defaultEngine.calculateNetCarbs(10, 2)).toBe(8);
      expect(defaultEngine.calculateIngredientGL(50, 10)).toBe(5);
      expect(typeof defaultEngine.calculateMetabolicProfile).toBe('function');
    });
  });
});
