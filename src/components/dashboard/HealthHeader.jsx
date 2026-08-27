import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/UserPreferences';
import { useRecipes } from '../../hooks/useRecipes';
import { calculateRecipeNutrition } from '../../utils/nutritionCalculator';

/**
 * HealthHeader � OOUX Health Context Header
 *
 * Displays the user's greeting, active glucose/unit preferences (clickable pills
 * linking to /settings), and a real-time Daily GL Budget progress bar.
 */
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
  let barColor = 'bg-brand-strong';     // Sage Green � safe
  let textColor = 'text-primary';
  let statusLabel = 'On Track';
  let statusBadgeClass = 'bg-primary-container/15 text-primary border-primary/20';

  if (ratio > 1) {
    barColor = 'bg-error-strong';        // Soft Rose � exceeded
    textColor = 'text-error';
    statusLabel = 'Exceeded';
    statusBadgeClass = 'bg-error-container/20 text-error border-error/20';
  } else if (ratio >= 0.75) {
    barColor = 'bg-warning-strong';        // Copper/Amber � moderate
    textColor = 'text-tertiary';
    statusLabel = 'Approaching Limit';
    statusBadgeClass = 'bg-tertiary-container/20 text-tertiary border-tertiary/20';
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bento-card p-5 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        {/* Left: User greeting + preference pills */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-[11px] font-bold text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Metabolic Health Dashboard
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
            {greeting()}, {user?.name || 'Chef'}
          </h2>
          <p className="text-on-surface-variant text-xs md:text-sm font-medium">
            Here is your daily metabolic glycemic overview and blood-sugar balanced menu.
          </p>

          {/* Clickable preference pills linking to /settings */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface-variant transition-all hover:scale-[1.02]"
              title="Change glucose format in Settings"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">bloodtype</span>
              {GLUCOSE_LABELS[glucoseUnit] || 'mg/dL'}
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface-variant transition-all hover:scale-[1.02]"
              title="Change unit system in Settings"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">straighten</span>
              {UNIT_LABELS[unitSystem] || 'Imperial'}
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface-variant transition-all hover:scale-[1.02]"
              title="Daily GL Target"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">flag</span>
              Target: {targetGL} GL
            </Link>
          </div>
        </div>

        {/* Right: Daily GL Budget Progress */}
        <div className="w-full md:w-80 bg-surface-container-low/70 rounded-2xl p-4 md:p-5 border border-outline-variant/30 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">monitoring</span>
              Daily GL Budget
            </span>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
              {statusLabel}
            </span>
          </div>

          {/* Numeric display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-display text-3xl font-black tracking-tight ${textColor}`}>
                {dailyGL}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">
                / {targetGL} GL
              </span>
            </div>
            <span className="text-[11px] font-bold text-on-surface-variant">
              {percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden bg-surface-container-high/80 p-0.5 border border-outline-variant/20">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant/80 font-semibold pt-0.5">
            <span>0 GL</span>
            <span>Target: {targetGL} GL</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthHeader;
