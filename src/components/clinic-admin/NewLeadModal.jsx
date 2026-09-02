import React, { useState, useEffect, useRef } from 'react';
import {
  PIPELINE_STAGES,
  REFERRAL_SOURCES,
  SERVICE_TIERS,
  CONTROLLED_STAGE_REASONS,
} from '../../utils/intakeStore';

/**
 * NewLeadModal - De-Identified Operational Intake Lead Creator
 *
 * Safety & Privacy Invariants:
 * - Collects strictly non-identifying operational categorization.
 * - Does NOT collect or prompt for patient names, emails, phone numbers, or clinical data.
 */
export const NewLeadModal = ({
  isOpen = false,
  onClose = () => {},
  onCreate = () => {},
}) => {
  const [referralSource, setReferralSource] = useState('self_service_redirect');
  const [serviceTier, setServiceTier] = useState('FULL_CARE');
  const [stage, setStage] = useState('Inquiry');
  const [stageReason, setStageReason] = useState(CONTROLLED_STAGE_REASONS[0]);

  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      referralSource,
      serviceTier,
      stage,
      stageReason,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-intake-dialog-title"
        aria-describedby="new-intake-dialog-desc"
        className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl p-6 space-y-5 animate-scale-up text-xs"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
          <div>
            <h3
              id="new-intake-dialog-title"
              className="font-display text-base font-bold text-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
                assignment_add
              </span>
              <span>New Operational Intake Record</span>
            </h3>
            <p id="new-intake-dialog-desc" className="text-[11px] text-on-surface-variant mt-0.5">
              Record a de-identified operational intake referral.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Anti-PHI Boundary Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-300/40 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-amber-800" aria-hidden="true">
            shield
          </span>
          <span>
            <strong>Operational Privacy Policy:</strong> Do not enter personal contact details, medical notes, or clinical targets.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Referral Source */}
          <div className="space-y-1.5">
            <label
              htmlFor="intake-referral-source"
              className="block font-bold text-on-surface uppercase tracking-wider text-[11px]"
            >
              Referral Channel
            </label>
            <select
              id="intake-referral-source"
              ref={firstInputRef}
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary text-on-surface"
            >
              {Object.entries(REFERRAL_SOURCES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Service Tier */}
          <div className="space-y-1.5">
            <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px]">
              Service Delivery Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SERVICE_TIERS).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    serviceTier === key
                      ? 'bg-primary/5 border-primary text-primary font-bold'
                      : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceTier"
                    value={key}
                    checked={serviceTier === key}
                    onChange={() => setServiceTier(key)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Initial Stage */}
          <div className="space-y-1.5">
            <label
              htmlFor="intake-initial-stage"
              className="block font-bold text-on-surface uppercase tracking-wider text-[11px]"
            >
              Initial Pipeline Stage
            </label>
            <select
              id="intake-initial-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary text-on-surface"
            >
              {PIPELINE_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          {/* Controlled Reason */}
          <div className="space-y-1.5">
            <label
              htmlFor="intake-initial-reason"
              className="block font-bold text-on-surface uppercase tracking-wider text-[11px]"
            >
              Administrative Reason
            </label>
            <select
              id="intake-initial-reason"
              value={stageReason}
              onChange={(e) => setStageReason(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary text-on-surface"
            >
              {CONTROLLED_STAGE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 min-h-[44px] bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                add
              </span>
              <span>Create Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;