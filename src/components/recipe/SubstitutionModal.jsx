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
  onSwap
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
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
        className="relative bg-white w-full max-w-md rounded-xl p-6 shadow-2xl scale-100 transition-transform duration-300 z-10 border border-outline-variant/50"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest block">
              Substitution Suggestion
            </span>
            <h4 id="sub-modal-title" className="font-display text-lg md:text-xl font-bold mt-1 text-on-surface">
              {originalName} <span className="text-on-surface-variant font-normal">→</span> {substitutionName}
            </h4>
          </div>
          <button
            aria-label="Close modal"
            className="p-1 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        <div className="bg-primary-container/10 p-4 rounded-lg mb-5 flex gap-3 items-start">
          <span className="material-symbols-outlined text-primary text-3xl shrink-0 mt-0.5">
            trending_down
          </span>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {reason || 'A much better option that digests slower to prevent blood glucose spikes.'}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-outline-variant/40">
            <span className="text-sm text-on-surface font-medium">Glucose Impact</span>
            <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Stable Release
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-outline-variant/40">
            <span className="text-sm text-on-surface font-medium">Fiber Profile</span>
            <span className="text-primary font-bold text-xs">Improved</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 h-12 bg-primary hover:bg-primary-container text-on-primary rounded-full font-label-md font-bold transition-all active:scale-95 cursor-pointer"
            onClick={() => {
              onSwap();
              onClose();
            }}
          >
            Swap & Apply
          </button>
          <button
            className="px-6 h-12 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-full font-label-md transition-all cursor-pointer"
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
