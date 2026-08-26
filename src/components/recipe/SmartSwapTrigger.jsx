import React from 'react';
import { TrendingDown } from 'lucide-react';

export const SmartSwapTrigger = ({
  originalName = 'Jasmine White Rice',
  targetSwapName = 'Cauliflower Pearl Rice',
  glSavings = 22,
  onTriggerSwap,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onTriggerSwap === 'function') {
      onTriggerSwap();
    }

    // Trigger visual telemetry pulse on the parent recipe GL badge
    const badge = document.querySelector('[data-testid="recipe-gl-badge"]');
    if (badge) {
      badge.classList.remove('voice-pulse');
      void badge.offsetWidth; // Trigger reflow
      badge.classList.add('voice-pulse');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid="btn-smart-swap-white-rice"
      aria-label={`Swap ${originalName} with ${targetSwapName} to save ${glSavings} Glycemic Load points`}
      className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D8E8CB]/70 hover:bg-[#D8E8CB] text-[#1B3B22] border border-[#2D5A34]/20 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
    >
      <TrendingDown className="w-3.5 h-3.5 text-[#386A20]" aria-hidden="true" />
      <span>Swap to {targetSwapName}</span>
      <span className="bg-[#1B3B22] text-[#FFFFFF] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
        -{glSavings} GL
      </span>
    </button>
  );
};

export default SmartSwapTrigger;
