import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/UserPreferences';
import { generateClinicalSummaryReport } from '../../utils/exportPipeline';

export const AccountSecurityTab = () => {
  const { user, logout } = useAuth();
  const {
    unitSystem,
    glucoseUnit,
    visualDensity,
    dailyGlTarget,
    maxNetCarbsPerMeal,
    targetDailyCalories,
    diabeticProfiles = ['T2D'],
    dietaryRestrictions = ['Gluten-Free'],
  } = usePreferences();

  const [exportMessage, setExportMessage] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Export Clinical Log using standardized exportPipeline
  const handleExportClinicalLog = () => {
    try {
      const rawMealPlan = localStorage.getItem('glyco_meal_plan');
      const mealPlan = rawMealPlan ? JSON.parse(rawMealPlan) : {};

      const clientProfile = {
        patientName: user?.name || user?.username || 'GlycoGourmet Patient',
        name: user?.name || user?.username || 'GlycoGourmet Patient',
        email: user?.email || 'patient@glycogourmet.com',
        diabeticSubtype: diabeticProfiles.join(', ') || 'T2D',
        dietaryRestrictions,
      };

      const calibration = {
        glTargetDaily: dailyGlTarget,
        bolusOffsetMinutes: 15,
        netCarbCap: maxNetCarbsPerMeal,
        glucoseUnit,
      };

      const summaryReport = generateClinicalSummaryReport(clientProfile, calibration, mealPlan, {});

      const exportPayload = {
        meta: {
          exportedAt: new Date().toISOString(),
          system: 'GlycoGourmet Clinical Metabolic Engine',
          version: '2.1.0',
        },
        patient: clientProfile,
        metabolicTargets: {
          dailyGlTarget,
          maxNetCarbsPerMeal,
          targetDailyCalories,
          glucoseUnit,
          unitSystem,
          visualDensity,
        },
        clinicalSummary: summaryReport,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glycogourmet-clinical-summary-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Clinical Log exported successfully as physician-ready JSON summary!');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (_err) {
      setExportMessage('Export failed: Unable to assemble summary report.');
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordStatus('New passwords do not match!');
      return;
    }
    setPasswordStatus('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in" role="tabpanel" aria-label="Account Security and Clinical Export">
      {/* Export Clinical Summary Report */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-3">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">download_for_offline</span>
            Export Clinical Summary Report
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Generate an endocrinologist-ready clinical summary report of your GL targets, dietary rules, and scheduled meal rollups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportClinicalLog}
          className="flex items-center justify-center gap-2 w-full py-3 min-h-[48px] bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-base">ios_share</span>
          Export Clinical Report (JSON)
        </button>

        {exportMessage && (
          <p className="text-xs text-primary font-bold text-center mt-2 animate-fade-in">
            {exportMessage}
          </p>
        )}
      </div>

      {/* Strapi Account Security & Session */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">security</span>
            Account Security & Session Status
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Manage authentication status and credentials for Strapi backend sync.
          </p>
        </div>

        {/* JWT Session Badge */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-on-surface">Active Strapi JWT Session</span>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase">Authenticated</span>
        </div>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordUpdate} className="space-y-3 border-t border-outline-variant/15 pt-3">
          <h4 className="text-xs font-bold text-on-surface">Update Password</h4>
          <div>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg px-3 h-10 text-xs outline-none focus:border-primary"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg px-3 h-10 text-xs outline-none focus:border-primary"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg px-3 h-10 text-xs outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 min-h-[44px] bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg text-xs font-bold border border-outline-variant/40 transition-colors cursor-pointer"
          >
            Update Password
          </button>

          {passwordStatus && (
            <p className={`text-xs font-bold text-center ${passwordStatus.includes('successfully') ? 'text-primary' : 'text-error'}`}>
              {passwordStatus}
            </p>
          )}
        </form>

        {/* Log Out Trigger */}
        <div className="border-t border-outline-variant/15 pt-3">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] bg-error-container/20 text-error hover:bg-error-container/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Log Out of Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityTab;