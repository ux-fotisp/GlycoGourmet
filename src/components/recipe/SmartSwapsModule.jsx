import React, { useState } from 'react';
import SmartSwapCard from './SmartSwapCard';

/**
 * SmartSwapsModule - Container module for interactive smart swap cards.
 */
export const SmartSwapsModule = ({ swaps = [], onApplySwap }) => {
  const [appliedMap, setAppliedMap] = useState({});

  const defaultSwaps = [
    {
      id: 'swap-1',
      sourceName: 'Edamame (shelled)',
      sourceGL: '1.2',
      targetName: 'Lupini Beans',
      deltaGL: '-0.6 GL',
    },
    {
      id: 'swap-2',
      sourceName: 'White Rice (Cooked)',
      sourceGL: '14.0',
      targetName: 'Cauliflower Rice',
      deltaGL: '-12.5 GL',
    },
  ];

  const activeSwaps = swaps && swaps.length > 0 ? swaps : defaultSwaps;

  const handleToggle = (id) => {
    setAppliedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (onApplySwap) {
      onApplySwap(id);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5 font-sans text-[#1A2118]">
      {/* Header */}
      <div className="border-b border-stone-100 pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wider text-primary uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-sage-text">swap_horiz</span>
            Smart Swaps
          </h3>
          <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200/50">
            {activeSwaps.length} Available
          </span>
        </div>
        <p className="text-[11px] font-medium text-stone-500 leading-snug">
          Lower-GI alternatives that recalculate GL instantly.
        </p>
      </div>

      {/* Swap Cards Grid */}
      <div className="space-y-3.5">
        {activeSwaps.map((item) => (
          <SmartSwapCard
            key={item.id || item.sourceName}
            sourceName={item.sourceName || item.name}
            sourceGL={item.sourceGL || item.glContribution || '1.0'}
            targetName={item.targetName || item.substitutionName || 'Low-GI Alternative'}
            deltaGL={item.deltaGL || '-0.5 GL'}
            isApplied={Boolean(appliedMap[item.id || item.sourceName])}
            onApply={() => handleToggle(item.id || item.sourceName)}
          />
        ))}
      </div>
    </section>
  );
};

export default SmartSwapsModule;
