import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeById } from '../utils/recipeStore';
import { calculateRecipeNutrition, scaleNutrition, getIngredientById, getGlycemicLoadCategory } from '../utils/nutritionCalculator';
import NutritionSnapshot from '../components/recipe/NutritionSnapshot';
import ServingSizeSelector from '../components/ui/ServingSizeSelector';
import IngredientRow from '../components/recipe/IngredientRow';
import SubstitutionModal from '../components/recipe/SubstitutionModal';
import CookMode from '../components/CookMode';
import { useFavorites } from '../hooks/useFavorites';

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [swappedIngredients, setSwappedIngredients] = useState({}); // originalId -> replacementId
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null); // { originalIng, replacementIng, reason }
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);

  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const isFavorite = checkFavorite(id);

  useEffect(() => {
    let cancelled = false;
    async function loadRecipe() {
      const found = await getRecipeById(id);
      if (cancelled) return;
      if (found) {
        setRecipe(found);
      } else {
        navigate('/');
      }
    }
    loadRecipe();
    return () => { cancelled = true; };
  }, [id, navigate]);

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
    
    // Adjust amount based on substitution ratios if needed, but for simplicity:
    return {
      ingredientId: currentId,
      amount: item.amount,
      unit: item.unit,
      prepState: item.prepState || ing?.defaultPrepState || 'raw',
      originalId,
      name: ing?.name || 'Unknown',
      category: ing?.category || '',
      substitutions: ing?.substitutions || []
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
      reason: sub.reason
    });
    setIsSubOpen(true);
  };

  const handleSwap = () => {
    if (!selectedSub) return;
    setSwappedIngredients(prev => ({
      ...prev,
      [selectedSub.originalId]: selectedSub.substitutionId
    }));
    setIsSubOpen(false);
  };

  const handleResetSwaps = () => {
    setSwappedIngredients({});
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Header Navigation */}
      <header className="w-full sticky top-0 z-50 bg-white border-b border-outline-variant/35 shadow-sm">
        <div className="flex justify-between items-center px-edge-margin md:px-md max-w-container-max mx-auto h-16">
          <Link to="/" className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary font-bold">arrow_back</span>
            <span className="font-display text-md text-primary font-extrabold tracking-tight">GlycoGourmet</span>
          </Link>
          <div className="hidden md:flex space-x-md items-center">
            <Link to="/" className="text-primary font-bold border-b-2 border-primary py-2 text-sm">Recipes</Link>
            <span className="text-on-surface-variant/40 text-sm cursor-not-allowed">Meal Plans</span>
            <span className="text-on-surface-variant/40 text-sm cursor-not-allowed">Community</span>
          </div>
          <div className="flex items-center space-x-sm">
            <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">account_circle</span>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-edge-margin py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Breadcrumb / Back Link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-primary-container/15 text-primary px-3 py-1 rounded-full font-label-md text-xs font-semibold">
                {recipe.category || 'Main Course'}
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-md text-xs font-semibold">
                {recipe.cookingTime} Mins
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-md text-xs font-semibold">
                GI: {currentNutrition.glycemicIndex || '—'}
              </span>
              <span className={`px-3 py-1 rounded-full font-label-md text-xs font-bold ${getGlycemicLoadCategory(currentNutrition.glycemicLoad).bgClass} ${getGlycemicLoadCategory(currentNutrition.glycemicLoad).colorClass}`}>
                GL: {currentNutrition.glycemicLoad ?? 0} ({getGlycemicLoadCategory(currentNutrition.glycemicLoad).label})
              </span>
            </div>
            
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
              {recipe.title}
            </h2>
            
            <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl">
              {recipe.description}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#recipe-steps"
                className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm px-6 py-3 rounded-full shadow-md transition-all flex items-center gap-2 font-bold cursor-pointer"
              >
                Jump to Recipe
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </a>
              <button
                onClick={() => toggleFavorite(recipe.id)}
                className={`border border-primary text-primary hover:bg-primary/5 font-label-md text-sm px-6 py-3 rounded-full transition-all cursor-pointer font-bold flex items-center gap-2`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                  {isFavorite ? 'favorite' : 'favorite_border'}
                </span>
                {isFavorite ? 'Saved' : 'Save Favorite'}
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden shadow-md aspect-video sm:aspect-[4/3] lg:aspect-square">
              <img
                className="w-full h-full object-cover"
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300'}
                alt={recipe.title}
              />
            </div>
          </div>
        </section>

        {/* Locked Above-the-Fold: Nutritional Snapshot Card */}
        <section className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-sm py-2">
          <NutritionSnapshot nutrition={currentNutrition} />
        </section>

        {/* Ingredients & Prep content splits */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ingredients Left Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-60">
              <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-3">
                <h4 className="font-display text-lg font-bold text-on-surface">
                  Ingredients
                </h4>
                <div className="flex items-center gap-3">
                  <ServingSizeSelector
                    value={servingMultiplier}
                    onChange={setServingMultiplier}
                  />
                  {Object.keys(swappedIngredients).length > 0 && (
                    <button
                      onClick={handleResetSwaps}
                      title="Reset Swaps"
                      className="material-symbols-outlined text-tertiary hover:bg-tertiary/10 p-1.5 rounded-full cursor-pointer transition-colors"
                    >
                      history
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {resolvedIngredients.map((item, idx) => {
                  const isSwapped = swappedIngredients[item.originalId] !== undefined;

                  return (
                    <IngredientRow
                      key={idx}
                      item={item}
                      servingMultiplier={servingMultiplier}
                      isSwapped={isSwapped}
                      onClick={() => handleOpenSubstitution(item)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Steps Right Panel */}
          <div className="lg:col-span-7 space-y-4" id="recipe-steps">
            <h4 className="font-display text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3">
              Preparation Steps
            </h4>
            
            <div className="space-y-6 mt-4 pl-2">
              {recipe.steps?.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-sm">
                      {idx + 1}
                    </div>
                    {idx < recipe.steps.length - 1 && (
                      <div className="w-[2px] flex-grow bg-outline-variant/40 group-hover:bg-primary/20 transition-colors my-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h5 className="font-label-md text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
                      {step.title}
                    </h5>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                      {step.description}
                    </p>
                    {step.timer && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant/75 mt-2 bg-surface-container-low border border-outline-variant/40 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {step.timer} mins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cook Mode FAB block */}
            <div className="mt-8 p-5 bg-surface-container-low border border-dashed border-outline-variant rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-on-surface">Ready to start?</p>
                <p className="text-xs text-on-surface-variant leading-normal max-w-sm mt-0.5">
                  Enter full-screen Cook Mode optimized with high contrast colors and large text blocks.
                </p>
              </div>
              <button
                onClick={() => setIsCookModeOpen(true)}
                className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-full flex items-center gap-2 font-label-md font-bold hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined">auto_videocam</span>
                Start Cook Mode
              </button>
            </div>
          </div>

        </section>

      </main>

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

      {/* Hands-Free Cook Mode Overlay */}
      <CookMode
        recipe={recipe}
        isOpen={isCookModeOpen}
        onClose={() => setIsCookModeOpen(false)}
      />
    </div>
  );
};

export default RecipeDetails;
