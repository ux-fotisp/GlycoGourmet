import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Breadcrumb — MagicPath header back-navigation and breadcrumb trail.
 *
 * Pattern: "← All Recipes / Low-Glycemic Green…"
 *
 * Props:
 * - backLabel?: string (e.g. "All Recipes")
 * - backHref?: string (URL path)
 * - onBack?: (e: React.MouseEvent) => void
 * - currentLabel: string (current page / recipe title)
 * - className?: string
 */
export const Breadcrumb = ({
  backLabel = 'All Recipes',
  backHref,
  onBack,
  currentLabel = '',
  className = '',
}) => {
  const handleBackClick = (e) => {
    if (onBack) {
      if (!backHref) {
        e.preventDefault();
      }
      onBack(e);
    }
  };

  const linkContent = (
    <>
      <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{backLabel}</span>
    </>
  );

  const linkClasses =
    'inline-flex items-center gap-1.5 text-primary hover:text-primary-variant transition-colors cursor-pointer font-bold';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm font-bold flex items-center gap-2 ${className}`}
    >
      {backHref ? (
        <a href={backHref} onClick={handleBackClick} className={linkClasses}>
          {linkContent}
        </a>
      ) : (
        <button
          type="button"
          onClick={handleBackClick}
          className={linkClasses}
        >
          {linkContent}
        </button>
      )}

      {currentLabel && (
        <>
          <span className="text-stone-400 select-none" aria-hidden="true">
            /
          </span>
          <span
            data-testid="breadcrumb-current"
            className="truncate max-w-xs sm:max-w-md text-on-surface font-semibold"
            title={currentLabel}
          >
            {currentLabel}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
