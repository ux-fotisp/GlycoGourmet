import React, { useState, useEffect } from 'react';
import { getNotificationPermission, requestNotificationPermission } from '../../utils/notificationEngine';

/**
 * NotificationOptIn — Patient pre-meal bolus reminder permission opt-in card.
 */
export const NotificationOptIn = () => {
  const [permission, setPermission] = useState(() => getNotificationPermission());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  // If already granted or dismissed, hide card
  if (permission === 'granted' || permission === 'unsupported' || isDismissed) {
    return null;
  }

  return (
    <article 
      role="region"
      aria-label="Clinical Notification Opt-In"
      className="bg-[#F6F4EE] border-2 border-primary/40 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 font-sans text-[#1A2118] animate-fade-in"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-2xl">notifications_active</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-extrabold text-primary">
              Enable Clinical Timers
            </h3>
            <span className="bg-sage-bg text-sage-text border border-sage-text/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Bolus Accuracy
            </span>
          </div>
          
          <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
            Accurate insulin timing prevents blood sugar spikes. Allow notifications so we can remind you exactly when to pre-bolus before your scheduled meals.
          </p>

          {permission === 'denied' && (
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-text pt-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Notifications are blocked in your browser settings.</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-xs font-bold text-stone-500 hover:text-stone-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          Dismiss
        </button>

        {permission !== 'denied' && (
          <button
            type="button"
            onClick={handleEnable}
            className="px-5 py-2.5 bg-primary text-white hover:bg-primary-variant rounded-2xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            Enable Notifications
          </button>
        )}
      </div>
    </article>
  );
};

export default NotificationOptIn;
