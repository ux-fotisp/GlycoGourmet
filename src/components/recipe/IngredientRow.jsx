import React from 'react';
import { getPrepStateMultiplier } from '../../utils/nutritionCalculator';

export const IngredientRow = ({ item, servingMultiplier = 1, breakdownData }) => {
  const scaledAmount = (parseFloat(item?.amount) || 0) * servingMultiplier;
  const roundedAmount = Math.round(scaledAmount);
  
  const prepMultiplier = getPrepStateMultiplier(item.prepState || 'raw').toFixed(2);
  const prepLabel = (item.prepState || 'raw').charAt(0).toUpperCase() + (item.prepState || 'raw').slice(1);

  const netCarbs = breakdownData?.netCarbs ?? 0;
  const glContrib = breakdownData?.glContribution ?? 0;
  const isHighGL = glContrib >= 5;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle/40 last:border-0 font-sans">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
          isHighGL ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-success-surface text-brand-strong border border-success-border'
        }`}>
          {Math.round(glContrib * 10) / 10}
        </div>
        <div>
          <div className="text-sm font-bold text-text-strong">{item?.name || 'Unknown'}</div>
          <div className="text-[10px] font-semibold text-text-body mt-0.5">
            {prepLabel} (x{prepMultiplier})
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-text-strong">{roundedAmount} {item?.unit || 'g'}</div>
        <div className="text-[10px] font-semibold text-text-body mt-0.5">{Math.round(netCarbs)}g NC</div>
      </div>
    </div>
  );
};
export default IngredientRow;
