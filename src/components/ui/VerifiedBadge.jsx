import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * VerifiedBadge — MagicPath clinical verification badge component.
 *
 * Uses the Sage & Grain tokens (--color-sage-bg / --color-sage-text) for 100% chromatic
 * and visual consistency with StatusChip's "ON TRACK" treatment. Note that rgba(45, 80, 22)
 * is #2D5016, which is the exact MagicPath sage-text token.
 *
 * @param {Object} props
 * @param {string} [props.label='Verified'] - Badge text
 * @param {string} [props.className=''] - Additional container classes
 */
export function VerifiedBadge({ label = 'Verified', className = '' }) {
  return (
    <span
      data-testid="verified-badge"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-bg text-sage-text border border-sage-text/20 shadow-2xs font-sans ${className}`}
    >
      <CheckCircle
        data-testid="verified-check-icon"
        className="w-3.5 h-3.5 shrink-0"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export default VerifiedBadge;
