import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSystemIngredients,
  getCustomIngredients,
  getIngredientsRegistry,
  getIngredientById,
  isSystemIngredient,
  isCustomIngredient,
  generateCustomId,
  validateCustomIngredient,
  saveCustomIngredient,
  deleteCustomIngredient,
} from './ingredientStore';

// Mock strapiClient so tests don't make real HTTP requests
vi.mock('../services/strapiClient', () => ({
  strapiGet: vi.fn(() => Promise.resolve([
    {
      id: 'feta',
      name: 'Feta',
      category: 'cheese',
      defaultUnit: 'oz',
      defaultAmount: 1,
      isUserAuthored: false,
      kcal: 75,
      protein: 4,
      fat: 6,
      carbs: 1,
      fiber: 0,
      glycemicIndex: 27,
    },
    {
      id: 'atlantic-salmon',
      name: 'Atlantic Salmon',
      category: 'protein',
      defaultUnit: 'oz',
      defaultAmount: 6,
      isUserAuthored: false,
      kcal: 350,
      protein: 34,
      fat: 22,
      carbs: 0,
      fiber: 0,
      glycemicIndex: 0,
    }
  ])),
  strapiPost: vi.fn((url, payload) => Promise.resolve({
    id: `custom-${Date.now()}`,
    ...payload,
    isUserAuthored: true,
  })),
  strapiPut: vi.fn(() => Promise.resolve({})),
  strapiDelete: vi.fn(() => Promise.resolve({})),
  invalidateCache: vi.fn(),
  unravelStrapiData: vi.fn((data) => data),
}));

describe('ingredientStore — Strapi Data Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ID Helpers & Validation', () => {
    it('correctly identifies custom ingredient IDs', () => {
      expect(isCustomIngredient('custom-almond-flour')).toBe(true);
      expect(isCustomIngredient(null)).toBe(false);
    });

    it('generates safe custom IDs with custom- prefix', () => {
      const id = generateCustomId('Almond Flour!');
      expect(id).toMatch(/^custom-almond-flour-\d+$/);
    });

    it('validates required fields and numerical inputs', () => {
      const invalid = validateCustomIngredient({});
      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);

      const valid = validateCustomIngredient({
        name: 'Test Flour',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 100,
        nutrition: { kcal: 350, protein: 10, fat: 2, carbs: 70, fiber: 5, glycemicIndex: 45 },
      });
      expect(valid.valid).toBe(true);
    });

    it('rejects glycemic index outside 0-100', () => {
      const invalid = validateCustomIngredient({
        name: 'High GI Item',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 100,
        nutrition: { kcal: 100, protein: 1, fat: 0, carbs: 20, fiber: 0, glycemicIndex: 150 },
      });
      expect(invalid.valid).toBe(false);
      expect(invalid.errors.some(e => e.includes('Glycemic Index'))).toBe(true);
    });
  });

  describe('Write Operations (saveCustomIngredient)', () => {
    it('saves a valid custom ingredient to Strapi', async () => {
      const result = await saveCustomIngredient({
        name: 'Custom Almond Meal',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 100,
        nutrition: { kcal: 590, protein: 21, fat: 50, carbs: 20, fiber: 10, glycemicIndex: 15 },
      });

      expect(result.ok).toBe(true);
      expect(result.ingredient).not.toBeNull();
      expect(result.ingredient.isUserAuthored).toBe(true);
      expect(result.ingredient.nutrition.netCarbs).toBe(10);
    });
  });
});
