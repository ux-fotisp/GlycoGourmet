import React from 'react';
import { usePreferences } from '../../context/UserPreferences';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import { getPrepStateLabel, PREP_STATES, getIngredientById } from '../../utils/nutritionCalculator';

/**
 * IngredientList — Responsive ingredient table with category icons,
 * scaled quantities, macro tags, and smart substitution triggers.
 */

const CATEGORY_ICONS = {
  protein: 'set_meal',
  grain: 'grain',
  vegetable: 'eco',
  fruit: 'nutrition',
  dairy: 'water_drop',
  cheese: 'breakfast_dining',
  fat: 'water_drop',
  spice: 'local_fire_department',
  legume: 'grass',
};

export const IngredientList = ({
  ingredients = [],
  servingMultiplier = 1,
  swappedIngredients = {},
  onOpenSubstitution,
  onResetSwaps,
}) => {
  const { unitSystem } = usePreferences();
  const hasSwaps = Object.keys(swappedIngredients).length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-3">
        <h4 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">grocery</span>
          Ingredients
        </h4>
        {hasSwaps && (
          <button
            onClick={onResetSwaps}
            title="Reset all swaps"
            className="flex items-center gap-1.5 text-xs font-bold text-tertiary hover:bg-tertiary/10 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            Reset Swaps
          </button>
        )}
      </div>

      {/* Ingredient rows */}
      <div className="space-y-2">
        {ingredients.map((item, idx) => {
          const isSwapped = swappedIngredients[item.originalId] !== undefined;
          const hasSub = item?.substitutions?.length > 0;
          const ing = getIngredientById(item.ingredientId);

          // Scale amount
          const scaledAmount = (parseFloat(item?.amount) || 0) * servingMultiplier;
          const { amount: finalAmount, unit: finalUnit } = convertAmountAndUnit(scaledAmount, item?.unit, unitSystem);
          const roundedAmount = Math.round(finalAmount * 10) / 10;

          // Macro tag data
          const ingNutrition = ing?.nutrition;
          const ingCarbs = ingNutrition?.carbs ?? ing?.carbs ?? null;
          const ingGI = ingNutrition?.glycemicIndex ?? ing?.glycemicIndex ?? null;

          // Category icon
          const icon = CATEGORY_ICONS[item?.category] || 'restaurant';

          // Prep state
          const ps = PREP_STATES.find(p => p.value === item?.prepState);

          return (
            <div
              key={idx}
              onClick={hasSub ? () => onOpenSubstitution(item) : undefined}
              className={`bg-white p-3 md:p-4 rounded-lg border transition-all select-none flex items-center justify-between gap-3 ${
                hasSub
                  ? 'border-outline-variant hover:border-primary cursor-pointer hover:shadow-[0_4px_20px_rgba(45,49,48,0.05)]'
                  : 'border-outline-variant/50'
              }`}
            >
              {/* Left: icon + quantity + name + prep badge */}
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  {icon}
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-on-surface block truncate">
                    <span className="font-bold text-primary">{roundedAmount}</span>{' '}
                    {finalUnit} {item?.name || 'Unknown'}
                  </span>

                  {/* Macro tag row */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {ingCarbs !== null && (
                      <span className="text-[10px] font-medium text-on-surface-variant/70">
                        {Math.round(ingCarbs * (scaledAmount / ((ing?.defaultAmount || 1))))  }g carbs
                      </span>
                    )}
                    {ingGI !== null && (
                      <span className="text-[10px] font-medium text-on-surface-variant/70">
                        • GI {ingGI}
                      </span>
                    )}
                    {item?.prepState && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-on-surface-variant/80 bg-surface-container-high/60 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[11px]">{ps?.icon || 'eco'}</span>
                        {getPrepStateLabel(item.prepState)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: swap action */}
              {hasSub && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSwapped && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Swapped
                    </span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-lg hover:text-primary transition-colors" title="Swap ingredient">
                    swap_horiz
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientList;
