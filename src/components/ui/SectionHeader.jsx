import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * SectionHeader — MagicPath bone-surface header bar with icon and action link.
 *
 * Spec: "RECOMMENDED FOR YOU" header bar with bone background, Sparkles icon,
 * uppercase tracking-widest section label, and optional right-aligned "View All →" action.
 *
 * Props:
 * - title: string (section label text)
 * - icon?: LucideIcon component (defaults to Sparkles)
 * - actionLabel?: string (e.g. "View All")
 * - actionHref?: string (destination link URL)
 * - onAction?: (e: React.MouseEvent) => void
 * - className?: string
 */
export const SectionHeader = ({
  title,
  icon: Icon = Sparkles,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  const handleActionClick = (e) => {
    if (onAction) {
      if (!actionHref) {
        e.preventDefault();
      }
      onAction(e);
    }
  };

  const actionContent = (
    <>
      <span>{actionLabel}</span>
      <ArrowRight
        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0"
        aria-hidden="true"
      />
    </>
  );

  const actionClasses =
    'inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-variant transition-colors group cursor-pointer shrink-0';

  return (
    <header
      data-testid="section-header"
      className={`bg-surface border border-border-subtle rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon
          data-testid="section-header-icon"
          className="w-4 h-4 text-primary shrink-0"
          aria-hidden="true"
        />
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary font-display truncate">
          {title}
        </h3>
      </div>

      {actionLabel && (
        actionHref ? (
          <a
            href={actionHref}
            onClick={handleActionClick}
            className={actionClasses}
          >
            {actionContent}
          </a>
        ) : (
          <button
            type="button"
            onClick={handleActionClick}
            className={actionClasses}
          >
            {actionContent}
          </button>
        )
      )}
    </header>
  );
};

export default SectionHeader;
