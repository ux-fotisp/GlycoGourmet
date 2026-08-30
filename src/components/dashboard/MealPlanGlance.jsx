import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes } from '../../utils/recipeStore';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';
import { scheduleBolusReminder } from '../../utils/notificationEngine';

/**
 * MealPlanGlance — Conditional Meal Plan summary for the Dashboard with clinical bolus reminder trigger.
 */

function useMealPlan() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await getAllRecipes();
      if (active) {
        setRecipes(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Build today\'s plan from available recipes (sample: first 3)
  const todayPlan = useMemo(() => {
    if (recipes.length === 0) return null;

    const dayIndex = new Date().getDay(); // 0=Sun..6=Sat
    const meals = [
      { slot: 'Breakfast', recipe: recipes[dayIndex % recipes.length] },
      { slot: 'Lunch', recipe: recipes[(dayIndex + 1) % recipes.length] },
      { slot: 'Dinner', recipe: recipes[(dayIndex + 2) % recipes.length] },
    ].filter(m => m.recipe);

    return meals.length > 0 ? meals : null;
  }, [recipes]);

  return {
    hasActivePlan: todayPlan !== null,
    todayPlan,
    loading,
  };
}

export const MealPlanGlance = () => {
  const { hasActivePlan, todayPlan, loading } = useMealPlan();
  const [preparingSlots, setPreparingSlots] = useState({});

  if (loading) {
    return (
      <div className="bento-card p-5 animate-pulse">
        <div className="h-4 bg-outline-variant/20 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-outline-variant/15 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Render B: No Active Plan CTA
  if (!hasActivePlan) {
    return (
      <div className="bento-card p-6 border-dashed border-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary-container/15 flex items-center justify-center shrink-0 text-primary">
            <span className="material-symbols-outlined text-2xl">calendar_add_on</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">
              No meal plan set for today
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5 max-w-sm font-medium">
              Want to generate a blood-sugar stable plan? Build a balanced menu optimized for your daily GL target.
            </p>
          </div>
        </div>
        <Link
          to="/meal-plans"
          className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Build Today\'s Menu
        </Link>
      </div>
    );
  }

  // Render A: Active Plan Summary
  const mealData = todayPlan.map(({ slot, recipe }) => {
    const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);
    return {
      slot,
      recipe,
      nutrition,
      gl: nutrition.glycemicLoad ?? 0,
    };
  });

  const totalGL = mealData.reduce((sum, m) => sum + m.gl, 0);
  const totalNetCarbs = mealData.reduce((sum, m) => sum + (m.nutrition.netCarbs ?? 0), 0);
  const totalGLInfo = getGlycemicLoadCategory(totalGL);

  const handleMarkPreparing = (e, slot, recipe) => {
    e.preventDefault();
    e.stopPropagation();

    // 15-minute bolus offset
    const estimatedMealTime = new Date(Date.now() + 15 * 60 * 1000);
    scheduleBolusReminder(estimatedMealTime, 15, recipe.title, recipe.id);

    setPreparingSlots((prev) => ({ ...prev, [slot]: true }));
  };

  return (
    <div className="bento-card p-5 md:p-6 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl font-bold">calendar_today</span>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-on-surface">
              Today\'s Meal Plan
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Scheduled low-glycemic daily meals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Macro summary badges */}
          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${totalGLInfo.bgClass} ${totalGLInfo.colorClass} border-current/20`}>
            Total GL: {totalGL}
          </span>
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
            {Math.round(totalNetCarbs)}g Net Carbs
          </span>
        </div>
      </div>

      {/* Meal slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {mealData.map(({ slot, recipe, gl }) => {
          const glInfo = getGlycemicLoadCategory(gl);
          const isPreparing = Boolean(preparingSlots[slot]);

          return (
            <div
              key={slot}
              className="bg-surface-container-low/50 hover:bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-3 transition-all group hover:border-primary/40 hover:shadow-xs"
            >
              <Link to={`/recipe/${recipe.id}`} className="flex items-center gap-3">
                <img
                  src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=100'}
                  alt={recipe.title}
                  className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
                    {slot}
                  </span>
                  <h5 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h5>
                  <span className={`text-[10px] font-extrabold ${glInfo.colorClass}`}>
                    GL: {gl}
                  </span>
                </div>
              </Link>

              {/* Mark as Preparing Bolus Trigger Action */}
              <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center">
                {isPreparing ? (
                  <span className="text-[10px] font-extrabold text-sage-text bg-sage-bg px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">alarm_on</span>
                    Bolus Timer Active (15m)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleMarkPreparing(e, slot, recipe)}
                    className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[11px] font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">skillet</span>
                    Mark as Preparing
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary action */}
      <div className="flex justify-end pt-1">
        <Link
          to="/meal-plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
        >
          View Today\'s Full Schedule
          <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default MealPlanGlance;
