import React from 'react';

/**
 * TagChip — Filter/category toggle chip with MagicPath gradient active state.
 *
 * Active: Green gradient (#1A3409 → #3D6B1E) with white text
 * Inactive: Bone bg with Linen border and Graphite text
 */
export const TagChip = ({ label, active, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-label-md text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
        active
          ? 'text-white shadow-sm hover:opacity-90 chip-gradient-active'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant/50 border border-border-subtle'
      } ${className}`}
      style={active ? { background: 'linear-gradient(135deg, #1A3409 0%, #3D6B1E 100%)', color: '#FFFFFF' } : undefined}
      aria-pressed={active}
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
