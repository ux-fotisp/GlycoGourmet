import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import SubscriptionUpgradeModal from '../dietitian/SubscriptionUpgradeModal';

/**
 * FeatureGate - Reusable SaaS subscription tier gate and upsell wrapper.
 */
export const FeatureGate = ({
  requiredTier = 'CLINIC_PRO',
  featureName = 'Premium Feature',
  description,
  fallbackType = 'upsellOverlay', // 'hide' | 'disable' | 'upsellOverlay'
  children,
  onTriggerUpsell,
}) => {
  const permissions = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTier = permissions?.clinicTier || 'INDEPENDENT';
  const role = permissions?.role;

  // Check if current subscription satisfies tier requirement
  const isUnlocked = (() => {
    if (role === 'super_admin') return true;
    if (requiredTier === 'INDEPENDENT') return true;
    if (requiredTier === 'CLINIC_PRO') {
      return currentTier === 'CLINIC_PRO' || currentTier === 'ENTERPRISE';
    }
    if (requiredTier === 'ENTERPRISE') {
      return currentTier === 'ENTERPRISE';
    }
    return false;
  })();

  if (isUnlocked) {
    return <>{children}</>;
  }

  // Handle fallback behaviors
  if (fallbackType === 'hide') {
    return null;
  }

  if (fallbackType === 'disable') {
    return (
      <div 
        className="relative inline-flex items-center cursor-not-allowed group"
        title={`${featureName} requires ${requiredTier.replace('_', ' ')} tier.`}
      >
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-bg text-amber-text border border-amber-text/30 flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[10px]">lock</span>
        </span>
      </div>
    );
  }

  // Default: 'upsellOverlay' mode
  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTriggerUpsell) {
      onTriggerUpsell();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div 
        className="relative inline-block cursor-pointer group"
        onClickCapture={handleOverlayClick}
      >
        {children}
        {/* Subtle lock indicator */}
        <span 
          title={`Click to unlock ${featureName} (${requiredTier.replace('_', ' ')})`}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform"
        >
          <span className="material-symbols-outlined text-[10px]">lock</span>
        </span>
      </div>

      <SubscriptionUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requiredTier={requiredTier}
        featureName={featureName}
        description={description}
      />
    </>
  );
};

export default FeatureGate;
