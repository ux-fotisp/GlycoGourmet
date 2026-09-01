import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import MetabolicTargetsTab from '../components/settings/MetabolicTargetsTab';
import MeasurementDensityTab from '../components/settings/MeasurementDensityTab';
import DiabeticRulesTab from '../components/settings/DiabeticRulesTab';
import AccountSecurityTab from '../components/settings/AccountSecurityTab';
import ConsentPermissionsDashboard from '../components/patient/ConsentPermissionsDashboard';
import NotificationGovernancePanel from '../components/patient/NotificationGovernancePanel';

export const Settings = ({ initialTab = null }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { role, canManageClinic } = usePermissions();

  const resolveActiveTab = () => {
    if (initialTab) return initialTab;
    const path = location.pathname.toLowerCase();
    if (path.includes('/settings/consent')) return 'consent';
    if (path.includes('/settings/notifications')) return 'notifications';

    const tabParam = searchParams.get('tab');
    if (tabParam && ['metabolic', 'clinical', 'diet', 'consent', 'notifications', 'account'].includes(tabParam)) {
      return tabParam;
    }
    return 'metabolic';
  };

  const [activeTab, setActiveTab] = useState(resolveActiveTab);

  useEffect(() => {
    setActiveTab(resolveActiveTab());
  }, [location.pathname, searchParams, initialTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0">
      {/* Header with Role Badge & Verification Status */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-primary">
              Metabolic & Profile Control Center
            </h2>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-bold"
              title={`Clinical Role: ${role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Clinical Role: <span className="capitalize">{role || 'user'}</span></span>
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Configure glycemic targets, measurement formats, privacy consents, notifications, and clinical exports.
          </p>
        </div>

        {/* Administrative Quick Links (React Router SPA Links) */}
        <div className="flex items-center gap-2">
          {(user?.roleType || '').toLowerCase() === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              title="Open Strapi Admin Panel for User Audits"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Admin Panel</span>
            </Link>
          )}

          {canManageClinic && (
            <Link
              to="/clinic-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high text-primary font-bold text-xs rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-all cursor-pointer shadow-xs"
              title="Open Clinic Administration Portal"
            >
              <span className="material-symbols-outlined text-base">corporate_fare</span>
              <span>Clinic Portal</span>
            </Link>
          )}
        </div>
      </header>

      {/* Tab Controls (6 Accessible Sections) */}
      <div className="flex flex-wrap border-b border-outline-variant/30 gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'metabolic'}
          onClick={() => handleTabChange('metabolic')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'metabolic'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitoring</span>
          Section A: Targets
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'clinical'}
          onClick={() => handleTabChange('clinical')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'clinical'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Section B: Preferences & Density
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'diet'}
          onClick={() => handleTabChange('diet')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'diet'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">medical_services</span>
          Section C: Diabetic & Dietary Rules
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'consent'}
          onClick={() => handleTabChange('consent')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'consent'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shield_lock</span>
          Section D: Permissions & Consent
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          onClick={() => handleTabChange('notifications')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          Section E: Notifications
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'account'}
          onClick={() => handleTabChange('account')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'account'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          Section F: Export & Account
        </button>
      </div>

      {/* Tab Panels */}
      <section className="mt-2">
        {activeTab === 'metabolic' && <MetabolicTargetsTab />}
        {activeTab === 'clinical' && <MeasurementDensityTab />}
        {activeTab === 'diet' && <DiabeticRulesTab />}
        {activeTab === 'consent' && <ConsentPermissionsDashboard />}
        {activeTab === 'notifications' && <NotificationGovernancePanel />}
        {activeTab === 'account' && <AccountSecurityTab />}
      </section>
    </main>
  );
};

export default Settings;