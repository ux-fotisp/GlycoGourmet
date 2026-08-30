import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * GlycemicSnapshot - 3-metric glycemic profile with fluid Framer Motion daily budget gauge.
 */
export const GlycemicSnapshot = ({ dailyGlTarget = 45, profile, servingMultiplier = 1 }) => {
  const shouldReduceMotion = useReducedMotion();

  const gl = Math.round(profile?.glycemicLoad ?? 4);
  const gi = profile?.glycemicIndex ?? 22;
  const netCarbs = profile?.netCarbs !== undefined ? Math.round(profile.netCarbs * 10) / 10 : 18;

  const percentageUsed = Math.min(100, Math.max(0, ((gl / dailyGlTarget) * 100))).toFixed(1);
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));

  return (
    <section className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6 font-sans text-[#1A2118]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-xs font-extrabold tracking-wider text-primary uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-sage-text">analytics</span>
          Glycemic Snapshot
        </h3>
        <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
          Per Serving
        </span>
      </div>

      {/* 3-Column Metric Display with Number Transitions */}
      <div className="grid grid-cols-3 divide-x divide-stone-200">
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="h-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={gl}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="text-4xl font-display font-extrabold text-sage-text leading-none"
              >
                {gl}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[10px] uppercase font-extrabold text-stone-500 mt-2 tracking-wider">
            GL / Serving
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="h-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={Math.round(gi)}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="text-4xl font-display font-extrabold text-primary leading-none"
              >
                {Math.round(gi)}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[10px] uppercase font-extrabold text-stone-500 mt-2 tracking-wider">
            Composite GI
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="h-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={netCarbs}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="text-4xl font-display font-extrabold text-primary leading-none"
              >
                {netCarbs}g
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[10px] uppercase font-extrabold text-stone-500 mt-2 tracking-wider">
            Net Carbs
          </span>
        </div>
      </div>

      {/* Daily Budget Gauge with Fluid Fill Animation */}
      <div className="pt-2 border-t border-stone-100 space-y-2.5">
        <div className="flex justify-between items-center text-xs font-bold text-primary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage-text" />
            Daily GL Budget Used
          </span>
          <span>{gl} of {dailyGlTarget} GL</span>
        </div>

        <div 
          className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60"
          role="progressbar" 
          aria-valuenow={gl} 
          aria-valuemin={0} 
          aria-valuemax={dailyGlTarget} 
          aria-label="Daily GL Budget Progress"
        >
          <motion.div 
            className="h-full bg-primary rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${fillWidth}%` }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              ease: [0.16, 1, 0.3, 1], // fluid easeOut cubic
            }}
          />
        </div>

        <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
          Consuming this recipe uses <strong className="text-primary font-bold">{percentageUsed}%</strong> of your daily {dailyGlTarget} GL target.
        </p>
      </div>
    </section>
  );
};

export default GlycemicSnapshot;
