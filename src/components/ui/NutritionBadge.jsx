import React from 'react';

export const NutritionBadge = ({ label, value, unit, highlight = false, sublabel, colorClass, title }) => {
  const valueFormatted = value !== null && value !== undefined ? `${value}${unit || ''}` : '—';
  
  return (
    <div
      title={title}
      className="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary-fixed-dim transition-all group text-center min-h-[90px] relative font-sans"
    >
      <span
        className={`font-bold font-display text-lg md:text-xl leading-none mb-1 ${
          colorClass ? colorClass : highlight ? 'text-tertiary' : 'text-primary'
        }`}
      >
        {valueFormatted}
      </span>
      <span className="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors leading-tight">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] font-bold text-on-surface-variant mt-1 bg-surface-container-high px-2 py-0.5 rounded-full uppercase tracking-wider">
          {sublabel}
        </span>
      )}
    </div>
  );
};

export default NutritionBadge;
