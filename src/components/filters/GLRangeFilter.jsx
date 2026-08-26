import React from 'react';

const GL_BANDS = [
  { value: 'low', label: 'Low GL', sublabel: 'Gentle (≤10)', maxGL: 10, icon: 'check_circle', activeClass: 'bg-primary text-on-primary border-primary' },
  { value: 'medium', label: 'Med GL', sublabel: 'Mod (11–19)', maxGL: 19, icon: 'info', activeClass: 'bg-tertiary text-on-tertiary border-tertiary' },
  { value: 'high', label: 'High GL', sublabel: 'Spike (≥20)', maxGL: 30, icon: 'warning', activeClass: 'bg-error text-on-error border-error' },
];

export const GLRangeFilter = ({
  activeBands = [],
  onToggleBand,
  maxGL = null,
  onMaxGLChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">speed</span>
          GL Impact:
        </span>
        {GL_BANDS.map(({ value, label, sublabel, icon, activeClass }) => {
          const isActive = activeBands.includes(value);
          return (
            <button
              key={value}
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label={`${label} (${sublabel})`}
              onClick={() => onToggleBand(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 border ${
                isActive
                  ? `${activeClass} shadow-sm`
                  : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{icon}</span>
              <span>{label}</span>
              <span className="text-[9px] font-medium font-bold hidden sm:inline">({sublabel})</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        <label
          htmlFor="max-gl-slider"
          className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0"
        >
          Max GL: <span className="text-primary font-black">{maxGL !== null ? maxGL : 'Any'}</span>
        </label>
        <input
          id="max-gl-slider"
          type="range"
          min="1"
          max="30"
          value={maxGL !== null ? maxGL : 30}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onMaxGLChange(val >= 30 ? null : val);
          }}
          aria-label="Filter maximum glycemic load"
          aria-valuemin={1}
          aria-valuemax={30}
          aria-valuenow={maxGL !== null ? maxGL : 30}
          aria-valuetext={maxGL !== null ? `Max GL ${maxGL}` : 'No max GL limit'}
          className="w-24 h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
        />
        {maxGL !== null && (
          <button
            type="button"
            onClick={() => onMaxGLChange(null)}
            className="text-[10px] text-on-surface-variant hover:text-error transition-colors p-0.5"
            title="Clear Max GL limit"
            aria-label="Clear Max GL limit"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default GLRangeFilter;
