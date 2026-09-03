import React, { useState, useEffect, useMemo } from 'react';
import RedirectNudgeCard from '../components/patient/RedirectNudgeCard';
import { evaluateRecipeNutritionCompleteness } from '../utils/provenanceEvaluator';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EditorFormFields from '../components/admin/EditorFormFields';
import EditorPreviewCard from '../components/admin/EditorPreviewCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { saveRecipe, getRecipeById } from '../utils/recipeStore';
import { adaptLegacyRecipeLine } from '../utils/provenanceAdapters';
import { getIngredientById } from '../utils/ingredientStore';

const DRAFT_SESSION_KEY = 'glyco_editor_draft_session';

const BLANK_FORM = {
  title: '',
  description: '',
  prepTime: '',
  cookingTime: '',
  servings: 1,
  imageUrl: '',
  tags: [],
  ingredients: [],
  steps: [{ id: 1, title: '', description: '', timer: '' }],
};

function serializeRecipeIngredients(ingredients = []) {
  return (ingredients || []).map((line) => ({
    ...line,
    ingredientId: line.ingredientId || undefined,
    amount: line.quantity ?? line.amount ?? 100,
    unit: line.unit || 'g',
    prepState: line.prepState || 'raw',
  }));
}

const generateRecipeId = (title) => {
  const slug = (title || 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug}-${Date.now()}`;
};

export const AdminEditor = () => {
  const { user, addFavorite } = useAuth();
  const { canPublishPublic, canCreateDrafts } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Mobile segmented view toggle: 'form' vs 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState('form');

  // Form State
  const [formData, setFormData] = useState(() => {
    if (!editId) {
      try {
        const savedSession = sessionStorage.getItem(DRAFT_SESSION_KEY);
        if (savedSession) {
          return JSON.parse(savedSession);
        }
      } catch (err) {
        console.warn('[AdminEditor] Failed to parse draft session:', err);
      }
      return BLANK_FORM;
    }
    return BLANK_FORM;
  });

  const [isExistingRecipe, setIsExistingRecipe] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => {
    if (!editId) {
      return Boolean(sessionStorage.getItem(DRAFT_SESSION_KEY));
    }
    return false;
  });

  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showReviewNudge, setShowReviewNudge] = useState(true);

  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const completeness = useMemo(() => {
    return evaluateRecipeNutritionCompleteness(formData.ingredients || []);
  }, [formData.ingredients]);

  const hasCustomOrEstimated = useMemo(() => {
    const lines = formData.ingredients || [];
    const hasCustomLines = lines.some(
      (line) =>
        line?.source === 'user_entered' ||
        line?.isUserAuthored === true ||
        line?.giEvidenceStatus === 'unavailable' ||
        line?.status === 'estimated'
    );
    return hasCustomLines || completeness.status === 'estimated';
  }, [formData.ingredients, completeness]);



  // Load existing recipe if editId parameter is present
  useEffect(() => {
    if (!editId) {
      setIsExistingRecipe(false);
      return;
    }
    let cancelled = false;
    async function loadEdit() {
      const existing = await getRecipeById(editId);
      if (cancelled || !existing) return;
      setFormData({
        id: existing.id,
        title: existing.title || '',
        description: existing.description || '',
        prepTime: existing.prepTime || '',
        cookingTime: existing.cookingTime || 0,
        servings: existing.servings || 1,
        imageUrl: existing.imageUrl || '',
        tags: existing.tags ?? [],
        ingredients: (existing.ingredients ?? []).map((line) => {
            if (line && line.source && line.validation) return line;
            return adaptLegacyRecipeLine(line, (id) => getIngredientById(id));
          }),
        steps: existing.steps && existing.steps.length > 0
          ? existing.steps
          : [{ id: 1, title: '', description: '', timer: '' }],
      });
      setIsExistingRecipe(true);
      setHasRestoredDraft(false);
    }
    loadEdit();
    return () => { cancelled = true; };
  }, [editId]);

  // Save active form state to sessionStorage to guard against accidental refresh
  useEffect(() => {
    if (!editId && (formData?.title || (formData?.ingredients && formData.ingredients.length > 0))) {
      try {
        sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(formData));
      } catch (err) {
        console.warn('[AdminEditor] Could not write to sessionStorage:', err);
      }
    }
  }, [formData, editId]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleClearRestoredDraft = () => {
    sessionStorage.removeItem(DRAFT_SESSION_KEY);
    setFormData(BLANK_FORM);
    setHasRestoredDraft(false);
    setLastSavedTime(null);
    showNotification('Cleared draft session. Editor initialized to blank state.', 'draft');
  };

  // Validation Rules
  const isTitleValid = Boolean(formData.title && formData.title.trim().length > 0);
  const isServingsValid = Boolean(Number(formData.servings) > 0);
  const isIngredientsValid = Boolean(Array.isArray(formData.ingredients) && formData.ingredients.length >= 1);
  const isPublishValid = isTitleValid && isServingsValid && isIngredientsValid;

  const missingValidationItems = [];
  if (!isTitleValid) missingValidationItems.push('Recipe Title');
  if (!isServingsValid) missingValidationItems.push('Yield / Servings (> 0)');
  if (!isIngredientsValid) missingValidationItems.push('At least 1 Ingredient');

  /**
   * Publishes the recipe to Strapi `/api/recipes` with `publishedAt: ISO String`.
   */
  const handlePublish = async () => {
    if (isSaving || !isPublishValid) return;
    setIsSaving(true);

    try {
      const finalId = editId || formData.id || generateRecipeId(formData.title);
      const nowIso = new Date().toISOString();
      const serializedIngredients = serializeRecipeIngredients(formData.ingredients);

      const newRecipe = {
        ...formData,
        id: finalId,
        ingredients: serializedIngredients,
        authorId: user?.email || 'admin@glycogourmet.com',
        isUserAuthored: true,
        status: 'published',
        publishedAt: nowIso,
      };

      await saveRecipe(newRecipe, {
        isUpdate: isExistingRecipe || !!editId,
        publishedAt: nowIso,
      });

      sessionStorage.removeItem(DRAFT_SESSION_KEY);
      if (addFavorite) addFavorite(finalId);
      showNotification('✅ Recipe published to Strapi CMS successfully!', 'success');
      
      // Navigate to recipe detail after 1.2s
      setTimeout(() => { navigate(`/recipe/${finalId}`); }, 50);
    } catch (err) {
      console.error('[AdminEditor] Strapi publish failed:', err?.name, err?.message, err?.stack);
      showNotification(`⚠️ Publish failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Saves the recipe as a draft to Strapi `/api/recipes` with `publishedAt: null`.
   */
  
  const handleSubmitReview = async () => {
    if (isSaving || !isPublishValid) return;
    setIsSaving(true);

    try {
      const finalId = editId || formData.id || generateRecipeId(formData.title);
      const serializedIngredients = serializeRecipeIngredients(formData.ingredients);
      const evalResult = evaluateRecipeNutritionCompleteness(formData.ingredients || []);
      const recalculationMetadata = {
        evaluatedAt: new Date().toISOString(),
        completenessStatus: evalResult.status,
        canCalculateGl: evalResult.canCalculateGl,
        canCalculateNutrition: evalResult.canCalculateNutrition,
        missingNutritionLinesCount: evalResult.missingNutritionLines.length,
        missingGiLinesCount: evalResult.missingGiLines.length,
        warningsCount: evalResult.warnings.length,
      };

      const newRecipe = {
        ...formData,
        id: finalId,
        ingredients: serializedIngredients,
        title: formData.title || 'Untitled Draft',
        authorId: user?.email || 'user@glycogourmet.com',
        isUserAuthored: true,
        status: 'pending_review',
        publishedAt: null,
        recalculationMetadata,
      };

      await saveRecipe(newRecipe, {
        isUpdate: isExistingRecipe || !!editId,
        publishedAt: null,
      });

      sessionStorage.removeItem(DRAFT_SESSION_KEY);
      showNotification('Submitted to clinical review', 'success');
      setTimeout(() => { navigate("/recipes/mine"); }, 50);
    } catch (err) {
      console.error('[AdminEditor] Submit for review failed:', err);
      showNotification(`⚠️ Submit failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalId = editId || formData.id || generateRecipeId(formData.title);
      const serializedIngredients = serializeRecipeIngredients(formData.ingredients);
      const evalResult = evaluateRecipeNutritionCompleteness(formData.ingredients || []);
      const recalculationMetadata = {
        evaluatedAt: new Date().toISOString(),
        completenessStatus: evalResult.status,
        canCalculateGl: evalResult.canCalculateGl,
        canCalculateNutrition: evalResult.canCalculateNutrition,
        missingNutritionLinesCount: evalResult.missingNutritionLines.length,
        missingGiLinesCount: evalResult.missingGiLines.length,
        warningsCount: evalResult.warnings.length,
      };

      const newRecipe = {
        ...formData,
        id: finalId,
        ingredients: serializedIngredients,
        title: formData.title || 'Untitled Draft',
        authorId: user?.email || 'admin@glycogourmet.com',
        isUserAuthored: true,
        status: 'draft',
        publishedAt: null,
        recalculationMetadata,
      };

      await saveRecipe(newRecipe, {
        isUpdate: isExistingRecipe || !!editId,
        publishedAt: null,
      });

      sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(newRecipe));
      setFormData(prev => ({ ...prev, id: finalId, recalculationMetadata }));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      showNotification('Draft saved to Strapi CMS successfully.', 'draft');
      if (!editId) {
        navigate(`/admin-editor?edit=${finalId}`);
      }
    } catch (err) {
      console.error('[AdminEditor] Strapi draft save failed:', err);
      showNotification(`⚠️ Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const notifBg =
    notification?.type === 'draft'
      ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/30'
      : notification?.type === 'error'
        ? 'bg-error-container text-on-error-container border-error/30'
        : 'bg-primary text-on-primary border-primary-fixed-dim/20';

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-screen relative bg-surface" aria-label="Recipe Editor">
      {/* Floating notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-[100] font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs md:text-sm border animate-fade-in ${notifBg}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {notification.type === 'error' ? 'error' : 'task_alt'}
          </span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-white border-b border-outline-variant/30 px-4 md:px-8 py-3 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg md:text-xl font-bold text-primary">
              {editId ? 'Edit Recipe' : 'Create New Recipe'}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {editId ? 'Strapi Update' : 'Blank State'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
            Formulate blood-sugar balancing meals with real-time metabolic recalculation & Strapi CMS persistence.
          </p>
        </div>

        {/* Mobile View Toggle Segmented Buttons (< 1024px) */}
        <div className="lg:hidden flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setActiveMobileTab('form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMobileTab === 'form'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Edit Form
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMobileTab === 'preview'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Live Preview
          </button>
        </div>
      </header>

      {/* Restored draft notification banner */}
      {hasRestoredDraft && (
        <div
          role="status"
          aria-live="polite"
          className="bg-tertiary-container/20 border-b border-tertiary/30 px-4 py-2 flex items-center justify-between text-xs text-on-surface"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[18px]">history</span>
            <span>Restored draft session from your browser. Continue editing or clear draft.</span>
          </div>
          <button
            type="button"
            onClick={handleClearRestoredDraft}
            className="text-[11px] font-bold text-tertiary hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">clear</span>
            Clear draft session
          </button>
        </div>
      )}

      {/* Cloud saved draft notification banner */}
      {lastSavedTime && (
        <div
          role="status"
          aria-live="polite"
          className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between text-xs text-on-surface"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">cloud_done</span>
            <span>Draft saved to Strapi CMS successfully at {lastSavedTime}.</span>
          </div>
        </div>
      )}

      {/* Main Split-Pane Canvas */}
      <div className="flex-grow overflow-hidden pb-20 lg:pb-24">
        {/* Desktop Split-Pane (lg:grid lg:grid-cols-12 gap-8) */}
        <div className="h-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 lg:grid lg:grid-cols-12 lg:gap-8 overflow-hidden">
          
          {/* Left Form Pane (lg:col-span-7) */}
          <section
            className={`h-full overflow-y-auto pr-1 lg:col-span-7 space-y-6 ${
              activeMobileTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
            aria-label="Recipe Input Form"
          >
            <EditorFormFields
              formData={formData}
              setFormData={setFormData}
            />

            {/* Optional Dietitian Review Nudge */}
            {showReviewNudge && hasCustomOrEstimated && (formData.ingredients || []).length > 0 && (
              <div className="pt-2">
                <RedirectNudgeCard
                  title="Optional Dietitian Review"
                  description="Your recipe is private to your account. If you would like expert guidance, a certified dietitian can collaborate with you to review ingredient choices and glycemic balance."
                  triggerReason="Suggested as an optional resource because your recipe contains user-entered ingredients or estimated glycemic values."
                  explanationData={{
                    title: 'Why am I seeing this review option?',
                    reason: 'Offered as an optional resource because your recipe contains custom ingredients or estimated glycemic values.',
                    dataUsed: 'Recipe ingredient lines and glycemic completeness evaluation.',
                  }}
                  onKeepManaging={() => setShowReviewNudge(false)}
                  onRequestSession={handleSubmitReview}
                  actionLabel="Submit for Dietitian Review"
                />
              </div>
            )}
          </section>

          {/* Right Live Preview Pane (lg:col-span-5 sticky top-20 h-fit) */}
          <section
            className={`h-full overflow-y-auto lg:col-span-5 lg:sticky lg:top-4 lg:h-fit ${
              activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
            aria-label="Live Recipe Card Preview"
          >
            <div className="pb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Preview Pane
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Real-time metabolic calculation
                </span>
              </div>
              <EditorPreviewCard formData={formData} />
            </div>
          </section>
        </div>
      </div>

      {/* ── Persistent Action Dock (Bottom fixed dock) ──────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 px-4 md:px-8 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Validation Status Indicator / Tooltip */}
          <div className="hidden sm:flex items-center gap-2">
            {isPublishValid ? (
              <span className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Ready to Publish
              </span>
            ) : (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/60 px-3 py-1 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-tertiary text-[16px]">info</span>
                <span>Requires:</span>
                <span className="font-bold text-error">{missingValidationItems.join(' • ')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={isSaving || !canCreateDrafts}
              className="h-12 px-5 font-bold text-xs md:text-sm text-on-surface-variant hover:text-primary cursor-pointer border border-outline-variant/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px] mr-1">save</span>
              {canPublishPublic ? 'Save as Draft' : 'Save Personal Draft'}
            </Button>
            
            <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const targetId = editId || formData.id || 'my-draft-id';
                  navigate(`/recipe/${targetId}?preview=true`);
                }}
                className="h-12 px-5 font-bold text-xs md:text-sm text-on-surface-variant hover:text-primary cursor-pointer border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px] mr-1">visibility</span>
                Preview Draft
              </Button>

            <div className="relative group">
              <Button
                type="button"
                onClick={canPublishPublic ? handlePublish : handleSubmitReview}
                disabled={isSaving || !isPublishValid}
                className="h-12 px-6 font-bold text-xs md:text-sm shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin mr-1">progress_activity</span>
                    {canPublishPublic ? 'Publishing...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-1">{canPublishPublic ? 'publish' : 'grading'}</span>
                    {canPublishPublic ? 'Publish Recipe' : 'Submit to Clinical Review'}
                  </>
                )}
              </Button>

              {/* Hover Tooltip when Publish button is disabled */}
              {!isPublishValid && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-xl text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-bold text-tertiary border-b border-white/10 pb-1 mb-1">
                    Complete Required Fields:
                  </p>
                  <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                    {!isTitleValid && <li>Enter a recipe title</li>}
                    {!isServingsValid && <li>Specify yield / servings (&gt; 0)</li>}
                    {!isIngredientsValid && <li>Add at least 1 ingredient</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AdminEditor;
