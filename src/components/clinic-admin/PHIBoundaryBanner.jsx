import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * PHIBoundaryBanner - Clinic Administration Security Safeguard Notice
 *
 * Provides a persistent, non-dismissible operational boundary notice for Clinic Administrators.
 * Reinforces the structural separation between non-clinical clinic management and protected health information (PHI).
 *
 * RBAC / Tenancy Invariant:
 * Renders strictly when the user is operating in a Clinic Admin context.
 * Never renders for patients or standard clinical dietitians.
 */
export const PHIBoundaryBanner = () => {
  const { canManageClinic, canManageIntakePipeline, role } = usePermissions();
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);

  const normalizedRole = (role || '').toLowerCase();
  const isClinicAdminContext =
    canManageClinic ||
    canManageIntakePipeline ||
    ['clinic_admin', 'super_admin'].includes(normalizedRole);

  if (!isClinicAdminContext) {
    return null;
  }

  return (
    <aside
      className="w-full bg-surface-container-high border-2 border-primary/20 rounded-2xl p-4 sm:p-5 shadow-xs mb-6"
      aria-label="Clinic Administration Data Boundary Notice"
      role="region"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5" aria-hidden="true">
          <span className="material-symbols-outlined text-xl">shield</span>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span>Operational Administration Workspace</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                PHI Isolated
              </span>
            </h3>

            {/* Accessible Disclosure Toggle */}
            <button
              type="button"
              onClick={() => setIsDisclosureOpen((prev) => !prev)}
              aria-expanded={isDisclosureOpen}
              aria-controls="phi-boundary-disclosure-panel"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-variant underline underline-offset-2 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <span>{isDisclosureOpen ? 'Hide operational boundaries' : 'What can I manage?'}</span>
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                  isDisclosureOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>
          </div>

          <p className="text-xs text-on-surface leading-relaxed font-medium">
            Clinic administration workspace: you can manage intake, service routing, and clinician assignment.
            Clinical records, metabolic targets, meal plans, and recipe-swap rules are unavailable in this workspace.
          </p>

          {/* Accessible Disclosure Details Panel */}
          {isDisclosureOpen && (
            <div
              id="phi-boundary-disclosure-panel"
              className="mt-3 pt-3 border-t border-primary/15 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in"
            >
              {/* Allowed Scope */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/70 border border-outline-variant/30">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-700">check_circle</span>
                  <span>Permitted Operational Work</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant text-[11px] leading-relaxed">
                  <li>Intake pipeline management & lead status triage</li>
                  <li>Two-tier service routing (Full Care vs. Online Session Only)</li>
                  <li>Dietitian caseload assignment & practitioner roster</li>
                  <li>Clinic directory listing & promotion configuration</li>
                </ul>
              </div>

              {/* Excluded Scope */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/70 border border-outline-variant/30">
                <div className="font-bold text-rose-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-rose-700">block</span>
                  <span>Excluded Protected Health Information</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant text-[11px] leading-relaxed">
                  <li>Patient clinical records & medical consultation notes</li>
                  <li>Continuous glucose monitoring (CGM) & glycemic telemetry</li>
                  <li>Calibrated Glycemic Load (GL) budgets & net carbohydrate caps</li>
                  <li>Prescribed patient meal plans & smart recipe substitution rules</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default PHIBoundaryBanner;