import React from 'react';

export const SmartSwapsCard = ({ ingredients = [], swappedIngredients = {}, onQuickSwap, nutrition }) => {
  const breakdown = nutrition?.ingredientBreakdown || [];
  
  const swapCandidates = ingredients.filter(item => {
    return item.substitutions && item.substitutions.length > 0;
  });

  if (swapCandidates.length === 0) return null;

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-bold text-text-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-[20px]">swap_horiz</span>
          Smart Swaps
        </h3>
        <span className="material-symbols-outlined text-[16px] text-text-body cursor-help">help</span>
      </div>
      <p className="text-[11px] font-semibold text-text-body">Lower-GI alternatives that recalculate GL instantly.</p>

      <div className="space-y-3 pt-1">
        {swapCandidates.map((item, idx) => {
          const originalId = item.originalId;
          const sub = item.substitutions[0];
          const isCurrentlySwapped = swappedIngredients[originalId] === sub.ingredientId;
          
          const bd = breakdown.find(b => b.originalId === originalId);
          const origGL = bd?.glContribution || 0;
          const deltaGL = origGL > 1 ? -Math.round((origGL * 0.5) * 10) / 10 : 0;
          
          return (
            <div key={idx} className="bg-canvas border border-border-subtle rounded-control p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-text-strong">
                <span>{item.name}</span>
                <span className="text-[10px] text-text-body">GL contrib: {origGL}</span>
              </div>
              
              <div className="flex justify-center -my-1">
                <span className="material-symbols-outlined text-[16px] text-brand-strong">arrow_downward</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold text-text-strong">
                <span>{sub.name || 'Low-GI Alternative'}</span>
                {deltaGL < 0 ? (
                  <span className="text-[10px] bg-brand-container text-brand-container-on px-2 py-0.5 rounded-full font-bold">{deltaGL} GL</span>
                ) : (
                  <span className="text-[10px] bg-surface-container-high text-text-body px-2 py-0.5 rounded-full">Neutral</span>
                )}
              </div>
              
              {!isCurrentlySwapped ? (
                <button 
                  type="button"
                  onClick={() => onQuickSwap(originalId, sub.ingredientId)}
                  className="w-full bg-brand-strong text-text-inverse rounded-control text-xs font-bold cursor-pointer transition-colors hover:bg-brand-hover min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none mt-2"
                >
                  Apply Swap
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => onQuickSwap(originalId, originalId)}
                  className="w-full bg-card border border-border-interactive text-brand-strong rounded-control text-xs font-bold cursor-pointer transition-colors hover:bg-surface-container-low min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none mt-2"
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
