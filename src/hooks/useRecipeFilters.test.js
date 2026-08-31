import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useRecipeFilters, MEAL_OCCASIONS, SORT_OPTIONS, GL_BANDS } from './useRecipeFilters';

vi.mock('../utils/nutritionCalculator', () => ({
  deriveAllergensFromIngredients: vi.fn(() => []),
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0, fiber: 0,
    glycemicIndex: null, glycemicLoad: 0,
  })),
  getGlycemicLoadCategory: (gl) => {
    if (gl <= 10) return { category: 'Low GL', label: 'Low GL', colorClass: 'text-primary-fixed-dim', bgClass: 'bg-primary-container/15' };
    if (gl <= 19) return { category: 'Medium GL', label: 'Medium GL', colorClass: 'text-tertiary', bgClass: 'bg-tertiary-container/15' };
    return { category: 'High GL', label: 'High GL', colorClass: 'text-error', bgClass: 'bg-error-container/15' };
  },
}));

vi.mock('../utils/ingredientStore', () => ({
  getIngredientById: () => null,
  getIngredientsRegistry: () => [],
  saveCustomIngredient: vi.fn(),
}));

function mockRecipe(overrides = {}) {
  return {
    id: 'test-' + Math.random().toString(36).slice(2, 8),
    title: 'Test Recipe',
    description: 'A test recipe',
    status: 'published',
    publishedAt: '2026-01-01T00:00:00.000Z',
    mealOccasion: 'dinner',
    dietaryFlags: [],
    tags: [],
    ingredients: [],
    servings: 1,
    cookingTime: 30,
    prepTime: 15,
    nutrition: {
      glycemicLoad: 10,
      glycemicIndex: 45,
      netCarbs: 20,
      fiber: 3,
    },
    ...overrides,
  };
}

function createWrapper(initialEntries = ['/']) {
  return function Wrapper({ children }) {
    return React.createElement(MemoryRouter, { initialEntries }, children);
  };
}

