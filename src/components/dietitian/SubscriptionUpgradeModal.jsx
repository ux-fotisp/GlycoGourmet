import React from 'react';

/**
 * SubscriptionUpgradeModal - Standardized SaaS feature lock & upsell dialog.
 */
export const SubscriptionUpgradeModal = ({
  isOpen,
  onClose,
  requiredTier = 'ENTERPRISE',
  featureName = 'Enterprise Feature',
  description,
  onUpgradeClick,
}) => {
  if (!isOpen) return null;

  const defaultDescriptions = {
    'Bulk EHR (FHIR) Export': 'Bulk HL7 FHIR exports are only available on the Enterprise tier. Upgrade your clinic’s workspace to streamline hospital EHR and clinical data integration.',
    'Predictive Postprandial Analytics': 'Deterministic 2-hour excursion curves and pharmacokinetic modeling require Clinic Pro or Enterprise tier.',
    'Clinical Asset Sharing': 'Publishing standardized templates and substitution rules to your clinic network requires Clinic Pro or Enterprise tier.',
  };

  const bodyText =
    description ||
    defaultDescriptions[featureName] ||
    `${featureName} is an exclusive capability for ${requiredTier.replace('_', ' ')} subscriptions. Upgrade your workspace to unlock clinical standardization.`;

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      alert(`Routing to Enterprise Billing & Tier Upgrades for ${requiredTier}...`);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans text-[#1A2118]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Hero */}
        <div className="p-6 bg-gradient-to-br from-[#1B3B22] to-[#2E5C38] text-white space-y-3 relative">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-2xl text-white">workspace_premium</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
              {requiredTier.replace('_', ' ')} SUBSCRIPTION REQUIRED
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-0.5">
              Unlock {featureName}
            </h2>
          </div>
        </div>

        {/* Body Text & Benefits */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-stone-600 leading-relaxed">
            {bodyText}
          </p>

          {/* Value Callout Badges */}
          <div className="space-y-2 bg-[#F6F4EE] p-4 rounded-2xl border border-stone-200/80">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              What's Included in {requiredTier.replace('_', ' ')}:
            </div>
            <ul className="space-y-2 text-xs text-stone-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sage-text text-[16px]">check_circle</span>
                <span>Automated HL7/FHIR R4 bulk export & sync</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sage-text text-[16px]">check_circle</span>
                <span>Deterministic kinetic glucose forecasting</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sage-text text-[16px]">check_circle</span>
                <span>Unlimited practitioner seats & cross-roster oversight</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F6F4EE] border-t border-stone-200 flex justify-end gap-3 items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-stone-600 hover:bg-stone-200 rounded-full text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            className="px-6 py-2.5 bg-primary text-white font-extrabold text-xs rounded-full hover:bg-primary-variant transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">upgrade</span>
            View Upgrade Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpgradeModal;
