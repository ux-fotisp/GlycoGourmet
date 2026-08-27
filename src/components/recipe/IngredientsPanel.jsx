import React from 'react';
import IngredientRow from './IngredientRow';
import MetabolicCalculationPanel from './MetabolicCalculationPanel';

export const IngredientsPanel = ({ ingredients = [], servingMultiplier = 1, onServingChange, nutrition }) => {
  const breakdown = nutrition?.ingredientBreakdown || [];

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm md:text-base font-bold text-text-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-[20px]">restaurant</span>
          Ingredients
        </h3>
        
        <div className="flex items-center gap-2 bg-canvas border border-border-subtle rounded-control px-2 py-1">
          <button 
            type="button"
            onClick={() => onServingChange && onServingChange(Math.max(0.5, servingMultiplier - 0.5))}
            className="w-7 h-7 flex items-center justify-center rounded-control bg-card shadow-xs text-text-strong font-bold hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Decrease servings"
          >-</button>
          <span className="text-xs font-bold text-text-strong min-w-[70px] text-center">{servingMultiplier} Servings</span>
          <button 
            type="button"
            onClick={() => onServingChange && onServingChange(servingMultiplier + 0.5)}
            className="w-7 h-7 flex items-center justify-center rounded-control bg-card shadow-xs text-text-strong font-bold hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Increase servings"
          >+</button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border-subtle/30">
        {ingredients.map((item, idx) => {
          const originalId = item.originalId || item.ingredientId;
          const bd = breakdown.find(b => b.originalId === originalId) || breakdown[idx];
          return (
            <IngredientRow 
              key={idx} 
              item={item} 
              servingMultiplier={servingMultiplier} 
              breakdownData={bd} 
            />
          );
        })}
      </div>

      <MetabolicCalculationPanel nutrition={nutrition} />
    </div>
  );
};
export default IngredientsPanel;
