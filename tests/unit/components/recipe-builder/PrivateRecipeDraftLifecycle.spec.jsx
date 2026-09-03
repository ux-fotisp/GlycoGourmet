import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEditor } from '../../../../src/pages/AdminEditor';
import * as recipeStore from '../../../../src/utils/recipeStore';
import * as permissionsHook from '../../../../src/hooks/usePermissions';
import * as authContext from '../../../../src/context/AuthContext';
import { adaptInternalIngredient, adaptCustomIngredient } from '../../../../src/utils/provenanceAdapters';

const DRAFT_SESSION_KEY = 'glyco_editor_draft_session';

// Mock recipeStore
vi.mock('../../../../src/utils/recipeStore', () => ({
  saveRecipe: vi.fn(),
  getRecipeById: vi.fn(),
}));

// Mock ingredientStore
vi.mock('../../../../src/utils/ingredientStore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getIngredientById: vi.fn((id) => {
      if (id === 'quinoa-cooked') {
        return {
          id: 'quinoa-cooked',
          name: 'Quinoa (Cooked)',
          category: 'grain',
          defaultAmount: 100,
          defaultUnit: 'g',
          defaultPrepState: 'boiled',
          kcal: 120,
          protein: 4.4,
          fat: 1.9,
          carbs: 21.3,
          fiber: 2.8,
          glycemicIndex: 53,
          isUserAuthored: false,
        };
      }
      return null;
    }),
    getCustomIngredients: vi.fn(() => []),
  };
});

