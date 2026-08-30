import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SmartSwapCard from './SmartSwapCard';

/**
 * SmartSwapsModule - Container module for interactive smart swap cards with Framer Motion layout transitions.
 */
export const SmartSwapsModule = ({ swaps = [], onApplySwap, dismissOnApply = false }) => {
  const [appliedMap, setAppliedMap] = useState({});
  const shouldReduceMotion = useReducedMotion();

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
    const nextState = !appliedMap[id];
    setAppliedMap((prev) => ({
      ...prev,
      [id]: nextState,
    }));
    if (onApplySwap) {
      onApplySwap(id, nextState);
    }
  };

  // If dismissOnApply is true, filter out applied swaps
  const visibleSwaps = dismissOnApply
    ? activeSwaps.filter((item) => !appliedMap[item.id || item.sourceName])
    : activeSwaps;

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
            {visibleSwaps.length} Available
          </span>
        </div>
        <p className="text-[11px] font-medium text-stone-500 leading-snug">
          Lower-GI alternatives that recalculate GL instantly.
        </p>
      </div>

      {/* Animated Swap Cards Grid */}
      <motion.div 
        layout={!shouldReduceMotion}
        className="space-y-3.5"
      >
        <AnimatePresence mode="popLayout">
          {visibleSwaps.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 bg-[#F6F4EE] rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs font-semibold"
            >
              All available Smart Swaps have been applied!
            </motion.div>
          ) : (
            visibleSwaps.map((item) => (
              <SmartSwapCard
                key={item.id || item.sourceName}
                id={item.id || item.sourceName}
                sourceName={item.sourceName || item.name}
                sourceGL={item.sourceGL || item.glContribution || '1.0'}
                targetName={item.targetName || item.substitutionName || 'Low-GI Alternative'}
                deltaGL={item.deltaGL || '-0.5 GL'}
                isApplied={Boolean(appliedMap[item.id || item.sourceName])}
                onApply={() => handleToggle(item.id || item.sourceName)}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default SmartSwapsModule;
