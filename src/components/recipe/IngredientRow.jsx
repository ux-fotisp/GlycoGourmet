import React from 'react';
import { usePreferences } from '../../context/UserPreferences';
import { convertAmountAndUnit } from '../../utils/unitConverter';
import { getPrepStateLabel, PREP_STATES } from '../../utils/nutritionCalculator';

/**
 * Renders an ingredient row item in recipe details.
 * Integrates unit system conversions and serving scale multipliers automatically.
 */
export const IngredientRow = ({
  item,
  servingMultiplier = 1,
  isSwapped = false,
  onClick
}) => {
  const { unitSystem } = usePreferences();

  const hasSub = item?.substitutions && item.substitutions.length > 0;
  
  // Scale amount based on servings multiplier
  const scaledAmount = (parseFloat(item?.amount) || 0) * servingMultiplier;

  // Convert unit system (e.g. Imperial to Metric)
  const { amount: finalAmount, unit: finalUnit } = convertAmountAndUnit(scaledAmount, item?.unit, unitSystem);
  const roundedAmount = Math.round(finalAmount * 10) / 10;

  return (
    <div
      onClick={hasSub ? onClick : undefined}
      className={`bg-white p-4 rounded-lg border transition-all select-none flex items-center justify-between ${
        hasSub 
          ? 'border-outline-variant hover:border-primary cursor-pointer hover:shadow-recipe' 
          : 'border-outline-variant/60 opacity-90'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="material-symbols-outlined text-primary text-xl shrink-0">
          {item?.category === 'protein' ? 'set_meal' : item?.category === 'cheese' ? 'breakfast_dining' : item?.category === 'dairy' ? 'water_drop' : 'restaurant'}
        </span>
        <span className="text-sm font-medium text-on-surface">
          <span className="font-bold text-primary">
            {roundedAmount}
          </span>{' '}
          {finalUnit} {item?.name || 'Unknown'}
        </span>
        {item?.prepState && (() => {
          const ps = PREP_STATES.find(p => p.value === item.prepState);
          return (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-on-surface-variant/80 bg-surface-container-high/60 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-outline-variant/20">
              <span className="material-symbols-outlined text-[12px]">{ps?.icon || 'eco'}</span>
              {getPrepStateLabel(item.prepState)}
            </span>
          );
        })()}
      </div>
      
      {hasSub && (
        <div className="flex items-center gap-1.5 shrink-0">
          {isSwapped && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
              Swapped
            </span>
          )}
          <span className="material-symbols-outlined text-on-surface-variant text-md hover:text-primary transition-colors">
            swap_horiz
          </span>
        </div>
      )}
    </div>
  );
};

export default IngredientRow;
