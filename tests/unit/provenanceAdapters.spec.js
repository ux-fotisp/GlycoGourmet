import { describe, it, expect } from 'vitest';
import {
  normalizeUnitToGrams,
  adaptInternalIngredient,
  adaptUsdaFood,
  adaptCustomIngredient,
  adaptLegacyRecipeLine,
} from '../../src/utils/provenanceAdapters';

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
    const line = adaptInternalIngredient(completeMasterIngredient, { quantity: 150, unit: 'g' });

    expect(line.source).toBe('internal_verified');
    expect(line.displayName).toBe('Quinoa (Cooked)');
    expect(line.quantity).toBe(150);
    expect(line.unit).toBe('g');
    expect(line.normalizedGrams).toBe(150);
    expect(line.glycemicIndex).toBe(53);
    expect(line.giEvidenceStatus).toBe('available');
    expect(line.validation.status).toBe('complete');
  });

  it('transforms USDA FoodData Central item into "usda_fooddata_central" with retained metadata', () => {
    const line = adaptUsdaFood(usdaSearchItem, { quantity: 100, unit: 'g' }, 53);

    expect(line.source).toBe('usda_fooddata_central');
    expect(line.fdcId).toBe(170567);
    expect(line.displayName).toBe('Quinoa, cooked');
    expect(line.sourceVersion).toBe('Foundation Food');
    expect(line.sourceRetrievedAt).toBeDefined();
    expect(line.glycemicIndex).toBe(53);
    expect(line.giEvidenceStatus).toBe('available');
    expect(line.validation.status).toBe('complete');
  });

  it('Anti-Upgrade Invariant: Custom user-authored ingredient maps strictly to "user_entered"', () => {
    const line = adaptCustomIngredient(userCustomIngredient, { quantity: 50, unit: 'g' });

    expect(line.source).toBe('user_entered');
    expect(line.source).not.toBe('internal_verified');
    expect(line.displayName).toBe('My Custom Chia Blend');
    expect(line.validation.status).toBe('complete');
  });

  it('falls back to "needs_review" and "incomplete" when master ingredient has missing core nutrient', () => {
    const incompleteMaster = {
      id: 'bad-flour',
      name: 'Defective Flour',
      kcal: 350,
      carbs: 70,
      fiber: 3,
      protein: null, // Missing!
      fat: 1,
      glycemicIndex: 70,
      isUserAuthored: false,
    };

    const line = adaptInternalIngredient(incompleteMaster, { quantity: 100, unit: 'g' });

    expect(line.source).toBe('needs_review');
    expect(line.validation.status).toBe('incomplete');
    expect(line.validation.reasons.some((r) => r.includes('proteinG'))).toBe(true);
  });

  it('normalizes culinary units to grams deterministically within tolerance', () => {
    // 1 oz -> ~28.35g
    const gramsFromOz = normalizeUnitToGrams(1, 'oz');
    expect(Math.abs(gramsFromOz - 28.3495)).toBeLessThanOrEqual(1);

    // 1 cup (density 1.0) -> ~236.59g
    const gramsFromCup = normalizeUnitToGrams(1, 'cup');
    expect(Math.abs(gramsFromCup - 236.588)).toBeLessThanOrEqual(1);

    // 1 tbsp -> ~14.79g
    const gramsFromTbsp = normalizeUnitToGrams(1, 'tbsp');
    expect(Math.abs(gramsFromTbsp - 14.7868)).toBeLessThanOrEqual(1);

    // 2 cloves -> 6g
    const gramsFromCloves = normalizeUnitToGrams(2, 'clove');
    expect(gramsFromCloves).toBe(6);

    // Invalid unit
    expect(normalizeUnitToGrams(1, 'invalid_unit')).toBeNull();
    expect(normalizeUnitToGrams(-5, 'g')).toBeNull();
  });

  it('adapts legacy recipe lines via resolver lookup or embedded payload', () => {
    const legacyEmbedded = {
      ingredient: completeMasterIngredient,
      amount: 200,
      unit: 'g',
    };
    const line1 = adaptLegacyRecipeLine(legacyEmbedded);
    expect(line1.source).toBe('internal_verified');
    expect(line1.quantity).toBe(200);

    const legacyReferenced = {
      ingredientId: 'quinoa-cooked',
      amount: 100,
      unit: 'g',
    };
    const mockResolver = (id) => (id === 'quinoa-cooked' ? completeMasterIngredient : null);
    const line2 = adaptLegacyRecipeLine(legacyReferenced, mockResolver);
    expect(line2.source).toBe('internal_verified');
    expect(line2.displayName).toBe('Quinoa (Cooked)');

    const legacyUnresolved = {
      ingredientId: 'unknown-id',
      amount: 50,
      unit: 'g',
    };
    const line3 = adaptLegacyRecipeLine(legacyUnresolved, mockResolver);
    expect(line3.source).toBe('needs_review');
    expect(line3.validation.status).toBe('incomplete');
  });
});