import React, { useState } from 'react';
import WhyAmISeeingThisPanel from './WhyAmISeeingThisPanel';

/**
 * RedirectNudgeCard - Compassionate & Non-Punitive Professional Support Nudge
 *
 * Provides a respectful, voluntary invitation for patients to explore certified dietitian
 * consultation while maintaining total self-service autonomy.
 *
 * Non-Negotiable Persona Invariants (Fotis):
 * - Never implies diagnosis, clinical failure, non-compliance, or urgency.
 * - Dismissal / deferral ("Keep managing my plan") never disables or restricts self-service features.
 * - Explanations are transparent and accessible via WhyAmISeeingThisPanel.
 * - No algorithmic-scoring, ranked-card, or swipe-matching interactions.
 */
export const RedirectNudgeCard = ({
  title = 'Optional Dietitian Support',
  description = "You can keep managing your plan yourself. If you'd like extra guidance, a certified dietitian can collaborate with you to review meal schedules and glycemic balance.",
  triggerReason = 'Multiple custom ingredient swaps and complex meal schedules applied.',
  onKeepManaging = null,
  onExploreDietitians = null,
  onRequestSession = null,
  onWhyAmISeeingThis = null,
  explanationData = null,
  actionLabel = 'Explore Dietitian Consultations',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleKeepManaging = () => {
    setIsDismissed(true);
    if (onKeepManaging) {
      onKeepManaging();
    }
  };

  const handleConsultAction = () => {
    if (onRequestSession) {
      onRequestSession();
    } else if (onExploreDietitians) {
      onExploreDietitians();
    }
  };

  const handleWhyClick = () => {
    if (onWhyAmISeeingThis) {
      onWhyAmISeeingThis();
    } else {
      setIsExplanationOpen(true);
    }
  };

  const resolvedExplanation = {
    title: 'Why am I seeing this consultation option?',
    reason: triggerReason || 'Suggested as an optional resource based on your recent meal planning patterns.',
    dataUsed: 'General self-service planning patterns and active dietary restrictions.',
    consentRequired: false,
    shownBecause: 'self_service_nudge',
    isPromotedDietitian: false,
    ...explanationData,
  };

  return (
    <>
      <aside
        className="w-full bg-surface-container-low border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in"
        aria-label="Optional Dietitian Support Opportunity"
        role="region"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5" aria-hidden="true">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-primary">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Voluntary Collaboration
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleWhyClick}
            className="text-[11px] font-bold text-primary hover:underline underline-offset-2 flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-center"
            aria-label="Why am I seeing this recommendation?"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              help_outline
            </span>
            <span>Why am I seeing this?</span>
          </button>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-outline-variant/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleKeepManaging}
            className="px-4 py-2.5 min-h-[44px] bg-white hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl border border-outline-variant/40 transition-colors cursor-pointer text-center"
          >
            Keep managing my plan
          </button>

          <button
            type="button"
            onClick={handleConsultAction}
            className="px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              calendar_month
            </span>
            <span>{actionLabel}</span>
          </button>
        </div>
      </aside>

      {/* Internal Explainability Dialog */}
      {isExplanationOpen && (
        <WhyAmISeeingThisPanel
          isOpen={isExplanationOpen}
          {...resolvedExplanation}
          onClose={() => setIsExplanationOpen(false)}
        />
      )}
    </>
  );
};

export default RedirectNudgeCard;