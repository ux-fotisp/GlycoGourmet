import React, { useMemo } from 'react';
import { calculateRecipeNutrition, getIngredientById, getPrepStateLabel, PREP_STATES, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';
import { usePreferences } from '../../context/UserPreferences';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import NutritionSnapshot from '../recipe/NutritionSnapshot';
import ProgressBar from '../ui/ProgressBar';

import { formatMediaUrl, PLACEHOLDER_IMAGE } from '../../utils/mediaUtils';

export const EditorPreviewCard = ({ formData }) => {
  const { unitSystem } = usePreferences();

  const nutrition = useMemo(() => {
    return calculateRecipeNutrition(formData?.ingredients);
  }, [formData?.ingredients]);

  const gi = nutrition.glycemicIndex;
  const gl = nutrition.glycemicLoad ?? 0;
  const glInfo = getGlycemicLoadCategory(gl);

  // Glucose impact progress bar: GL of 25 = 100%
  const glPercent = Math.min(Math.round((gl / 25) * 100), 100);

  let rangeLabel = 'Low GL Range (Gentle)';
  let rangeColor = 'text-primary-fixed-dim';
  let barColor = 'bg-primary-fixed-dim';

  if (gl >= 20) {
    rangeLabel = 'High GL Range (Spike Risk)';
    rangeColor = 'text-error';
    barColor = 'bg-error';
  } else if (gl >= 11) {
    rangeLabel = 'Medium GL Range (Moderate)';
    rangeColor = 'text-tertiary';
    barColor = 'bg-tertiary';
  }

  /** Get the icon for a prep state value */
  const getPrepIcon = (prepState) => {
    const found = PREP_STATES.find(p => p.value === prepState);
    return found ? found.icon : 'eco';
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0px_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30 overflow-hidden flex flex-col">

      {/* ① Recipe image with tag overlays */}
      <div className="relative h-56 overflow-hidden bg-surface-container">
        <img
          className="w-full h-full object-cover transition-opacity duration-300"
          src={formatMediaUrl(formData.imageUrl)}
          alt={formData.title || 'Recipe Preview'}
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold">
          <span>GI: {gi !== null ? Math.round(gi) : 'N/A'}</span>
          <span>•</span>
          <span className={glInfo.colorClass}>GL: {gl}</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {formData.tags.slice(0, 2).map(tag => {
            const displayTag = tag.toUpperCase().includes('KETO') ? 'KETO' : tag.toUpperCase().includes('LOW GI') ? 'LOW GI' : tag.toUpperCase();
            return (
              <span
                key={tag}
                className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-on-surface uppercase tracking-wide border border-white/40 shadow-sm animate-fade-in animate-sans"
              >
                {displayTag}
              </span>
            );
          })}
        </div>
      </div>

      {/* ② Title + meta */}
      <div className="px-5 pt-4 space-y-1">
        <h3 className="font-display text-lg font-bold text-primary leading-snug">
          {formData.title || 'Untitled Recipe'}
        </h3>
        <div className="flex items-center gap-4 text-on-surface-variant text-xs font-sans">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="font-semibold">{formData.cookingTime || 0} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">restaurant</span>
            <span className="font-semibold">{formData.servings || 1} serving{formData.servings !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ③ Description */}
      <div className="px-5 pt-3">
        <blockquote className="border-l-2 border-primary/40 pl-3 italic text-xs text-on-surface-variant leading-relaxed">
          "{formData.description || 'Describe the flavors and health benefits...'}"
        </blockquote>
      </div>

      {/* ④ Nutritional Snapshot — matches RecipeDetails exactly */}
      <div className="px-3 pt-4">
        <NutritionSnapshot nutrition={nutrition} />
      </div>

      {/* ⑤ Glucose Impact progress bar */}
      <div className="px-5 pt-4 space-y-1.5">
        <div className="flex justify-between items-end text-xs font-sans">
          <span className="font-bold text-on-surface flex items-center gap-1">
            Glucose Impact <small className="text-[10px] text-on-surface-variant font-normal">(Glycemic Load)</small>
          </span>
          <span className="font-bold text-on-surface-variant">
            GL {gl} • {nutrition.netCarbs ?? 0}g Net Carbs
          </span>
        </div>
        <ProgressBar progress={glPercent} barColor={barColor} />
        <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
          This draft stays within the{' '}
          <span className={`font-bold ${rangeColor}`}>{rangeLabel}</span>{' '}
          for postprandial glucose stability.
        </p>
      </div>

      {/* ⑥ Ingredients preview with prep state chips */}
      <div className="px-5 pt-4 pb-2 border-t border-outline-variant/20 mt-4 font-sans">
        <h4 className="text-xs font-bold text-on-surface mb-2">Ingredients</h4>
        <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {formData.ingredients.length === 0 ? (
            <li className="text-xs text-on-surface-variant/60 italic">No ingredients added yet</li>
          ) : (
            formData.ingredients.map((item, idx) => {
              const ing = getIngredientById(item.ingredientId);
              const { amount: finalAmount, unit: finalUnit } = convertAmountAndUnit(item.amount, item.unit, unitSystem);
              const roundedAmount = Math.round(finalAmount * 10) / 10;
              const prepLabel = getPrepStateLabel(item.prepState);
              const prepIcon = getPrepIcon(item.prepState);
              return (
                <li key={idx} className="flex items-center justify-between gap-2 bg-surface-container-low/40 rounded-lg px-3 py-2 border border-outline-variant/20">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="material-symbols-outlined text-primary text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {ing?.category === 'protein' ? 'set_meal' : ing?.category === 'cheese' ? 'breakfast_dining' : ing?.category === 'dairy' ? 'water_drop' : 'restaurant'}
                    </span>
                    <span className="text-xs text-on-surface">
                      <span className="font-bold text-primary">{roundedAmount}</span>{' '}
                      {finalUnit} {ing?.name || 'Unknown Item'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-on-surface-variant/80 bg-surface-container-high/60 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[12px]">{prepIcon}</span>
                    {prepLabel}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* ⑦ Disabled Cook Mode button */}
      <div className="px-5 pb-5 pt-3">
        <button
          className="w-full h-11 bg-surface-container-highest text-on-surface-variant rounded-lg font-label-md text-xs font-semibold opacity-50 cursor-not-allowed border border-outline-variant/30 font-sans"
          disabled
        >
          Cook Mode Preview
        </button>
      </div>
    </div>
  );
};

export default EditorPreviewCard;
