import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    glycemicLoad: 9.3,
    netCarbs: 17.5,
    fiber: 2.5,
  })),
}));

const mockRecipe = {
  id: 'crispy-salmon-asparagus',
  title: 'Crispy Salmon & Asparagus',
  description: 'Pan-seared Atlantic salmon with roasted asparagus and a light lemon drizzle.',
  imageUrl: 'https://example.com/salmon.jpg',
  tags: ['Low GI', 'High Protein'],
  ingredients: [
    { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' },
    { ingredientId: 'asparagus', amount: 1, unit: 'bunch' },
  ],
};

describe('RecipeCard component', () => {
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

  // --- GI Score Badge ---
  it('renders glycemic index value and classification', () => {
    renderCard();
    expect(screen.getByText('Glycemic Index')).toBeDefined();
    // GI 53 → "Low" classification
    expect(screen.getByText('(Low)')).toBeDefined();
  });

  // --- Sugar Badge ---
  it('renders total sugar estimate', () => {
    renderCard();
    expect(screen.getByText('Total Sugar')).toBeDefined();
    expect(screen.getByText('2.4g')).toBeDefined();
  });

  // --- Hover effect ---
  it('applies card-hover-effect class for lift transform', () => {
    const { container } = renderCard();
    const link = container.querySelector('a');
    expect(link.className).toContain('card-hover-effect');
  });

  // --- Link ---
  it('links to recipe detail page', () => {
    const { container } = renderCard();
    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/recipe/crispy-salmon-asparagus');
  });
});
