import React, { useState } from 'react';
import NutritionBadge from '../ui/NutritionBadge';
import { usePreferences } from '../../context/UserPreferences';

/**
 * NutritionSnapshot - Metabolic Bento Grid with Progressive Disclosure
 *
 * Keeps primary anchors (GL, GI, Net Carbs, Fiber) continuously visible,
 * while rendering secondary macros (Calories, Carbs, Fat, Protein) inside a collapsible accordion.
 */
export const NutritionSnapshot = ({ nutrition, servingMultiplier = 1, isAuditorView = false }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const { dailyGlTarget = 45 } = usePreferences();

  const gl = Math.round(nutrition?.glycemicLoad ?? 0);

  const gi = nutrition?.glycemicIndex;
  let giSublabel = 'Low';
  let giColor = 'text-brand-strong';
  if (gi !== null && gi !== undefined) {
    if (gi >= 70) { giSublabel = 'High'; giColor = 'text-error'; }
    else if (gi >= 56) { giSublabel = 'Med'; giColor = 'text-tertiary'; }
    else { giSublabel = 'Low'; giColor = 'text-brand-strong'; }
  }

  // Preattentive GL Gauge fill width & color
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));
  const isGentle = gl <= 10;
  const spikeLabel = isGentle ? 'Gentle Impact' : gl <= 19 ? 'Moderate Impact' : 'High Spike Risk';
  const spikeColor = isGentle ? 'bg-brand-strong' : gl <= 19 ? 'bg-tertiary' : 'bg-error';

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-bold text-text-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-[20px]">analytics</span>
          Nutritional Snapshot
        </h3>
        <div className="flex items-center gap-1 text-text-body text-xs bg-surface-container px-2.5 py-1 rounded-full border border-border-subtle">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span className="font-bold">per {servingMultiplier}× serving</span>
        </div>
      </div>

      {/* Primary Anchors (Continuously Visible) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Glycemic Load (GL) Meter */}
        <div className="bg-canvas p-3 rounded-control border border-border-subtle flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-body">
            Glycemic Load
          </span>
          <div className="space-y-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className={`text-sm md:text-base font-extrabold px-2 py-0.5 rounded-full border ${
                gl >= 20 ? 'bg-error-container text-on-error-container border-error font-bold' :
                gl >= 11 ? 'bg-tertiary-container text-on-tertiary-container border-tertiary font-bold' :
                'bg-success-surface text-brand-strong border-success-border font-bold'
              }`}>
                GL {gl}
              </span>
              <span className="text-[10px] font-bold text-text-body">{fillWidth}%</span>
            </div>
            {/* Preattentive Chromatic Meter */}
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={gl} aria-valuemin="0" aria-valuemax={dailyGlTarget} aria-label="Daily Glycemic Load Progress">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spikeColor}`}
                style={{ width: `${fillWidth}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-text-body">
            {spikeLabel}
          </span>
        </div>

        {/* 2. Glycemic Index (GI) */}
        <div className="bg-canvas p-3 rounded-control border border-border-subtle flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-body">
            Glycemic Index
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="bg-card border border-border-interactive text-text-strong px-2.5 py-0.5 rounded-full font-bold text-sm shadow-xs">
              {`GI ${gi !== null && gi !== undefined ? Math.round(gi) : '—'}`}
            </span>
          </div>
          <span className={`text-[10px] font-bold mt-1 ${giColor}`}>
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
      <details
        open={isAccordionOpen || isAuditorView}
        onToggle={(e) => setIsAccordionOpen(e.currentTarget.open)}
        className="group border border-border-subtle rounded-control p-3 bg-canvas transition-all"
        aria-label="Secondary Macronutrient Breakdown"
      >
        <summary className="font-bold text-xs text-text-strong cursor-pointer flex items-center justify-between select-none py-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none">
          <span className="flex items-center gap-1.5 text-brand-strong">
            <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform">
              expand_more
            </span>
            Secondary Macros (Calories, Carbs, Fat, Protein)
          </span>
          <span className="text-[10px] font-normal text-text-body group-open:hidden">
            Tap to expand breakdown
          </span>
        </summary>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border-subtle/50 mt-2">
          {/* Calories */}
          <div className="contents">
            <dt className="sr-only">Calories</dt>
            <dd className="w-full">
              <NutritionBadge
                label="Calories"
                value={nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : null}
                unit=" kcal"
              />
            </dd>
          </div>

          {/* Total Carbs */}
          <div className="contents">
            <dt className="sr-only">Total Carbohydrates</dt>
            <dd className="w-full">
              <NutritionBadge
                label="Total Carbs"
                value={nutrition?.carbs !== undefined ? Math.round(nutrition.carbs * 10) / 10 : null}
                unit="g"
              />
            </dd>
          </div>

          {/* Protein */}
          <div className="contents">
            <dt className="sr-only">Protein</dt>
            <dd className="w-full">
              <NutritionBadge
                label="Protein"
                value={nutrition?.protein !== undefined ? Math.round(nutrition.protein * 10) / 10 : null}
                unit="g"
              />
            </dd>
          </div>

          {/* Total Fat */}
          <div className="contents">
            <dt className="sr-only">Total Fat</dt>
            <dd className="w-full">
              <NutritionBadge
                label="Total Fat"
                value={nutrition?.fat !== undefined ? Math.round(nutrition.fat * 10) / 10 : null}
                unit="g"
              />
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
};

export default NutritionSnapshot;
