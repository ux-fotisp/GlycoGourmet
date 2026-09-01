import React, { useState } from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const MetabolicTargetsTab = () => {
  const {
    dailyGlTarget,
    maxNetCarbsPerMeal,
    targetDailyCalories,
    setDailyGlTarget,
    setMaxNetCarbsPerMeal,
    setTargetDailyCalories,
  } = usePreferences();

  const [validationErrors, setValidationErrors] = useState({});

  const handleDailyGlChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors((prev) => ({ ...prev, dailyGlTarget: 'GL Target must be greater than 0' }));
    } else {
      setValidationErrors((prev) => ({ ...prev, dailyGlTarget: null }));
      setDailyGlTarget(val);
    }
  };

  const handleMaxNetCarbsChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors((prev) => ({ ...prev, maxNetCarbsPerMeal: 'Carbs target must be greater than 0' }));
    } else {
      setValidationErrors((prev) => ({ ...prev, maxNetCarbsPerMeal: null }));
      setMaxNetCarbsPerMeal(val);
    }
  };

  const handleCaloriesChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors((prev) => ({ ...prev, targetDailyCalories: 'Calories must be greater than 0' }));
    } else {
      setValidationErrors((prev) => ({ ...prev, targetDailyCalories: null }));
      setTargetDailyCalories(val);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" role="tabpanel" aria-label="Metabolic Targets">
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">insights</span>
            Daily Glycemic Load (GL) Budget
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Maximum recommended cumulative glycemic load score across all 24-hour meal occasions.
          </p>
        </div>
        <div className="max-w-xs space-y-1">
          <input
            type="number"
            min="1"
            max="300"
            value={dailyGlTarget}
            onChange={handleDailyGlChange}
            className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-primary"
            aria-label="Daily GL Target"
          />
          {validationErrors.dailyGlTarget && (
            <p className="text-[11px] text-error font-bold">{validationErrors.dailyGlTarget}</p>
          )}
        </div>
      </div>

      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
            Max Net Carbohydrates per Meal (g)
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Postprandial glycemic threshold per dish to avoid sudden glucose excursions.
          </p>
        </div>
        <div className="max-w-xs space-y-1">
          <input
            type="number"
            min="1"
            max="200"
            value={maxNetCarbsPerMeal}
            onChange={handleMaxNetCarbsChange}
            className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-primary"
            aria-label="Max Net Carbohydrates per Meal"
          />
          {validationErrors.maxNetCarbsPerMeal && (
            <p className="text-[11px] text-error font-bold">{validationErrors.maxNetCarbsPerMeal}</p>
          )}
        </div>
      </div>

      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">local_fire_department</span>
            Target Daily Calories (kcal)
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Target baseline energy requirement for balanced macronutrient distribution.
          </p>
        </div>
        <div className="max-w-xs space-y-1">
          <input
            type="number"
            min="500"
            max="6000"
            step="50"
            value={targetDailyCalories}
            onChange={handleCaloriesChange}
            className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-primary"
            aria-label="Target Daily Calories"
          />
          {validationErrors.targetDailyCalories && (
            <p className="text-[11px] text-error font-bold">{validationErrors.targetDailyCalories}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetabolicTargetsTab;