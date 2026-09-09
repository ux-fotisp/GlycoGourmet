import React from 'react';

const NET_CARBS_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '<10g', label: '<10g' },
  { value: '10-20g', label: '10-20g' },
  { value: '20-30g', label: '20-30g' },
  { value: '30g+', label: '30g+' },
];

/**
 * NetCarbsFilter — Radio group filter for net carbohydrate ranges per serving.
 * Matching MagicPath Phase 4 design system specification.
 *
 * @param {Object} props
 * @param {string} [props.activeRange='any'] - Currently active net carbs range
 * @param {Function} [props.onRangeChange] - Callback when an option is clicked
 * @param {string} [props.className=''] - Additional container classes
 */
export function NetCarbsFilter({
  activeRange = 'any',
  onRangeChange,
  className = '',
}) {
  const isOptionActive = (optValue) => {
    if (optValue === 'any') {
      return activeRange === 'any' || !activeRange;
    }
    return activeRange === optValue || activeRange === optValue.replace('g', '');
  };

  return (
    <div
      role="radiogroup"
      aria-label="Net carbs filter"
      data-testid="net-carbs-filter"
      className={`flex items-center gap-1.5 flex-wrap ${className}`}
    >
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1">
        <span className="material-symbols-outlined text-[15px]">grain</span>
        Net Carbs:
      </span>
      {NET_CARBS_OPTIONS.map(({ value, label }) => {
        const isActive = isOptionActive(value);
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-testid={`net-carbs-option-${value}`}
            onClick={() => onRangeChange?.(value)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 border ${
              isActive
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default NetCarbsFilter;
