import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NavPill — Accessible, ergonomic navigation link or parent button component.
 * Enforces minimum 48px x 48px touch target on mobile viewports.
 */
export const NavPill = ({
  to,
  icon,
  label,
  isActive = false,
  onClick,
  onKeyDown,
  hasSubmenu = false,
  isOpen = false,
  ariaExpanded,
  className = '',
  children,
}) => {
  const baseClasses = `flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-r-full font-body-md text-sm transition-all cursor-pointer select-none active:scale-95 ${
    isActive
      ? 'bg-primary text-on-primary font-bold shadow-xs'
      : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
  } ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
        <span className="flex-1">{label}</span>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-expanded={ariaExpanded ?? isOpen}
      aria-haspopup={hasSubmenu ? 'true' : undefined}
      className={`${baseClasses} w-full text-left justify-between`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
        <span>{label}</span>
      </div>
      {hasSubmenu && (
        <span
          className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      )}
      {children}
    </button>
  );
};

export default NavPill;
