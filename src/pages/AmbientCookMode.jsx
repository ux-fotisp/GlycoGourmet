import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById } from '../utils/recipeStore';
import { calculateRecipeNutrition } from '../utils/nutritionCalculator';
import { useWakeLock } from '../hooks/useWakeLock';
import { useOfflineMutation } from '../hooks/useOfflineMutation';
import StepTimer from '../components/recipe/StepTimer';

/**
 * AmbientCookMode — Full-screen, distraction-free kitchen execution environment
 * with Screen Wake Lock, step-by-step carousel, embedded timers, and offline Smart Swaps.
 */
export const AmbientCookMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requestWakeLock, releaseWakeLock, isLocked } = useWakeLock();
  const { mutate } = useOfflineMutation();

  const [recipe, setRecipe] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [targetSubstitute, setTargetSubstitute] = useState('');

  // Request Wake Lock on mount
  useEffect(() => {
    requestWakeLock();
    return () => {
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  // Load Recipe data
  useEffect(() => {
    if (id) {
      getRecipeById(id).then((data) => {
        if (data) setRecipe(data);
      });
    }
  }, [id]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center p-6 font-sans text-stone-600">
        Loading kitchen mode...
      </div>
    );
  }

  const instructions = recipe.instructions && recipe.instructions.length > 0
    ? recipe.instructions
    : [
        'Prepare all fresh produce by washing and cutting into uniform portions.',
        'Heat olive oil in a skillet over medium heat and sauté the aromatic ingredients for 4 minutes.',
        'Add the protein and season thoroughly with herbs and low-sodium spices.',
        'Simmer for 10 minutes until the sauce reduces and flavors concentrate.',
        'Garnish with fresh greens and serve warm in portion-controlled bowls.',
      ];

  const currentStepText = instructions[currentStepIndex] || '';

  // Extract duration from text if step mentions minutes (e.g. "sauté for 4 minutes" or "10 mins")
  const matchMinutes = currentStepText.match(/(\d+)\s*(?:minutes|mins|min)/i);
  const extractedDuration = matchMinutes ? parseInt(matchMinutes[1], 10) : null;

  const handleNext = () => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      navigate(`/recipe/${recipe.id}`);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleApplySwap = async (e) => {
    e.preventDefault();
    if (!selectedIngredient || !targetSubstitute) return;

    // Optimistically update recipe ingredients
    const updatedIngredients = (recipe.ingredients || []).map((ing) => {
      if (ing.name === selectedIngredient) {
        return { ...ing, name: targetSubstitute };
      }
      return ing;
    });

    const nutrition = calculateRecipeNutrition(updatedIngredients);
    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
      nutrition,
      glycemicLoad: nutrition.glycemicLoad ?? recipe.glycemicLoad,
    };
    setRecipe(updatedRecipe);

    // Queue mutation offline
    await mutate(`/api/recipes/${recipe.id}/swaps`, 'POST', {
      recipeId: recipe.id,
      sourceIngredient: selectedIngredient,
      targetSubstitute,
      updatedAt: new Date().toISOString(),
    });

    setIsSwapModalOpen(false);
    setSelectedIngredient('');
    setTargetSubstitute('');
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / instructions.length) * 100);

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] font-sans flex flex-col justify-between select-none">
      
      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 bg-white border-b border-stone-200 shadow-xs flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/recipe/${recipe.id}`)}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shrink-0"
            aria-label="Exit Ambient Cook Mode"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-display font-extrabold text-primary truncate">
              {recipe.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold mt-0.5">
              <span>Step {currentStepIndex + 1} of {instructions.length}</span>
              <span>&bull;</span>
              <span className="text-sage-text font-bold">
                GL: {recipe.glycemicLoad ?? 12} per serving
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators & Swap Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wake lock indicator */}
          <div 
            title={isLocked ? 'Screen Wake Lock Active' : 'Wake Lock Inactive'}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 transition-colors ${
              isLocked 
                ? 'bg-sage-bg text-sage-text border border-sage-text/30' 
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isLocked ? 'lightbulb' : 'lightbulb_outline'}
            </span>
            <span className="hidden sm:inline">Screen Awake</span>
          </div>

          <button
            type="button"
            onClick={() => setIsSwapModalOpen(true)}
            className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span className="hidden sm:inline">Smart Swap</span>
          </button>
        </div>
      </header>

      {/* Main Focus Area: Step Typography & Interactive Controls */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col justify-center items-center text-center space-y-8">
        
        {/* Massive Step Badge */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sage-text bg-sage-bg border border-sage-text/20 px-4 py-1.5 rounded-full shadow-2xs">
            Instruction Step {currentStepIndex + 1}
          </span>
          <div className="text-6xl sm:text-7xl font-display font-black text-primary/20 tracking-tighter">
            0{currentStepIndex + 1}
          </div>
        </div>

        {/* High-Contrast Large Instruction Text */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-md max-w-3xl w-full space-y-6">
          <p className="font-display text-xl sm:text-2xl lg:text-3xl text-primary font-bold leading-relaxed">
            {currentStepText}
          </p>

          {/* Embedded Contextual Step Timer */}
          {extractedDuration && (
            <div className="pt-4 border-t border-stone-100 flex justify-center">
              <StepTimer
                durationMinutes={extractedDuration}
                stepId={`cook-step-${currentStepIndex}`}
                label={`Step ${currentStepIndex + 1}`}
              />
            </div>
          )}
        </div>

        {/* Step Progress Line */}
        <div className="w-full max-w-md h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </main>

      {/* Massive Touch Targets Bottom Nav */}
      <footer className="p-4 sm:p-6 bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex-1 py-4 rounded-2xl font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentStepIndex === 0
                ? 'bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 active:scale-98 shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
            Previous Step
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-4 bg-primary text-white hover:bg-primary-variant rounded-2xl font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
          >
            <span>
              {currentStepIndex === instructions.length - 1 ? 'Complete Cooking 🎉' : 'Next Step'}
            </span>
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </footer>

      {/* Offline Smart Swap Modal Dialog */}
      {isSwapModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200 shadow-2xl p-6 space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">swap_horiz</span>
                Kitchen Smart Swap
              </h3>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleApplySwap} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1">
                  Ingredient to Replace
                </label>
                <select
                  required
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white min-h-[44px]"
                >
                  <option value="">Select an ingredient...</option>
                  {(recipe.ingredients || []).map((ing, idx) => (
                    <option key={idx} value={ing.name}>
                      {ing.name} ({ing.amount} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1">
                  Low-GI Kitchen Substitute
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cauliflower Pearls, Zucchini Noodles"
                  value={targetSubstitute}
                  onChange={(e) => setTargetSubstitute(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200/80 text-[11px] text-stone-600 leading-snug">
                Substitutions recalculate glycemic load offline using cached metabolic profiles.
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-4 py-2 font-bold text-stone-600 hover:bg-stone-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-extrabold rounded-full hover:bg-primary-variant shadow-md cursor-pointer"
                >
                  Apply Swap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AmbientCookMode;
