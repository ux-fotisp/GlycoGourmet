import React, { useState } from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const NotificationGovernancePanel = () => {
  const { notificationPreferences, setNotificationPreferences } = usePreferences();
  const [saveStatus, setSaveStatus] = useState('');

  const care = notificationPreferences?.careReminders || {
    enabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  };

  const promo = notificationPreferences?.promotedDietitians || {
    enabled: false,
    frequencyCap: 'weekly',
  };

  const showSaveConfirmation = (msg) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleCareToggle = () => {
    const updated = !care.enabled;
    setNotificationPreferences((prev) => ({
      ...prev,
      careReminders: {
        ...care,
        enabled: updated,
      },
    }));
    showSaveConfirmation(`Care Reminders ${updated ? 'enabled' : 'disabled'}`);
  };

  const handleQuietHoursStartChange = (e) => {
    const val = e.target.value;
    setNotificationPreferences((prev) => ({
      ...prev,
      careReminders: {
        ...care,
        quietHoursStart: val,
      },
    }));
    showSaveConfirmation('Quiet hours updated');
  };

  const handleQuietHoursEndChange = (e) => {
    const val = e.target.value;
    setNotificationPreferences((prev) => ({
      ...prev,
      careReminders: {
        ...care,
        quietHoursEnd: val,
      },
    }));
    showSaveConfirmation('Quiet hours updated');
  };

  const handlePromoToggle = () => {
    const updated = !promo.enabled;
    setNotificationPreferences((prev) => ({
      ...prev,
      promotedDietitians: {
        ...promo,
        enabled: updated,
      },
    }));
    showSaveConfirmation(`Dietitian discoveries ${updated ? 'enabled' : 'disabled'}`);
  };

  const handleFrequencyCapChange = (e) => {
    const val = e.target.value;
    setNotificationPreferences((prev) => ({
      ...prev,
      promotedDietitians: {
        ...promo,
        frequencyCap: val,
      },
    }));
    showSaveConfirmation(`Delivery frequency set to ${val}`);
  };

  return (
    <section className="space-y-6 animate-fade-in" aria-label="Notification Governance Panel">
      {/* Overview Card */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-2">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          Notification & Focus Preferences
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Customize timely clinical care reminders and optional dietitian spotlights. Set quiet hours to keep nocturnal rest uninterrupted.
        </p>

        {saveStatus && (
          <div role="status" className="p-2.5 bg-emerald-500/15 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Metabolic Care Reminders */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/15 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">alarm</span>
                Metabolic Care Reminders
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Clinical Priority
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Circadian meal-timing prompts and pre-meal insulin bolus offset countdowns.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={care.enabled}
            onClick={handleCareToggle}
            className={`relative inline-flex h-8 w-14 min-w-[56px] min-h-[32px] items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              care.enabled ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant'
            }`}
            aria-label="Toggle Metabolic Care Reminders"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                care.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Quiet Hours */}
        {care.enabled && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <h5 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-on-surface-variant">bedtime</span>
              Daily Quiet Hours (No Sound / Vibrations)
            </h5>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Reminders will be silenced during this nocturnal period to prevent dawn-time sleep disruption.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={care.quietHoursStart || '22:00'}
                  onChange={handleQuietHoursStartChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={care.quietHoursEnd || '07:00'}
                  onChange={handleQuietHoursEndChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono font-bold text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promoted Dietitian & Clinic Discoveries */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/15 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">recommend</span>
                Dietitian & Clinic Discoveries
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                Optional Discovery
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Transparently labeled spotlights of certified clinical dietitians and low-GI recipes.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={promo.enabled}
            onClick={handlePromoToggle}
            className={`relative inline-flex h-8 w-14 min-w-[56px] min-h-[32px] items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              promo.enabled ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant'
            }`}
            aria-label="Toggle Dietitian and Clinic Discoveries"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                promo.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Frequency Cap */}
        {promo.enabled && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <h5 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-on-surface-variant">tune</span>
              Maximum Delivery Frequency
            </h5>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Caps how often discovery spotlights may be delivered.
            </p>

            <div className="max-w-xs">
              <select
                value={promo.frequencyCap || 'weekly'}
                onChange={handleFrequencyCapChange}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer"
                aria-label="Select promotion frequency cap"
              >
                <option value="daily">At most 1 per Day</option>
                <option value="weekly">At most 1 per Week (Recommended)</option>
                <option value="biweekly">At most 1 every 2 Weeks</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NotificationGovernancePanel;