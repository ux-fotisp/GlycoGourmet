import React, { useState, useEffect } from 'react';
import { getAllRecipes } from '../utils/recipeStore';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../utils/nutritionCalculator';
import { usePreferences } from '../context/UserPreferences';
import { Link } from 'react-router-dom';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MealPlans = () => {
  const { dailyGlTarget = 45 } = usePreferences();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store 7-day schedule map in state and localStorage
  const [scheduleState, setScheduleState] = useState(() => {
    try {
      const saved = localStorage.getItem('glyco_weekly_meal_plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [activeDuplicateModal, setActiveDuplicateModal] = useState(null); // sourceDay string
  const [duplicateSuccessMsg, setDuplicateSuccessMsg] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchRecipes() {
      const data = await getAllRecipes();
      if (active) {
        setRecipes(data);
        setLoading(false);

        // Initialize default schedule if not already present
        if (!scheduleState && data.length > 0) {
          const initialSchedule = {};
          DAYS.forEach((day, idx) => {
            initialSchedule[day] = [
              data[idx % data.length]?.id,
              data[(idx + 1) % data.length]?.id,
              data[(idx + 2) % data.length]?.id,
            ].filter(Boolean);
          });
          setScheduleState(initialSchedule);
        }
      }
    }
    fetchRecipes();
    return () => { active = false; };
  }, []);

  // Sync scheduleState to localStorage
  useEffect(() => {
    if (scheduleState) {
      localStorage.setItem('glyco_weekly_meal_plan', JSON.stringify(scheduleState));
    }
  }, [scheduleState]);

  // Handle Safe Day Duplication
  const handleDuplicateDay = (sourceDay, targetDay) => {
    if (!scheduleState || !scheduleState[sourceDay]) return;

    const sourceRecipeIds = scheduleState[sourceDay];
    setScheduleState(prev => ({
      ...prev,
      [targetDay]: [...sourceRecipeIds],
    }));

    setDuplicateSuccessMsg(`Successfully duplicated ${sourceDay}'s meal plan to ${targetDay}!`);
    setActiveDuplicateModal(null);
    setTimeout(() => setDuplicateSuccessMsg(''), 4000);
  };

  // Build computed daily schedules
  const computedSchedule = DAYS.map((day, idx) => {
    const mealIds = scheduleState?.[day] || (recipes.length > 0 ? [
      recipes[idx % recipes.length]?.id,
      recipes[(idx + 1) % recipes.length]?.id,
      recipes[(idx + 2) % recipes.length]?.id,
    ] : []);

    const dayMeals = mealIds
      .map(id => recipes.find(r => r.id === id))
      .filter(Boolean)
      .map(r => {
        const nutrition = calculateRecipeNutrition(r.ingredients);
        return {
          ...r,
          nutrition,
          gl: nutrition.glycemicLoad ?? 0,
        };
      });

    const dailyTotalGL = dayMeals.reduce((sum, r) => sum + r.gl, 0);
    const dailyGLCategory = getGlycemicLoadCategory(dailyTotalGL);

    // US-1.2 Safe Day Condition: Total Planned GL is >= 50% AND <= 100% of target budget
    const targetCeiling = dailyGlTarget || 45;
    const isSafeDay = dailyTotalGL >= (0.50 * targetCeiling) && dailyTotalGL <= (1.00 * targetCeiling);

    return {
      day,
      meals: dayMeals,
      dailyTotalGL,
      dailyGLCategory,
      isSafeDay,
      targetCeiling,
    };
  });

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">
            Weekly Glycemic Meal Planning Suite
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Positive reinforcement budgeting & 1-click safe day duplication.
          </p>
        </div>

        {/* Daily Recommended Ceiling Badge */}
        <div className="flex items-center gap-2 bg-primary-container/15 px-4 py-2 rounded-full border border-primary/20 text-xs font-bold shadow-2xs">
          <span className="material-symbols-outlined text-primary text-sm">health_and_safety</span>
          <span className="text-on-surface">Target Daily GL Ceiling: <strong className="text-primary">&le; {dailyGlTarget} GL</strong></span>
        </div>
      </header>

      {/* Success Toast Notification */}
      {duplicateSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-primary-container text-on-primary-container border border-primary/30 flex items-center justify-between text-xs font-bold animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {duplicateSuccessMsg}
          </span>
          <button
            onClick={() => setDuplicateSuccessMsg('')}
            className="material-symbols-outlined text-sm cursor-pointer opacity-70 hover:opacity-100"
          >
            close
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {computedSchedule.map(({ day, meals, dailyTotalGL, dailyGLCategory, isSafeDay, targetCeiling }) => {
            const dailyPercent = Math.min(Math.round((dailyTotalGL / targetCeiling) * 100), 100);

            return (
              <div
                key={day}
                className={`bg-white rounded-xl p-3 flex flex-col gap-3 transition-all relative ${
                  isSafeDay
                    ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md bg-gradient-to-b from-primary-container/10 to-white'
                    : 'border border-outline-variant/40 shadow-xs'
                }`}
              >
                {/* Column Header with Positive Reinforcement Gold Star */}
                <div className="border-b border-outline-variant/20 pb-2 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <h3 className="font-display text-sm font-bold text-primary">{day}</h3>
                      {isSafeDay && (
                        <span className="material-symbols-outlined text-amber-500 text-[18px] fill-amber-500" title="Perfect GL Balanced Day!">
                          star
                        </span>
                      )}
                    </div>

                    {isSafeDay ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5 shadow-2xs">
                        Balanced Day
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        {meals.length} Meals
                      </span>
                    )}
                  </div>

                  {/* US-1.2 Frictionless Duplication Button */}
                  <button
                    type="button"
                    onClick={() => setActiveDuplicateModal(day)}
                    className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs ${
                      isSafeDay
                        ? 'bg-primary text-on-primary hover:bg-primary/90'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Duplicate Day</span>
                  </button>
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
                        dailyTotalGL > targetCeiling ? 'bg-error' : isSafeDay ? 'bg-primary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-on-surface-variant text-right font-medium">
                    {dailyPercent}% of {targetCeiling} GL ceiling
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
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                            {mealType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${mealGLInfo.bgClass} ${mealGLInfo.colorClass}`}>
                            GL: {meal.gl}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {meal.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/10">
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

      {/* Mini Duplication Calendar Modal Popover */}
      {activeDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-outline-variant shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">content_copy</span>
                <h3 className="font-bold text-sm text-on-surface">
                  Duplicate {activeDuplicateModal}'s Meals
                </h3>
              </div>
              <button
                onClick={() => setActiveDuplicateModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Select a target day to paste the exact 3-meal configuration from <strong>{activeDuplicateModal}</strong>:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DAYS.filter(d => d !== activeDuplicateModal).map(targetDay => (
                <button
                  key={targetDay}
                  type="button"
                  onClick={() => handleDuplicateDay(activeDuplicateModal, targetDay)}
                  className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:bg-primary hover:text-on-primary font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between group"
                >
                  <span>{targetDay}</span>
                  <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100">arrow_forward</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDuplicateModal(null)}
                className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MealPlans;
