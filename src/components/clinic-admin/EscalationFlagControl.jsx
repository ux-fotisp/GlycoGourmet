import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../utils/auditStore';

const ESCALATION_REASONS = [
  'The suggestion is incorrect',
  'Important context is missing',
  'This needs human review',
  'Other',
];

/**
 * EscalationFlagControl - Dispute & Human Escalation Action for Clinic Admin
 *
 * Allows Clinic Administrators to flag an automated operational suggestion
 * without penalty, without altering the underlying recommendation silently,
 * and with an immutable audit log entry.
 */
export const EscalationFlagControl = ({
  suggestionId = 'suggestion_default',
  suggestionType = 'operational_routing',
  suggestedValue = null,
  entityId = 'entity_default',
  entityType = 'operational_suggestion',
  buttonLabel = 'Flag as wrong / Escalate',
  onEscalationLogged = null,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(ESCALATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus safe behavior
      setTimeout(() => cancelButtonRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setStatusMessage('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setCustomNote('');
  };

  const handleConfirmEscalation = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const actorId = user?.id || user?.email || 'admin_konstantina';

      const auditEntry = logAdminAction({
        actorId,
        actorRole: 'clinic_admin',
        action: 'operational_suggestion_escalated',
        entityId: entityId || suggestionId,
        entityType: entityType || 'operational_suggestion',
        suggestedValue: suggestedValue || { suggestionId, suggestionType },
        finalValue: {
          status: 'ESCALATED_FOR_HUMAN_REVIEW',
          reason: selectedReason,
          suggestionId,
          suggestionType,
        },
        note: customNote.trim(),
      });

      setStatusMessage('Operational suggestion flagged for human review.');
      setIsSubmitting(false);

      if (onEscalationLogged) {
        onEscalationLogged(auditEntry);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (_err) {
      setIsSubmitting(false);
      setStatusMessage('Failed to record escalation audit.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-surface-container-high hover:bg-surface-container text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
        aria-label={`Flag suggestion ${suggestionId} as incorrect`}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          flag
        </span>
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="escalation-flag-dialog-title"
            aria-describedby="escalation-flag-dialog-desc"
            className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl p-6 space-y-5 animate-scale-up text-xs"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
              <div>
                <h3
                  id="escalation-flag-dialog-title"
                  className="font-display text-base font-bold text-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-rose-700 text-lg" aria-hidden="true">
                    flag
                  </span>
                  <span>Flag Operational Suggestion</span>
                </h3>
                <p id="escalation-flag-dialog-desc" className="text-[11px] text-on-surface-variant mt-0.5">
                  Flagging this suggestion will not change it automatically. It records your concern for human review.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmEscalation} className="space-y-4">
              {/* Reason Radios */}
              <div className="space-y-2">
                <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  Reason for Escalation
                </label>
                <div className="space-y-1.5">
                  {ESCALATION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        selectedReason === reason
                          ? 'bg-primary/5 border-primary text-primary font-bold'
                          : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="escalationReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Note input with PHI warning */}
              <div className="space-y-1">
                <label htmlFor="escalation-custom-note" className="block font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  Administrative Note (Optional)
                </label>
                <textarea
                  id="escalation-custom-note"
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Describe why this operational suggestion is inaccurate..."
                  className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary text-on-surface"
                />
                <p className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" aria-hidden="true">
                    shield
                  </span>
                  <span>Do not enter patient clinical information, medical notes, or glucose targets.</span>
                </p>
              </div>

              {/* Status Alert */}
              {statusMessage && (
                <div
                  role="status"
                  className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-fade-in"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    check_circle
                  </span>
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-3">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 min-h-[44px] font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 min-h-[44px] bg-rose-700 text-white font-bold rounded-xl hover:bg-rose-800 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    send
                  </span>
                  <span>{isSubmitting ? 'Recording...' : 'Confirm Escalation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EscalationFlagControl;