import React from 'react';

/**
 * MetabolicCalculationBox - Embedded mathematical callout showing clinical GL formula breakdown.
 */
export const MetabolicCalculationBox = ({
  compositeGI = 22,
  netCarbsTotal = 18,
  resultGL = 4,
}) => {
  return (
    <div className="bg-primary text-white rounded-2xl p-5 border border-primary-variant shadow-sm space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-sage-bg flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">calculate</span>
          Metabolic Calculation Callout
        </h4>
        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/80">
          Deterministic Engine
        </span>
      </div>

      {/* 3-Column Calculation Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center sm:text-left">
        {/* Column 1: Composite GI */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider block">
            Composite GI
          </span>
          <span className="text-xl font-display font-extrabold text-white">
            {compositeGI}
          </span>
        </div>

        {/* Column 2: NCTotal / Serving */}
        <div className="space-y-0.5 border-y sm:border-y-0 sm:border-x border-white/10 py-2 sm:py-0 sm:px-3">
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider block">
            NCTotal / Serving
          </span>
          <span className="text-xl font-display font-extrabold text-white">
            {netCarbsTotal}g
          </span>
        </div>

        {/* Column 3: Result & Formula */}
        <div className="space-y-0.5">
          <div className="text-[11px] font-mono text-sage-bg/90 leading-tight">
            round(({compositeGI} &times; {netCarbsTotal}) / 100)
          </div>
          <div className="text-lg font-extrabold text-sage-bg">
            Result: GL = {resultGL}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetabolicCalculationBox;

