import React from 'react';

export const MetabolicCalculationPanel = ({ nutrition }) => {
  const compositeGI = nutrition?.glycemicIndex !== null ? Math.round(nutrition?.glycemicIndex) : 0;
  const netCarbs = nutrition?.netCarbs ? Math.round(nutrition?.netCarbs) : 0;
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);

  return (
    <div className="bg-surface-container-low rounded-xl p-4 mt-4 border border-outline-variant/30 space-y-3 font-sans">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        <span className="material-symbols-outlined text-[14px]">science</span>
        Metabolic Calculation
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Composite GI</span>
          <span className="text-on-surface">{compositeGI}</span>
        </div>
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>NC Total / Serving</span>
          <span className="text-on-surface">{netCarbs}g</span>
        </div>
        
        <div className="flex justify-between items-center text-on-surface-variant col-span-1">
          <span>GL Formula</span>
        </div>
        <div className="flex justify-between items-center col-span-1 text-on-surface-variant">
          <span>Result</span>
          <span className="font-bold text-on-surface">GL = {gl}</span>
        </div>
      </div>
      <div className="bg-white px-3 py-2 rounded border border-outline-variant/30 text-center text-[11px] font-mono font-medium text-on-surface">
        round(({compositeGI}  {netCarbs}) / 100)
      </div>
    </div>
  );
};
export default MetabolicCalculationPanel;
