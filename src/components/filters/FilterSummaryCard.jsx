import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

/**
 * FilterSummaryCard — Compact filter summary bar matching MagicPath design system.
 * Displays filter status icon, label, active filter count badge, Clear All action,
 * and an Advanced toggle with a rotating chevron.
 *
 * @param {Object} props
 * @param {number} [props.activeCount=0] - Number of currently active filters
 * @param {Function} [props.onClearAll] - Callback when Clear All is clicked
 * @param {Function} [props.onToggleAdvanced] - Callback when Advanced button is clicked
 * @param {boolean} [props.isAdvancedOpen=false] - Whether advanced filter section is expanded
 * @param {string} [props.className=''] - Additional container classes
 */
export function FilterSummaryCard({
  activeCount = 0,
  onClearAll,
  onToggleAdvanced,
  isAdvancedOpen = false,
  className = '',
}) {
  return (
    <div
      data-testid="filter-summary-card"
      role="region"
      aria-label="Filter summary"
      className={`bg-card border border-border-subtle rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 font-sans ${className}`}
    >
      {/* Left: Icon, label, active count badge */}
      <div className="flex items-center gap-2.5">
        <SlidersHorizontal
          className="w-4 h-4 text-brand-strong"
          aria-hidden="true"
          data-testid="filter-sliders-icon"
        />
        <span className="text-sm font-semibold text-text-strong">Filters</span>
        {activeCount > 0 && (
          <span
            data-testid="filter-active-badge"
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sage-bg text-sage-text border border-sage-text/20"
          >
            {activeCount} active
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            data-testid="clear-all-btn"
            aria-label="Clear all active filters"
            className="text-xs font-semibold text-text-body hover:text-error transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Clear All
          </button>
        )}

        <button
          type="button"
          onClick={onToggleAdvanced}
          aria-expanded={isAdvancedOpen}
          data-testid="toggle-advanced-btn"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-body hover:text-text-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <span>Advanced</span>
          <ChevronDown
            data-testid="advanced-chevron"
            aria-hidden="true"
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isAdvancedOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default FilterSummaryCard;
