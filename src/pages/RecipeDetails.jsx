import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRecipeById, saveRecipe } from '../utils/recipeStore';
import { calculateRecipeNutrition, scaleNutrition, getIngredientById } from '../utils/nutritionCalculator';
import DetailHero from '../components/recipe/DetailHero';
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
 * - Desktop (≥ 1024px): Asymmetric split-pane layout (Left 65% hero/ingredients/steps, Right 35% sticky bento/bridge)
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
          if (user?.roleType !== 'admin' && found.authorId !== user?.email) {
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
    const originalId = item.ingredientId;
    const currentId = swappedIngredients[originalId] || originalId;
    const ing = getIngredientById(currentId);

    return {
      ingredientId: currentId,
      amount: item.amount,
      unit: item.unit,
      prepState: item.prepState || ing?.defaultPrepState || 'raw',
      originalId,
      name: ing?.name || 'Unknown',
      category: ing?.category || '',
      substitutions: ing?.substitutions || [],
    };
  });

  // Calculate dynamic recipe nutrition based on resolved (possibly swapped) ingredients
  const baseNutrition = calculateRecipeNutrition(resolvedIngredients);
  const currentNutrition = scaleNutrition(baseNutrition, servingMultiplier);

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
    <div className="min-h-screen bg-background pb-28 md:pb-16">
      {(!recipe.publishedAt || recipe.status === 'draft') && (
        <DraftPreviewBanner onPublish={handlePublish} roleType={user?.roleType || 'user'} />
      )}
      {/* Top Header Navigation */}

      <header className="w-full sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-outline-variant/35 shadow-sm">
        <div className="flex justify-between items-center px-edge-margin md:px-md max-w-container-max mx-auto h-16">
          <Link to="/" className="flex items-center gap-1.5 font-bold text-primary hover:underline">
            <span className="material-symbols-outlined text-primary font-bold">arrow_back</span>
            <span className="font-display text-md text-primary font-extrabold tracking-tight">GlycoGourmet</span>
          </Link>
          <div className="hidden md:flex space-x-md items-center">
            <Link to="/" className="text-primary font-bold border-b-2 border-primary py-2 text-sm">Dashboard</Link>
            <Link to="/meal-plans" className="text-on-surface-variant hover:text-primary py-2 text-sm font-medium">Meal Plans</Link>
            <Link to="/my-recipes" className="text-on-surface-variant hover:text-primary py-2 text-sm font-medium">My Recipes</Link>
          </div>
          <div className="flex items-center space-x-sm">
            <Link to="/settings" className="p-2 hover:bg-surface-container rounded-full text-primary transition-colors">
              <span className="material-symbols-outlined text-primary cursor-pointer">settings</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-container-max mx-auto px-edge-margin md:px-lg py-6 space-y-6">

        {/* Desktop Split-Pane Layout (lg:flex-row gap-8) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Pane (lg:w-[65%]): Hero Media, Ingredients List, Instruction Pipeline */}
          <div className="w-full lg:w-[65%] space-y-8">
            {/* Hero Header + Serving Scaler */}
            <DetailHero
              recipe={recipe}
              nutrition={currentNutrition}
              servingMultiplier={servingMultiplier}
              onServingChange={setServingMultiplier}
              isFavorite={isFavorite}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
            />

            {/* Mobile-only Nutrition Bento Grid (visible on < lg screens) */}
            <div className="block lg:hidden">
              <NutritionSnapshot nutrition={currentNutrition} />
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

          {/* Right Pane (lg:w-[35%]): Sticky Bento Box & Recipe Object Bridge */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-20 space-y-6">

            {/* Desktop Nutrition Bento Grid */}
            <div className="hidden lg:block">
              <NutritionSnapshot nutrition={currentNutrition} />
            </div>

            {/* Recipe Object Bridge (Quick Action Stack & Meal Plan picker) */}
            <div className="bg-white rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(45,49,48,0.05)]">
              <RecipeObjectBridge
                recipe={recipe}
                isFavorite={isFavorite}
                onToggleFavorite={() => toggleFavorite(recipe.id)}
                onStartCooking={() => setIsCookModeOpen(true)}
              />
            </div>

          </div>

        </div>

      </main>

      {/* Persistent Fixed Mobile Dock (< 768px) */}
      <nav className="lg:hidden fixed bottom-0 z-40 w-full p-3 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Button 1: [+ Meal Plan] */}
        <button
          onClick={() => setShowMobilePlanPicker(!showMobilePlanPicker)}
          className="flex-1 bg-surface-container-high hover:bg-surface-container border border-outline-variant/40 h-12 rounded-full flex items-center justify-center gap-2 font-bold text-xs text-on-surface transition-all cursor-pointer min-h-[48px]"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">calendar_add_on</span>
          + Meal Plan
        </button>

        {/* Button 2: [Start Cooking] — High Contrast Primary */}
        <button
          onClick={() => setIsCookModeOpen(true)}
          className="flex-1 bg-primary hover:bg-primary-container text-on-primary h-12 rounded-full flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer min-h-[48px]"
        >
          <span className="material-symbols-outlined text-[18px]">auto_videocam</span>
          Start Cooking
        </button>
      </nav>

      {/* Flow 3 Predictive Meal Plan Modal */}
      <AddToMealPlanModal
        recipe={recipe}
        isOpen={showMobilePlanPicker}
        onClose={() => setShowMobilePlanPicker(false)}
      />

      {/* Substitution Modal Popover */}
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

      {/* Mobile-Optimized Ambient Cook Mode Overlay */}
      <CookModeModal
        recipe={recipe}
        isOpen={isCookModeOpen}
        onClose={() => setIsCookModeOpen(false)}
      />
    </div>
  );
};

export default RecipeDetails;
