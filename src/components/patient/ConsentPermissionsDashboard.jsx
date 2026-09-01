import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getConsentsByGrantor,
  revokeConsent,
  grantConsent,
} from '../../utils/consentStore';

export const ConsentPermissionsDashboard = () => {
  const { user } = useAuth();
  const patientId = user?.id || user?.email || 'patient_fotis';

  const [consents, setConsents] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  // New Grant Form State
  const [newPurpose, setNewPurpose] = useState('Clinic Dietitian Consultation');
  const [newGrantee, setNewGrantee] = useState('Glycemic Wellness Clinic');
  const [newScope, setNewScope] = useState(['intake_redirect', 'dietitian_share']);

  const loadConsents = () => {
    let records = getConsentsByGrantor(patientId);
    // If no records, initialize with a sample baseline consent for intuitive demo
    if (records.length === 0) {
      grantConsent({
        grantorId: patientId,
        granteeId: 'Glycemic Wellness Clinic',
        purpose: 'Self-Service Intake & Care Coordination',
        scope: ['intake_redirect'],
        version: '2.1',
      });
      records = getConsentsByGrantor(patientId);
    }
    setConsents(records);
  };

  useEffect(() => {
    loadConsents();

    const handleUpdate = () => {
      loadConsents();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('glyco:consent:updated', handleUpdate);
      return () => {
        window.removeEventListener('glyco:consent:updated', handleUpdate);
      };
    }
  }, [patientId]);

  const showFeedback = (msg, type = 'success') => {
    setFeedbackMessage(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  const handleRevoke = (consentId, purposeTitle) => {
    const revoked = revokeConsent(consentId, 'Patient requested immediate revocation from Settings');
    if (revoked) {
      showFeedback(`Access revoked for "${purposeTitle}". Downstream sharing halted immediately.`, 'success');
      loadConsents();
    }
  };

  const handleGrantSubmit = (e) => {
    e.preventDefault();
    if (!newPurpose || newScope.length === 0) {
      showFeedback('Please select at least one scope and purpose.', 'error');
      return;
    }

    grantConsent({
      grantorId: patientId,
      granteeId: newGrantee,
      purpose: newPurpose,
      scope: newScope,
      version: '2.1',
    });

    setIsGrantModalOpen(false);
    showFeedback(`New authorization for "${newPurpose}" granted successfully.`, 'success');
    loadConsents();
  };

  const toggleScopeSelection = (scopeKey) => {
    setNewScope((prev) =>
      prev.includes(scopeKey) ? prev.filter((s) => s !== scopeKey) : [...prev, scopeKey]
    );
  };

  return (
    <section className="space-y-6 animate-fade-in" aria-label="Permissions and Consent Dashboard">
      {/* Header Card */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">shield_lock</span>
              Permissions & Data Consent Governance
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
              Review and manage granular authorizations granted to clinics and dietitians. You retain total agency to revoke access with 1 click.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2.5 min-h-[44px] bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            aria-label="Authorize new clinical data share"
          >
            <span className="material-symbols-outlined text-base">add_moderator</span>
            <span>+ Authorize New Share</span>
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div
            role="status"
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
              feedbackType === 'success'
                ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                : 'bg-error-container/20 text-error border border-error/30'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {feedbackType === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Consent Grants List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-base">fact_check</span>
          Active & Historical Data Consents ({consents.length})
        </h4>

        {consents.length === 0 ? (
          <div className="bento-cell text-center p-8 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/60">lock_open</span>
            <p className="text-xs font-bold text-on-surface">No active data sharing authorizations</p>
            <p className="text-[11px] text-on-surface-variant">Your metabolic data remains strictly local and private to your device.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {consents.map((record) => {
              const isActive = (record.status === 'granted' || record.status === 'active') && !record.revokedAt;
              const isRevoked = Boolean(record.revokedAt);

              return (
                <div
                  key={record.id}
                  className={`bento-cell bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                    isActive ? 'border-primary/30' : 'border-outline-variant/30 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-bold text-sm text-on-surface">{record.purpose}</h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                          v{record.version || '2.1'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-800'
                              : isRevoked
                              ? 'bg-rose-500/15 text-rose-800'
                              : 'bg-stone-500/15 text-stone-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{isActive ? 'Active' : isRevoked ? 'Revoked' : 'Expired'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                        <span>Grantee: <strong>{record.granteeId}</strong></span>
                      </p>
                    </div>

                    {/* 1-Click Revocation Action */}
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => handleRevoke(record.id, record.purpose)}
                        className="px-4 py-2 min-h-[44px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label={`Revoke access for ${record.purpose}`}
                      >
                        <span className="material-symbols-outlined text-base">block</span>
                        <span>Revoke Access</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-medium text-on-surface-variant text-right">
                        {isRevoked && (
                          <span className="text-rose-700 font-bold block">
                            Revoked: {new Date(record.revokedAt).toLocaleDateString()}
                          </span>
                        )}
                        <span>Granted: {new Date(record.grantedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Scopes & Privacy Notice */}
                  <div className="border-t border-outline-variant/15 pt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-on-surface-variant">Authorized Scopes:</span>
                      {record.scope.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                        >
                          {s === 'intake_redirect' && 'Intake Referral'}
                          {s === 'dietitian_share' && 'Dietitian Plan Sharing'}
                          {s === 'promoted_notifications' && 'Clinic Nudges'}
                          {s === 'telemetry_analytics' && 'Adherence Telemetry'}
                        </span>
                      ))}
                    </div>

                    <span className="text-[10px] text-on-surface-variant/80 font-medium">
                      Granted on {new Date(record.grantedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grant New Authorization Modal */}
      {isGrantModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="grant-modal-title"
        >
          <div className="bg-white rounded-3xl w-full max-w-lg border border-outline-variant/30 shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 id="grant-modal-title" className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">add_moderator</span>
                Authorize New Clinical Share
              </h3>
              <button
                type="button"
                onClick={() => setIsGrantModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface uppercase tracking-wider mb-1">
                  Purpose of Authorization
                </label>
                <input
                  required
                  type="text"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="e.g. Consult with Dietitian Sarah"
                  className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface uppercase tracking-wider mb-1">
                  Designated Clinic / Practitioner
                </label>
                <input
                  required
                  type="text"
                  value={newGrantee}
                  onChange={(e) => setNewGrantee(e.target.value)}
                  placeholder="e.g. Glycemic Wellness Clinic"
                  className="w-full bg-white border border-outline-variant rounded-xl p-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-on-surface uppercase tracking-wider">
                  Select Granular Scopes
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newScope.includes('intake_redirect')}
                      onChange={() => toggleScopeSelection('intake_redirect')}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div>
                      <div className="font-bold text-on-surface">Intake Referral Scope</div>
                      <div className="text-[11px] text-on-surface-variant">Allows clinic intake coordinator to view contact details for session booking.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newScope.includes('dietitian_share')}
                      onChange={() => toggleScopeSelection('dietitian_share')}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div>
                      <div className="font-bold text-on-surface">Dietitian Meal Plan Sharing</div>
                      <div className="text-[11px] text-on-surface-variant">Enables collaborative meal planning and smart recipe substitution reviews.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-base">info</span>
                <span>Authorizations are versioned (v2.1) and non-clinical. You can revoke access at any time from this dashboard.</span>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2.5 min-h-[44px] font-bold text-on-surface-variant hover:bg-surface-container rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 min-h-[44px] bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 shadow-sm cursor-pointer"
                >
                  Confirm & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConsentPermissionsDashboard;