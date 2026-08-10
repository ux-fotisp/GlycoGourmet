import React, { useState, useMemo } from 'react';
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
    return nutrition?.glycemicLoad ?? 0;
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
        colorClass: 'bg-primary-container text-on-primary-container border-primary-container',
        barColor: 'bg-primary',
        microcopy: 'Within optimal blood sugar range.',
      };
    }
    if (projectedRatio <= 1.0) {
      return {
        label: 'Approaching Target',
        colorClass: 'bg-tertiary-container text-on-tertiary-container border-tertiary-container',
        barColor: 'bg-tertiary',
        microcopy: 'Approaching daily glycemic target.',
      };
    }
    return {
      label: 'Exceeds Target',
      colorClass: 'bg-error-container text-on-error-container border-error-container',
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

    // 1. Optimistic State Update: Write directly to localStorage & dispatch event
    try {
      const raw = localStorage.getItem('glyco_meal_plan');
      const plan = raw ? JSON.parse(raw) : {};
      const dayList = plan[selectedDay] || [];
      plan[selectedDay] = [...dayList, mealEntry];
      localStorage.setItem('glyco_meal_plan', JSON.stringify(plan));

      // Global sync event for HealthHeader.jsx
      window.dispatchEvent(new CustomEvent('glyco_meal_plan_updated', { detail: plan }));

      if (onConfirm) {
        onConfirm(mealEntry);
      }
      onClose();
    } catch (err) {
      setSyncError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Meal to Plan"
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 animate-fade-in"
      >
        {/* Modal Header */}
        <header className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">calendar_add_on</span>
            <div>
              <h2 className="font-display text-base font-bold text-on-surface">
                Schedule Meal & Analyze Impact
              </h2>
              <p className="text-xs text-on-surface-variant line-clamp-1">
                {recipe?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close meal planning modal"
            className="w-10 h-10 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Sync Error Retry Banner */}
          {syncError && (
            <div className="p-3.5 rounded-xl bg-error-container/30 border border-error/30 flex items-center justify-between text-xs text-error">
              <span>Failed to sync with meal plan storage.</span>
              <button
                type="button"
                onClick={handleCommit}
                className="px-3 py-1 bg-error text-on-error rounded-lg font-bold hover:bg-error/90 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Day Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
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
                  className={`min-h-[48px] px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    selectedDay === day.id
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Slot Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Meal Slot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEAL_SLOTS.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`min-h-[48px] p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedSlot === slot.id
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{slot.icon}</span>
                  <span>{slot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flow 3 Predictive Daily GL Impact Display */}
          <section className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">analytics</span>
                Projected Daily GL Impact
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${budgetFeedback.colorClass}`}>
                {budgetFeedback.label}
              </span>
            </div>

            {/* Predictive Math Formula: Current GL + Recipe GL -> Projected GL */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-outline-variant/20 text-xs">
              <div className="text-center">
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase">Current GL</span>
                <span className="font-display font-extrabold text-on-surface text-sm">{currentDailyGL} GL</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">add</span>
              <div className="text-center">
                <span className="block text-[9px] text-primary font-bold uppercase">Recipe GL</span>
                <span className="font-display font-extrabold text-primary text-sm">+{recipeGL} GL</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">arrow_forward</span>
              <div className="text-center">
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase">Projected Total</span>
                <span className="font-display font-extrabold text-on-surface text-base">{projectedGL} / {DAILY_GL_TARGET} GL</span>
              </div>
            </div>

            {/* Projected Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-outline-variant/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${budgetFeedback.barColor}`}
                  style={{ width: `${Math.min(projectedPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                {budgetFeedback.microcopy}
              </p>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <footer className="px-6 py-4 border-t border-outline-variant/20 bg-surface flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-5 rounded-xl border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-low cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={isSubmitting}
            className="min-h-[48px] px-6 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all shadow-md flex items-center gap-2"
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
