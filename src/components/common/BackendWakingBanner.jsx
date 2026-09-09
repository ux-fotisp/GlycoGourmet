import React from 'react';
import { useBackendWakeStatus } from '../../hooks/useBackendWakeStatus';

/**
 * BackendWakingBanner — Non-blocking banner indicating Render free-tier cold-start wake progress.
 *
 * Accessibility & Safety:
 * - Employs role="status" and aria-live="polite" (never traps focus).
 * - Hook `useBackendWakeStatus` is invoked unconditionally at top-level.
 * - Displays attempt number and non-punitive clinical explanation.
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export const BackendWakingBanner = ({ className = '' }) => {
  const { isWaking, attempt, maxAttempts } = useBackendWakeStatus();

  if (!isWaking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="backend-waking-indicator"
      className={`bg-primary text-white border border-emerald-800 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-xs font-extrabold animate-fade-in ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="material-symbols-outlined text-[20px] animate-spin text-emerald-300 shrink-0"
          aria-hidden="true"
        >
          progress_activity
        </span>
        <span className="truncate">
          Demo backend is waking up (~30-60s on Render)... Retrying request ({attempt}/{maxAttempts})
        </span>
      </div>
    </div>
  );
};

export default BackendWakingBanner;
