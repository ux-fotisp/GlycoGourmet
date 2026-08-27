import React from 'react';
import IngredientRow from './IngredientRow';
import MetabolicCalculationPanel from './MetabolicCalculationPanel';
import ServingStepper from './ServingStepper';

export const IngredientsPanel = ({ ingredients, servingMultiplier, onServingChange, nutrition }) => {
  const breakdown = nutrition?.ingredientBreakdown || [];

  return (
    <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-[18px]">restaurant</span>
          Ingredients
        </h3>
        
        {/* Custom inline serving stepper matching mockup */}
        <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 rounded-full px-2 py-1">
          <button 
            onClick={() => onServingChange(Math.max(0.5, servingMultiplier - 0.5))}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-xs text-on-surface font-bold hover:bg-surface-container transition-colors"
          >-</button>
          <span className="text-xs font-bold text-on-surface min-w-[70px] text-center">{servingMultiplier} Servings</span>
          <button 
            onClick={() => onServingChange(servingMultiplier + 0.5)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-xs text-on-surface font-bold hover:bg-surface-container transition-colors"
          >+</button>
        </div>
      </div>

      <div className="flex flex-col">
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
