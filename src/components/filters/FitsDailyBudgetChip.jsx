import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * FitsDailyBudgetChip — Standalone metabolic toggle chip for recipes fitting the daily GL/carb budget.
 * Uses .btn-gradient-primary when active, flat/outlined when inactive, with a CheckCircle icon.
 *
 * @param {Object} props
 * @param {boolean} [props.isActive=false] - Whether the filter is active
 * @param {Function} [props.onClick] - Callback when clicked
 * @param {string} [props.label='Fits Daily Budget'] - Chip label text
 * @param {string} [props.className=''] - Additional styling classes
 */
export function FitsDailyBudgetChip({
  isActive = false,
  onClick,
  label = 'Fits Daily Budget',
  className = '',
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      data-testid="fits-daily-budget-chip"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer select-none active:scale-95 border ${
        isActive
          ? 'btn-gradient-primary border-primary shadow-sm'
          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
      } ${className}`}
    >
      {isActive && (
        <CheckCircle
          data-testid="fits-budget-check-icon"
          className="w-3.5 h-3.5 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </button>
  );
}

export default FitsDailyBudgetChip;
