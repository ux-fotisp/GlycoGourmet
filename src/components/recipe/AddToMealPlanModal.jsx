import React, { useState, useMemo, useEffect } from 'react';
import { calculateRecipeNutrition } from '../../utils/nutritionCalculator';

const DAILY_GL_TARGET = 45;

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: 'free_breakfast' },
  { id: 'lunch', label: 'Lunch', icon: 'lunch_dining' },
  { id: 'dinner', label: 'Dinner', icon: 'dinner_dining' },
  { id: 'snack', label: 'Snack', icon: 'bakery_dining' },
];

/**
 * AddToMealPlanModal — Flow 3: Predictive Daily GL Budgeting & Meal Slotting
 *
 * Displays pre-commitment impact analysis before user confirms adding a recipe
 * to their daily meal schedule.
 */
export const AddToMealPlanModal = ({ recipe, isOpen, onClose, onConfirm }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [selectedSlot, setSelectedSlot] = useState('lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute Current Daily GL from existing meal plan in localStorage
  const currentDailyGL = useMemo(() => {
    try {
      const raw = localStorage.getItem('glyco_meal_plan');
      if (!raw) return 15; // default simulated base GL for today
      const plan = JSON.parse(raw);
      const dayEntries = plan[selectedDay] || [];
      return dayEntries.reduce((sum, item) => sum + (Number(item.glycemicLoad) || 0), 0);
    } catch {
      return 15;
    }
  }, [selectedDay]);

  // Recipe GL per serving
  const recipeGL = useMemo(() => {
    if (!recipe) return 0;
    const nutrition = calculateRecipeNutrition(recipe.ingredients ?? []);
    return Math.round(nutrition?.glycemicLoad ?? 0);
  }, [recipe]);

  // Projected GL after adding this meal
  const projectedGL = useMemo(() => {
    return currentDailyGL + recipeGL;
  }, [currentDailyGL, recipeGL]);

  const projectedRatio = DAILY_GL_TARGET > 0 ? projectedGL / DAILY_GL_TARGET : 0;
  const projectedPercent = Math.round(projectedRatio * 100);

  // Medical Color Tokens & Microcopy per spec
  const budgetFeedback = useMemo(() => {
    if (projectedRatio <= 0.75) {
      return {
        label: 'Safe Range',
        colorClass: 'bg-success-surface text-brand-strong border border-success-border',
        barColor: 'bg-brand-strong',
        microcopy: 'Within optimal blood sugar range.',
      };
    }
    if (projectedRatio <= 1.0) {
      return {
        label: 'Approaching Target',
        colorClass: 'bg-tertiary-container text-on-tertiary-container border border-tertiary',
        barColor: 'bg-tertiary',
        microcopy: 'Approaching daily glycemic target.',
      };
    }
    return {
      label: 'Exceeds Target',
      colorClass: 'bg-error-container text-on-error-container border border-error',
      barColor: 'bg-error',
      microcopy: 'Exceeds target. Consider swapping high-GI items.',
    };
  }, [projectedRatio]);

  const handleCommit = async () => {
    setIsSubmitting(true);
    setSyncError(false);

    const mealEntry = {
      id: recipe?.id || String(Date.now()),
      title: recipe?.title || 'Untitled Meal',
      glycemicLoad: recipeGL,
      slot: selectedSlot,
      day: selectedDay,
      addedAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem('glyco_meal_plan');
      const plan = raw ? JSON.parse(raw) : {};
      if (!plan[selectedDay]) {
        plan[selectedDay] = [];
      }
      plan[selectedDay].push(mealEntry);
      localStorage.setItem('glyco_meal_plan', JSON.stringify(plan));

      if (onConfirm) {
        onConfirm(mealEntry);
      }

      setIsSubmitting(false);
      onClose();
    } catch {
      setSyncError(true);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div className="w-full max-w-lg bg-card rounded-card border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <header className="px-6 py-4 border-b border-border-subtle/50 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-strong text-[22px]">calendar_add_on</span>
            <div>
              <h2 id="modal-headline" className="font-display text-base font-bold text-text-strong">
                Schedule Meal & Analyze Impact
              </h2>
              <p className="text-xs text-text-body line-clamp-1">
                {recipe?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close meal planning modal"
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-body transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Sync Error Retry Banner */}
          {syncError && (
            <div className="p-3 rounded-control bg-error-container/30 border border-error/30 flex items-center justify-between text-xs text-error">
              <span>Failed to sync with meal plan storage.</span>
              <button
                type="button"
                onClick={handleCommit}
                className="px-3 py-1 bg-error text-on-error rounded-control font-bold hover:bg-error/90 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Day Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-strong uppercase tracking-wider">
              Target Day
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'day3', label: 'Wednesday' },
              ].map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.id)}
                  className={`min-h-[44px] px-3 rounded-control border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    selectedDay === day.id
                      ? 'bg-brand-strong text-text-inverse border-brand-strong shadow-xs'
                      : 'bg-card border-border-interactive text-text-strong hover:bg-surface-container-low'
                  } focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Slot Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-strong uppercase tracking-wider">
              Meal Slot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEAL_SLOTS.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`min-h-[44px] p-2 rounded-control border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedSlot === slot.id
                      ? 'bg-brand-strong text-text-inverse border-brand-strong shadow-xs'
                      : 'bg-card border-border-interactive text-text-strong hover:bg-surface-container-low'
                  } focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none`}
                >
                  <span className="material-symbols-outlined text-[18px]">{slot.icon}</span>
                  <span>{slot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Projected Daily GL Impact Display */}
          <section className="p-4 rounded-control bg-canvas border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-body uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-brand-strong">analytics</span>
                Projected Daily GL Impact
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${budgetFeedback.colorClass}`}>
                {budgetFeedback.label}
              </span>
            </div>

            {/* Math Formula */}
            <div className="flex items-center justify-between bg-card p-3 rounded-control border border-border-subtle text-xs">
              <div className="text-center">
                <span className="block text-[9px] text-text-body font-bold uppercase">Current GL</span>
                <span className="font-display font-extrabold text-text-strong text-sm">{currentDailyGL} GL</span>
              </div>
              <span className="material-symbols-outlined text-text-body/50 text-[16px]">add</span>
              <div className="text-center">
                <span className="block text-[9px] text-brand-strong font-bold uppercase">Recipe GL</span>
                <span className="font-display font-extrabold text-brand-strong text-sm">+{recipeGL} GL</span>
              </div>
              <span className="material-symbols-outlined text-text-body/50 text-[16px]">arrow_forward</span>
              <div className="text-center">
                <span className="block text-[9px] text-text-body font-bold uppercase">Projected Total</span>
                <span className="font-display font-extrabold text-text-strong text-base">{projectedGL} / {DAILY_GL_TARGET} GL</span>
              </div>
            </div>

            {/* Projected Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${budgetFeedback.barColor}`}
                  style={{ width: `${Math.min(projectedPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs font-medium text-text-body flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                {budgetFeedback.microcopy}
              </p>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <footer className="px-6 py-4 border-t border-border-subtle/50 bg-card flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 rounded-control border border-border-interactive bg-card text-brand-strong text-xs font-bold hover:bg-surface-container-low cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={isSubmitting}
            className="min-h-[44px] px-6 rounded-control bg-brand-strong text-text-inverse text-xs font-bold hover:bg-brand-hover disabled:opacity-50 cursor-pointer transition-all shadow-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Scheduling...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Confirm Meal Assignment
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddToMealPlanModal;
