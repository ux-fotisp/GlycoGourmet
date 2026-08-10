import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyRecipes } from './MyRecipes';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}));

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

describe('MyRecipes page', () => {
  const mockAuthoredRecipes = [
    {
      id: 'my-custom-recipe',
      title: 'My Keto Bowl',
      description: 'Custom authored keto bowl.',
      imageUrl: 'https://example.com/keto.jpg',
      tags: ['Keto-Friendly'],
      ingredients: [{ ingredientId: 'avocado', amount: 1, unit: 'piece' }],
      status: 'published',
      isUserAuthored: true,
    },
  ];

  const mockAllRecipes = [
    ...mockAuthoredRecipes,
    {
      id: 'crispy-salmon',
      title: 'Crispy Salmon',
      description: 'System recipe for salmon.',
      imageUrl: 'https://example.com/salmon.jpg',
      tags: ['Low GI'],
      ingredients: [{ ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz' }],
      status: 'published',
      isUserAuthored: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAuth.mockReturnValue({
      user: {
        name: 'Chef Julian',
        email: 'demo@glyco.com',
        favorites: ['crispy-salmon'],
      },
    });
    useRecipes.mockReturnValue({
      authoredRecipes: mockAuthoredRecipes,
      allRecipes: mockAllRecipes,
    });
    useFavorites.mockReturnValue({
      favorites: ['crispy-salmon'],
      isFavorite: (id) => id === 'crispy-salmon',
      toggleFavorite: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderMyRecipes = () =>
    render(
      <MemoryRouter>
        <MyRecipes />
      </MemoryRouter>
    );

  // --- Tab rendering ---
  it('renders Authored and Favorites tabs', () => {
    renderMyRecipes();
    expect(screen.getByText(/My Authored Recipes/i)).toBeDefined();
    expect(screen.getByText(/Saved Favorites/i)).toBeDefined();
  });

  // --- Authored tab shows user-authored recipes ---
  it('shows user-authored recipes on Authored tab', () => {
    renderMyRecipes();
    expect(screen.getByText('My Keto Bowl')).toBeDefined();
  });

  // --- Create button ---
  it('renders Create New Recipe button', () => {
    renderMyRecipes();
    expect(screen.getByText(/Create New Recipe/i)).toBeDefined();
  });

  // --- Favorites tab ---
  it('switches to Favorites tab and shows favorited recipes', () => {
    renderMyRecipes();
    const favTab = screen.getByText(/Saved Favorites/i);
    fireEvent.click(favTab);
    // Crispy Salmon is in favorites
    expect(screen.getByText('Crispy Salmon')).toBeDefined();
  });
});
