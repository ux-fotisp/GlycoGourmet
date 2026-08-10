import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeCard from './RecipeCard';

// Mock nutritionCalculator to avoid importing the real ingredients.json
vi.mock('../../utils/nutritionCalculator', () => ({
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 291,
    protein: 38,
    fat: 6.8,
    carbs: 20,
    glycemicIndex: 53,
    glycemicLoad: 9,
    netCarbs: 17.5,
    fiber: 2.5,
  })),
  getGlycemicLoadCategory: vi.fn((gl) => {
    if (gl <= 10) return { category: 'Low GL', label: 'Low GL', colorClass: 'text-primary-fixed-dim', bgClass: 'bg-primary-container/15' };
    if (gl <= 19) return { category: 'Medium GL', label: 'Medium GL', colorClass: 'text-tertiary', bgClass: 'bg-tertiary-container/15' };
    return { category: 'High GL', label: 'High GL', colorClass: 'text-error', bgClass: 'bg-error-container/15' };
  }),
}));

// Mock useFavorites
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  }),
}));

const mockRecipe = {
  id: 'crispy-salmon-asparagus',
  title: 'Crispy Salmon & Asparagus',
  description: 'Pan-seared Atlantic salmon with roasted asparagus and a light lemon drizzle.',
  imageUrl: 'https://example.com/salmon.jpg',
  cookingTime: 25,
  tags: ['Low GI', 'High Protein'],
  ingredients: [
    { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' },
    { ingredientId: 'asparagus', amount: 1, unit: 'bunch' },
  ],
};

describe('RecipeCard component', () => {
  afterEach(() => cleanup());

  const renderCard = (recipe = mockRecipe) =>
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} />
      </MemoryRouter>
    );

  // --- Layout structure ---
  it('renders recipe title', () => {
    renderCard();
    expect(screen.getByText('Crispy Salmon & Asparagus')).toBeDefined();
  });

  it('renders recipe description', () => {
    renderCard();
    expect(screen.getByText(/Pan-seared Atlantic salmon/)).toBeDefined();
  });

  it('renders recipe image with alt text', () => {
    renderCard();
    const img = screen.getByAltText('Crispy Salmon & Asparagus');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://example.com/salmon.jpg');
  });

  // --- Tag Badge ---
  it('renders first tag as overlay badge', () => {
    renderCard();
    expect(screen.getByText('Low GI')).toBeDefined();
  });

  // --- GI Outline Pill ---
  it('renders glycemic index as outline pill badge', () => {
    renderCard();
    expect(screen.getByText('GI 53')).toBeDefined();
  });

  // --- GL Solid Pill ---
  it('renders glycemic load as solid pill badge', () => {
    renderCard();
    expect(screen.getByText('GL 9')).toBeDefined();
  });

  // --- Hover effect ---
  it('applies card-hover-effect class for lift transform', () => {
    const { container } = renderCard();
    const card = container.firstChild;
    expect(card.className).toContain('card-hover-effect');
  });

  // --- Link ---
  it('links to recipe detail page', () => {
    const { container } = renderCard();
    const links = container.querySelectorAll('a');
    const detailLink = Array.from(links).find(l => l.getAttribute('href') === '/recipe/crispy-salmon-asparagus');
    expect(detailLink).toBeDefined();
  });

  // --- Favorite button ---
  it('renders a favorite toggle button', () => {
    renderCard();
    const favBtn = screen.getByTitle('Add to favorites');
    expect(favBtn).toBeDefined();
  });

  // --- Plan button ---
  it('renders a plan action button', () => {
    renderCard();
    const planBtn = screen.getByTitle('Add to Meal Plan');
    expect(planBtn).toBeDefined();
  });
});
