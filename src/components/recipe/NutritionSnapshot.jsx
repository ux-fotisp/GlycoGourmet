import React from 'react';
import NutritionBadge from '../ui/NutritionBadge';
import { getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

/**
 * NutritionSnapshot — Metabolic Bento Grid
 *
 * Renders a high-density 8-item bento grid (grid grid-cols-2 md:grid-cols-4 gap-3):
 * 1. Glycemic Load (GL) — Solid pill badge (Sage ≤10, Copper 11-19, Rose ≥20)
 * 2. Glycemic Index (GI) — Minimalist outline pill badge
 * 3. Net Carbs (g)
 * 4. Dietary Fiber (g)
 * 5. Calories (kcal)
 * 6. Protein (g)
 * 7. Total Fat (g)
 * 8. Glucose Spike Prediction — Progress meter ("Gentle Range" vs "Elevated Spike")
 */
export const NutritionSnapshot = ({ nutrition }) => {
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);
  const glInfo = getGlycemicLoadCategory(gl);

  const gi = nutrition?.glycemicIndex;
  let giSublabel = 'Low';
  let giColor = 'text-primary';
  if (gi !== null && gi !== undefined) {
    if (gi >= 70) { giSublabel = 'High'; giColor = 'text-error'; }
    else if (gi >= 56) { giSublabel = 'Med'; giColor = 'text-tertiary'; }
    else { giSublabel = 'Low'; giColor = 'text-primary'; }
  }

  // Glucose Spike Prediction logic based on GL
  const spikePercent = Math.min(Math.round((gl / 30) * 100), 100);
  const isGentle = gl <= 10;
  const spikeLabel = isGentle ? 'Gentle Range' : gl <= 19 ? 'Moderate Curve' : 'Elevated Spike';
  const spikeColor = isGentle ? 'bg-primary' : gl <= 19 ? 'bg-tertiary' : 'bg-error';

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-outline-variant shadow-[0px_4px_20px_rgba(45,49,48,0.05)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md md:text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">analytics</span>
          Nutritional Snapshot
        </h3>
        <div className="flex items-center gap-1 text-on-surface-variant/70 text-xs">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span className="font-label-md">Portion-adjusted calculation</span>
        </div>
      </div>

      {/* 8-Item High-Density Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* 1. Glycemic Load (GL) — Solid pill badge */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            Glycemic Load
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-xl md:text-2xl font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
              gl >= 20 ? 'bg-error-container text-on-error-container font-bold text-base' :
              gl >= 11 ? 'bg-tertiary-container text-on-tertiary-container font-bold text-base' :
              'bg-primary-container text-on-primary-container font-bold text-base'
            }`}>
              GL {gl}
            </span>
          </div>
          <span className="text-[10px] font-medium text-on-surface-variant/70 mt-1">
            {glInfo.label} impact
          </span>
        </div>

        {/* 2. Glycemic Index (GI) — Minimalist outline pill badge */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            Glycemic Index
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="bg-white border border-outline-variant/60 text-on-surface px-2.5 py-0.5 rounded-full font-bold text-sm">
              GI {gi !== null && gi !== undefined ? Math.round(gi) : '—'}
            </span>
          </div>
          <span className={`text-[10px] font-medium mt-1 ${giColor}`}>
            {giSublabel} Speed
          </span>
        </div>

        {/* 3. Net Carbs */}
        <NutritionBadge
          label="Net Carbs"
          value={nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs * 10) / 10 : null}
          unit="g"
        />

        {/* 4. Dietary Fiber */}
        <NutritionBadge
          label="Dietary Fiber"
          value={nutrition?.fiber !== undefined ? Math.round(nutrition.fiber * 10) / 10 : null}
          unit="g"
        />

        {/* 5. Calories */}
        <NutritionBadge
          label="Calories"
          value={nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : null}
          unit=" kcal"
        />

        {/* 6. Protein */}
        <NutritionBadge
          label="Protein"
          value={nutrition?.protein !== undefined ? Math.round(nutrition.protein * 10) / 10 : null}
          unit="g"
        />

        {/* 7. Total Fat */}
        <NutritionBadge
          label="Total Fat"
          value={nutrition?.fat !== undefined ? Math.round(nutrition.fat * 10) / 10 : null}
          unit="g"
        />

        {/* 8. Glucose Spike Prediction — Progress meter */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            Glucose Spike Prediction
          </span>
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className={isGentle ? 'text-primary' : gl <= 19 ? 'text-tertiary' : 'text-error'}>
                {spikeLabel}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spikeColor}`}
                style={{ width: `${spikePercent}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] text-on-surface-variant/70">
            Postprandial curve estimate
          </span>
        </div>

      </div>
    </div>
  );
};

export default NutritionSnapshot;
