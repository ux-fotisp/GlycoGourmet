import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateRecipeNutrition, scaleNutrition } from './nutritionCalculator';

// Mock ingredientStore registry lookup instead of legacy json
vi.mock('./ingredientStore', () => {
  const mockIngredients = [
    {
      id: 'atlantic-salmon',
      name: 'Atlantic Salmon',
      category: 'protein',
      defaultUnit: 'oz',
      defaultAmount: 6,
      kcal: 180,
      protein: 34,
      fat: 5,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      glycemicIndex: null,
      glycemicLoad: null,
      nutrition: {
        kcal: 180,
        protein: 34,
        fat: 5,
        carbs: 0,
        fiber: 0,
        netCarbs: 0,
        glycemicIndex: null,
        glycemicLoad: null,
      },
    },
    {
      id: 'quinoa',
      name: 'Quinoa',
      category: 'grain',
      defaultUnit: 'cup',
      defaultAmount: 0.5,
      kcal: 111,
      protein: 4,
      fat: 1.8,
      carbs: 20,
      fiber: 2.5,
      netCarbs: 17.5,
      glycemicIndex: 53,
      glycemicLoad: 9.3,
      nutrition: {
        kcal: 111,
        protein: 4,
        fat: 1.8,
        carbs: 20,
        fiber: 2.5,
        netCarbs: 17.5,
        glycemicIndex: 53,
        glycemicLoad: 9.3,
      },
    },
  ];

  return {
    getIngredientById: (id) => mockIngredients.find((i) => i.id === String(id)) || null,
    getIngredientsRegistry: () => mockIngredients,
    saveCustomIngredient: vi.fn(),
  };
});

describe('nutritionCalculator dynamic aggregation tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles null properties and missing macros safely without NaN or crashes', () => {
    const ingredients = [
      { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' }
    ];

    const result = calculateRecipeNutrition(ingredients);

    expect(result.kcal).toBe(180);
    expect(result.protein).toBe(34);
    expect(result.fat).toBe(5);
    expect(result.carbs).toBe(0);
    expect(result.glycemicIndex).toBeNull();
    expect(result.glycemicLoad).toBe(0);
  });

  it('calculates weighted glycemic index correctly based on carb contribution', () => {
    const ingredients = [
      { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' },
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup' }
    ];

    const result = calculateRecipeNutrition(ingredients);

    expect(result.glycemicIndex).toBe(53);
    expect(result.glycemicLoad).toBe(9);
  });

  it('scales quantitative components accurately on multi-serving multipliers', () => {
    const baseNutrition = {
      kcal: 100,
      protein: 10,
      fat: 2,
      carbs: 15,
      glycemicIndex: 50,
      glycemicLoad: 5,
      netCarbs: 10,
      fiber: 5
    };

    const result2x = scaleNutrition(baseNutrition, 2);
    expect(result2x.kcal).toBe(200);
    expect(result2x.protein).toBe(20);
    expect(result2x.fat).toBe(4);
    expect(result2x.carbs).toBe(30);
    expect(result2x.glycemicIndex).toBe(50);
    expect(result2x.glycemicLoad).toBe(10);

    const result4x = scaleNutrition(baseNutrition, 4);
    expect(result4x.kcal).toBe(400);
    expect(result4x.glycemicIndex).toBe(50);
    expect(result4x.glycemicLoad).toBe(20);
  });

  it('applies prep state GI multipliers correctly (e.g. roasted vs cooled)', () => {
    const rawResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'raw' }
    ]);
    expect(rawResult.glycemicIndex).toBe(53);

    const roastedResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'roasted' }
    ]);
    expect(roastedResult.glycemicIndex).toBe(61);

    const cooledResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'cooled' }
    ]);
    expect(cooledResult.glycemicIndex).toBe(45.1);
  });
});
