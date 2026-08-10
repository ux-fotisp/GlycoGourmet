import React from 'react';

export const TagChip = ({ label, active, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-label-md text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
        active
          ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant/50'
      } ${className}`}
    >
      {active && (
        <span className="material-symbols-outlined text-[18px] font-bold">
          check
        </span>
      )}
      {label}
    </button>
  );
};

export default TagChip;
