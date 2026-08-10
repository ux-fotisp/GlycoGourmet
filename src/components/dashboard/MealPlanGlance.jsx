import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes } from '../../utils/recipeStore';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

/**
 * MealPlanGlance — Conditional Meal Plan summary for the Dashboard.
 *
 * Reads the active meal plan state from a local hook (useMealPlan pattern).
 * Render A: If an active plan exists, displays today's scheduled meals with
 *           macro summary badges (Total GL, Net Carbs) and a CTA to view the full schedule.
 * Render B: If no plan exists, renders a low-cognitive-load CTA card prompting
 *           the user to build today's menu.
 */

/**
 * Internal hook: useMealPlan
 * In production, this would connect to Snappi CMS meal-plan collections.
 * Currently uses a seeded sample plan from system recipes.
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

  // Build today's plan from available recipes (sample: first 3)
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

  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 animate-pulse">
        <div className="h-4 bg-outline-variant/20 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-outline-variant/15 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render B: No Active Plan CTA ────────────────────────────────────────
  if (!hasActivePlan) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 border border-dashed border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">calendar_add_on</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">
              No meal plan set for today
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5 max-w-sm">
              Want to generate a blood-sugar stable plan? Build a balanced menu optimized for your daily GL target.
            </p>
          </div>
        </div>
        <Link
          to="/meal-plans"
          className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Build Today's Menu
        </Link>
      </div>
    );
  }

  // ─── Render A: Active Plan Summary ───────────────────────────────────────
  // Compute aggregated macros for today's meals
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

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(45,49,48,0.05)] space-y-3">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm font-bold">calendar_today</span>
          Today's Meal Plan
        </h4>
        <div className="flex items-center gap-2">
          {/* Macro summary badges */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${totalGLInfo.bgClass} ${totalGLInfo.colorClass} border-current/20`}>
            Total GL: {totalGL}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
            {Math.round(totalNetCarbs)}g Net Carbs
          </span>
        </div>
      </div>

      {/* Meal slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mealData.map(({ slot, recipe, gl }) => {
          const glInfo = getGlycemicLoadCategory(gl);
          return (
            <Link
              key={slot}
              to={`/recipe/${recipe.id}`}
              className="bg-surface-container-lowest hover:bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/20 flex items-center gap-3 transition-all group"
            >
              <img
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=100'}
                alt={recipe.title}
                className="w-11 h-11 rounded-lg object-cover border border-outline-variant/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-extrabold text-on-surface-variant/60 uppercase tracking-wider block">
                  {slot}
                </span>
                <h5 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {recipe.title}
                </h5>
                <span className={`text-[10px] font-bold ${glInfo.colorClass}`}>
                  GL: {gl}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Primary action */}
      <div className="flex justify-end pt-1">
        <Link
          to="/meal-plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          View Today's Full Schedule
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default MealPlanGlance;
