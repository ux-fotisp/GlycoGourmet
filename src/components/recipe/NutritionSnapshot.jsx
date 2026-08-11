import React from 'react';
import NutritionBadge from '../ui/NutritionBadge';
import { getGlycemicLoadCategory } from '../../utils/nutritionCalculator';
import { usePreferences } from '../../context/UserPreferences';

/**
 * NutritionSnapshot — Metabolic Bento Grid with Progressive Disclosure
 *
 * Keeps primary anchors (GL, GI, Net Carbs, Fiber) continuously visible,
 * while rendering secondary macros (Calories, Fat, Protein) inside a collapsible accordion.
 */
export const NutritionSnapshot = ({ nutrition }) => {
  const { dailyGlTarget = 45 } = usePreferences();

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

  // Preattentive GL Gauge fill width & color
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));
  const isGentle = gl <= 10;
  const spikeLabel = isGentle ? 'Gentle Impact' : gl <= 19 ? 'Moderate Impact' : 'High Spike Risk';
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

      {/* Primary Anchors (Continuously Visible) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Glycemic Load (GL) Meter */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            Glycemic Load
          </span>
          <div className="space-y-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className={`text-sm md:text-base font-extrabold px-2 py-0.5 rounded-full ${
                gl >= 20 ? 'bg-error-container text-on-error-container font-bold' :
                gl >= 11 ? 'bg-tertiary-container text-on-tertiary-container font-bold' :
                'bg-primary-container text-on-primary-container font-bold'
              }`}>
                GL {gl}
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant">{fillWidth}%</span>
            </div>
            {/* Preattentive Chromatic Meter */}
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spikeColor}`}
                style={{ width: `${fillWidth}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-on-surface-variant/80">
            {spikeLabel}
          </span>
        </div>

        {/* 2. Glycemic Index (GI) */}
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
      </div>

      {/* Secondary Macros Collapsible Accordion (Progressive Disclosure) */}
      <details className="group border border-outline-variant/30 rounded-xl p-3 bg-surface-container-low/40 transition-all">
        <summary className="font-bold text-xs text-on-surface cursor-pointer flex items-center justify-between select-none py-1">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform">
              expand_more
            </span>
            Secondary Macros (Calories, Fat, Protein)
          </span>
          <span className="text-[10px] font-normal text-on-surface-variant group-open:hidden">
            Tap to expand breakdown
          </span>
        </summary>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-outline-variant/20 mt-2">
          {/* Calories */}
          <NutritionBadge
            label="Calories"
            value={nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : null}
            unit=" kcal"
          />

          {/* Protein */}
          <NutritionBadge
            label="Protein"
            value={nutrition?.protein !== undefined ? Math.round(nutrition.protein * 10) / 10 : null}
            unit="g"
          />

          {/* Total Fat */}
          <NutritionBadge
            label="Total Fat"
            value={nutrition?.fat !== undefined ? Math.round(nutrition.fat * 10) / 10 : null}
            unit="g"
          />
        </div>
      </details>
    </div>
  );
};

export default NutritionSnapshot;
