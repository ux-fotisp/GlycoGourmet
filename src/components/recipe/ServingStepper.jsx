import React from 'react';

/**
 * ServingStepper - Discrete portion scaling touch pills.
 *
 * Touch targets: strictly >= 48x48px per button pill.
 * Active state: bg-brand-strong text-text-inverse border-brand-strong shadow-sm
 * Inactive state: bg-surface-container text-text-strong hover:bg-surface-container-high
 */
export const ServingStepper = ({ currentMultiplier, onScaleChange, disabled }) => {
  const PORTION_OPTIONS = [0.5, 1, 1.5, 2];

  return (
    <div 
      role="radiogroup" 
      aria-label="Scale serving portion size"
      className="flex items-center gap-2 flex-wrap w-full sm:w-auto"
    >
      {PORTION_OPTIONS.map(mult => {
        const isActive = currentMultiplier === mult;
        return (
          <button
            key={mult}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => !disabled && onScaleChange(mult)}
            className={`min-h-[48px] min-w-[48px] px-4 rounded-full border text-sm font-bold transition-all cursor-pointer flex items-center justify-center
              ${isActive
                ? 'bg-brand-strong text-text-inverse border-brand-strong shadow-sm scale-105'
                : 'bg-surface-container text-text-strong hover:bg-surface-container-high border-transparent'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={`Scale recipe by ${mult}x`}
          >
            {mult}x
          </button>
        );
      })}
    </div>
  );
};

export default ServingStepper;
