import { describe, it, expect } from 'vitest';

// Node built-in imports with ambient declarations for environments without @types/node
declare const require: (module: string) => any;
declare const __dirname: string;

const fs = require('node:fs');
const path = require('node:path');

describe('Public Recipes Content Completeness Gate', () => {
  const publicRecipesDir = path.resolve(__dirname, '../../public/data/recipes');
  const recipeFiles: string[] = fs.readdirSync(publicRecipesDir).filter((f: string) => f.endsWith('.json'));

  it('should find recipe JSON files in public/data/recipes', () => {
    expect(recipeFiles.length).toBeGreaterThanOrEqual(20);
  });

  describe.each(recipeFiles)('Recipe: %s', (fileName) => {
    const filePath = path.join(publicRecipesDir, fileName);
    const recipe = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    it('should have core identity and metadata fields', () => {
      expect(recipe.id).toBeTypeOf('string');
      expect(recipe.id.length).toBeGreaterThan(0);
      expect(recipe.title).toBeTypeOf('string');
      expect(recipe.title.length).toBeGreaterThan(0);
      expect(recipe.description).toBeTypeOf('string');
      expect(recipe.description.length).toBeGreaterThan(0);
      expect(recipe.servings).toBeTypeOf('number');
      expect(recipe.servings).toBeGreaterThan(0);
    });

    it('should have non-empty steps array with structured title and description', () => {
      expect(Array.isArray(recipe.steps)).toBe(true);
      expect(recipe.steps.length).toBeGreaterThanOrEqual(1);

      recipe.steps.forEach((step: { title?: string; description?: string }, idx: number) => {
        expect(step.title, `Step ${idx} missing title in ${fileName}`).toBeTypeOf('string');
        expect(step.title?.length).toBeGreaterThan(0);
        expect(step.description, `Step ${idx} missing description in ${fileName}`).toBeTypeOf('string');
        expect(step.description?.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty ingredients array with valid quantities', () => {
      expect(Array.isArray(recipe.ingredients)).toBe(true);
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(1);

      recipe.ingredients.forEach((ing: { ingredientId?: string; amount?: number; unit?: string }, idx: number) => {
        expect(ing.ingredientId, `Ingredient ${idx} missing ingredientId in ${fileName}`).toBeTypeOf('string');
        expect(ing.ingredientId?.length).toBeGreaterThan(0);
        expect(ing.amount, `Ingredient ${idx} amount invalid in ${fileName}`).toBeTypeOf('number');
        expect(ing.amount).toBeGreaterThan(0);
        expect(ing.unit, `Ingredient ${idx} unit invalid in ${fileName}`).toBeTypeOf('string');
      });
    });

    it('should have valid non-negative glycemicLoad', () => {
      const gl = recipe.glycemicLoad ?? recipe.nutrition?.glycemicLoad;
      expect(gl, `Missing glycemicLoad in ${fileName}`).toBeTypeOf('number');
      expect(Number.isNaN(gl)).toBe(false);
      expect(gl).toBeGreaterThanOrEqual(0);
    });

    it('should have an allergens array', () => {
      expect(Array.isArray(recipe.allergens), `Missing allergens array in ${fileName}`).toBe(true);
    });

    it('should maintain netCarbs = max(0, carbs - fiber) physiological invariant in nutrition rollup', () => {
      if (recipe.nutrition) {
        const { carbs, fiber, netCarbs } = recipe.nutrition;
        if (typeof carbs === 'number' && typeof fiber === 'number' && typeof netCarbs === 'number') {
          const expectedNetCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
          expect(Math.abs(netCarbs - expectedNetCarbs)).toBeLessThanOrEqual(0.5);
        }
      }
    });
  });
});