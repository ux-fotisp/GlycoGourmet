import React from 'react';

/**
 * IngredientRow - Single ingredient matrix line item with GI indicator badge and thermal multiplier.
 */
export const IngredientRow = ({
  index = 1,
  gi = 15,
  name = 'Broccoli Florets',
  prepState = 'Steamed',
  prepMultiplier = '1.02',
  amount = '150',
  unit = 'g',
  netCarbs = '6',
}) => {
  // Preattentive GL band colors based on GI value
  const getGIBadgeStyle = (giVal) => {
    if (giVal <= 25) return 'bg-sage-bg text-sage-text border-sage-text/30';
    if (giVal <= 55) return 'bg-amber-bg text-amber-text border-amber-text/30';
    return 'bg-rose-bg text-rose-text border-rose-text/30';
  };

  const badgeStyle = getGIBadgeStyle(Number(gi) || 15);

  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 hover:bg-stone-50/60 px-2 rounded-xl transition-colors">
      {/* Left: Circular GI / Index Badge */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div 
          title={`Glycemic Index: ${gi}`}
          className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-xs shrink-0 border shadow-2xs ${badgeStyle}`}
        >
          {gi}
        </div>

        {/* Middle: Ingredient Name & Prep State Multiplier */}
        <div className="min-w-0">
          <div className="text-sm font-bold text-primary truncate">
            {name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-extrabold text-amber-text bg-amber-bg/70 border border-amber-text/20 px-2 py-0.5 rounded-md leading-none">
              {prepState} &times;{prepMultiplier}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Gram Weight & Net Carbs */}
      <div className="text-right shrink-0 pl-3">
        <div className="text-sm font-extrabold text-primary">
          {amount} {unit}
        </div>
        <div className="text-[11px] font-bold text-sage-text mt-0.5">
          {netCarbs}g NC
        </div>
      </div>
    </div>
  );
};

export default IngredientRow;

