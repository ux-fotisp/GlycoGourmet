import { describe, it, expect } from 'vitest';
import {
  evaluateRecipeNutritionCompleteness,
  validateIngredientLine,
  REQUIRED_CORE_NUTRIENTS,
} from '../../src/utils/provenanceEvaluator';

describe('provenanceEvaluator — Pure Deterministic Completeness Engine', () => {
  const createCompleteCarbLine = (id = 'line-quinoa') => ({
    id,
    displayName: 'Quinoa (Cooked)',
    quantity: 150,
    unit: 'g',
    normalizedGrams: 150,
    source: 'internal_verified',
    nutritionPer100g: {
      energyKcal: 120,
      carbohydrateG: 21.3,
      fiberG: 2.8,
      proteinG: 4.4,
      fatG: 1.9,
    },
    glycemicIndex: 53,
    giEvidenceStatus: 'available',
    validation: { status: 'complete', reasons: [] },
  });

  const createCompleteZeroCarbLine = (id = 'line-salmon') => ({
    id,
    displayName: 'Atlantic Salmon',
    quantity: 120,
    unit: 'g',
    normalizedGrams: 120,
    source: 'internal_verified',
    nutritionPer100g: {
      energyKcal: 206,
      carbohydrateG: 0,
      fiberG: 0,
      proteinG: 22,
      fatG: 13,
    },
    glycemicIndex: null, // Non-carb ingredients have GI: null and giEvidenceStatus: "not_applicable"
    giEvidenceStatus: 'not_applicable',
    validation: { status: 'complete', reasons: [] },
  });

  it('exports REQUIRED_CORE_NUTRIENTS with 5 macro keys', () => {
    expect(REQUIRED_CORE_NUTRIENTS).toHaveLength(5);
    const keys = REQUIRED_CORE_NUTRIENTS.map((n) => n.key);
    expect(keys).toEqual(['energyKcal', 'carbohydrateG', 'fiberG', 'proteinG', 'fatG']);
  });

  it('Rule 1: Evaluates a fully complete recipe with verified nutrition and valid GI as "complete"', () => {
    const lines = [createCompleteCarbLine('line-1'), createCompleteZeroCarbLine('line-2')];
    const result = evaluateRecipeNutritionCompleteness(lines);

    expect(result.status).toBe('complete');
    expect(result.canCalculateNutrition).toBe(true);
    expect(result.canCalculateGl).toBe(true);
    expect(result.missingNutritionLines).toHaveLength(0);
    expect(result.missingGiLines).toHaveLength(0);
  });

  it('Rule 2: Marks recipe as "estimated" when carb-contributing ingredient is missing GI (never coerces GI to 0)', () => {
    const incompleteGiLine = {
      ...createCompleteCarbLine('line-oats'),
      displayName: 'Rolled Oats',
      glycemicIndex: null,
      giEvidenceStatus: 'unavailable',
    };

    const lines = [incompleteGiLine, createCompleteZeroCarbLine('line-salmon')];
    const result = evaluateRecipeNutritionCompleteness(lines);

    expect(result.status).toBe('estimated');
    expect(result.canCalculateNutrition).toBe(true);
    expect(result.canCalculateGl).toBe(false);
    expect(result.missingGiLines).toContain('line-oats');
    expect(result.missingNutritionLines).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes('Glycemic Index unavailable'))).toBe(true);
  });

  it('Rule 3: Genuinely zero-carb ingredient with glycemicIndex null and giEvidenceStatus "not_applicable" does not block GL calculation', () => {
    const oliveOilLine = {
      id: 'line-oil',
      displayName: 'Extra Virgin Olive Oil',
      quantity: 15,
      unit: 'ml',
      normalizedGrams: 13.8,
      source: 'internal_verified',
      nutritionPer100g: {
        energyKcal: 884,
        carbohydrateG: 0,
        fiberG: 0,
        proteinG: 0,
        fatG: 100,
      },
      glycemicIndex: null,
      giEvidenceStatus: 'not_applicable',
      validation: { status: 'complete', reasons: [] },
    };

    const lines = [createCompleteCarbLine('line-quinoa'), oliveOilLine];
    const result = evaluateRecipeNutritionCompleteness(lines);

    expect(result.status).toBe('complete');
    expect(result.canCalculateNutrition).toBe(true);
    expect(result.canCalculateGl).toBe(true);
    expect(result.missingGiLines).toHaveLength(0);
  });

  it('Rule 4: Missing required core nutrient halts nutrition calculation (missing is not 0)', () => {
    const missingProteinLine = {
      ...createCompleteCarbLine('line-broken'),
      displayName: 'Defective Ingredient',
      nutritionPer100g: {
        energyKcal: 100,
        carbohydrateG: 20,
        fiberG: 2,
        proteinG: null, // Missing!
        fatG: 1,
      },
    };

    const lines = [missingProteinLine, createCompleteZeroCarbLine('line-salmon')];
    const result = evaluateRecipeNutritionCompleteness(lines);

    expect(result.status).toBe('incomplete');
    expect(result.canCalculateNutrition).toBe(false);
    expect(result.canCalculateGl).toBe(false);
    expect(result.missingNutritionLines).toContain('line-broken');
  });

  it('Rule 5: Unit normalization failure (null normalizedGrams) makes recipe "incomplete"', () => {
    const invalidUnitLine = {
      ...createCompleteCarbLine('line-bad-unit'),
      quantity: 2,
      unit: 'handful',
      normalizedGrams: null, // Normalization failed
    };

    const lines = [invalidUnitLine];
    const result = evaluateRecipeNutritionCompleteness(lines);

    expect(result.status).toBe('incomplete');
    expect(result.canCalculateNutrition).toBe(false);
    expect(result.missingNutritionLines).toContain('line-bad-unit');
  });

  it('Rule 6: Empty recipe array returns "incomplete" with safe defaults', () => {
    const result = evaluateRecipeNutritionCompleteness([]);

    expect(result.status).toBe('incomplete');
    expect(result.canCalculateNutrition).toBe(false);
    expect(result.canCalculateGl).toBe(false);
    expect(result.warnings).toContain('Recipe contains no ingredient lines');
  });

  it('Rule 7: Pure function guarantees input immutability', () => {
    const originalLine = createCompleteCarbLine('line-freeze');
    const snapshot = JSON.stringify(originalLine);
    const lines = [originalLine];

    evaluateRecipeNutritionCompleteness(lines);

    expect(JSON.stringify(lines[0])).toBe(snapshot);
    expect(lines).toHaveLength(1);
  });

  it('Rule 8: Line validation identifies null lines and negative quantities defensively', () => {
    expect(validateIngredientLine(null).status).toBe('incomplete');
    expect(validateIngredientLine({ quantity: -1 }).status).toBe('incomplete');
    expect(validateIngredientLine({ quantity: 10, normalizedGrams: 10 }).status).toBe('incomplete');
  });
});
