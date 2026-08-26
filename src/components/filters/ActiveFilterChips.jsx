import React from 'react';

export const ActiveFilterChips = ({
  filters = [],
  onResetAll,
  resultLabel = '',
}) => {
  if (filters.length === 0) return null;

  return (
    <div
      aria-label="Active filters"
      className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20"
    >
      <span className="text-[11px] font-extrabold text-on-surface-variant/80 uppercase tracking-wider">
        Active:
      </span>

      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-fade-in"
        >
          {filter.icon && (
            <span className="material-symbols-outlined text-[13px]">{filter.icon}</span>
          )}
          <span>{filter.label}</span>
          <button
            type="button"
            onClick={filter.onRemove}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors cursor-pointer ml-0.5"
            aria-label={`Remove filter ${filter.label}`}
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="text-xs font-bold text-error/90 hover:text-error hover:underline transition-all cursor-pointer ml-auto flex items-center gap-0.5"
        aria-label="Reset all filters"
      >
        <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
        Reset all
      </button>

      {resultLabel && (
        <div className="w-full text-right">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {resultLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActiveFilterChips;
