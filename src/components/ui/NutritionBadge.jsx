import React from 'react';

export const NutritionBadge = ({ label, value, unit, highlight = false, sublabel, colorClass, title }) => {
  const valueFormatted = value !== null && value !== undefined ? `${value}${unit || ''}` : '—';
  
  return (
    <div
      title={title}
      className="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary-fixed-dim transition-colors group text-center min-h-[90px] relative"
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
        <span className="text-[10px] font-bold text-on-surface-variant/80 mt-1 bg-surface-container px-1.5 py-0.5 rounded uppercase tracking-wider">
          {sublabel}
        </span>
      )}
    </div>
  );
};

export default NutritionBadge;
