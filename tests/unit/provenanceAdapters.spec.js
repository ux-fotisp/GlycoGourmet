import { describe, it, expect } from 'vitest';
import {
  normalizeUnitToGrams,
  adaptInternalIngredient,
  adaptUsdaFood,
  adaptCustomIngredient,
  adaptLegacyRecipeLine,
} from '../../src/utils/provenanceAdapters';
import { evaluateRecipeNutritionCompleteness } from '../../src/utils/provenanceEvaluator';

describe('provenanceAdapters — Provenance & Ingredient Line Adapters', () => {
  const completeMasterIngredient = {
    id: 'quinoa-cooked',
    name: 'Quinoa (Cooked)',
    category: 'grain',
    defaultAmount: 100,
    defaultUnit: 'g',
    kcal: 120,
    protein: 4.4,
    fat: 1.9,
    carbs: 21.3,
    fiber: 2.8,
    glycemicIndex: 53,
    isUserAuthored: false,
  };

  const zeroCarbMasterIngredient = {
    id: 'atlantic-salmon',
    name: 'Atlantic Salmon',
    category: 'protein',
    defaultAmount: 120,
    defaultUnit: 'g',
    kcal: 206,
    protein: 22,
    fat: 13,
    carbs: 0,
    fiber: 0,
    glycemicIndex: 0,
    isUserAuthored: false,
  };

  const usdaSearchItem = {
    fdcId: 170567,
    description: 'Quinoa, cooked',
    brandOwner: 'Foundation Food',
    kcal: 120,
    protein: 4.4,
    fat: 1.9,
    carbs: 21.3,
    fiber: 2.8,
  };

  const usdaZeroCarbItem = {
    fdcId: 175167,
    description: 'Salmon, Atlantic, wild, raw',
    brandOwner: 'USDA Standard Reference',
    kcal: 142,
    protein: 19.8,
    fat: 6.3,
    carbs: 0,
    fiber: 0,
  };

  const userCustomIngredient = {
    id: 'custom-12345',
    name: 'My Custom Chia Blend',
    category: 'grain',
    defaultAmount: 100,
    defaultUnit: 'g',
    kcal: 486,
    protein: 16.5,
    fat: 30.7,
    carbs: 42.1,
    fiber: 34.4,
    glycemicIndex: 15,
    isUserAuthored: true,
  };

  it('transforms complete internal master ingredient into "internal_verified" line', () => {
    const line = adaptInternalIngredient(completeMasterIngredient, { id: 'line-q-1', quantity: 150, unit: 'g' });

    expect(line.source).toBe('internal_verified');
    expect(line.displayName).toBe('Quinoa (Cooked)');
    expect(line.quantity).toBe(150);
    expect(line.unit).toBe('g');
    expect(line.normalizedGrams).toBe(150);
    expect(line.glycemicIndex).toBe(53);
    expect(line.giEvidenceStatus).toBe('available');
    expect(line.validation.status).toBe('complete');
    expect(line.validation.reasons).toEqual([]);
  });

  it('transforms USDA FoodData Central item into "usda_fooddata_central" with retained metadata', () => {
    const line = adaptUsdaFood(usdaSearchItem, { id: 'line-usda-1', quantity: 100, unit: 'g' }, 53);

    expect(line.source).toBe('usda_fooddata_central');
    expect(line.fdcId).toBe(170567);
    expect(line.displayName).toBe('Quinoa, cooked');
    expect(line.sourceVersion).toBe('Foundation Food');
    expect(line.validation.status).toBe('complete');
    expect(line.glycemicIndex).toBe(53);
    expect(line.giEvidenceStatus).toBe('available');
    expect(line.validation.reasons).toEqual([]);
  });

  it('transforms user custom ingredient into "user_entered" (anti-upgrade invariant)', () => {
    const line = adaptCustomIngredient(userCustomIngredient, { id: 'line-custom-1', quantity: 50, unit: 'g' });

    expect(line.source).toBe('user_entered');
    expect(line.displayName).toBe('My Custom Chia Blend');
    expect(line.validation.status).toBe('complete');
    expect(line.validation.reasons).toEqual([]);
  });

  it('flags internal ingredient with missing core nutrient as "needs_review" and "incomplete"', () => {
    const brokenInternal = {
      id: 'incomplete-item',
      name: 'Incomplete Item',
      isUserAuthored: false,
      kcal: 100,
      carbs: 10,
      // missing protein, fat, fiber
    };
    const line = adaptInternalIngredient(brokenInternal, { id: 'line-broken-1', quantity: 100, unit: 'g' });

    expect(line.source).toBe('needs_review');
    expect(line.validation.status).toBe('incomplete');
    expect(line.validation.reasons.some((r) => r.includes('Missing required nutrient'))).toBe(true);
  });

  // --- Fix 1 Tests: Recipe-Line Identity vs Ingredient Identity ---

  it('1. Two lines using the same ingredient with different explicit lineDetails.id preserve distinct IDs, share source identity, and remain valid', () => {
    const line1 = adaptInternalIngredient(completeMasterIngredient, { id: 'recipe-line-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(completeMasterIngredient, { id: 'recipe-line-2', quantity: 50, unit: 'g' });

    expect(line1.id).toBe('recipe-line-1');
    expect(line2.id).toBe('recipe-line-2');
    expect(line1.ingredientId).toBe('quinoa-cooked');
    expect(line2.ingredientId).toBe('quinoa-cooked');
    expect(line1.validation.status).toBe('complete');
    expect(line2.validation.status).toBe('complete');
    expect(line1.validation.reasons).toEqual([]);
    expect(line2.validation.reasons).toEqual([]);
  });

  it('2. A line created without an explicit line ID gets deterministic fallback ID and receives persistent-unique-line-ID warning, remaining calculable', () => {
    const lineNoId = adaptInternalIngredient(completeMasterIngredient, { quantity: 100, unit: 'g' });

    expect(lineNoId.id).toBe('line_internal_quinoa-cooked');
    expect(lineNoId.isFallbackId).toBe(true);
    expect(lineNoId.validation.reasons).toContain('Recipe line requires a persistent unique line ID before editing or saving.');
    expect(lineNoId.validation.status).toBe('complete');

    const evalResult = evaluateRecipeNutritionCompleteness([lineNoId]);
    expect(evalResult.status).toBe('complete');
    expect(evalResult.canCalculateNutrition).toBe(true);
    expect(evalResult.canCalculateGl).toBe(true);
    expect(evalResult.warnings.some((w) => w.includes('Recipe line requires a persistent unique line ID'))).toBe(true);
  });

  it('3. Explicit line ID produces no persistent-unique-line-ID warning', () => {
    const lineWithId = adaptInternalIngredient(completeMasterIngredient, { id: 'explicit-line-42', quantity: 100, unit: 'g' });

    expect(lineWithId.id).toBe('explicit-line-42');
    expect(lineWithId.isFallbackId).toBe(false);
    expect(lineWithId.validation.reasons).not.toContain('Recipe line requires a persistent unique line ID before editing or saving.');
    expect(lineWithId.validation.reasons).toEqual([]);
  });

  it('4. Repeated adaptation remains deterministic and non-mutating', () => {
    const frozenIngredient = Object.freeze({ ...completeMasterIngredient });
    const lineDetails = Object.freeze({ id: 'frozen-line-1', quantity: 100, unit: 'g' });

    const run1 = adaptInternalIngredient(frozenIngredient, lineDetails);
    const run2 = adaptInternalIngredient(frozenIngredient, lineDetails);

    expect(run1).toEqual(run2);
  });

  // --- Fix 2 Tests: GI Semantics for Non-Carb Lines ---

  it('5. Internal zero-carbohydrate ingredient adapts with glycemicIndex === null and giEvidenceStatus === "not_applicable"', () => {
    const line = adaptInternalIngredient(zeroCarbMasterIngredient, { id: 'line-salmon-1', quantity: 120, unit: 'g' });

    expect(line.glycemicIndex).toBeNull();
    expect(line.giEvidenceStatus).toBe('not_applicable');
    expect(line.validation.status).toBe('complete');
  });

  it('6. USDA zero-carbohydrate result adapts with glycemicIndex === null and giEvidenceStatus === "not_applicable"', () => {
    const line = adaptUsdaFood(usdaZeroCarbItem, { id: 'line-usda-salmon', quantity: 100, unit: 'g' });

    expect(line.glycemicIndex).toBeNull();
    expect(line.giEvidenceStatus).toBe('not_applicable');
    expect(line.validation.status).toBe('complete');
  });

  it('7. Complete recipe with carb ingredient (valid GI) and zero-carb ingredient (GI null, not_applicable) stays complete with GL calculable', () => {
    const carbLine = adaptInternalIngredient(completeMasterIngredient, { id: 'carb-line-1', quantity: 100, unit: 'g' });
    const zeroCarbLine = adaptInternalIngredient(zeroCarbMasterIngredient, { id: 'zero-carb-line-1', quantity: 120, unit: 'g' });

    const evalResult = evaluateRecipeNutritionCompleteness([carbLine, zeroCarbLine]);
    expect(evalResult.status).toBe('complete');
    expect(evalResult.canCalculateNutrition).toBe(true);
    expect(evalResult.canCalculateGl).toBe(true);
    expect(evalResult.missingGiLines).toHaveLength(0);
  });

  it('8. Carbohydrate-contributing line with GI null and unavailable remains estimated with canCalculateGl false', () => {
    const carbLineWithoutGi = {
      ...adaptInternalIngredient(completeMasterIngredient, { id: 'carb-no-gi', quantity: 100, unit: 'g' }),
      glycemicIndex: null,
      giEvidenceStatus: 'unavailable',
    };

    const evalResult = evaluateRecipeNutritionCompleteness([carbLineWithoutGi]);
    expect(evalResult.status).toBe('estimated');
    expect(evalResult.canCalculateNutrition).toBe(true);
    expect(evalResult.canCalculateGl).toBe(false);
    expect(evalResult.missingGiLines).toContain('carb-no-gi');
  });

  // --- Unit Normalization & Mass Rules Tests ---

  it('9. One ounce and one gram remain supported deterministic mass conversions', () => {
    const gramsFrom1g = normalizeUnitToGrams(1, 'g');
    expect(gramsFrom1g).toBe(1);

    const gramsFrom1oz = normalizeUnitToGrams(1, 'oz');
    expect(Math.abs(gramsFrom1oz - 28.3495)).toBeLessThanOrEqual(0.001);

    const gramsFrom1kg = normalizeUnitToGrams(1, 'kg');
    expect(gramsFrom1kg).toBe(1000);

    const gramsFrom1lb = normalizeUnitToGrams(1, 'lb');
    expect(Math.abs(gramsFrom1lb - 453.592)).toBeLessThanOrEqual(0.001);
  });

  it('10. Volume unit such as "cup" returns null with no supplied density', () => {
    expect(normalizeUnitToGrams(1, 'cup')).toBeNull();
    expect(normalizeUnitToGrams(100, 'ml')).toBeNull();
    expect(normalizeUnitToGrams(1, 'tbsp')).toBeNull();
    expect(normalizeUnitToGrams(1, 'tsp')).toBeNull();
    expect(normalizeUnitToGrams(2, 'fl oz')).toBeNull();
  });

  it('11. Volume unit normalizes only when an explicit ingredient-specific density is supplied', () => {
    const oliveOilDensity = 0.92; // g/ml
    const waterDensity = 1.0; // g/ml

    const gramsFrom100mlOil = normalizeUnitToGrams(100, 'ml', oliveOilDensity);
    expect(gramsFrom100mlOil).toBe(92);

    const gramsFrom1CupWater = normalizeUnitToGrams(1, 'cup', waterDensity);
    expect(Math.abs(gramsFrom1CupWater - 236.588)).toBeLessThanOrEqual(0.01);

    const gramsFrom1TbspOil = normalizeUnitToGrams(1, 'tbsp', oliveOilDensity);
    expect(Math.abs(gramsFrom1TbspOil - (14.7868 * 0.92))).toBeLessThanOrEqual(0.01);
  });

  it('12. Count unit such as "piece" returns null with no supplied gram weight', () => {
    expect(normalizeUnitToGrams(1, 'piece')).toBeNull();
    expect(normalizeUnitToGrams(2, 'clove')).toBeNull();
    expect(normalizeUnitToGrams(1, 'bunch')).toBeNull();
    expect(normalizeUnitToGrams(1, 'slice')).toBeNull();
    expect(normalizeUnitToGrams(1, 'item')).toBeNull();
    expect(normalizeUnitToGrams(1, 'serving')).toBeNull();
  });

  it('13. Count unit normalizes only when an explicit ingredient-specific gram weight is supplied', () => {
    const largeEggWeight = 50; // 50g per egg piece
    const garlicCloveWeight = 3; // 3g per clove

    const gramsFrom2Eggs = normalizeUnitToGrams(2, 'piece', undefined, largeEggWeight);
    expect(gramsFrom2Eggs).toBe(100);

    const gramsFrom3Cloves = normalizeUnitToGrams(3, 'clove', undefined, garlicCloveWeight);
    expect(gramsFrom3Cloves).toBe(9);
  });

  it('14. A line with unavailable volume/count conversion gets normalizedGrams: null and validation incomplete with structured reason', () => {
    const eggWithoutWeight = {
      id: 'fresh-egg',
      name: 'Fresh Egg',
      kcal: 143,
      protein: 12.6,
      fat: 9.5,
      carbs: 0.7,
      fiber: 0,
      glycemicIndex: 0,
      isUserAuthored: false,
    };

    const adaptedCountLine = adaptInternalIngredient(eggWithoutWeight, { id: 'line-egg-1', quantity: 2, unit: 'piece' });
    expect(adaptedCountLine.normalizedGrams).toBeNull();
    expect(adaptedCountLine.validation.status).toBe('incomplete');
    expect(adaptedCountLine.validation.reasons).toContain('Count unit requires ingredient-specific gram weight');

    const adaptedVolumeLine = adaptInternalIngredient(eggWithoutWeight, { id: 'line-egg-2', quantity: 1, unit: 'cup' });
    expect(adaptedVolumeLine.normalizedGrams).toBeNull();
    expect(adaptedVolumeLine.validation.status).toBe('incomplete');
    expect(adaptedVolumeLine.validation.reasons).toContain('Volume unit requires ingredient-specific density');
  });

  it('15. Completeness evaluator reports that a line with unavailable gram conversion makes nutrition and GL unavailable', () => {
    const lineWithUnavailableConversion = {
      id: 'line-egg-unconverted',
      displayName: 'Fresh Egg',
      quantity: 2,
      unit: 'piece',
      normalizedGrams: null, // normalization failed
      source: 'internal_verified',
      nutritionPer100g: {
        energyKcal: 143,
        carbohydrateG: 0.7,
        fiberG: 0,
        proteinG: 12.6,
        fatG: 9.5,
      },
      glycemicIndex: 0,
      giEvidenceStatus: 'available',
      validation: { status: 'incomplete', reasons: ['Count unit requires ingredient-specific gram weight'] },
    };

    const evaluation = evaluateRecipeNutritionCompleteness([lineWithUnavailableConversion]);
    expect(evaluation.status).toBe('incomplete');
    expect(evaluation.canCalculateNutrition).toBe(false);
    expect(evaluation.canCalculateGl).toBe(false);
    expect(evaluation.missingNutritionLines).toContain('line-egg-unconverted');
  });

  it('16. USDA retrieval time remains absent when unavailable and is preserved exactly when supplied', () => {
    // Absent
    const lineWithoutTimestamp = adaptUsdaFood(usdaSearchItem, { id: 'line-usda-ts-1', quantity: 100, unit: 'g' });
    expect(lineWithoutTimestamp.sourceRetrievedAt).toBeUndefined();

    // Supplied via lineDetails
    const fixedTime = '2026-09-01T10:00:00.000Z';
    const lineWithLineTimestamp = adaptUsdaFood(usdaSearchItem, { id: 'line-usda-ts-2', quantity: 100, unit: 'g', sourceRetrievedAt: fixedTime });
    expect(lineWithLineTimestamp.sourceRetrievedAt).toBe(fixedTime);

    // Supplied via usdaFood
    const usdaWithTime = { ...usdaSearchItem, retrievedAt: '2026-08-15T12:30:00.000Z' };
    const lineWithFoodTimestamp = adaptUsdaFood(usdaWithTime, { id: 'line-usda-ts-3', quantity: 100, unit: 'g' });
    expect(lineWithFoodTimestamp.sourceRetrievedAt).toBe('2026-08-15T12:30:00.000Z');
  });

  it('17. Adapts legacy recipe lines via resolver lookup or embedded payload deterministically', () => {
    const legacyEmbedded = {
      id: 'legacy-line-1',
      ingredient: completeMasterIngredient,
      amount: 200,
      unit: 'g',
    };
    const line1 = adaptLegacyRecipeLine(legacyEmbedded);
    expect(line1.source).toBe('internal_verified');
    expect(line1.quantity).toBe(200);
    expect(line1.id).toBe('legacy-line-1');
    expect(line1.isFallbackId).toBe(false);

    const legacyReferenced = {
      id: 'legacy-line-2',
      ingredientId: 'quinoa-cooked',
      amount: 100,
      unit: 'g',
    };
    const mockResolver = (id) => (id === 'quinoa-cooked' ? completeMasterIngredient : null);
    const line2 = adaptLegacyRecipeLine(legacyReferenced, mockResolver);
    expect(line2.source).toBe('internal_verified');
    expect(line2.displayName).toBe('Quinoa (Cooked)');
    expect(line2.id).toBe('legacy-line-2');
    expect(line2.isFallbackId).toBe(false);

    const legacyUnresolved = {
      id: 'legacy-line-3',
      ingredientId: 'unknown-id',
      amount: 50,
      unit: 'g',
    };
    const line3 = adaptLegacyRecipeLine(legacyUnresolved, mockResolver);
    expect(line3.source).toBe('needs_review');
    expect(line3.validation.status).toBe('incomplete');
    expect(line3.id).toBe('legacy-line-3');
    expect(line3.isFallbackId).toBe(false);
  });
});
