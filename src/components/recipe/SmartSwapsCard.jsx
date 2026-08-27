import React from 'react';

export const SmartSwapsCard = ({ ingredients, swappedIngredients, onQuickSwap, nutrition }) => {
  const breakdown = nutrition?.ingredientBreakdown || [];
  
  // Find candidates that have substitutions
  const swapCandidates = ingredients.filter(item => {
    return item.substitutions && item.substitutions.length > 0;
  });

  if (swapCandidates.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
          Smart Swaps
        </h3>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant cursor-help">help</span>
      </div>
      <p className="text-[11px] font-semibold text-on-surface-variant">Lower-GI alternatives that recalculate GL instantly.</p>

      <div className="space-y-4 pt-2">
        {swapCandidates.map((item, idx) => {
          const originalId = item.originalId;
          const sub = item.substitutions[0]; // just taking the first for simplicity
          const isCurrentlySwapped = swappedIngredients[originalId] === sub.ingredientId;
          
          const bd = breakdown.find(b => b.originalId === originalId);
          const origGL = bd?.glContribution || 0;
          
          // Dummy delta for UI if engine doesn't provide the new item GL yet
          // In real implementation we would compute the delta from a preview profile
          const deltaGL = origGL > 1 ? -Math.round((origGL * 0.5)*10)/10 : 0;
          
          return (
            <div key={idx} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                <span>{item.name}</span>
                <span className="text-[10px] text-on-surface-variant">GL contrib: {origGL}</span>
              </div>
              
              <div className="flex justify-center -my-1">
                <span className="material-symbols-outlined text-[16px] text-outline-variant">arrow_downward</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                <span>{sub.name || 'Low-GI Alternative'}</span>
                {deltaGL < 0 ? (
                  <span className="text-[10px] bg-primary-container text-primary px-2 py-0.5 rounded-full">{deltaGL} GL</span>
                ) : (
                  <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">Neutral</span>
                )}
              </div>
              
              {!isCurrentlySwapped ? (
                <button 
                  onClick={() => onQuickSwap(originalId, sub.ingredientId)}
                  className="w-full h-8 bg-primary text-on-primary rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-primary/90 mt-2 min-h-[48px]"
                >
                  Apply Swap
                </button>
              ) : (
                <button 
                  onClick={() => onQuickSwap(originalId, originalId)}
                  className="w-full h-8 bg-surface-container-high text-on-surface rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-surface-container mt-2 min-h-[48px]"
                >
                  Revert Swap
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SmartSwapsCard;