describe('useRecipeFilters', () => {
  const baseRecipes = [
    mockRecipe({ id: 'r1', title: 'Low GL Salad', mealOccasion: 'lunch', nutrition: { glycemicLoad: 3, glycemicIndex: 25, netCarbs: 5, fiber: 8 }, dietaryFlags: ['Vegetarian', 'Gluten-Free'] }),
    mockRecipe({ id: 'r2', title: 'Medium GL Pasta', mealOccasion: 'dinner', nutrition: { glycemicLoad: 15, glycemicIndex: 55, netCarbs: 35, fiber: 4 } }),
    mockRecipe({ id: 'r3', title: 'High GL Rice', mealOccasion: 'dinner', nutrition: { glycemicLoad: 22, glycemicIndex: 72, netCarbs: 50, fiber: 1 } }),
    mockRecipe({ id: 'r4', title: 'Zero Carb Steak', mealOccasion: 'dinner', nutrition: { glycemicLoad: 0, glycemicIndex: null, netCarbs: 0, fiber: 0 } }),
    mockRecipe({ id: 'r5', title: 'Breakfast Bowl', mealOccasion: 'breakfast', nutrition: { glycemicLoad: 8, glycemicIndex: 40, netCarbs: 18, fiber: 6 }, dietaryFlags: ['Vegetarian'], prepTime: 10 }),
    mockRecipe({ id: 'r6', title: 'GL Tie A', mealOccasion: 'lunch', nutrition: { glycemicLoad: 10, glycemicIndex: 50, netCarbs: 25, fiber: 3 } }),
    mockRecipe({ id: 'r7', title: 'GL Tie B', mealOccasion: 'lunch', nutrition: { glycemicLoad: 10, glycemicIndex: 48, netCarbs: 15, fiber: 5 } }),
  ];

  it('returns all published recipes when no filters are active', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(),
    });
    expect(result.current.recipes.length).toBe(7);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('sorts by GL ascending by default, with NC tiebreaker', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(),
    });
    const gls = result.current.recipes.map(r => r._metabolics.glycemicLoad);
    expect(gls[0]).toBe(0);
    expect(gls[1]).toBe(3);

    const gl10s = result.current.recipes.filter(r => r._metabolics.glycemicLoad === 10);
    expect(gl10s[0]._metabolics.netCarbs).toBeLessThanOrEqual(gl10s[1]._metabolics.netCarbs);
  });

  it('handles NC=0 edge case (zero-carb recipes sort to top on GL sort)', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(),
    });
    expect(result.current.recipes[0].id).toBe('r4');
    expect(result.current.recipes[0]._metabolics.glycemicLoad).toBe(0);
    expect(result.current.recipes[0]._metabolics.netCarbs).toBe(0);
  });

  it('filters by meal occasion correctly', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=lunch']),
    });
    expect(result.current.recipes.every(r => r.mealOccasion === 'lunch')).toBe(true);
    expect(result.current.recipes.length).toBe(3);
  });

  it('filters by GL band - Low only returns GL <= 10', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?band=low']),
    });
    expect(result.current.recipes.every(r => r._metabolics.glycemicLoad <= 10)).toBe(true);
    expect(result.current.recipes.length).toBe(5);
  });

  it('filters by custom max GL threshold', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?maxGL=5']),
    });
    expect(result.current.recipes.every(r => r._metabolics.glycemicLoad <= 5)).toBe(true);
    expect(result.current.recipes.length).toBe(2);
  });

  it('composes multiple filters correctly (Dinner + Low GL)', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=dinner&band=low']),
    });
    expect(result.current.recipes.every(r =>
      r.mealOccasion === 'dinner' && r._metabolics.glycemicLoad <= 10
    )).toBe(true);
    expect(result.current.recipes.length).toBe(1);
  });

  it('filters by dietary flags with AND logic', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?dietary=Vegetarian']),
    });
    expect(result.current.recipes.every(r =>
      r.dietaryFlags.includes('Vegetarian')
    )).toBe(true);
    expect(result.current.recipes.length).toBe(2);
  });

  it('returns empty array for impossible filter combinations', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=breakfast&dietary=Gluten-Free']),
    });
    expect(result.current.recipes.length).toBe(0);
  });

  it('sorts by GI ascending', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?sort=gi_asc']),
    });
    const gis = result.current.recipes.map(r => r._metabolics.glycemicIndex ?? 999);
    for (let i = 1; i < gis.length; i++) {
      expect(gis[i]).toBeGreaterThanOrEqual(gis[i - 1]);
    }
  });

  it('sorts by fiber descending', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?sort=fiber_desc']),
    });
    const fibers = result.current.recipes.map(r => r._metabolics.fiber);
    for (let i = 1; i < fibers.length; i++) {
      expect(fibers[i]).toBeLessThanOrEqual(fibers[i - 1]);
    }
  });

  it('generates matched tags reflecting active filter criteria', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=lunch&band=low']),
    });
    const lunchLowRecipes = result.current.recipes;
    expect(lunchLowRecipes.length).toBeGreaterThan(0);
    lunchLowRecipes.forEach(r => {
      expect(r._matchedTags.some(t => t.type === 'occasion')).toBe(true);
      expect(r._matchedTags.some(t => t.type === 'band')).toBe(true);
    });
  });

  it('generates contextual result count label', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=dinner&band=low']),
    });
    expect(result.current.resultCountLabel).toContain('Showing');
    expect(result.current.resultCountLabel).toContain('Low-GL');
    expect(result.current.resultCountLabel).toContain('Dinner');
  });

  it('toggleOccasion adds and removes occasions correctly', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleOccasion('dinner');
    });
    expect(result.current.activeOccasions).toContain('dinner');

    act(() => {
      result.current.toggleOccasion('dinner');
    });
    expect(result.current.activeOccasions).not.toContain('dinner');
  });

  it('resetAll clears all filters', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?occasion=dinner&band=low&sort=gi_asc&dietary=Vegetarian']),
    });

    expect(result.current.activeFilterCount).toBeGreaterThan(0);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.activeOccasions).toEqual([]);
    expect(result.current.activeBands).toEqual([]);
    expect(result.current.activeDietary).toEqual([]);
  });

  it('text search filters by title, description, and tags', () => {
    const { result } = renderHook(() => useRecipeFilters(baseRecipes), {
      wrapper: createWrapper(['/?q=salad']),
    });
    expect(result.current.recipes.every(r =>
      r.title.toLowerCase().includes('salad') ||
      r.description.toLowerCase().includes('salad')
    )).toBe(true);
  });

  it('exports constant definitions', () => {
    expect(MEAL_OCCASIONS).toBeDefined();
    expect(MEAL_OCCASIONS.length).toBeGreaterThan(0);
    expect(SORT_OPTIONS).toBeDefined();
    expect(GL_BANDS).toBeDefined();
  });
});
