import React, { useState, useEffect } from 'react';
import { getAllRecipes } from '../utils/recipeStore';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../utils/nutritionCalculator';
import { Link } from 'react-router-dom';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MealPlans = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchRecipes() {
      const data = await getAllRecipes();
      if (active) {
        setRecipes(data);
        setLoading(false);
      }
    }
    fetchRecipes();
    return () => { active = false; };
  }, []);

  // Build sample 7-day schedule using system recipes
  const sampleSchedule = DAYS.map((day, idx) => {
    const dayRecipes = recipes.length > 0 ? [
      recipes[idx % recipes.length],
      recipes[(idx + 1) % recipes.length],
      recipes[(idx + 2) % recipes.length],
    ] : [];

    const computedDayRecipes = dayRecipes.map(r => {
      const nutrition = calculateRecipeNutrition(r.ingredients);
      return {
        ...r,
        nutrition,
        gl: nutrition.glycemicLoad ?? 0,
      };
    });

    const dailyTotalGL = computedDayRecipes.reduce((sum, r) => sum + r.gl, 0);
    const dailyGLCategory = getGlycemicLoadCategory(dailyTotalGL);

    return {
      day,
      meals: computedDayRecipes,
      dailyTotalGL,
      dailyGLCategory,
    };
  });

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">
            Weekly Glycemic Meal Planning Suite
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Monitor real-world postprandial impact with daily total Glycemic Load aggregation.
          </p>
        </div>

        {/* Daily Recommended Ceiling Badge */}
        <div className="flex items-center gap-2 bg-primary-container/15 px-4 py-2 rounded-full border border-primary-fixed-dim/20 text-xs font-bold">
          <span className="material-symbols-outlined text-primary text-sm">health_and_safety</span>
          <span className="text-on-surface">Target Daily GL Ceiling: <strong className="text-primary">&le; 80 GL</strong></span>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {sampleSchedule.map(({ day, meals, dailyTotalGL, dailyGLCategory }) => {
            // Target daily GL ceiling = 80
            const dailyPercent = Math.min(Math.round((dailyTotalGL / 80) * 100), 100);

            return (
              <div
                key={day}
                className="bg-white rounded-xl border border-outline-variant/40 p-3 flex flex-col gap-3 shadow-sm"
              >
                {/* Column Header */}
                <div className="border-b border-outline-variant/20 pb-2 flex justify-between items-center">
                  <h3 className="font-display text-sm font-bold text-primary">{day}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                    3 Meals
                  </span>
                </div>

                {/* Daily Total GL Aggregate Bar */}
                <div className="bg-surface-container-low p-2.5 rounded-lg space-y-1.5 border border-outline-variant/20">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-on-surface-variant">Daily GL</span>
                    <span className={dailyGLCategory.colorClass}>
                      {dailyTotalGL} GL <small className="font-normal">({dailyGLCategory.label})</small>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        dailyTotalGL > 80 ? 'bg-error' : dailyTotalGL > 50 ? 'bg-tertiary' : 'bg-primary-fixed-dim'
                      }`}
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-on-surface-variant/70 text-right font-medium">
                    {dailyPercent}% of 80 GL target
                  </div>
                </div>

                {/* Meal Cards List */}
                <div className="flex flex-col gap-2 flex-grow">
                  {meals.map((meal, idx) => {
                    const mealType = idx === 0 ? 'Breakfast' : idx === 1 ? 'Lunch' : 'Dinner';
                    const mealGLInfo = getGlycemicLoadCategory(meal.gl);

                    return (
                      <Link
                        key={meal.id + idx}
                        to={`/recipe/${meal.id}`}
                        className="bg-surface-container-lowest hover:bg-surface-container-low/60 rounded-lg p-2.5 border border-outline-variant/30 transition-all flex flex-col gap-1.5 group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
                            {mealType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${mealGLInfo.bgClass} ${mealGLInfo.colorClass}`}>
                            GL: {meal.gl}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {meal.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/10">
                          <span>GI: {meal.nutrition.glycemicIndex ?? '—'}</span>
                          <span>{meal.nutrition.netCarbs}g carbs</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default MealPlans;
