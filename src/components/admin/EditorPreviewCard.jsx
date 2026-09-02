import React from 'react';
import {
  getIngredientById,
  getPrepStateLabel,
  PREP_STATES,
} from '../../utils/nutritionCalculator';
import { usePreferences } from '../../context/UserPreferences';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import { formatMediaUrl } from '../../utils/mediaUtils';
import RecipeNutritionSummary from '../recipe-builder/RecipeNutritionSummary';

export const EditorPreviewCard = ({ formData }) => {
  const { unitSystem, dailyGlTarget = 45 } = usePreferences();

  const ingredientsList = Array.isArray(formData?.ingredients) ? formData.ingredients : [];
  const hasTitle = Boolean(formData?.title && formData.title.trim().length > 0);
  const hasImage = Boolean(formData?.imageUrl && formData.imageUrl.trim().length > 0);
  const hasIngredients = ingredientsList.length > 0;
  const tags = Array.isArray(formData?.tags) ? formData.tags : [];

  /** Get the icon for a prep state value */
  const getPrepIcon = (prepState) => {
    const found = PREP_STATES.find((p) => p.value === prepState);
    return found ? found.icon : 'eco';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0px_4px_25px_rgba(45,49,48,0.07)] border border-outline-variant/30 overflow-hidden flex flex-col transition-all space-y-4">
      {/* 1. Recipe image wireframe skeleton vs uploaded image */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-surface-container-high/40">
        {hasImage ? (
          <img
            className="w-full h-full object-cover transition-opacity duration-300"
            src={formatMediaUrl(formData.imageUrl)}
            alt={formData.title || 'Recipe Preview'}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
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

        {tags.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            {tags.slice(0, 2).map((tag) => {
              const displayTag = tag.toUpperCase().includes('KETO')
                ? 'KETO'
                : tag.toUpperCase().includes('LOW GI')
                ? 'LOW GI'
                : tag.toUpperCase();
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

      {/* 2. Title & Meta Header */}
      <div className="px-5 space-y-1.5">
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

      {/* 3. Description */}
      {formData?.description?.trim() && (
        <div className="px-5">
          <blockquote className="border-l-2 border-primary/40 pl-3 italic text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/30 py-1 rounded-r-md">
            "{formData.description}"
          </blockquote>
        </div>
      )}

      {/* 4. Real-Time Truthful Recipe Nutrition & Metabolic Summary */}
      <div className="px-5">
        <RecipeNutritionSummary
          lines={ingredientsList}
          servings={formData?.servings || 1}
          dailyGlTarget={dailyGlTarget}
        />
      </div>

      {/* 5. Ingredient Assembly Preview List */}
      <div className="px-5 pt-3 pb-2 border-t border-outline-variant/20 font-sans">
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
              const displayName = item.displayName || item.name || ing?.name || 'Unassigned Ingredient';
              const rawAmount = item.quantity ?? item.amount ?? 100;
              const rawUnit = item.unit || 'g';
              const { amount: finalAmount, unit: finalUnit } = convertAmountAndUnit(rawAmount, rawUnit, unitSystem);
              const roundedAmount = Math.round(finalAmount * 10) / 10;
              const prepLabel = getPrepStateLabel(item.prepState);
              const prepIcon = getPrepIcon(item.prepState);

              return (
                <li
                  key={item.id || idx}
                  className="flex items-center justify-between gap-2 bg-surface-container-low/40 rounded-lg px-3 py-2 border border-outline-variant/20"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="material-symbols-outlined text-primary text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {ing?.category === 'protein'
                        ? 'set_meal'
                        : ing?.category === 'cheese'
                        ? 'breakfast_dining'
                        : ing?.category === 'dairy'
                        ? 'water_drop'
                        : 'restaurant'}
                    </span>
                    <span className="text-xs text-on-surface">
                      <span className="font-bold text-primary">{roundedAmount}</span> {finalUnit}{' '}
                      {displayName}
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

      {/* 6. Disabled Cook Mode button */}
      <div className="px-5 pb-5 pt-1">
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
