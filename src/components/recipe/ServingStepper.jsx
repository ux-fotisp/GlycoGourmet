import React from 'react';

/**
 * ServingStepper - Discrete portion scaling touch pills.
 *
 * Touch targets: strictly >= 48x48px per button pill.
 * Active state: bg-[#1B3B22] text-[#FFFFFF] border-[#1B3B22] shadow-sm
 * Inactive state: bg-[#F0EFE9] text-[#1A2118] hover:bg-[#E4E2DC]
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
                ? 'bg-[#1B3B22] text-[#FFFFFF] border-[#1B3B22] shadow-sm scale-105'
                : 'bg-[#F0EFE9] text-[#1A2118] hover:bg-[#E4E2DC] border-transparent'
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
