import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MealPlans } from '../MealPlans';
import { usePreferences } from '../../context/UserPreferences';
import { getAllRecipes } from '../../utils/recipeStore';
import { calculateRecipeNutrition } from '../../utils/nutritionCalculator';

vi.mock('../../context/UserPreferences', () => ({
  usePreferences: vi.fn(),
}));

vi.mock('../../utils/recipeStore', () => ({
  getAllRecipes: vi.fn(),
}));

vi.mock('../../utils/nutritionCalculator', () => ({
  deriveAllergensFromIngredients: vi.fn(() => []),
  calculateRecipeNutrition: vi.fn(),
  getGlycemicLoadCategory: vi.fn((gl) => {
    if (gl <= 10) return { label: 'Gentle Impact', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
    if (gl <= 19) return { label: 'Moderate Impact', colorClass: 'text-tertiary', bgClass: 'bg-tertiary/10' };
    return { label: 'High Spike Risk', colorClass: 'text-error', bgClass: 'bg-error/10' };
  }),
}));

describe('US-1.2: MealPlans Positive Reinforcement & Safe Day Duplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    localStorage.clear();

    usePreferences.mockReturnValue({
      dailyGlTarget: 45,
    });

    getAllRecipes.mockResolvedValue([
      { id: 'rec-1', title: 'Salmon Salad', ingredients: [] },
      { id: 'rec-2', title: 'Avocado Bowl', ingredients: [] },
      { id: 'rec-3', title: 'Quinoa Dish', ingredients: [] },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  const renderMealPlans = () =>
    render(
      <MemoryRouter>
        <MealPlans />
      </MemoryRouter>
    );

  it('Scenario 1.1: Triggers gold Balanced Day star icon and Sage Green border when daily GL is between 50% and 100% of target', async () => {
    // 35 GL / 45 GL target = 77% (Safe Day)
    calculateRecipeNutrition.mockReturnValue({ glycemicLoad: 11.66, netCarbs: 15, glycemicIndex: 30 });

    renderMealPlans();

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeDefined();
    });

    // Check for "Balanced Day" badge or gold star title
    expect(screen.getAllByText(/Balanced Day/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(/Perfect GL Balanced Day!/i).length).toBeGreaterThan(0);
  });

  it('Scenario 1.2: Suppresses gold star icon when daily GL exceeds target budget (> 100%)', async () => {
    // 60 GL / 45 GL target = 133% (Over Budget)
    calculateRecipeNutrition.mockReturnValue({ glycemicLoad: 20, netCarbs: 35, glycemicIndex: 65 });

    renderMealPlans();

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeDefined();
    });

    // Gold star title should NOT be present when over budget
    expect(screen.queryByTitle(/Perfect GL Balanced Day!/i)).toBeNull();
  });

  it('Scenario 1.3: Duplicates safe day meals to target day when [ Duplicate Day ] is clicked', async () => {
    calculateRecipeNutrition.mockReturnValue({ glycemicLoad: 12, netCarbs: 15, glycemicIndex: 30 });

    renderMealPlans();

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeDefined();
    });

    // Click Duplicate Day button on Monday
    const duplicateBtns = screen.getAllByRole('button', { name: /Duplicate Day/i });
    fireEvent.click(duplicateBtns[0]);

    // Mini calendar modal popover should open
    expect(screen.getByText(/Duplicate Monday's Meals/i)).toBeDefined();

    // Click target day "Tuesday"
    const tuesdayBtn = screen.getByRole('button', { name: /Tuesday/i });
    fireEvent.click(tuesdayBtn);

    // Success feedback toast should appear
    await waitFor(() => {
      expect(screen.getByText(/Successfully duplicated Monday's meal plan to Tuesday!/i)).toBeDefined();
    });
  });
});
