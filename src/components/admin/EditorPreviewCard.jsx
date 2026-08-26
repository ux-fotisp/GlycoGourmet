import React, { useMemo } from 'react';
import {
  calculateRecipeNutrition,
  getIngredientById,
  getPrepStateLabel,
  PREP_STATES,
  getGlycemicLoadCategory,
} from '../../utils/nutritionCalculator';
import { usePreferences } from '../../context/UserPreferences';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import NutritionSnapshot from '../recipe/NutritionSnapshot';
import ProgressBar from '../ui/ProgressBar';
import { formatMediaUrl } from '../../utils/mediaUtils';

export const EditorPreviewCard = ({ formData }) => {
  const { unitSystem, dailyGlTarget = 45 } = usePreferences();

  const ingredientsList = Array.isArray(formData?.ingredients) ? formData.ingredients : [];

  const nutrition = useMemo(() => {
    return calculateRecipeNutrition(ingredientsList);
  }, [ingredientsList]);

  const gi = nutrition.glycemicIndex;
  const gl = Math.round(nutrition.glycemicLoad ?? 0);
  const glInfo = getGlycemicLoadCategory(gl);

  // Preattentive chromatic fill width based on Daily Target GL
  const glPercent = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));

  let rangeLabel = 'Gentle Impact';
  let rangeColor = 'text-primary';
  let barColor = 'bg-primary';

  if (gl >= 20) {
    rangeLabel = 'High Spike Risk';
    rangeColor = 'text-error';
    barColor = 'bg-error';
  } else if (gl >= 11) {
    rangeLabel = 'Moderate Impact';
    rangeColor = 'text-tertiary';
    barColor = 'bg-tertiary';
  }

  /** Get the icon for a prep state value */
  const getPrepIcon = (prepState) => {
    const found = PREP_STATES.find(p => p.value === prepState);
    return found ? found.icon : 'eco';
  };

  const hasTitle = Boolean(formData?.title && formData.title.trim().length > 0);
  const hasImage = Boolean(formData?.imageUrl && formData.imageUrl.trim().length > 0);
  const hasIngredients = ingredientsList.length > 0;
  const tags = Array.isArray(formData?.tags) ? formData.tags : [];

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0px_4px_25px_rgba(45,49,48,0.07)] border border-outline-variant/30 overflow-hidden flex flex-col transition-all">

      {/* ① Recipe image wireframe skeleton vs uploaded image */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-surface-container-high/40">
        {hasImage ? (
          <img
            className="w-full h-full object-cover transition-opacity duration-300"
            src={formatMediaUrl(formData.imageUrl)}
            alt={formData.title || 'Recipe Preview'}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Skeleton Wireframe Fallback when no image is set */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-6 text-center gap-2 bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high border-b border-outline-variant/20 ${
            hasImage ? 'hidden' : 'flex'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[32px]">restaurant</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant/80">Image Wireframe Placeholder</p>
          <p className="text-[10px] text-on-surface-variant max-w-xs leading-relaxed">
            Drop an image file or upload to Strapi Media Library to render recipe photography.
          </p>
        </div>

        {/* Overlay Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-md z-10">
          <span>GI: {gi !== null ? Math.round(gi) : 'N/A'}</span>
          <span>•</span>
          <span className={glInfo.colorClass}>GL: {gl}</span>
        </div>

        {tags.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            {tags.slice(0, 2).map(tag => {
              const displayTag = tag.toUpperCase().includes('KETO') ? 'KETO' : tag.toUpperCase().includes('LOW GI') ? 'LOW GI' : tag.toUpperCase();
              return (
                <span
                  key={tag}
                  className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-on-surface uppercase tracking-wide border border-white/40 shadow-sm"
                >
                  {displayTag}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ② Title & Meta Header */}
      <div className="px-5 pt-5 space-y-1.5">
        <h3 className="font-display text-xl font-bold leading-snug">
          {hasTitle ? (
            <span className="text-primary">{formData.title}</span>
          ) : (
            <span className="text-on-surface-variant/50 italic font-normal">Untitled Recipe</span>
          )}
        </h3>

        <div className="flex items-center gap-4 text-on-surface-variant text-xs font-sans">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
            <span className="font-semibold">
              {(parseInt(formData?.cookingTime) || 0) + (parseInt(formData?.prepTime) || 0)} min total
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">group</span>
            <span className="font-semibold">
              {formData?.servings || 1} serving{formData?.servings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ③ Description */}
      <div className="px-5 pt-3">
        <blockquote className="border-l-2 border-primary/40 pl-3 italic text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/30 py-1 rounded-r-md">
          {formData?.description?.trim() ? (
            `"${formData.description}"`
          ) : (
            <span className="text-on-surface-variant/50">"Describe the culinary experience and glycemic stabilization features..."</span>
          )}
        </blockquote>
      </div>

      {/* ④ Real-Time Nutritional Snapshot */}
      <div className="px-3 pt-4">
        <NutritionSnapshot nutrition={nutrition} />
      </div>

      {/* ⑤ Live Metabolic Recalculation (Preattentive Chromatic GL Gauge) */}
      <div className="px-5 pt-4 space-y-1.5 font-sans">
        <div className="flex justify-between items-end text-xs">
          <span className="font-bold text-on-surface flex items-center gap-1">
            Glycemic Load Gauge
          </span>
          <span className="font-bold text-on-surface-variant">
            GL {gl} • {nutrition.netCarbs ?? 0}g Net Carbs
          </span>
        </div>

        {/* Preattentive Chromatic Progress Meter */}
        <div className="h-3 rounded-full bg-surface-container-high overflow-hidden w-full relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${glPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
          This formulation sits in the{' '}
          <span className={`font-bold ${rangeColor}`}>{rangeLabel}</span>{' '}
          ({glPercent}% of Daily Target GL).
        </p>
      </div>

      {/* ⑥ Ingredient Assembly Preview List */}
      <div className="px-5 pt-4 pb-2 border-t border-outline-variant/20 mt-4 font-sans">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-on-surface">Ingredients ({ingredientsList.length})</h4>
          {hasIngredients && (
            <span className="text-[10px] text-primary font-bold">Auto-calculated</span>
          )}
        </div>

        {!hasIngredients ? (
          <div className="p-4 rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low/30 text-center space-y-1 my-1">
            <span className="material-symbols-outlined text-[24px] text-on-surface-variant/40">nutrition</span>
            <p className="text-xs text-on-surface-variant italic">
              No ingredients added yet. Preview will populate as you type.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {ingredientsList.map((item, idx) => {
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
                      {finalUnit} {ing?.name || 'Unassigned Ingredient'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-on-surface-variant/80 bg-surface-container-high/60 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[12px]">{prepIcon}</span>
                    {prepLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ⑦ Disabled Cook Mode button */}
      <div className="px-5 pb-5 pt-3">
        <button
          className="w-full h-11 bg-surface-container-highest text-on-surface-variant rounded-xl font-label-md text-xs font-semibold opacity-50 cursor-not-allowed border border-outline-variant/30 font-sans flex items-center justify-center gap-1.5"
          disabled
        >
          <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
          Cook Mode Preview (Saved Recipes Only)
        </button>
      </div>
    </div>
  );
};

export default EditorPreviewCard;
