import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRecipeById, saveRecipe } from '../utils/recipeStore';
import { getIngredientById } from '../utils/nutritionCalculator';
import { applyServingScale } from '../services/metabolicEngine';

import RecipeHero from '../components/recipe/RecipeHero';
import RecipeMetaHeader from '../components/recipe/RecipeMetaHeader';
import RecipeActionBar from '../components/recipe/RecipeActionBar';
import GlycemicSnapshotCard from '../components/recipe/GlycemicSnapshotCard';
import NutritionFactsCard from '../components/recipe/NutritionFactsCard';
import SmartSwapsCard from '../components/recipe/SmartSwapsCard';
import IngredientsPanel from '../components/recipe/IngredientsPanel';
import RelatedRecipesRow from '../components/recipe/RelatedRecipesRow';

import NutritionSnapshot from '../components/recipe/NutritionSnapshot';
import IngredientList from '../components/recipe/IngredientList';
import InstructionSteps from '../components/recipe/InstructionSteps';
import CookModeModal from '../components/recipe/CookModeModal';
import RecipeObjectBridge from '../components/recipe/RecipeObjectBridge';
import SubstitutionModal from '../components/recipe/SubstitutionModal';
import AddToMealPlanModal from '../components/recipe/AddToMealPlanModal';
import DraftPreviewBanner from '../components/recipe/DraftPreviewBanner';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';


/**
 * RecipeDetails / RecipeDetail Page
 *
 * Restructured with OOUX object-relationship mapping and Don Norman design principles:
 * - Mobile (< 768px): Single-column view with persistent fixed bottom dock (+ Meal Plan & Start Cooking)
 * - Desktop (â‰¥ 1024px): Asymmetric split-pane layout (Left 65% hero/ingredients/steps, Right 35% sticky bento/bridge)
 */
export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [swappedIngredients, setSwappedIngredients] = useState({}); // originalId -> replacementId
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [showMobilePlanPicker, setShowMobilePlanPicker] = useState(false);

  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const isFavorite = checkFavorite(id);

  useEffect(() => {
    let cancelled = false;
    async function loadRecipe() {
      const found = await getRecipeById(id, { preview: isPreview });
      if (cancelled) return;
      if (found) {
        if (found.status === 'draft' || !found.publishedAt) {
          // Security Check
          if (user?.roleType !== 'admin' && user?.roleType !== 'dietitian' && found.authorId !== user?.email) {
            alert('Unauthorized: You do not have permission to view this draft.');
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
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  // Resolve current ingredients, taking swaps into account
  const resolvedIngredients = (recipe.ingredients ?? []).map(item => {
    const originalId = item.ingredientId || item.ingredient?.id;
    const currentId = swappedIngredients[originalId] || originalId;
    const ing = getIngredientById(currentId);

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

  // Calculate dynamic recipe nutrition based on resolved (possibly swapped) ingredients
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
      substitutionName: replacement.name,
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
    <div className="bg-background min-h-screen">
      {(!recipe.publishedAt || recipe.status === 'draft') && (
        <DraftPreviewBanner recipe={recipe} onPublish={handlePublish} roleType={user?.roleType || 'user'} />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Top Breadcrumb & Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <Link to="/recipes/all" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              All Recipes
            </Link>
            <span>/</span>
            <span className="text-on-surface truncate max-w-[200px] sm:max-w-xs">{recipe?.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-outline-variant/40 rounded-full text-xs font-bold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 shadow-sm min-h-[48px] cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Recipe
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm min-h-[48px] cursor-pointer" onClick={() => setShowMobilePlanPicker(true)}>
              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
              Add to Meal Plan
            </button>
          </div>
        </div>

        {/* Desktop Split-Pane Layout (lg:flex-row gap-10) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Pane (lg:w-[35%]): Hero Media, Snapshots, Swaps */}
          <div className="w-full lg:w-[38%] space-y-6">
            <RecipeHero recipe={recipe} nutrition={currentNutrition} />
            <GlycemicSnapshotCard nutrition={currentNutrition} servingMultiplier={servingMultiplier} />
            <NutritionFactsCard nutrition={currentNutrition} servingMultiplier={servingMultiplier} />
            <SmartSwapsCard 
              ingredients={resolvedIngredients} 
              swappedIngredients={swappedIngredients} 
              onQuickSwap={handleQuickSwap} 
              nutrition={currentNutrition} 
            />
          </div>

          {/* Right Pane (lg:w-[65%]): Meta Header, Actions, Ingredients, Instructions */}
          <div className="w-full lg:w-[62%] space-y-8 lg:pt-4">
            
            <RecipeMetaHeader recipe={recipe} />
            <RecipeActionBar 
              onAddToMealPlan={() => setShowMobilePlanPicker(true)}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              isFavorite={isFavorite}
            />

            <IngredientsPanel 
              ingredients={resolvedIngredients} 
              servingMultiplier={servingMultiplier} 
              onServingChange={setServingMultiplier} 
              nutrition={currentNutrition}
            />

            <InstructionSteps steps={recipe.steps ?? []} />
          </div>

        </div>

        <RelatedRecipesRow currentRecipe={recipe} />

      </main>

      {/* Persistent Fixed Mobile Dock (< 768px) */}
      <nav className="lg:hidden fixed bottom-0 z-40 w-full p-3 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setShowMobilePlanPicker(!showMobilePlanPicker)}
          className="flex-1 bg-surface-container-high hover:bg-surface-container border border-outline-variant/40 rounded-full flex items-center justify-center gap-2 font-bold text-xs text-on-surface transition-all cursor-pointer min-h-[48px]"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">calendar_add_on</span>
          + Meal Plan
        </button>
        <button
          onClick={() => setIsCookModeOpen(true)}
          className="flex-1 bg-primary hover:bg-primary-container text-on-primary rounded-full flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer min-h-[48px]"
        >
          <span className="material-symbols-outlined text-[18px]">auto_videocam</span>
          Start Cooking
        </button>
      </nav>

      {/* Modals */}
      <AddToMealPlanModal recipe={recipe} isOpen={showMobilePlanPicker} onClose={() => setShowMobilePlanPicker(false)} />
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
      <CookModeModal recipe={recipe} isOpen={isCookModeOpen} onClose={() => setIsCookModeOpen(false)} />
    </div>
  );
};

export default RecipeDetails;
