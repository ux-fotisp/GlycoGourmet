import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRecipeById, saveRecipe } from '../utils/recipeStore';
import { getIngredientById } from '../utils/nutritionCalculator';
import { applyServingScale } from '../services/metabolicEngine';

import DetailHero from '../components/recipe/DetailHero';
import NutritionSnapshot from '../components/recipe/NutritionSnapshot';
import IngredientList from '../components/recipe/IngredientList';
import InstructionSteps from '../components/recipe/InstructionSteps';
import RecipeObjectBridge from '../components/recipe/RecipeObjectBridge';
import SubstitutionModal from '../components/recipe/SubstitutionModal';
import AddToMealPlanModal from '../components/recipe/AddToMealPlanModal';
import CookModeModal from '../components/recipe/CookModeModal';
import DraftPreviewBanner from '../components/recipe/DraftPreviewBanner';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';

/**
 * RecipeDetails Page
 *
 * Structured with healthcare-food aesthetic:
 * - Desktop: Asymmetric split-pane layout with DetailHero, NutritionSnapshot, IngredientList, InstructionSteps, and sticky Quick Action Bridge
 * - Mobile: Stacked layout with persistent fixed bottom dock (+ Meal Plan & Start Cooking)
 */
export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [swappedIngredients, setSwappedIngredients] = useState({});
  const [selectedSub, setSelectedSub] = useState(null);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [showMobilePlanPicker, setShowMobilePlanPicker] = useState(false);

  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const isFavorite = recipe ? checkFavorite(recipe.id) : false;

  useEffect(() => {
    let cancelled = false;
    async function loadRecipe() {
      const found = await getRecipeById(id);
      if (cancelled) return;
      if (found) {
        // Enforce draft privacy protection: only admins/dietitians or preview query can see unpublished drafts
        if (!found.publishedAt || found.status === 'draft') {
          const canViewDraft = isPreview || user?.roleType === 'admin' || user?.roleType === 'dietitian';
          if (!canViewDraft) {
            navigate('/');
            return;
          }
        }
        setRecipe(found);
      } else {
        navigate('/');
      }
    }
    loadRecipe();
    return () => { cancelled = true; };
  }, [id, navigate, isPreview, user]);

  const handlePublish = async () => {
    if (!recipe) return;
    try {
      await saveRecipe(recipe, { isUpdate: true, publishedAt: new Date().toISOString() });
      setRecipe({ ...recipe, status: 'published', publishedAt: new Date().toISOString() });
      alert('Recipe successfully published!');
    } catch (err) {
      alert('Failed to publish recipe: ' + err.message);
    }
  };

  if (!recipe) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <span className="material-symbols-outlined text-4xl text-brand-strong animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  // Resolve current ingredients, taking swaps into account
  const resolvedIngredients = (recipe.ingredients ?? []).map(item => {
    const originalId = item.ingredientId || item.ingredient?.id;
    const currentId = swappedIngredients[originalId] || originalId;
    const ing = (item.ingredient && String(item.ingredient.id) === String(currentId)) ? item.ingredient : getIngredientById(currentId);

    return {
      ingredientId: currentId,
      amount: item.amount,
      unit: item.unit,
      prepState: item.prepState || ing?.defaultPrepState || 'raw',
      originalId,
      ingredient: ing,
      name: ing?.name || 'Unknown',
      category: ing?.category || '',
      substitutions: ing?.substitutions || [],
    };
  });

  // Calculate dynamic recipe nutrition based on resolved ingredients
  const scaleResult = applyServingScale(resolvedIngredients, servingMultiplier);
  const currentNutrition = scaleResult.profile;

  const handleOpenSubstitution = (item) => {
    const ing = getIngredientById(item.originalId);
    if (!ing || !ing.substitutions || ing.substitutions.length === 0) return;

    const sub = ing.substitutions[0];
    const replacement = getIngredientById(sub.ingredientId);

    setSelectedSub({
      originalId: item.originalId,
      originalName: ing.name,
      substitutionId: sub.ingredientId,
      substitutionName: replacement?.name || 'Alternative',
      reason: sub.reason,
    });
    setIsSubOpen(true);
  };

  const handleSwap = () => {
    if (!selectedSub) return;
    setSwappedIngredients(prev => ({
      ...prev,
      [selectedSub.originalId]: selectedSub.substitutionId,
    }));
    setIsSubOpen(false);
  };

  const handleQuickSwap = (originalId, targetId) => {
    setSwappedIngredients(prev => ({
      ...prev,
      [originalId]: targetId,
    }));
  };

  const handleResetSwaps = () => {
    setSwappedIngredients({});
  };

  return (
    <div className="min-h-screen bg-canvas pb-28 md:pb-16">
      {(!recipe.publishedAt || recipe.status === 'draft') && (
        <DraftPreviewBanner recipe={recipe} onPublish={handlePublish} roleType={user?.roleType || 'user'} />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Top Breadcrumb & Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-text-body">
            <Link to="/recipes/all" className="hover:text-brand-strong transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              All Recipes
            </Link>
            <span>/</span>
            <span className="text-text-strong truncate max-w-[280px] sm:max-w-md">{recipe?.title}</span>
          </div>
          <div className="flex items-center gap-3">
            {(user?.roleType === 'admin' || user?.roleType === 'dietitian') && (
              <Link
                to={`/admin-editor?edit=${recipe?.id}`}
                className="px-4 py-2 bg-card border border-border-interactive rounded-control text-xs font-bold text-text-strong hover:bg-surface-container-low transition-colors flex items-center gap-1 shadow-xs min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Recipe
              </Link>
            )}
            <button
              onClick={() => setShowMobilePlanPicker(true)}
              className="px-4 py-2 bg-brand-strong text-text-inverse rounded-control text-xs font-bold hover:bg-brand-hover transition-colors flex items-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
              Add to Meal Plan
            </button>
          </div>
        </div>

        {/* Desktop Split-Pane Layout (lg:flex-row gap-8) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Pane: Hero Media, Ingredients List, Instruction Pipeline */}
          <div className="w-full lg:w-[65%] space-y-6">
            {/* Hero Header + Serving Scaler */}
            <DetailHero
              recipe={recipe}
              nutrition={currentNutrition}
              servingMultiplier={servingMultiplier}
              onServingChange={setServingMultiplier}
              isFavorite={isFavorite}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
            />

            {/* Mobile-only Nutrition Bento Grid */}
            <div className="block lg:hidden">
              <NutritionSnapshot nutrition={currentNutrition} servingMultiplier={servingMultiplier} />
            </div>

            {/* Ingredient List with Smart Substitutions */}
            <IngredientList
              ingredients={resolvedIngredients}
              servingMultiplier={servingMultiplier}
              swappedIngredients={swappedIngredients}
              onOpenSubstitution={handleOpenSubstitution}
              onQuickSwap={handleQuickSwap}
              onResetSwaps={handleResetSwaps}
            />

            {/* Step-by-Step Instruction Pipeline with Countdown Timers */}
            <InstructionSteps steps={recipe.steps ?? []} />
          </div>

          {/* Right Pane: Sticky Bento Box & Recipe Object Bridge */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-6 space-y-6">
            {/* Desktop Nutrition Bento Grid */}
            <div className="hidden lg:block">
              <NutritionSnapshot nutrition={currentNutrition} servingMultiplier={servingMultiplier} />
            </div>

            {/* Recipe Object Bridge (Quick Action Stack & Meal Plan picker) */}
            <RecipeObjectBridge
              recipe={recipe}
              isFavorite={isFavorite}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onStartCooking={() => setIsCookModeOpen(true)}
              onAddToMealPlan={() => setShowMobilePlanPicker(true)}
            />
          </div>

        </div>

      </main>

      {/* Persistent Fixed Mobile Dock (< 768px) */}
      <nav className="lg:hidden fixed bottom-0 z-40 w-full p-3 bg-card/95 backdrop-blur-md border-t border-border-subtle flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => setShowMobilePlanPicker(!showMobilePlanPicker)}
          className="flex-1 bg-card hover:bg-surface-container-low border border-border-interactive rounded-control flex items-center justify-center gap-2 font-bold text-xs text-brand-strong transition-all cursor-pointer min-h-[44px]"
        >
          <span className="material-symbols-outlined text-[18px] text-brand-strong">calendar_add_on</span>
          + Meal Plan
        </button>

        <button
          type="button"
          onClick={() => setIsCookModeOpen(true)}
          className="flex-1 bg-brand-strong hover:bg-brand-hover text-text-inverse rounded-control flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer min-h-[44px]"
        >
          <span className="material-symbols-outlined text-[18px]">auto_videocam</span>
          Start Cooking
        </button>
      </nav>

      {/* Modals */}
      <AddToMealPlanModal
        recipe={recipe}
        isOpen={showMobilePlanPicker}
        onClose={() => setShowMobilePlanPicker(false)}
      />

      {selectedSub && (
        <SubstitutionModal
          isOpen={isSubOpen}
          onClose={() => setIsSubOpen(false)}
          originalName={selectedSub.originalName}
          substitutionName={selectedSub.substitutionName}
          reason={selectedSub.reason}
          onSwap={handleSwap}
        />
      )}

      <CookModeModal
        recipe={recipe}
        isOpen={isCookModeOpen}
        onClose={() => setIsCookModeOpen(false)}
      />
    </div>
  );
};

export default RecipeDetails;
