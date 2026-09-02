import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PIPELINE_STAGES,
  REFERRAL_SOURCES,
  SERVICE_TIERS,
  getIntakeLeads,
  createIntakeLead,
  updateLeadStage,
  updateLeadServiceTier,
  assignDietitianToLead,
  getPipelineMetrics,
} from '../../utils/intakeStore';
import { getClinicDietitians } from '../../utils/clientStore';
import IntakeLeadCard from './IntakeLeadCard';
import NewLeadModal from './NewLeadModal';

/**
 * IntakePipelineBoard - De-Identified Operational Referral Kanban Board
 *
 * Provides Clinic Administrators (Konstantina) with an accessible, 6-stage lifecycle
 * board for tracking incoming prospective leads without processing or storing PHI.
 *
 * Trust & Safety Invariants:
 * - Strictly de-identified operational records (reference codes only).
 * - Zero clinical telemetry, glucose/A1c values, meal plans, or medical notes.
 * - Explicit keyboard-accessible stage transitions with immutable audit logging.
 * - Neutral operational metrics only (no conversion rates or growth pressure).
 * - Manual practitioner selection only (no matching scores or ranking).
 */
export const IntakePipelineBoard = ({ clinicId = 'clinic-glycemic-wellness' }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [dietitians, setDietitians] = useState([]);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchCode, setSearchCode] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    const leadData = await getIntakeLeads(clinicId);
    const practitioners = await getClinicDietitians();
    setLeads(leadData);
    setDietitians(practitioners);
  };

  useEffect(() => {
    loadData();
  }, [clinicId]);

  const actorId = user?.id || user?.email || 'admin_konstantina';

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateLead = async (leadInput) => {
    const created = await createIntakeLead({ ...leadInput, clinicId }, actorId);
    await loadData();
    showNotification(`Created intake record ${created.referenceCode}`);
  };

  const handleStageChange = async (leadId, newStage, reason) => {
    const updated = await updateLeadStage(leadId, newStage, reason, actorId);
    await loadData();
    showNotification(`Updated ${updated.referenceCode} to stage "${newStage}"`);
  };

  const handleTierChange = async (leadId, newTier) => {
    const updated = await updateLeadServiceTier(leadId, newTier, actorId);
    await loadData();
    showNotification(`Updated ${updated.referenceCode} tier to "${SERVICE_TIERS[newTier]}"`);
  };

  const handleAssignDietitian = async (leadId, dietitianId, dietitianName) => {
    const updated = await assignDietitianToLead(leadId, dietitianId, dietitianName, actorId);
    await loadData();
    showNotification(
      dietitianName
        ? `Assigned ${dietitianName} to ${updated.referenceCode}`
        : `Unassigned practitioner for ${updated.referenceCode}`
    );
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    if (tierFilter !== 'ALL' && l.serviceTier !== tierFilter) return false;
    if (sourceFilter !== 'ALL' && l.referralSource !== sourceFilter) return false;
    if (searchCode && !l.referenceCode.toLowerCase().includes(searchCode.toLowerCase())) return false;
    return true;
  });

  const metrics = getPipelineMetrics(leads);

  return (
    <section
      aria-label="Clinic Intake Pipeline Board"
      className="space-y-6"
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div
          role="status"
          className="p-3 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-xl flex items-center gap-2 animate-fade-in"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            check_circle
          </span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Controls & Neutral Operational Metrics */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]" aria-hidden="true">
                view_kanban
              </span>
              <span>Intake Pipeline Board</span>
            </h2>
            <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
              De-identified referral triage across 6 operational stages.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewLeadOpen(true)}
            className="px-5 py-2.5 min-h-[40px] bg-primary text-on-primary font-bold text-xs rounded-full hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              add
            </span>
            <span>+ New Intake Record</span>
          </button>
        </div>

        {/* Neutral Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
              Total Records
            </span>
            <span className="text-xl font-display font-extrabold text-primary block">
              {metrics.totalRecords}
            </span>
            <span className="text-[10px] text-on-surface-variant">All intake entries</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
              Open Records
            </span>
            <span className="text-xl font-display font-extrabold text-amber-800 block">
              {metrics.openRecords}
            </span>
            <span className="text-[10px] text-on-surface-variant">Inquiry through Scheduled</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
              Scheduled
            </span>
            <span className="text-xl font-display font-extrabold text-indigo-800 block">
              {metrics.scheduledSessions}
            </span>
            <span className="text-[10px] text-on-surface-variant">Awaiting consultation</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
              Active Clients
            </span>
            <span className="text-xl font-display font-extrabold text-emerald-800 block">
              {metrics.activeRecords}
            </span>
            <span className="text-[10px] text-on-surface-variant">In active care</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
              Tier Breakdown
            </span>
            <div className="text-[11px] font-bold text-on-surface flex flex-col gap-0.5">
              <span className="text-emerald-800">Full Care: {metrics.tierDistribution.FULL_CARE}</span>
              <span className="text-indigo-800">Online Only: {metrics.tierDistribution.ONLINE_SESSION_ONLY}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-outline-variant/15 text-xs">
          {/* Reference Code Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Search reference code (e.g. INT-1011)..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-9 pr-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
              aria-label="Filter by reference code"
            />
          </div>

          {/* Service Tier Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="tier-filter-select" className="font-bold text-on-surface-variant text-[11px] whitespace-nowrap">
              Tier:
            </label>
            <select
              id="tier-filter-select"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="ALL">All Tiers</option>
              <option value="FULL_CARE">Full Care</option>
              <option value="ONLINE_SESSION_ONLY">Online-Session-Only</option>
            </select>
          </div>

          {/* Referral Source Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="source-filter-select" className="font-bold text-on-surface-variant text-[11px] whitespace-nowrap">
              Source:
            </label>
            <select
              id="source-filter-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="ALL">All Sources</option>
              {Object.entries(REFERRAL_SOURCES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 6-Column Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage);

          return (
            <div
              key={stage}
              aria-label={`Pipeline column ${stage}`}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant/25 p-3.5 space-y-3 min-h-[420px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-xs font-extrabold text-primary">
                    {stage}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="h-32 rounded-2xl border border-dashed border-outline-variant/30 flex items-center justify-center text-center p-3 text-[11px] text-on-surface-variant font-medium">
                    No intake records in {stage}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <IntakeLeadCard
                      key={lead.id}
                      lead={lead}
                      dietitians={dietitians}
                      onStageChange={handleStageChange}
                      onTierChange={handleTierChange}
                      onAssignDietitian={handleAssignDietitian}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Lead Creator Modal */}
      {isNewLeadOpen && (
        <NewLeadModal
          isOpen={isNewLeadOpen}
          onClose={() => setIsNewLeadOpen(false)}
          onCreate={handleCreateLead}
        />
      )}
    </section>
  );
};

export default IntakePipelineBoard;