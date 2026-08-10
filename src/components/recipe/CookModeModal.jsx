import React, { useState, useEffect, useCallback, useRef } from 'react';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

/**
 * CookModeModal — Mobile-optimized ambient cook mode overlay.
 *
 * Features:
 * - High-contrast dark theme (bg-inverse-surface text-inverse-on-surface)
 * - Large typography readable at arm's length (text-2xl to text-4xl)
 * - 48px minimum touch targets for Previous/Next navigation
 * - Touch swipe gesture handlers for step navigation
 * - Web API: navigator.wakeLock to prevent display sleep during cooking
 */
export const CookModeModal = ({ recipe, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const touchStartRef = useRef(null);
  const wakeLockRef = useRef(null);

  const steps = recipe?.steps || [];
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep] || {};

  const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);
  const gl = nutrition?.glycemicLoad ?? 0;
  const glInfo = getGlycemicLoadCategory(gl);

  // ─── WakeLock API ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        // WakeLock not supported or denied — silently degrade
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isOpen]);

  // ─── Navigation ───────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleReset = () => {
    setCurrentStep(0);
    setIsFinished(false);
    onClose();
  };

  // ─── Keyboard Controls ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') handleNext();
      else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') handlePrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // ─── Touch Swipe Gestures ────────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    const SWIPE_THRESHOLD = 50;
    if (diff > SWIPE_THRESHOLD) handleNext();      // Swipe left → next
    else if (diff < -SWIPE_THRESHOLD) handlePrev(); // Swipe right → prev
    touchStartRef.current = null;
  };

  if (!isOpen) return null;

  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hands-free Cook Mode"
      className="fixed inset-0 z-[200] bg-inverse-surface text-inverse-on-surface font-body-md overflow-hidden flex flex-col justify-between"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient Backdrop */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center filter grayscale"
          style={{ backgroundImage: `url('${recipe?.imageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200'}')` }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 flex flex-wrap justify-between items-center px-edge-margin py-md w-full max-w-container-max mx-auto shrink-0 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-on-surface/10 hover:bg-on-surface/20 rounded-full transition-colors cursor-pointer text-sm font-semibold border border-on-surface/5 min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Exit Cook Mode
          </button>

          {/* Persistent Summary Pill */}
          <div className="flex items-center gap-2 bg-on-surface/10 border border-on-surface/15 px-3 py-1.5 rounded-full text-xs font-bold">
            <span className={`px-2 py-0.5 rounded text-[11px] ${glInfo.bgClass} ${glInfo.colorClass}`}>
              GL: {gl}
            </span>
            <span className="text-inverse-on-surface/40">•</span>
            <span className="flex items-center gap-1 text-inverse-on-surface/90">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {recipe?.cookingTime || 0}m
            </span>
            <span className="text-inverse-on-surface/40">•</span>
            <span className="flex items-center gap-1 text-inverse-on-surface/90">
              <span className="material-symbols-outlined text-[14px]">restaurant</span>
              {recipe?.servings || 1} serv
            </span>
          </div>
        </div>

        {!isFinished && (
          <div className="flex flex-col items-end gap-1">
            <span className="font-label-md text-xs text-primary-fixed-dim font-bold uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <div className="w-32 h-2 bg-on-surface/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-fixed-dim transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-md max-w-4xl mx-auto w-full">
        {isFinished ? (
          <div className="text-center space-y-md flex flex-col items-center">
            <span className="material-symbols-outlined text-8xl text-primary-fixed-dim animate-bounce">
              celebration
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
              Bon Appétit!
            </h1>
            <p className="text-lg text-inverse-on-surface/80 max-w-md">
              Your meal is ready. Enjoy your nutrient-dense, glycemic-stable creation!
            </p>
            <button
              onClick={handleReset}
              className="mt-6 px-8 py-3.5 bg-primary text-on-primary hover:bg-primary-container rounded-full font-bold text-base cursor-pointer shadow-lg min-h-[48px]"
            >
              Back to Recipe
            </button>
          </div>
        ) : (
          <article className="w-full text-center space-y-lg px-2">
            <h2 className="font-display text-2xl md:text-4xl text-primary-fixed-dim font-bold tracking-tight">
              {currentStepData.title}
            </h2>
            <p className="font-sans text-xl md:text-2xl leading-relaxed text-inverse-on-surface max-w-3xl mx-auto font-medium py-4">
              {currentStepData.description}
            </p>
            {currentStepData.timer && (
              <span className="inline-flex items-center gap-2 bg-secondary-container/20 border border-outline/20 text-on-secondary-container px-5 py-2.5 rounded-full text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                {currentStepData.timer} mins
              </span>
            )}
          </article>
        )}
      </div>

      {/* Navigation Touch Targets — 48px min */}
      {!isFinished ? (
        <nav className="relative z-10 w-full grid grid-cols-2 h-36 md:h-52 gap-1 px-edge-margin pb-edge-margin shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="group relative flex flex-col items-center justify-center rounded-xl bg-on-surface/5 hover:bg-on-surface/10 border-2 border-transparent active:border-primary-fixed-dim transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer min-h-[56px]"
          >
            <span className="material-symbols-outlined text-4xl md:text-5xl mb-1 group-hover:-translate-x-2 transition-transform">
              arrow_back
            </span>
            <span className="font-label-md text-[10px] md:text-xs uppercase tracking-widest opacity-60">
              Previous
            </span>
          </button>

          <button
            onClick={handleNext}
            className="group relative flex flex-col items-center justify-center rounded-xl bg-primary-container/20 hover:bg-primary-container/30 border-2 border-primary-fixed-dim active:scale-95 transition-all duration-200 cursor-pointer min-h-[56px]"
          >
            <span className="material-symbols-outlined text-4xl md:text-5xl mb-1 group-hover:translate-x-2 transition-transform">
              {currentStep === totalSteps - 1 ? 'celebration' : 'arrow_forward'}
            </span>
            <span className="font-label-md text-[10px] md:text-xs uppercase tracking-widest font-bold">
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next Step'}
            </span>
          </button>
        </nav>
      ) : (
        <div className="h-20 shrink-0" />
      )}

      {/* Swipe hint footer */}
      {!isFinished && (
        <footer className="relative z-10 mx-auto mb-4 pointer-events-none shrink-0">
          <div className="px-6 py-2 rounded-full bg-inverse-surface/85 backdrop-blur-md border border-on-surface/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-fixed-dim text-md">swipe</span>
            <p className="font-caption text-[10px] md:text-xs text-inverse-on-surface/75">
              <span className="text-primary-fixed-dim font-bold">Swipe left/right</span> or press <span className="text-primary-fixed-dim font-bold">Arrow keys</span> to navigate
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default CookModeModal;
