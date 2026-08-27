import React from 'react';
import { getIngredientById, getPrepStateLabel, PREP_STATES } from '../../utils/nutritionCalculator';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import { usePreferences } from '../../context/UserPreferences';

// Low-GI Smart Swap Presets (US-2.2 pairing registry)
const LOW_GI_SWAP_PRESETS = [
  { match: ['white rice', 'rice', 'basmati rice', 'jasmine rice'], targetId: 'cauliflower-rice', substitute: 'Cauliflower Rice', gi: 15, glSavings: 12 },
  { match: ['wheat pasta', 'pasta', 'spaghetti', 'penne', 'macaroni'], targetId: 'shirataki-noodles', substitute: 'Shirataki Noodles', gi: 15, glSavings: 14 },
  { match: ['white bread', 'bread', 'baguette', 'toast'], targetId: 'almond-flour-bread', substitute: 'Almond Flour Bread', gi: 25, glSavings: 11 },
  { match: ['sugar', 'white sugar', 'cane sugar', 'table sugar'], targetId: 'stevia', substitute: 'Stevia / Monk Fruit', gi: 0, glSavings: 15 },
  { match: ['potato', 'potatoes', 'mashed potatoes'], targetId: 'mashed-cauliflower', substitute: 'Mashed Cauliflower', gi: 20, glSavings: 10 },
];

const CATEGORY_ICONS = {
  produce: 'eco',
  dairy: 'egg',
  protein: 'set_meal',
  pantry: 'kitchen',
  bakery: 'bakery_dining',
  beverages: 'local_cafe',
  spices: 'flare',
};

export const IngredientList = ({
  ingredients = [],
  servingMultiplier = 1,
  swappedIngredients = {},
  onOpenSubstitution,
  onQuickSwap,
  onResetSwaps,
}) => {
  const { unitSystem = 'imperial' } = usePreferences();
  const hasSwaps = Object.keys(swappedIngredients).length > 0;

  // Programmatically evaluate ingredient carb impact contributions
  const ingredientCarbImpacts = ingredients.map(item => {
    const ing = getIngredientById(item.ingredientId);
    const defaultAmt = (ing?.defaultAmount && ing.defaultAmount > 0) ? ing.defaultAmount : 100;
    const amt = (parseFloat(item?.amount) || 0) * servingMultiplier;
    const ratio = amt / defaultAmt;
    const netCarbs = (ing?.nutrition?.netCarbs ?? ing?.netCarbs ?? 0) * ratio;
    return netCarbs > 0 ? netCarbs : 0;
  });

  const totalRecipeNetCarbs = ingredientCarbImpacts.reduce((acc, val) => acc + val, 0);

  // Identify index of the single ingredient responsible for > 50% of recipe carb impact
  let primaryCarbIndex = -1;
  if (totalRecipeNetCarbs > 0) {
    ingredientCarbImpacts.forEach((impact, idx) => {
      if (impact / totalRecipeNetCarbs > 0.50) {
        primaryCarbIndex = idx;
      }
    });
  }

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border-subtle/50 pb-3">
        <h3 className="text-sm md:text-base font-bold text-text-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-xl">grocery</span>
          Ingredients & Smart Swaps
        </h3>
        {hasSwaps && (
          <button
            type="button"
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

          // Check for Low-GI Swap Preset Match
          const lowerName = (item?.name || '').toLowerCase();
          const presetSwap = LOW_GI_SWAP_PRESETS.find(p => p.match.some(m => lowerName.includes(m)));

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

          const isPrimaryCarbSource = idx === primaryCarbIndex;

          return (
            <div
              key={idx}
              onClick={hasSub ? () => onOpenSubstitution(item) : undefined}
              className={`bg-canvas p-3.5 rounded-control border transition-all select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                hasSub
                  ? 'border-border-subtle hover:border-brand-strong cursor-pointer hover:shadow-sm'
                  : 'border-border-subtle/50'
              }`}
            >
              {/* Left: icon + quantity + name + prep badge + Primary Carb Source badge */}
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <span className="material-symbols-outlined text-brand-strong text-xl shrink-0">
                  {icon}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-text-strong block truncate">
                      <span className="font-bold text-brand-strong">{roundedAmount}</span>{' '}
                      {finalUnit} {item?.name || 'Unknown'}
                    </span>

                    {/* Highest-Impact Ingredient Signifier */}
                    {isPrimaryCarbSource && (
                      <span className="bg-tertiary-container text-on-tertiary-container text-xs px-2 py-0.5 rounded font-bold shrink-0 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Primary Carb Source
                      </span>
                    )}
                  </div>

                  {/* Macro tag row */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {ingCarbs !== null && (
                      <span className="text-[10px] font-medium text-text-body">
                        {Math.round(ingCarbs * (scaledAmount / ((ing?.defaultAmount || 1))))}g carbs
                      </span>
                    )}
                    {ingGI !== null && (
                      <span className="text-[10px] font-medium text-text-body">
                        • GI {ingGI}
                      </span>
                    )}
                    {item?.prepState && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-text-body bg-surface-container px-2 py-0.5 rounded-full uppercase tracking-wider border border-border-subtle/40">
                        <span className="material-symbols-outlined text-[11px]">{ps?.icon || 'eco'}</span>
                        {getPrepStateLabel(item.prepState)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Smart Low-GI Swap Action & Manual Swap Trigger */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {presetSwap && !isSwapped && (
                  <button
                    type="button"
                    data-testid="swap-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onQuickSwap) {
                        onQuickSwap(item.originalId || item.ingredientId, presetSwap.targetId);
                      } else if (onOpenSubstitution) {
                        onOpenSubstitution(item);
                      }
                    }}
                    className="bg-success-surface hover:bg-brand-container text-brand-strong border border-success-border text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer shadow-xs hover:scale-105 flex items-center gap-1 shrink-0"
                    title={`Swap with ${presetSwap.substitute} to save ~${presetSwap.glSavings} GL`}
                  >
                    <span className="material-symbols-outlined text-[15px]">published_with_changes</span>
                    Swap with {presetSwap.substitute} (GL -{presetSwap.glSavings})
                  </button>
                )}

                {hasSub && (
                  <div className="flex items-center gap-1.5">
                    {isSwapped && (
                      <span className="text-[10px] font-bold text-brand-strong bg-success-surface border border-success-border px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Swapped
                      </span>
                    )}
                    <span className="material-symbols-outlined text-text-body text-lg hover:text-brand-strong transition-colors" title="Swap ingredient">
                      swap_horiz
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientList;
