import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_MAP = {
  care_reminder: 'Care reminder',
  self_service_nudge: 'Optional support notice',
  promoted_dietitian: 'Clinic editorial spotlight',
};

/**
 * WhyAmISeeingThisPanel - Patient Explainability & Transparency Panel
 *
 * Provides a clear, non-punitive, and accessible explanation of why an automated
 * prompt, care reminder, or promoted dietitian spotlight is being shown.
 *
 * Trust Invariants:
 * - Never claims a dietitian is a "best match", ranked, or algorithmically scored.
 * - Clearly distinguishes clinical care reminders from editorial spotlights.
 * - Always provides a direct, reversible path to manage preferences or privacy consents.
 * - Never displays private clinical telemetry or numerical metabolic targets.
 */
export const WhyAmISeeingThisPanel = ({
  isOpen = true,
  title = 'Why am I seeing this recommendation?',
  reason = 'Based on your self-managed meal planning and dietary preferences.',
  dataUsed = 'General meal planning occasions and active dietary preference tags.',
  consentRequired = false,
  consentStatus = 'active',
  shownBecause = 'self_service_nudge',
  isPromotedDietitian = false,
  onManagePreferences = null,
  onManageConsent = null,
  onClose = () => {},
}) => {
  const navigate = useNavigate();
  const closeButtonRef = useRef(null);

  const categoryLabel = CATEGORY_MAP[shownBecause] || CATEGORY_MAP.self_service_nudge;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePreferencesNavigation = () => {
    if (onManagePreferences) {
      onManagePreferences();
    } else {
      navigate('/settings/notifications');
      onClose();
    }
  };

  const handleConsentNavigation = () => {
    if (onManageConsent) {
      onManageConsent();
    } else {
      navigate('/settings/consent');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-am-i-seeing-this-title"
        aria-describedby="why-am-i-seeing-this-desc"
        className="bg-white rounded-3xl w-full max-w-lg border border-outline-variant/30 shadow-2xl p-6 space-y-5 animate-scale-up text-xs"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary" aria-hidden="true">
              <span className="material-symbols-outlined text-lg">info</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="why-am-i-seeing-this-title" className="font-display text-base font-bold text-primary">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {categoryLabel}
                </span>
              </div>
              <p id="why-am-i-seeing-this-desc" className="text-[11px] text-on-surface-variant mt-0.5">
                Transparent explanation of system suggestions and notices.
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Close explanation dialog"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Core Plain-Language Explanation */}
        <div className="space-y-3">
          <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/25 space-y-1.5">
            <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm" aria-hidden="true">
                lightbulb
              </span>
              <span>Reason for this notice</span>
            </h4>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              {reason}
            </p>
          </div>

          {/* Transparent Promoted Notice (Editorial Spotlight Invariant) */}
          {isPromotedDietitian && (
            <div className="p-3.5 bg-primary/5 rounded-2xl border border-primary/20 space-y-1">
              <div className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  verified
                </span>
                <span>Editorial Clinic Spotlight</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                This dietitian profile is curated and recommended by the clinic network. Recommendations are non-algorithmic and based on clinical specialty rather than automated profiling.
              </p>
            </div>
          )}

          {/* Data Used Breakdown */}
          <div className="space-y-1 p-3 rounded-xl border border-outline-variant/20">
            <span className="font-bold text-[11px] text-on-surface uppercase tracking-wider block">
              Information Used
            </span>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              {dataUsed}
            </p>
          </div>

          {/* Consent Status & Controls */}
          {consentRequired && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-outline-variant/30">
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-on-surface block">Data Sharing Authorization</span>
                <span className="text-[10px] text-on-surface-variant">
                  Current Status: <strong className="capitalize text-primary">{consentStatus}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleConsentNavigation}
                className="px-3 py-1.5 bg-white text-primary font-bold text-xs rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Manage Consent
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-2">
          <button
            type="button"
            onClick={handlePreferencesNavigation}
            className="text-[11px] font-bold text-primary hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              tune
            </span>
            <span>Adjust Notification & Privacy Preferences</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhyAmISeeingThisPanel;