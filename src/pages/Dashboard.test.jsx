import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock UserPreferences
vi.mock('../context/UserPreferences', () => ({
  usePreferences: () => ({
    visualDensity: 'comfortable',
    unitSystem: 'imperial',
    glucoseUnit: 'mgdl',
    setSettings: vi.fn(),
  }),
}));

// Mock recipeStore — async API
vi.mock('../utils/recipeStore', () => ({
  getAllRecipes: vi.fn(() => Promise.resolve([
    {
      id: 'crispy-salmon',
      title: 'Crispy Salmon & Asparagus',
      description: 'Pan-seared salmon with asparagus.',
      imageUrl: 'https://example.com/salmon.jpg',
      tags: ['Low GI', 'High Protein'],
      ingredients: [{ ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' }],
      status: 'published',
      cookingTime: 25,
      isUserAuthored: false,
    },
    {
      id: 'berry-chia',
      title: 'Berry Chia Power Pot',
      description: 'Overnight chia with blueberries.',
      imageUrl: 'https://example.com/chia.jpg',
      tags: ['High Fiber'],
      ingredients: [{ ingredientId: 'chia-seeds', amount: 2, unit: 'tbsp' }],
      status: 'published',
      cookingTime: 10,
      isUserAuthored: false,
    },
  ])),
  saveRecipe: vi.fn(),
  getRecipeById: vi.fn(() => Promise.resolve(null)),
}));

// Mock nutritionCalculator (RecipeCard + HealthHeader use it)
vi.mock('../utils/nutritionCalculator', () => ({
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 200,
    protein: 25,
    fat: 8,
    carbs: 12,
    glycemicIndex: 45,
    glycemicLoad: 5,
    netCarbs: 10,
    fiber: 2,
  })),
  getGlycemicLoadCategory: vi.fn((gl) => {
    if (gl <= 10) return { category: 'Low GL', label: 'Low GL', colorClass: 'text-primary-fixed-dim', bgClass: 'bg-primary-container/15' };
    if (gl <= 19) return { category: 'Medium GL', label: 'Medium GL', colorClass: 'text-tertiary', bgClass: 'bg-tertiary-container/15' };
    return { category: 'High GL', label: 'High GL', colorClass: 'text-error', bgClass: 'bg-error-container/15' };
  }),
}));

// Mock useFavorites for RecipeCard
vi.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  }),
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: {
        name: 'Chef Julian',
        email: 'demo@glyco.com',
        preferences: [],
        visualDensity: 'comfortable',
        favorites: [],
      },
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
    });
  });

  afterEach(() => cleanup());

  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  // --- Greeting ---
  it('renders personalized greeting with user name', () => {
    renderDashboard();
    expect(screen.getByText(/Chef Julian/)).toBeDefined();
  });

  // --- Search bar ---
  it('renders the AI-powered search bar', () => {
    renderDashboard();
    const searchInputs = screen.getAllByRole('textbox');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  // --- Tag chips ---
  it('renders dietary tag chips for filtering', () => {
    renderDashboard();
    expect(screen.getAllByText('Low GI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('High Fiber').length).toBeGreaterThan(0);
  });

  // --- Recipe grid ---
  it('renders recipe cards from the store', async () => {
    renderDashboard();
    const salmonCards = await screen.findAllByText('Crispy Salmon & Asparagus');
    expect(salmonCards.length).toBeGreaterThan(0);
    const chiaCards = await screen.findAllByText('Berry Chia Power Pot');
    expect(chiaCards.length).toBeGreaterThan(0);
  });

  // --- Recommendation section ---
  it('renders recommendation section heading', () => {
    renderDashboard();
    expect(screen.getByText(/Recommended/i)).toBeDefined();
  });
});
