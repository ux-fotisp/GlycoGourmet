import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * SmartSwapCard - Side-by-side interactive comparison for a single low-GI substitution with Framer Motion.
 */
export const SmartSwapCard = ({
  id,
  sourceName = 'Edamame (shelled)',
  sourceGL = '1.2',
  targetName = 'Lupini Beans',
  deltaGL = '-0.6 GL',
  isApplied = false,
  onApply,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' } },
    exit: shouldReduceMotion 
      ? { opacity: 0 } 
      : { opacity: 0, scale: 0.92, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <motion.div
      layout={!shouldReduceMotion}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-[#F6F4EE] border border-stone-200 rounded-2xl p-4 space-y-3.5 shadow-2xs hover:border-primary/40 transition-colors"
    >
      {/* Top Half: Source Ingredient */}
      <div className="flex justify-between items-center text-xs font-bold text-primary">
        <span className="truncate pr-2">{sourceName}</span>
        <span className="text-[10px] text-stone-500 font-semibold bg-white border border-stone-200 px-2 py-0.5 rounded-md shrink-0">
          GL contrib: {sourceGL}
        </span>
      </div>

      {/* Downward Transition Arrow */}
      <div className="flex justify-center -my-2">
        <motion.div 
          animate={isApplied && !shouldReduceMotion ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-2xs"
        >
          <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward</span>
        </motion.div>
      </div>

      {/* Bottom Half: Target Substitute & Delta Pill */}
      <div className="flex justify-between items-center text-xs font-bold text-primary">
        <span className="truncate pr-2">{targetName}</span>
        <span className="text-[10px] bg-sage-bg text-sage-text border border-sage-text/20 font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
          {deltaGL}
        </span>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onApply}
        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[40px] ${
          isApplied
            ? 'bg-white border border-primary text-primary hover:bg-stone-50'
            : 'bg-primary text-white hover:bg-primary-variant active:scale-[0.99]'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isApplied ? 'check_circle' : 'swap_horiz'}
        </span>
        {isApplied ? 'Swap Applied (Revert)' : '[ Apply Swap ]'}
      </button>
    </motion.div>
  );
};

export default SmartSwapCard;
