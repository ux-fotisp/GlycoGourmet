import React from 'react';

/**
 * Reusable progress bar component matching Google Stitch styling rules.
 * 
 * @param {number} progress Numeric percentage (0 - 100)
 * @param {string} barColor Color styling class (e.g., bg-primary)
 * @param {string} className Extra custom classes
 */
export const ProgressBar = ({ progress = 0, barColor = 'bg-primary', className = '' }) => {
  const roundedProgress = Math.min(Math.max(0, progress), 100);

  return (
    <div className={`w-full h-3 bg-secondary-container rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
        style={{ width: `${roundedProgress}%` }}
        role="progressbar"
        aria-valuenow={roundedProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default ProgressBar;
