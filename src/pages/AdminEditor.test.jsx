import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminEditor } from './AdminEditor';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../utils/recipeStore', () => ({
  saveRecipe: vi.fn(() => Promise.resolve({})),
  getRecipeById: vi.fn(() => Promise.resolve(null)),
  getAllRecipes: vi.fn(() => Promise.resolve([])),
  invalidateRecipeCache: vi.fn(),
}));

vi.mock('../utils/nutritionCalculator', () => ({
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 291, protein: 38, fat: 6.8, carbs: 20,
    glycemicIndex: 53, glycemicLoad: 9.3, netCarbs: 17.5, fiber: 2.5,
  })),
  getIngredientById: vi.fn(() => null),
  getIngredients: vi.fn(() => []),
}));

// Mock the child components to avoid deep rendering
vi.mock('../components/admin/EditorFormFields', () => ({
  default: ({ onPublish, onSaveDraft }) => (
    <div data-testid="editor-form">
      <button onClick={onPublish}>Publish Recipe</button>
      <button onClick={onSaveDraft}>Save Draft</button>
    </div>
  ),
}));

vi.mock('../components/admin/EditorPreviewCard', () => ({
  default: (props) => <div data-testid="editor-preview">EditorPreview</div>,
}));

describe('AdminEditor page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAuth.mockReturnValue({
      user: { email: 'demo@glyco.com', name: 'Chef Julian' },
      addFavorite: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderEditor = () =>
    render(
      <MemoryRouter>
        <AdminEditor />
      </MemoryRouter>
    );

  // --- Split-pane layout ---
  it('renders the EditorFormFields component', () => {
    renderEditor();
    expect(screen.getByTestId('editor-form')).toBeDefined();
  });

  it('renders the EditorPreviewCard component', () => {
    renderEditor();
    expect(screen.getByTestId('editor-preview')).toBeDefined();
  });

  // --- Header ---
  it('renders Create New Recipe heading', () => {
    renderEditor();
    expect(screen.getByText(/Create New Recipe/i)).toBeDefined();
  });

  // --- Save/Publish buttons ---
  it('renders Publish Recipe and Save Draft buttons', () => {
    renderEditor();
    expect(screen.getAllByText(/Publish Recipe/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Save (as )?Draft/i).length).toBeGreaterThan(0);
  });
});