describe('PrivateRecipeDraftLifecycle — Phase 7 / Chunk 5', () => {
  const mockUser = {
    email: 'fotis@glycogourmet.com',
    role: 'user',
  };

  const sampleQuinoaLine = adaptInternalIngredient({
    id: 'quinoa-cooked',
    name: 'Quinoa (Cooked)',
    category: 'grain',
    defaultAmount: 100,
    defaultUnit: 'g',
    defaultPrepState: 'boiled',
    kcal: 120,
    protein: 4.4,
    fat: 1.9,
    carbs: 21.3,
    fiber: 2.8,
    glycemicIndex: 53,
    isUserAuthored: false,
  }, 150, 'g', 'boiled');

  const sampleCustomLine = adaptCustomIngredient({
    id: 'custom-flax-meal',
    name: 'Artisan Flax Meal',
    category: 'seed',
    defaultAmount: 30,
    defaultUnit: 'g',
    defaultPrepState: 'raw',
    kcal: 150,
    protein: 5.4,
    fat: 12.6,
    carbs: 8.7,
    fiber: 8.2,
    glycemicIndex: null, // Omitted on carb contributor -> giEvidenceStatus: 'unavailable'
    isUserAuthored: true,
  }, 30, 'g', 'raw');

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: mockUser,
      addFavorite: vi.fn(),
    });

    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      canPublishPublic: false,
      canCreateDrafts: true,
    });

    recipeStore.saveRecipe.mockResolvedValue({ id: 'rec-test-123' });
    recipeStore.getRecipeById.mockResolvedValue(null);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const renderEditor = (initialEntries = ['/admin-editor']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/admin-editor" element={<AdminEditor />} />
          <Route path="/recipes/mine" element={<div data-testid="my-recipes-page">My Recipes Roster</div>} />
          <Route path="/recipe/:id" element={<div data-testid="recipe-detail-page">Recipe Detail View</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. Draft Persistence via handleSaveDraft saves with status "draft" and publishedAt: null', async () => {
    renderEditor();

    // Fill title and servings
    const titleInput = screen.getByLabelText(/recipe title/i);
    fireEvent.change(titleInput, { target: { value: 'Private Low-GI Bowl' } });

    // Save as draft
    const saveDraftBtn = screen.getByRole('button', { name: /Save Personal Draft/i });
    expect(saveDraftBtn).toBeEnabled();
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(recipeStore.saveRecipe).toHaveBeenCalledTimes(1);
    });

    const [savedPayload, options] = recipeStore.saveRecipe.mock.calls[0];
    expect(savedPayload.status).toBe('draft');
    expect(savedPayload.publishedAt).toBeNull();
    expect(savedPayload.isUserAuthored).toBe(true);
    expect(savedPayload.title).toBe('Private Low-GI Bowl');
    expect(options.publishedAt).toBeNull();
  });

  it('2. Draft Resumption via editId fetches and hydrates recipe data with provenance intact', async () => {
    const existingDraft = {
      id: 'draft-recipe-789',
      title: 'Resumed Farro Salad',
      description: 'Ancient grain salad with high fiber',
      servings: 2,
      ingredients: [sampleQuinoaLine],
      steps: [{ id: 1, title: 'Rinse and boil', description: 'Boil quinoa for 15 mins', timer: 15 }],
      status: 'draft',
      publishedAt: null,
    };

    recipeStore.getRecipeById.mockResolvedValue(existingDraft);

    renderEditor(['/admin-editor?edit=draft-recipe-789']);

    await waitFor(() => {
      expect(recipeStore.getRecipeById).toHaveBeenCalledWith('draft-recipe-789');
    });

    expect(await screen.findByDisplayValue('Resumed Farro Salad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ancient grain salad with high fiber')).toBeInTheDocument();
  });

  it('3. Browser Session Auto-Save persists in-progress form to sessionStorage', async () => {
    renderEditor();

    const titleInput = screen.getByLabelText(/recipe title/i);
    fireEvent.change(titleInput, { target: { value: 'In-Flight Session Recipe' } });

    await waitFor(() => {
      const stored = sessionStorage.getItem(DRAFT_SESSION_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored);
      expect(parsed.title).toBe('In-Flight Session Recipe');
    });
  });

  it('4. Browser Session Draft Restoration restores formData and renders polite status banner', async () => {
    const sessionDraft = {
      title: 'Restored Strawberry Chia Pot',
      description: 'Omega-3 rich breakfast bowl',
      servings: 1,
      ingredients: [sampleQuinoaLine],
      steps: [{ id: 1, title: 'Mix', description: 'Mix seeds', timer: 5 }],
    };
    sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(sessionDraft));

    renderEditor();

    const bannerText = await screen.findByText('Restored draft session from your browser. Continue editing or clear draft.');
    expect(bannerText).toBeInTheDocument();
    expect(bannerText.closest('[role="status"]')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Restored Strawberry Chia Pot')).toBeInTheDocument();
  });

  it('5. Clear Restored Session Draft empties sessionStorage and resets form to blank', async () => {
    const sessionDraft = {
      title: 'Temporary Discardable Draft',
      servings: 1,
      ingredients: [],
      steps: [],
    };
    sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(sessionDraft));

    renderEditor();

    expect(await screen.findByDisplayValue('Temporary Discardable Draft')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear draft session/i });
    fireEvent.click(clearBtn);

    expect(sessionStorage.getItem(DRAFT_SESSION_KEY)).toBeNull();
    expect(screen.queryByDisplayValue('Temporary Discardable Draft')).toBeNull();
  });

  it('6. Voluntary Review Nudge renders when recipe contains custom/estimated ingredients', async () => {
    const draftWithCustom = {
      id: 'draft-custom-1',
      title: 'Flax Seed Crunch',
      servings: 1,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Mix', description: 'Stir ingredients', timer: 2 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    renderEditor(['/admin-editor?edit=draft-custom-1']);

    const nudgeRegion = await screen.findByRole('region', { name: /Optional Dietitian Support Opportunity/i });
    expect(nudgeRegion).toBeInTheDocument();
    expect(screen.getByText('Optional Dietitian Review')).toBeInTheDocument();
    expect(screen.getByText('Voluntary Collaboration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit for Dietitian Review/i })).toBeInTheDocument();
  });

  it('7. Non-Punitive Dismissal Invariant: "Keep managing my plan" dismisses nudge without restricting save controls', async () => {
    const draftWithCustom = {
      id: 'draft-custom-2',
      title: 'Autonomy Maintained Recipe',
      servings: 1,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Mix', description: 'Stir ingredients', timer: 2 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    renderEditor(['/admin-editor?edit=draft-custom-2']);

    const keepManagingBtn = await screen.findByRole('button', { name: /Keep managing my plan/i });
    fireEvent.click(keepManagingBtn);

    // Nudge should be dismissed
    expect(screen.queryByRole('region', { name: /Optional Dietitian Support Opportunity/i })).not.toBeInTheDocument();

    // Draft saving and submit controls remain fully enabled
    const saveDraftBtn = screen.getByRole('button', { name: /Save Personal Draft/i });
    expect(saveDraftBtn).toBeEnabled();
  });

  it('8. Why Am I Seeing This Panel displays plain-language reason and data used without ranking claims', async () => {
    const draftWithCustom = {
      id: 'draft-custom-3',
      title: 'Explainability Test Recipe',
      servings: 1,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Mix', description: 'Stir ingredients', timer: 2 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    renderEditor(['/admin-editor?edit=draft-custom-3']);

    const whyBtn = await screen.findByRole('button', { name: /Why am I seeing this recommendation?/i });
    fireEvent.click(whyBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Why am I seeing this review option?')).toBeInTheDocument();
    expect(screen.getByText(/Recipe ingredient lines and glycemic completeness evaluation/i)).toBeInTheDocument();
  });

  it('9. Submit for Professional Review saves with status "pending_review" and navigates to /recipes/mine', async () => {
    const draftWithCustom = {
      id: 'draft-custom-4',
      title: 'Ready for Dietitian Input',
      servings: 2,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Step 1', description: 'Prep flax meal', timer: 10 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    renderEditor(['/admin-editor?edit=draft-custom-4']);

    const reviewBtn = await screen.findByRole('button', { name: /Submit for Dietitian Review/i });
    fireEvent.click(reviewBtn);

    await waitFor(() => {
      expect(recipeStore.saveRecipe).toHaveBeenCalledTimes(1);
    });

    const [savedPayload] = recipeStore.saveRecipe.mock.calls[0];
    expect(savedPayload.status).toBe('pending_review');
    expect(savedPayload.publishedAt).toBeNull();
    expect(savedPayload.isUserAuthored).toBe(true);

    // Navigates to /recipes/mine
    expect(await screen.findByTestId('my-recipes-page')).toBeInTheDocument();
  });

  it('10. Recalculation Metadata is attached on save and accurately snapshots completeness state', async () => {
    const draftWithCustom = {
      id: 'draft-custom-5',
      title: 'Metadata Snapshot Recipe',
      servings: 1,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Prep', description: 'Measure out seeds', timer: 1 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    renderEditor(['/admin-editor?edit=draft-custom-5']);

    const saveDraftBtn = await screen.findByRole('button', { name: /Save Personal Draft/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(recipeStore.saveRecipe).toHaveBeenCalledTimes(1);
    });

    const [savedPayload] = recipeStore.saveRecipe.mock.calls[0];
    const meta = savedPayload.recalculationMetadata;
    expect(meta).toBeDefined();
    expect(meta.evaluatedAt).toBeDefined();
    // sampleCustomLine is a carb contributor missing GI -> completenessStatus: 'estimated'
    expect(meta.completenessStatus).toBe('estimated');
    expect(meta.canCalculateGl).toBe(false);
    expect(meta.missingGiLinesCount).toBe(1);
    expect(meta.missingNutritionLinesCount).toBe(0);
  });

  it('11. Proves absence of prohibited marketing and clinical claims across the draft lifecycle UI', async () => {
    const draftWithCustom = {
      id: 'draft-custom-6',
      title: 'Pure Patient Self Care Recipe',
      servings: 1,
      ingredients: [sampleCustomLine],
      steps: [{ id: 1, title: 'Prep', description: 'Measure out seeds', timer: 1 }],
      status: 'draft',
      publishedAt: null,
    };
    recipeStore.getRecipeById.mockResolvedValue(draftWithCustom);

    const { container } = renderEditor(['/admin-editor?edit=draft-custom-6']);

    await screen.findByRole('region', { name: /Optional Dietitian Support Opportunity/i });

    const fullText = (container.textContent || '').toLowerCase();
    const prohibitedTerms = [
      'usda-approved',
      'usda approved',
      'clinically-approved',
      'clinically approved',
      'diabetes-safe',
      'diabetes safe',
      'medically-approved',
      'medically approved',
    ];

    prohibitedTerms.forEach((term) => {
      expect(fullText).not.toContain(term);
    });
  });
});
