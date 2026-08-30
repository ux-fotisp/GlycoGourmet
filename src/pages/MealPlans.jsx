import React, { useState, useEffect } from 'react';
import { getAllRecipes } from '../utils/recipeStore';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../utils/nutritionCalculator';
import { usePreferences } from '../context/UserPreferences';
import { generateGroceryManifest } from '../utils/exportPipeline';
import GroceryListModal from '../components/recipe/GroceryListModal';
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
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);

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
    setScheduleState((prev) => ({
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
      .map((id) => recipes.find((r) => r.id === id))
      .filter(Boolean)
      .map((r) => {
        const nutrition = calculateRecipeNutrition(r.ingredients);
        return {
          ...r,
          nutrition,
          gl: nutrition.glycemicLoad ?? 0,
        };
      });

    const dayGL = dayMeals.reduce((sum, m) => sum + m.gl, 0);
    const dayNetCarbs = dayMeals.reduce((sum, m) => sum + (m.nutrition.netCarbs || 0), 0);
    const glInfo = getGlycemicLoadCategory(dayGL);
    const isBalanced = dayGL >= dailyGlTarget * 0.5 && dayGL <= dailyGlTarget;
    const isOverBudget = dayGL > dailyGlTarget;

    return {
      day,
      meals: dayMeals,
      totalGL: dayGL,
      totalNetCarbs: Math.round(dayNetCarbs * 10) / 10,
      glInfo,
      isBalanced,
      isOverBudget,
    };
  });

  // Calculate grocery manifest across current 7-day schedule
  const recipesMap = recipes.reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});

  const prescribedPlanShape = {
    scheduledSlots: scheduleState || {},
  };

  const groceryManifest = generateGroceryManifest(prescribedPlanShape, recipesMap);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1B3B22] text-2xl">calendar_month</span>
            <h1 className="text-2xl font-extrabold text-[#1B3B22] tracking-tight">
              7-Day Glycemic Meal Plan
            </h1>
          </div>
          <p className="text-xs font-semibold text-[#2D5A34] mt-1">
            Tracking against your calibrated daily target of <strong>{dailyGlTarget} GL</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsGroceryModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#1B3B22] text-white hover:bg-[#2D5A34] rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Grocery Shopping List
          </button>
        </div>
      </div>

      {/* Duplicate Success Message Alert */}
      {duplicateSuccessMsg && (
        <div className="bg-[#D8E8CB] border border-[#386A20]/40 text-[#1B3B22] p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{duplicateSuccessMsg}</span>
          </div>
          <button onClick={() => setDuplicateSuccessMsg('')} className="text-stone-500 hover:text-stone-800">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Schedule 7-Day Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#1B3B22]">progress_activity</span>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {computedSchedule.map(({ day, meals, totalGL, totalNetCarbs, isBalanced, isOverBudget }) => {
            const fillWidth = Math.min(100, Math.round((totalGL / dailyGlTarget) * 100));

            return (
              <div
                key={day}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between space-y-4 shadow-xs transition-shadow hover:shadow-md ${
                  isBalanced
                    ? 'border-[#386A20] ring-1 ring-[#386A20]/30'
                    : isOverBudget
                    ? 'border-amber-300 ring-1 ring-amber-300'
                    : 'border-stone-200'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-[#1B3B22]">{day}</span>
                      {isBalanced && (
                        <span
                          title="Perfect GL Balanced Day!"
                          className="material-symbols-outlined text-amber-500 text-[16px] leading-none"
                        >
                          star
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Duplicate Day"
                      title={`Duplicate ${day}'s meals to another day`}
                      onClick={() => setActiveDuplicateModal(day)}
                      className="p-1 rounded-lg text-stone-400 hover:text-[#1B3B22] hover:bg-stone-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                  </div>

                  {/* GL Gauge & Balanced Day Badge */}
                  <div className="mt-3 space-y-1.5 bg-[#F6F4EE] p-2.5 rounded-xl border border-stone-200/60">
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#1B3B22]">
                      <span className="flex items-center gap-1">
                        Daily GL
                        {isBalanced && (
                          <span className="bg-[#D8E8CB] text-[#1B3B22] text-[9px] px-1.5 py-0.5 rounded font-extrabold">
                            Balanced Day
                          </span>
                        )}
                      </span>
                      <span className={isOverBudget ? 'text-amber-700 font-extrabold' : 'text-[#386A20]'}>
                        {totalGL} / {dailyGlTarget}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? 'bg-amber-600' : 'bg-[#1B3B22]'
                        }`}
                        style={{ width: `${fillWidth}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium text-right">
                      {totalNetCarbs}g Net Carbs
                    </div>
                  </div>
                </div>

                {/* Meals in Day */}
                <div className="space-y-2 flex-grow">
                  {meals.map((meal, mIdx) => {
                    const mealType = mIdx === 0 ? 'Breakfast' : mIdx === 1 ? 'Lunch' : 'Dinner';
                    const mealGLInfo = getGlycemicLoadCategory(meal.gl);

                    return (
                      <Link
                        key={mIdx}
                        to={`/recipe/${meal.id}`}
                        className="block bg-[#F6F4EE] hover:bg-stone-100 p-2.5 rounded-xl border border-stone-200/80 transition-all group shadow-2xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#2D5A34] uppercase tracking-wider">
                            {mealType}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${mealGLInfo.bgClass} ${mealGLInfo.colorClass}`}>
                            GL: {meal.gl}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#1B3B22] group-hover:text-[#386A20] transition-colors line-clamp-1 mt-1">
                          {meal.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 mt-1 border-t border-stone-200/50">
                          <span>GI: {meal.nutrition.glycemicIndex ?? '--'}</span>
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

      {/* Grocery Shopping Checklist Modal */}
      <GroceryListModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        manifest={groceryManifest}
      />

      {/* Mini Duplication Calendar Modal Popover */}
      {activeDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-stone-200 shadow-2xl space-y-4 font-sans text-[#1A2118]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1B3B22]">content_copy</span>
                <h3 className="font-bold text-sm text-[#1B3B22]">
                  Duplicate {activeDuplicateModal}'s Meals
                </h3>
              </div>
              <button
                onClick={() => setActiveDuplicateModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Select a target day to paste the exact 3-meal configuration from <strong>{activeDuplicateModal}</strong>:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DAYS.filter((d) => d !== activeDuplicateModal).map((targetDay) => (
                <button
                  key={targetDay}
                  type="button"
                  onClick={() => handleDuplicateDay(activeDuplicateModal, targetDay)}
                  className="p-3 rounded-xl border border-stone-200 bg-[#F6F4EE] hover:bg-[#1B3B22] hover:text-white font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between group"
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
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold hover:bg-stone-100 cursor-pointer text-stone-700"
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
