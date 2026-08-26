import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecipeFilterBar } from './RecipeFilterBar';

vi.mock('../../utils/nutritionCalculator', () => ({
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0, fiber: 0,
    glycemicIndex: null, glycemicLoad: 0,
  })),
  getGlycemicLoadCategory: () => ({
    category: 'Low GL', label: 'Low GL',
    colorClass: 'text-primary-fixed-dim', bgClass: 'bg-primary-container/15',
  }),
}));

vi.mock('../../utils/ingredientStore', () => ({
  getIngredientById: () => null,
  getIngredientsRegistry: () => [],
  saveCustomIngredient: vi.fn(),
}));

const defaultProps = {
  activeOccasions: [],
  activeSort: 'gl_asc',
  activeBands: [],
  maxGL: null,
  activeDietary: [],
  searchText: '',
  activeFilterCount: 0,
  activeFiltersList: [],
  resultCountLabel: 'Showing 20 recipes',
  toggleOccasion: vi.fn(),
  setSort: vi.fn(),
  toggleBand: vi.fn(),
  setMaxGL: vi.fn(),
  toggleDietary: vi.fn(),
  setSearchText: vi.fn(),
  applyPreset: vi.fn(),
  resetAll: vi.fn(),
};

function renderWithRouter(ui) {
  return render(
    React.createElement(MemoryRouter, null, ui)
  );
}

describe('RecipeFilterBar', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the search input', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByRole('search')).toBeDefined();
    expect(screen.getByPlaceholderText(/search recipes/i)).toBeDefined();
  });

  it('renders meal occasion pills', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByLabelText(/all meals/i)).toBeDefined();
    expect(screen.getByLabelText(/breakfast meals/i)).toBeDefined();
    expect(screen.getByLabelText(/dinner meals/i)).toBeDefined();
  });

  it('renders sort dropdown', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByLabelText(/sort recipes by metabolic metric/i)).toBeDefined();
  });

  it('renders GL impact filter chips', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByRole('switch', { name: /^Low GL/i })).toBeDefined();
    expect(screen.getByRole('switch', { name: /^Med GL/i })).toBeDefined();
    expect(screen.getByRole('switch', { name: /^High GL/i })).toBeDefined();
  });

  it('renders dietary filter buttons', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByLabelText(/vegetarian dietary filter/i)).toBeDefined();
    expect(screen.getByLabelText(/vegan dietary filter/i)).toBeDefined();
    expect(screen.getByLabelText(/gluten-free dietary filter/i)).toBeDefined();
  });

  it('renders quick preset buttons', () => {
    renderWithRouter(React.createElement(RecipeFilterBar, defaultProps));
    expect(screen.getByLabelText(/apply preset.*ultra-low gl/i)).toBeDefined();
    expect(screen.getByLabelText(/apply preset.*under 15m prep/i)).toBeDefined();
    expect(screen.getByLabelText(/apply preset.*safe dinner/i)).toBeDefined();
  });

  it('calls toggleOccasion when a meal pill is clicked', () => {
    const toggleOccasion = vi.fn();
    renderWithRouter(React.createElement(RecipeFilterBar, { ...defaultProps, toggleOccasion }));
    fireEvent.click(screen.getByLabelText(/dinner meals/i));
    expect(toggleOccasion).toHaveBeenCalledWith('dinner');
  });

  it('calls setSort when sort dropdown changes', () => {
    const setSort = vi.fn();
    renderWithRouter(React.createElement(RecipeFilterBar, { ...defaultProps, setSort }));
    fireEvent.change(screen.getByLabelText(/sort recipes by metabolic metric/i), {
      target: { value: 'fiber_desc' },
    });
    expect(setSort).toHaveBeenCalledWith('fiber_desc');
  });

  it('calls toggleBand when a GL chip is clicked', () => {
    const toggleBand = vi.fn();
    renderWithRouter(React.createElement(RecipeFilterBar, { ...defaultProps, toggleBand }));
    fireEvent.click(screen.getByRole('switch', { name: /^Low GL/i }));
    expect(toggleBand).toHaveBeenCalledWith('low');
  });

  it('calls applyPreset when a quick preset is clicked', () => {
    const applyPreset = vi.fn();
    renderWithRouter(React.createElement(RecipeFilterBar, { ...defaultProps, applyPreset }));
    fireEvent.click(screen.getByLabelText(/apply preset.*safe dinner/i));
    expect(applyPreset).toHaveBeenCalledWith('safe_dinner');
  });

  it('shows active filter chips when filters are active', () => {
    const props = {
      ...defaultProps,
      activeFilterCount: 2,
      activeFiltersList: [
        { key: 'occasion:dinner', type: 'occasion', label: 'Dinner', icon: 'dinner_dining', onRemove: vi.fn() },
        { key: 'band:low', type: 'band', label: 'Low GL - Gentle Impact', icon: 'check_circle', onRemove: vi.fn() },
      ],
      resultCountLabel: 'Showing 5 Low-GL Dinner recipes',
    };
    renderWithRouter(React.createElement(RecipeFilterBar, props));
    const activeSection = screen.getByLabelText('Active filters');
    expect(within(activeSection).getByText('Dinner')).toBeDefined();
    expect(within(activeSection).getByText('Low GL - Gentle Impact')).toBeDefined();
    expect(within(activeSection).getByText(/showing 5/i)).toBeDefined();
  });

  it('calls resetAll when Reset All is clicked', () => {
    const resetAll = vi.fn();
    const props = {
      ...defaultProps,
      resetAll,
      activeFilterCount: 1,
      activeFiltersList: [
        { key: 'band:low', type: 'band', label: 'Low GL', icon: 'check_circle', onRemove: vi.fn() },
      ],
    };
    renderWithRouter(React.createElement(RecipeFilterBar, props));
    const activeSection = screen.getByLabelText('Active filters');
    fireEvent.click(within(activeSection).getByRole('button', { name: /reset all filters/i }));
    expect(resetAll).toHaveBeenCalled();
  });
});
