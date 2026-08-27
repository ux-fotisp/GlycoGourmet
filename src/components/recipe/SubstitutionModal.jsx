import React from 'react';

/**
 * Modal to display alternative ingredients that have a lower Glycemic Index or higher fiber content.
 */
export const SubstitutionModal = ({
  isOpen,
  onClose,
  originalName,
  substitutionName,
  reason,
  onSwap,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Popover Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-modal-title"
        className="relative bg-card w-full max-w-md rounded-card p-6 shadow-2xl scale-100 transition-transform duration-300 z-10 border border-border-subtle"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-brand-strong uppercase tracking-widest block">
              Substitution Suggestion
            </span>
            <h4 id="sub-modal-title" className="font-display text-lg md:text-xl font-bold mt-1 text-text-strong">
              {originalName} <span className="text-text-body font-normal">→</span> {substitutionName}
            </h4>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            className="p-1 hover:bg-surface-container rounded-full transition-colors cursor-pointer text-text-body focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        <div className="bg-success-surface border border-success-border p-4 rounded-control mb-5 flex gap-3 items-start">
          <span className="material-symbols-outlined text-brand-strong text-2xl shrink-0 mt-0.5">
            trending_down
          </span>
          <p className="text-xs text-brand-strong leading-relaxed font-medium">
            {reason || 'A much better option that digests slower to prevent blood glucose spikes.'}
          </p>
        </div>

        <div className="space-y-2 mb-6 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
            <span className="text-text-strong font-medium">Glucose Impact</span>
            <span className="bg-success-surface text-brand-strong border border-success-border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Stable Release
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
            <span className="text-text-strong font-medium">Fiber Profile</span>
            <span className="text-brand-strong font-bold">Improved</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 min-h-[44px] h-11 bg-brand-strong hover:bg-brand-hover text-text-inverse rounded-control font-label-md font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
            onClick={() => {
              onSwap();
              onClose();
            }}
          >
            Swap & Apply
          </button>
          <button
            type="button"
            className="px-5 min-h-[44px] h-11 border border-border-interactive bg-card text-brand-strong hover:bg-surface-container-low rounded-control font-label-md font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubstitutionModal;
