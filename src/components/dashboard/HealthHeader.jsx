import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/UserPreferences';
import { useRecipes } from '../../hooks/useRecipes';
import { calculateRecipeNutrition } from '../../utils/nutritionCalculator';

/**
 * HealthHeader — OOUX Health Context Header
 *
 * Displays the user's greeting, active glucose/unit preferences (clickable pills
 * linking to /settings), and a real-time Daily GL Budget progress bar. The GL budget
 * tracks accumulated glycemic load from favorited recipes consumed today versus a
 * configurable daily target (default 45 GL).
 */
const DAILY_GL_TARGET = 45;

const GLUCOSE_LABELS = {
  mgdl: 'mg/dL',
  mmoll: 'mmol/L',
};

const UNIT_LABELS = {
  imperial: 'Imperial',
  metric: 'Metric',
};

export const HealthHeader = () => {
  const { user } = useAuth();
  const { glucoseUnit, unitSystem, dailyGlTarget } = usePreferences();
  const { allRecipes } = useRecipes();
  const [mealPlanGL, setMealPlanGL] = React.useState(0);

  const targetGL = dailyGlTarget || 45;

  // Listen for optimistic meal plan updates
  React.useEffect(() => {
    const syncMealPlan = () => {
      try {
        const raw = localStorage.getItem('glyco_meal_plan');
        if (!raw) {
          setMealPlanGL(0);
          return;
        }
        const plan = JSON.parse(raw);
        const todayItems = plan.today || [];
        const sum = todayItems.reduce((acc, item) => acc + (Number(item.glycemicLoad) || 0), 0);
        setMealPlanGL(sum);
      } catch {
        setMealPlanGL(0);
      }
    };

    syncMealPlan();
    window.addEventListener('glyco_meal_plan_updated', syncMealPlan);
    return () => window.removeEventListener('glyco_meal_plan_updated', syncMealPlan);
  }, []);

  // Calculate today's accumulated GL from favorited recipes + scheduled meals
  const dailyGL = useMemo(() => {
    const favIds = user?.favorites ?? [];
    const favoriteGL = favIds.reduce((sum, id) => {
      const recipe = allRecipes.find(r => r.id === id);
      if (!recipe) return sum;
      const nutrition = calculateRecipeNutrition(recipe.ingredients ?? []);
      return sum + (nutrition.glycemicLoad ?? 0);
    }, 0);

    return favoriteGL + mealPlanGL;
  }, [user?.favorites, allRecipes, mealPlanGL]);

  const ratio = targetGL > 0 ? dailyGL / targetGL : 0;
  const percent = Math.min(Math.round(ratio * 100), 120);
  const clampedPercent = Math.min(percent, 100);

  // Color thresholds per spec
  let barColor = 'bg-[#325346]';     // Sage Green — safe
  let textColor = 'text-primary';
  let statusLabel = 'On Track';

  if (ratio > 1) {
    barColor = 'bg-[#BA1A1A]';        // Soft Rose — exceeded
    textColor = 'text-error';
    statusLabel = 'Exceeded';
  } else if (ratio >= 0.75) {
    barColor = 'bg-[#C87A5B]';        // Copper/Amber — moderate
    textColor = 'text-tertiary';
    statusLabel = 'Approaching Limit';
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-[0_4px_20px_rgba(45,49,48,0.04)] mb-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">

        {/* Left: User greeting + preference pills */}
        <div className="space-y-1">
          <h2 className="font-display text-headline-sm text-on-surface font-bold">
            {greeting()}, {user?.name || 'Chef'} 👋
          </h2>
          <p className="text-on-surface-variant font-body-md text-xs">
            Here is your daily metabolic glycemic overview.
          </p>

          {/* Clickable preference pills linking to /settings */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface-variant transition-colors"
              title="Change glucose format in Settings"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">bloodtype</span>
              {GLUCOSE_LABELS[glucoseUnit] || 'mg/dL'}
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface-variant transition-colors"
              title="Change unit system in Settings"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">straighten</span>
              {UNIT_LABELS[unitSystem] || 'Imperial'}
            </Link>
          </div>
        </div>

        {/* Right: Daily GL Budget Progress */}
        <div className="w-full md:w-72 bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">monitoring</span>
              Daily GL Budget
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              ratio > 1 ? 'bg-error-container/15 text-error' :
              ratio >= 0.75 ? 'bg-tertiary-container/15 text-tertiary' :
              'bg-primary-container/15 text-primary'
            }`}>
              {statusLabel}
            </span>
          </div>

          {/* Numeric display */}
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-2xl font-extrabold ${textColor}`}>
              {dailyGL}
            </span>
            <span className="text-sm text-on-surface-variant font-medium">
              / {targetGL} GL
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F4F2' }}>
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-on-surface-variant/70 font-medium">
            {percent}% of daily target consumed
          </p>
        </div>

      </div>
    </div>
  );
};

export default HealthHeader;
