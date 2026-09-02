import React, { useState, useMemo } from 'react';
import {
  calculateRecipeNutrition,
  scaleNutrition,
  getGlycemicLoadCategory,
} from '../../utils/nutritionCalculator';
import { evaluateRecipeNutritionCompleteness } from '../../utils/provenanceEvaluator';

/**
 * RecipeNutritionSummary — Truthful Per-Recipe and Per-Serving Nutrition & Glycemic Load Summary
 *
 * Evaluates recipe ingredient lines against strict completeness and glycemic safety rules.
 * Never fabricates or coerces missing Glycemic Load to 0.
 *
 * Props:
 *   lines: ProvenanceReadyRecipeIngredientLine[]
 *   servings: number (default: 1)
 *   dailyGlTarget: number (default: 45)
 */
export const RecipeNutritionSummary = ({
  lines = [],
  servings = 1,
  dailyGlTarget = 45,
}) => {
  const [scope, setScope] = useState('serving'); // 'serving' | 'total'

  const effectiveServings = Math.max(1, Number(servings) || 1);

  // 1. Evaluate completeness deterministically
  const completeness = useMemo(() => {
    return evaluateRecipeNutritionCompleteness(lines);
  }, [lines]);

  // 2. Calculate full recipe nutrition
  const totalNutrition = useMemo(() => {
    if (!completeness.canCalculateNutrition && completeness.status === 'incomplete') {
      return null;
    }
    return calculateRecipeNutrition(lines);
  }, [lines, completeness]);

  // 3. Scale nutrition for current display scope
  const displayedNutrition = useMemo(() => {
    if (!totalNutrition) return null;
    if (scope === 'serving') {
      return scaleNutrition(totalNutrition, 1 / effectiveServings);
    }
    return totalNutrition;
  }, [totalNutrition, scope, effectiveServings]);

  // 4. Glycemic metrics (strictly when canCalculateGl is true)
  const gl = completeness.canCalculateGl && displayedNutrition
    ? Math.round(displayedNutrition.glycemicLoad ?? 0)
    : null;

  const gi = completeness.canCalculateGl && displayedNutrition && displayedNutrition.glycemicIndex !== null
    ? Math.round(displayedNutrition.glycemicIndex)
    : null;

  const glInfo = gl !== null ? getGlycemicLoadCategory(gl) : null;
  const glPercent = gl !== null
    ? Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)))
    : 0;

  // 5. Provenance source counts
  const sourceCounts = useMemo(() => {
    const counts = { verified: 0, usda: 0, custom: 0, review: 0 };
    lines.forEach((l) => {
      if (l.source === 'internal_verified') counts.verified += 1;
      else if (l.source === 'usda_fooddata_central') counts.usda += 1;
      else if (l.source === 'user_entered') counts.custom += 1;
      else counts.review += 1;
    });
    return counts;
  }, [lines]);

  return (
    <div
      role="region"
      aria-label="Recipe Nutrition and Metabolic Summary"
      className="bg-white p-5 md:p-6 rounded-2xl border border-outline-variant/30 shadow-[0px_4px_25px_rgba(45,49,48,0.06)] space-y-5"
    >
      {/* Header & Provenance Source Breakdown */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/20 pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            Nutrition & Metabolic Summary
          </h3>
          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
            Real-time glycemic load and macronutrient estimation for private formulation.
          </p>
        </div>

        {/* Source Badges */}
        {lines.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            {sourceCounts.verified > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {sourceCounts.verified} Verified database
              </span>
            )}
            {sourceCounts.usda > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {sourceCounts.usda} USDA-sourced
              </span>
            )}
            {sourceCounts.custom > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {sourceCounts.custom} User-entered
              </span>
            )}
          </div>
        )}
      </div>

      {/* Completeness State Alert Banner */}
      {completeness.status === 'complete' && (
        <div
          data-testid="completeness-banner-complete"
          className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 text-primary text-xs"
        >
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-primary/10 px-2 py-0.5 rounded-full inline-block border border-primary/20 mb-0.5">
              Complete nutrition & Glycemic Load
            </span>
            <p className="text-[11px] text-on-surface">
              All ingredients have complete nutritional profiles and verified glycemic evidence.
            </p>
          </div>
        </div>
      )}

      {completeness.status === 'estimated' && (
        <div
          role="alert"
          data-testid="completeness-banner-estimated"
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs"
        >
          <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">warning</span>
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-block border border-amber-300">
              Estimated Nutrition (GL Unavailable)
            </span>
            <p className="text-[11px] text-amber-900">
              Macronutrients are calculated, but Glycemic Load cannot be determined because 1 or more carbohydrate ingredients lack verified Glycemic Index data.
            </p>
            {completeness.missingGiLines.length > 0 && (
              <p className="text-[10px] text-amber-800 font-mono">
                Missing GI for: {completeness.missingGiLines.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {completeness.status === 'incomplete' && (
        <div
          role="alert"
          data-testid="completeness-banner-incomplete"
          className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-900 text-xs"
        >
          <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">error</span>
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full inline-block border border-rose-300">
              Incomplete Nutrition Data
            </span>
            <p className="text-[11px] text-rose-900">
              Cannot calculate complete nutrition: 1 or more ingredients cannot be converted to grams or lack core macronutrients.
            </p>
            {completeness.warnings.length > 0 && (
              <ul className="text-[10px] text-rose-800 list-disc list-inside space-y-0.5">
                {completeness.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Scope Selector Tabs (Per Serving vs Full Recipe) */}
      <div className="flex items-center justify-between gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
        <button
          type="button"
          onClick={() => setScope('serving')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            scope === 'serving'
              ? 'bg-white text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Per Serving (1 of {effectiveServings})
        </button>
        <button
          type="button"
          onClick={() => setScope('total')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            scope === 'total'
              ? 'bg-white text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Full Recipe Total
        </button>
      </div>

      {/* Metabolic Impact / Glycemic Load Card */}
      <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 space-y-3">
        {completeness.canCalculateGl && gl !== null ? (
          <div className="space-y-3" data-testid="glycemic-metrics-complete">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Glycemic Load ({scope === 'serving' ? 'Per Serving' : 'Full Recipe'})
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display text-2xl font-bold text-on-surface">
                    GL {gl}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${glInfo?.colorClass || 'text-primary'}`}>
                    {glInfo?.label || 'Gentle Impact'}
                  </span>
                </div>
              </div>

              {gi !== null && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Weighted GI
                  </span>
                  <span className="font-display text-lg font-bold text-primary">
                    GI {gi}
                  </span>
                </div>
              )}
            </div>

            {/* Daily GL Target Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                <span>Daily GL Target Budget</span>
                <span>{glPercent}% of {dailyGlTarget} GL</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    gl >= 20 ? 'bg-error' : gl >= 11 ? 'bg-tertiary' : 'bg-primary'
                  }`}
                  style={{ width: `${glPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="gl-unavailable-message" className="py-2 text-center text-on-surface-variant space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Glycemic Load Unavailable
            </div>
            <p className="text-[11px] text-on-surface-variant/80 max-w-xs mx-auto">
              {completeness.status === 'incomplete'
                ? 'Resolve unit conversion warnings to enable metabolic calculations.'
                : 'Requires verified glycemic index for all carbohydrate contributors before Glycemic Load can be safely determined.'}
            </p>
          </div>
        )}
      </div>

      {/* Core Macronutrients Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Calories */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Calories
          </span>
          <span className="font-display text-lg font-bold text-primary mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.kcal} kcal` : '--'}
          </span>
        </div>

        {/* Carbohydrates */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Carbohydrates
          </span>
          <span className="font-display text-lg font-bold text-on-surface mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.carbs}g` : '--'}
          </span>
        </div>

        {/* Net Carbs */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Net Carbs
          </span>
          <span className="font-display text-lg font-bold text-secondary mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.netCarbs}g` : '--'}
          </span>
        </div>

        {/* Dietary Fiber */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Fiber
          </span>
          <span className="font-display text-lg font-bold text-on-surface mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.fiber}g` : '--'}
          </span>
        </div>

        {/* Protein */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Protein
          </span>
          <span className="font-display text-lg font-bold text-on-surface mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.protein}g` : '--'}
          </span>
        </div>

        {/* Total Fat */}
        <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 text-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Fat
          </span>
          <span className="font-display text-lg font-bold text-on-surface mt-0.5 block">
            {displayedNutrition ? `${displayedNutrition.fat}g` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeNutritionSummary;
