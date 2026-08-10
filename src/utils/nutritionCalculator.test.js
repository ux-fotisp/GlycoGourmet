import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateRecipeNutrition, scaleNutrition } from './nutritionCalculator';

// Mock ingredients database with specific parameters required by the prompt
vi.mock('../data/ingredients.json', () => {
  return {
    default: [
      {
        id: 'atlantic-salmon',
        name: 'Atlantic Salmon',
        category: 'protein',
        defaultUnit: 'oz',
        defaultAmount: 6,
        nutrition: {
          kcal: 180,
          protein: 34,
          fat: 5,
          carbs: 0,
          fiber: 0,
          netCarbs: 0,
          glycemicIndex: null,
          glycemicLoad: null
        }
      },
      {
        id: 'quinoa',
        name: 'Quinoa',
        category: 'grain',
        defaultUnit: 'cup',
        defaultAmount: 0.5,
        nutrition: {
          kcal: 111,
          protein: 4,
          fat: 1.8,
          carbs: 20,
          fiber: 2.5,
          netCarbs: 17.5,
          glycemicIndex: 53,
          glycemicLoad: 9.3
        }
      }
    ]
  };
});

describe('nutritionCalculator dynamic aggregation tests', () => {
  beforeEach(() => {
    // Clear localStorage to prevent test pollution
    localStorage.clear();
  });

  it('handles null properties and missing macros safely without NaN or crashes', () => {
    const ingredients = [
      { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' }
    ];

    const result = calculateRecipeNutrition(ingredients);

    // Salmon has null GI and 0 carbs. Ensure GL falls back safely to 0 ("Low GL").
    expect(result.kcal).toBe(180);
    expect(result.protein).toBe(34);
    expect(result.fat).toBe(5);
    expect(result.carbs).toBe(0);
    expect(result.glycemicIndex).toBeNull();
    expect(result.glycemicLoad).toBe(0);
  });

  it('calculates weighted glycemic index correctly based on carb contribution', () => {
    // Combine 6oz Salmon (0 carbs) and 0.5 cup Quinoa (20 carbs, 53 GI)
    const ingredients = [
      { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' },
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup' }
    ];

    const result = calculateRecipeNutrition(ingredients);

    // Total carbs from carb-bearing elements: 20g (from Quinoa)
    // Weighted GI sum: 20 * 53 = 1060
    // Weighted Average GI: 1060 / 20 = 53
    expect(result.glycemicIndex).toBe(53);
    
    // GL = Math.round((GI * NetCarbs) / 100)
    // Net Carbs = 17.5 (from Quinoa)
    // GL = (53 * 17.5) / 100 = 9.275 -> rounded to integer 9
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

    // Test 2x scaling
    const result2x = scaleNutrition(baseNutrition, 2);
    expect(result2x.kcal).toBe(200);
    expect(result2x.protein).toBe(20);
    expect(result2x.fat).toBe(4);
    expect(result2x.carbs).toBe(30);
    expect(result2x.glycemicIndex).toBe(50); // GI remains constant
    expect(result2x.glycemicLoad).toBe(10);  // GL scales

    // Test 4x scaling
    const result4x = scaleNutrition(baseNutrition, 4);
    expect(result4x.kcal).toBe(400);
    expect(result4x.glycemicIndex).toBe(50);
    expect(result4x.glycemicLoad).toBe(20);
  });

  it('applies prep state GI multipliers correctly (e.g. roasted vs cooled)', () => {
    // Quinoa base GI = 53
    // Raw multiplier = 1.0 -> GI = 53
    const rawResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'raw' }
    ]);
    expect(rawResult.glycemicIndex).toBe(53);

    // Roasted multiplier = 1.15 -> 53 * 1.15 = 60.95 -> rounded 61
    const roastedResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'roasted' }
    ]);
    expect(roastedResult.glycemicIndex).toBe(61);

    // Cooled multiplier = 0.85 -> 53 * 0.85 = 45.05 -> rounded 45.1
    const cooledResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa', amount: 0.5, unit: 'cup', prepState: 'cooled' }
    ]);
    expect(cooledResult.glycemicIndex).toBe(45.1);
  });
});
