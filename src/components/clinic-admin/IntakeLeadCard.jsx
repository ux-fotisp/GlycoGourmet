import React, { useState } from 'react';
import {
  PIPELINE_STAGES,
  REFERRAL_SOURCES,
  SERVICE_TIERS,
  CONTROLLED_STAGE_REASONS,
} from '../../utils/intakeStore';

/**
 * IntakeLeadCard - De-Identified Operational Referral Card
 *
 * Displays neutral operational intake metadata with explicit, keyboard-accessible
 * stage advance/retreat controls and practitioner assignment.
 *
 * Safety & Privacy Invariants:
 * - Zero personal contact information (no name, email, phone, address).
 * - Zero clinical telemetry, glucose values, meal plans, or diagnoses.
 * - Explicit manual Clinic Admin action required for stage changes (no drag-and-drop).
 */
export const IntakeLeadCard = ({
  lead,
  dietitians = [],
  onStageChange = () => {},
  onTierChange = () => {},
  onAssignDietitian = () => {},
}) => {
  const [selectedReason] = useState(lead.stageReason || CONTROLLED_STAGE_REASONS[0]);

  const currentStageIndex = PIPELINE_STAGES.indexOf(lead.stage);
  const canMoveBackward = currentStageIndex > 0;
  const canMoveForward = currentStageIndex < PIPELINE_STAGES.length - 1;

  const prevStage = canMoveBackward ? PIPELINE_STAGES[currentStageIndex - 1] : null;
  const nextStage = canMoveForward ? PIPELINE_STAGES[currentStageIndex + 1] : null;

  const referralLabel = REFERRAL_SOURCES[lead.referralSource] || lead.referralSource;
  const tierLabel = SERVICE_TIERS[lead.serviceTier] || lead.serviceTier;

  const handleMoveBackward = () => {
    if (prevStage) {
      onStageChange(lead.id, prevStage, selectedReason);
    }
  };

  const handleMoveForward = () => {
    if (nextStage) {
      onStageChange(lead.id, nextStage, selectedReason);
    }
  };

  const handleDirectStageSelect = (e) => {
    const targetStage = e.target.value;
    if (targetStage && targetStage !== lead.stage) {
      onStageChange(lead.id, targetStage, selectedReason);
    }
  };

  const handleTierToggle = () => {
    const newTier = lead.serviceTier === 'FULL_CARE' ? 'ONLINE_SESSION_ONLY' : 'FULL_CARE';
    onTierChange(lead.id, newTier);
  };

  const handleDietitianSelect = (e) => {
    const dietitianId = e.target.value;
    if (!dietitianId) {
      onAssignDietitian(lead.id, null, null);
      return;
    }
    const practitioner = dietitians.find((d) => d.id === dietitianId);
    if (practitioner) {
      onAssignDietitian(lead.id, practitioner.id, practitioner.name);
    }
  };

  return (
    <article
      aria-label={`Intake Record ${lead.referenceCode}`}
      className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-xs hover:shadow-md transition-shadow space-y-3.5 text-xs text-on-surface"
    >
      {/* Top Badges: Reference Code & Referral Source */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary" aria-hidden="true">
            tag
          </span>
          <strong className="font-mono text-xs font-bold text-primary tracking-wide">
            {lead.referenceCode}
          </strong>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20">
          {referralLabel}
        </span>
      </div>

      {/* Service Tier & Reason */}
      <div className="space-y-1.5 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/15">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant">
            Service Tier
          </span>
          <button
            type="button"
            onClick={handleTierToggle}
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer border ${
              lead.serviceTier === 'FULL_CARE'
                ? 'bg-emerald-500/10 text-emerald-800 border-emerald-300/40 hover:bg-emerald-500/20'
                : 'bg-indigo-500/10 text-indigo-800 border-indigo-300/40 hover:bg-indigo-500/20'
            }`}
            title="Click to switch service tier"
            aria-label={`Current tier ${tierLabel} for ${lead.referenceCode}. Click to change tier.`}
          >
            {tierLabel}
          </button>
        </div>

        {lead.stageReason && (
          <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary/70" aria-hidden="true">
              history
            </span>
            <span>Reason: <strong>{lead.stageReason}</strong></span>
          </div>
        )}
      </div>

      {/* Manual Practitioner Assignment Selector */}
      <div className="space-y-1">
        <label
          htmlFor={`dietitian-select-${lead.id}`}
          className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant"
        >
          Assigned Practitioner
        </label>
        <select
          id={`dietitian-select-${lead.id}`}
          value={lead.assignedDietitianId || ''}
          onChange={handleDietitianSelect}
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={`Assigned practitioner for ${lead.referenceCode}`}
        >
          <option value="">— Unassigned —</option>
          {dietitians.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.credentials || 'RDN'})
            </option>
          ))}
        </select>
      </div>

      {/* Explicit Accessible Stage Advance / Retreat Controls */}
      <div className="pt-2 border-t border-outline-variant/20 space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            disabled={!canMoveBackward}
            onClick={handleMoveBackward}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg border border-outline-variant/30 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label={`Move ${lead.referenceCode} back to ${prevStage || 'previous stage'}`}
            title={prevStage ? `Move back to ${prevStage}` : 'At initial stage'}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_back
            </span>
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={!canMoveForward}
            onClick={handleMoveForward}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg bg-primary text-on-primary text-[11px] font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
            aria-label={`Move ${lead.referenceCode} forward to ${nextStage || 'next stage'}`}
            title={nextStage ? `Move forward to ${nextStage}` : 'At final stage'}
          >
            <span>Advance</span>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Direct Stage Jump & Reason Select */}
        <div className="flex items-center gap-1.5">
          <label htmlFor={`stage-jump-${lead.id}`} className="sr-only">
            Select stage for {lead.referenceCode}
          </label>
          <select
            id={`stage-jump-${lead.id}`}
            value={lead.stage}
            onChange={handleDirectStageSelect}
            className="w-full bg-white border border-outline-variant/30 rounded-lg px-2 py-1 text-[11px] text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label={`Stage select dropdown for ${lead.referenceCode}`}
          >
            {PIPELINE_STAGES.map((stg) => (
              <option key={stg} value={stg}>
                Stage: {stg}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
};

export default IntakeLeadCard;