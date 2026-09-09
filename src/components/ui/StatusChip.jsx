import React from 'react';

/**
 * StatusChip — MagicPath metabolic health & plan status chip component.
 *
 * Supported states:
 * - "ON TRACK": Sage green tokens (--color-sage-bg / --color-sage-text)
 * - "PENDING": Amber tokens (--color-amber-bg / --color-amber-text)
 * - "HIGH RISK": Rose red tokens (--color-rose-bg / --color-rose-text)
 */
const STATUS_CONFIG = {
  'ON TRACK': {
    label: 'ON TRACK',
    className: 'bg-sage-bg text-sage-text border-sage-text/20',
  },
  'PENDING': {
    label: 'PENDING',
    className: 'bg-amber-bg text-amber-text border-amber-text/20',
  },
  'HIGH RISK': {
    label: 'HIGH RISK',
    className: 'bg-rose-bg text-rose-text border-rose-text/20',
  },
};

export const StatusChip = ({ status = 'ON TRACK', className = '' }) => {
  const normalizedStatus = (status || 'ON TRACK').toUpperCase().trim();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['ON TRACK'];

  return (
    <span
      data-testid="status-chip"
      data-status={normalizedStatus}
      className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusChip;
