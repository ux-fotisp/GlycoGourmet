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
  updateCustomIngredient,
} from './ingredientStore';

// Mock snappiClient so tests don't make real HTTP requests
vi.mock('../services/snappiClient', () => ({
  snappiGet: vi.fn(() => Promise.reject(new Error('Snappi not available in tests'))),
  snappiPost: vi.fn(() => Promise.reject(new Error('Snappi not available in tests'))),
  snappiPut: vi.fn(() => Promise.reject(new Error('Snappi not available in tests'))),
  snappiDelete: vi.fn(() => Promise.reject(new Error('Snappi not available in tests'))),
  snappiUpload: vi.fn(() => Promise.reject(new Error('Snappi not available in tests'))),
  invalidateCache: vi.fn(),
}));

describe('ingredientStore — Two-Tier Data Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Tier 1 System Database', () => {
    it('returns system ingredients as a frozen read-only array', () => {
      const system = getSystemIngredients();
      expect(Array.isArray(system)).toBe(true);
      expect(system.length).toBeGreaterThan(0);
      expect(Object.isFrozen(system)).toBe(true);
    });

    it('correctly identifies system ingredients by ID', () => {
      expect(isSystemIngredient('feta')).toBe(true);
      expect(isSystemIngredient('atlantic-salmon')).toBe(true);
      expect(isSystemIngredient('custom-my-ingredient')).toBe(false);
      expect(isSystemIngredient('unknown-id')).toBe(false);
    });
  });

  describe('Tier 2 Custom Registry', () => {
    it('returns empty array when no custom ingredients exist', () => {
      expect(getCustomIngredients()).toEqual([]);
    });

    it('correctly identifies custom ingredient IDs', () => {
      expect(isCustomIngredient('custom-almond-flour')).toBe(true);
      expect(isCustomIngredient('feta')).toBe(false);
      expect(isCustomIngredient(null)).toBe(false);
    });

    it('generates safe custom IDs with custom- prefix', () => {
      const id = generateCustomId('Almond Flour!');
      expect(id).toMatch(/^custom-almond-flour-\d+$/);
    });
  });

  describe('Validation & Governance Rules', () => {
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
    it('saves a valid custom ingredient with custom- prefix and derived netCarbs/GL', async () => {
      const result = await saveCustomIngredient({
        name: 'Custom Almond Meal',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 100,
        nutrition: { kcal: 590, protein: 21, fat: 50, carbs: 20, fiber: 10, glycemicIndex: 15 },
      });

      expect(result.ok).toBe(true);
      expect(result.ingredient).not.toBeNull();
      expect(result.ingredient.id).toMatch(/^custom-custom-almond-meal-\d+$/);
      expect(result.ingredient.isUserAuthored).toBe(true);
      expect(result.ingredient.nutrition.netCarbs).toBe(10); // 20 - 10
      expect(result.ingredient.nutrition.glycemicLoad).toBe(1.5); // (15 * 10) / 100

      // Falls back to localStorage when Snappi is unavailable
      const stored = getCustomIngredients();
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('Custom Almond Meal');
    });

    it('returns a similarity warning when saving an ingredient with a system name', async () => {
      const result = await saveCustomIngredient({
        name: 'Feta', // matches system entry 'Feta'
        category: 'cheese',
        defaultUnit: 'oz',
        defaultAmount: 1,
        nutrition: { kcal: 75, protein: 4, fat: 6, carbs: 1, fiber: 0, glycemicIndex: 27 },
      });

      expect(result.ok).toBe(true);
      expect(result.warning).toBe('similar_to_system');
    });

    it('prevents writing with a system ID namespace', async () => {
      const result = await saveCustomIngredient({
        id: 'feta', // direct system ID attempt
        name: 'Feta Fake',
        category: 'cheese',
        defaultUnit: 'oz',
        defaultAmount: 1,
        nutrition: { kcal: 75, protein: 4, fat: 6, carbs: 1, fiber: 0, glycemicIndex: 27 },
      });

      expect(result.ok).toBe(false);
      expect(result.errors.some(e => e.includes('conflicts with a system ingredient'))).toBe(true);
    });
  });

  describe('Merged Registry & Retrieval', () => {
    it('merges Tier 1 and Tier 2 ingredients in getIngredientsRegistry', async () => {
      const systemCount = getSystemIngredients().length;

      await saveCustomIngredient({
        name: 'My Special Spice Mix',
        category: 'seasoning',
        defaultUnit: 'g',
        defaultAmount: 5,
        nutrition: { kcal: 10, protein: 0.5, fat: 0.2, carbs: 1, fiber: 0.5, glycemicIndex: 5 },
      });

      const registry = getIngredientsRegistry();
      expect(registry.length).toBe(systemCount + 1);
      expect(registry.some(i => i.name === 'My Special Spice Mix')).toBe(true);
    });

    it('retrieves system ingredients first, then custom ingredients by ID', async () => {
      const systemItem = getIngredientById('feta');
      expect(systemItem).not.toBeNull();
      expect(systemItem.name).toBe('Feta');

      const saved = await saveCustomIngredient({
        name: 'Custom Flax',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 10,
        nutrition: { kcal: 55, protein: 2, fat: 4, carbs: 3, fiber: 2.8, glycemicIndex: 10 },
      });

      const customItem = getIngredientById(saved.ingredient.id);
      expect(customItem).not.toBeNull();
      expect(customItem.name).toBe('Custom Flax');
    });
  });

  describe('Delete & Update Safety', () => {
    it('allows deleting custom ingredients but blocks deleting system ingredients', async () => {
      const sysDelete = deleteCustomIngredient('feta');
      expect(sysDelete.ok).toBe(false);
      expect(sysDelete.error).toContain('Only custom ingredients');

      const saved = await saveCustomIngredient({
        name: 'Temporary Item',
        category: 'vegetable',
        defaultUnit: 'g',
        defaultAmount: 50,
        nutrition: { kcal: 20, protein: 1, fat: 0, carbs: 4, fiber: 1, glycemicIndex: 15 },
      });

      const customDelete = deleteCustomIngredient(saved.ingredient.id);
      expect(customDelete.ok).toBe(true);
      expect(getIngredientById(saved.ingredient.id)).toBeNull();
    });

    it('allows updating custom ingredients', async () => {
      const saved = await saveCustomIngredient({
        name: 'Old Name',
        category: 'fruit',
        defaultUnit: 'g',
        defaultAmount: 100,
        nutrition: { kcal: 50, protein: 0, fat: 0, carbs: 12, fiber: 2, glycemicIndex: 30 },
      });

      const updated = await updateCustomIngredient(saved.ingredient.id, { name: 'New Name' });
      expect(updated.ok).toBe(true);
      expect(updated.ingredient.name).toBe('New Name');
    });
  });
});
