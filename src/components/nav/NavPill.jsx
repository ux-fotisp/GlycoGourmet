import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NavPill — Accessible, ergonomic navigation link or parent button component.
 * Enforces minimum 44px touch target on all viewports.
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
  const baseClasses = `flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-control font-body-md text-sm transition-all cursor-pointer select-none active:scale-95 ${
    isActive
      ? 'bg-brand-hover text-text-inverse font-bold shadow-xs'
      : 'text-brand-container/90 hover:bg-brand-hover/60 hover:text-text-inverse'
  } focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:outline-none ${className}`;

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
