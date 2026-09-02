import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminEditor } from './AdminEditor';
import { useAuth } from '../context/AuthContext';
import { saveRecipe } from '../utils/recipeStore';

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

// Mock the child components to allow injecting and testing form state
vi.mock('../components/admin/EditorFormFields', () => ({
  default: ({ formData, setFormData }) => (
    <div data-testid="editor-form">
      <button
        type="button"
        onClick={() =>
          setFormData({
            ...formData,
            title: 'Provenance Quinoa Bowl',
            servings: 2,
            ingredients: [
              {
                id: 'line_custom_id_456',
                ingredientId: 'quinoa-cooked',
                displayName: 'Quinoa (Cooked)',
                quantity: 150,
                unit: 'g',
                normalizedGrams: 150,
                prepState: 'boiled',
                source: 'internal_verified',
                giEvidenceStatus: 'available',
                glycemicIndex: 53,
                nutritionPer100g: {
                  energyKcal: 120,
                  carbohydrateG: 21.3,
                  fiberG: 2.8,
                  proteinG: 4.4,
                  fatG: 1.9,
                },
                validation: { status: 'complete', reasons: [] },
              },
            ],
          })
        }
      >
        Set Provenance Line
      </button>
    </div>
  ),
}));

vi.mock('../components/admin/EditorPreviewCard', () => ({
  default: () => <div data-testid="editor-preview">EditorPreview</div>,
}));

describe('AdminEditor page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAuth.mockReturnValue({
      user: { email: 'admin@glycogourmet.com', name: 'Chef Julian', roleType: 'admin', isApproved: true },
      isAuthenticated: true,
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

  // --- Provenance & Dual Serialization Verification ---
  it('serializes canonical provenance ingredient lines into dual-format payload with flat legacy fields when saving draft', async () => {
    renderEditor();

    // Populate form with canonical provenance ingredient line
    fireEvent.click(screen.getByText('Set Provenance Line'));

    // Trigger Save Draft
    const saveDraftBtn = screen.getByRole('button', { name: /save (as )?draft/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(saveRecipe).toHaveBeenCalledTimes(1);
    });

    const [savedPayload, saveOptions] = saveRecipe.mock.calls[0];
    expect(saveOptions.publishedAt).toBeNull();
    expect(savedPayload.status).toBe('draft');
    expect(Array.isArray(savedPayload.ingredients)).toBe(true);
    expect(savedPayload.ingredients).toHaveLength(1);

    const savedLine = savedPayload.ingredients[0];

    // Verify canonical provenance fields are preserved
    expect(savedLine.id).toBe('line_custom_id_456');
    expect(savedLine.displayName).toBe('Quinoa (Cooked)');
    expect(savedLine.quantity).toBe(150);
    expect(savedLine.unit).toBe('g');
    expect(savedLine.normalizedGrams).toBe(150);
    expect(savedLine.source).toBe('internal_verified');
    expect(savedLine.giEvidenceStatus).toBe('available');
    expect(savedLine.glycemicIndex).toBe(53);
    expect(savedLine.prepState).toBe('boiled');
    expect(savedLine.validation).toEqual({ status: 'complete', reasons: [] });
    expect(savedLine.nutritionPer100g).toEqual({
      energyKcal: 120,
      carbohydrateG: 21.3,
      fiberG: 2.8,
      proteinG: 4.4,
      fatG: 1.9,
    });

    // Verify flat legacy-compatible fields are populated directly without string parsing
    expect(savedLine.ingredientId).toBe('quinoa-cooked');
    expect(savedLine.amount).toBe(150);
    expect(savedLine.unit).toBe('g');
    expect(savedLine.prepState).toBe('boiled');
  });

  it('serializes canonical provenance ingredient lines into dual-format payload with flat legacy fields when publishing recipe', async () => {
    renderEditor();

    // Populate form with canonical provenance ingredient line
    fireEvent.click(screen.getByText('Set Provenance Line'));

    // Trigger Publish Recipe
    const publishBtn = screen.getByRole('button', { name: /publish recipe/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(saveRecipe).toHaveBeenCalledTimes(1);
    });

    const [savedPayload, saveOptions] = saveRecipe.mock.calls[0];
    expect(saveOptions.publishedAt).toBeDefined();
    expect(savedPayload.status).toBe('published');
    expect(Array.isArray(savedPayload.ingredients)).toBe(true);
    expect(savedPayload.ingredients).toHaveLength(1);

    const savedLine = savedPayload.ingredients[0];

    // Verify canonical provenance fields
    expect(savedLine.id).toBe('line_custom_id_456');
    expect(savedLine.source).toBe('internal_verified');
    expect(savedLine.prepState).toBe('boiled');

    // Verify flat legacy-compatible fields
    expect(savedLine.ingredientId).toBe('quinoa-cooked');
    expect(savedLine.amount).toBe(150);
    expect(savedLine.unit).toBe('g');
    expect(savedLine.prepState).toBe('boiled');
  });
});
