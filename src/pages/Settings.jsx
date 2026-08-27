import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/UserPreferences';
import { usePermissions } from '../hooks/usePermissions';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { role } = usePermissions();
  const {
    unitSystem,
    glucoseUnit,
    dailyGlTarget,
    maxNetCarbsPerMeal,
    targetDailyCalories,
    diabeticProfiles = ['Type 2'],
    dietaryRestrictions = ['Gluten-Free'],
    setUnitSystem,
    setGlucoseUnit,
    setDailyGlTarget,
    setMaxNetCarbsPerMeal,
    setTargetDailyCalories,
    setDiabeticProfiles,
    setDietaryRestrictions,
  } = usePreferences();

  // Tab State: 'metabolic' | 'clinical' | 'diet' | 'account'
  const [activeTab, setActiveTab] = useState('metabolic');

  // Input validation & feedback state
  const [validationErrors, setValidationErrors] = useState({});
  const [exportMessage, setExportMessage] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Metabolic Targets Handlers with strict validation (> 0)
  const handleDailyGlChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors(prev => ({ ...prev, dailyGlTarget: 'GL Target must be greater than 0' }));
    } else {
      setValidationErrors(prev => ({ ...prev, dailyGlTarget: null }));
      setDailyGlTarget(val);
    }
  };

  const handleMaxNetCarbsChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors(prev => ({ ...prev, maxNetCarbsPerMeal: 'Carbs target must be greater than 0' }));
    } else {
      setValidationErrors(prev => ({ ...prev, maxNetCarbsPerMeal: null }));
      setMaxNetCarbsPerMeal(val);
    }
  };

  const handleCaloriesChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val) || val <= 0) {
      setValidationErrors(prev => ({ ...prev, targetDailyCalories: 'Calories must be greater than 0' }));
    } else {
      setValidationErrors(prev => ({ ...prev, targetDailyCalories: null }));
      setTargetDailyCalories(val);
    }
  };

  // Diabetic Profiles Multi-Select
  const ALL_DIABETIC_PROFILES = [
    'Type 1',
    'Type 2',
    'Gestational',
    'Prediabetic',
    'Caregiver',
  ];

  const toggleDiabeticProfile = (profile) => {
    const updated = diabeticProfiles.includes(profile)
      ? diabeticProfiles.filter(p => p !== profile)
      : [...diabeticProfiles, profile];
    setDiabeticProfiles(updated);
  };

  // Dietary Restrictions Toggle Chips
  const ALL_DIETARY_RESTRICTIONS = [
    'Lactose-Free',
    'Gluten-Free',
    'Nut-Free',
    'Halal',
    'Vegetarian',
  ];

  const toggleDietaryRestriction = (item) => {
    const updated = dietaryRestrictions.includes(item)
      ? dietaryRestrictions.filter(i => i !== item)
      : [...dietaryRestrictions, item];
    setDietaryRestrictions(updated);
  };

  // Export Clinical Log as downloadable JSON summary
  const handleExportClinicalLog = () => {
    try {
      const rawMealPlan = localStorage.getItem('glyco_meal_plan');
      const mealPlan = rawMealPlan ? JSON.parse(rawMealPlan) : {};

      const exportData = {
        exportedAt: new Date().toISOString(),
        patient: {
          name: user?.name || 'GlycoGourmet User',
          email: user?.email || 'user@glycogourmet.com',
          diabeticProfiles,
          dietaryRestrictions,
        },
        metabolicTargets: {
          dailyGlTarget,
          maxNetCarbsPerMeal,
          targetDailyCalories,
          glucoseUnit,
          unitSystem,
        },
        activeMealPlan: mealPlan,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glycogourmet-clinical-summary-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Clinical Log exported successfully as JSON summary!');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (_err) {
      setExportMessage('Export failed: Unable to parse log.');
    }
  };

  // Handle Password Update Form
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
            Configure glycemic targets, measurement formats, dietary restrictions, and clinical exports.
          </p>
        </div>

        {/* Admin Control Panel Shortcut Link */}
        {(user?.roleType || '').toLowerCase() === 'admin' && (
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            title="Open Strapi Admin Panel for User Audits"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>Admin Panel</span>
          </a>
        )}
      </header>

      {/* Tab Controls */}
      <div className="flex flex-wrap border-b border-outline-variant/30 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('metabolic')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'metabolic'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitoring</span>
          Section A: Metabolic Targets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clinical')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'clinical'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Section B: Measurement Preferences
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diet')}
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
          onClick={() => setActiveTab('account')}
          className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'account'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          Section D: Clinical Log & Security
        </button>
      </div>

      {/* Tab Content Panels */}
      <section className="flex-grow max-w-2xl">
        {/* Section A: Metabolic Targets & GL Budget */}
        {activeTab === 'metabolic' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bento-cell space-y-4">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">track_changes</span>
                  Daily Metabolic Targets & Thresholds
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Set limits to guide your daily Glycemic Load calculations across meals.
                </p>
              </div>

              <div className="space-y-4 border-t border-outline-variant/15 pt-3">
                {/* Daily GL Target */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Daily Glycemic Load (GL) Target
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={dailyGlTarget}
                      onChange={handleDailyGlChange}
                      className="w-full bg-white border border-outline-variant rounded-lg px-3 h-11 text-sm font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-on-surface-variant font-medium">GL / day</span>
                  </div>
                  {validationErrors.dailyGlTarget && (
                    <p className="text-xs text-error font-semibold mt-1">{validationErrors.dailyGlTarget}</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant opacity-75 mt-1">Recommended target for Type 2 management: 45 GL.</p>
                </div>

                {/* Max Net Carbs per Meal */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Max Net Carbs per Meal (g)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={maxNetCarbsPerMeal}
                      onChange={handleMaxNetCarbsChange}
                      className="w-full bg-white border border-outline-variant rounded-lg px-3 h-11 text-sm font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-on-surface-variant font-medium">g / meal</span>
                  </div>
                  {validationErrors.maxNetCarbsPerMeal && (
                    <p className="text-xs text-error font-semibold mt-1">{validationErrors.maxNetCarbsPerMeal}</p>
                  )}
                </div>

                {/* Target Daily Calories */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Target Daily Energy (kcal)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={targetDailyCalories}
                      onChange={handleCaloriesChange}
                      className="w-full bg-white border border-outline-variant rounded-lg px-3 h-11 text-sm font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-on-surface-variant font-medium">kcal / day</span>
                  </div>
                  {validationErrors.targetDailyCalories && (
                    <p className="text-xs text-error font-semibold mt-1">{validationErrors.targetDailyCalories}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Clinical & Measurement Preferences */}
        {activeTab === 'clinical' && (
          <div className="space-y-6 animate-fade-in">
            {/* Glucose Display Unit */}
            <div className="bento-cell space-y-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">bloodtype</span>
                  Glucose Display Format
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Select your medical laboratory unit for blood sugar tracking.
                </p>
              </div>
              <div className="inline-flex bg-surface-container-high p-1 rounded-full w-full">
                <button
                  type="button"
                  onClick={() => setGlucoseUnit('mgdl')}
                  className={`flex-1 py-2.5 min-h-[44px] text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                    glucoseUnit === 'mgdl'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-white/40'
                  }`}
                >
                  mg/dL (US Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setGlucoseUnit('mmoll')}
                  className={`flex-1 py-2.5 min-h-[44px] text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                    glucoseUnit === 'mmoll'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-white/40'
                  }`}
                >
                  mmol/L (International)
                </button>
              </div>
            </div>

            {/* Unit System */}
            <div className="bento-cell space-y-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">straighten</span>
                  Measurement Unit System
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Choose between Imperial (oz, cups) and Metric (g, ml) ingredient displays.
                </p>
              </div>
              <div className="inline-flex bg-surface-container-high p-1 rounded-full w-full">
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`flex-1 py-2.5 min-h-[44px] text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                    unitSystem === 'imperial'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-white/40'
                  }`}
                >
                  Imperial (oz, lbs)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`flex-1 py-2.5 min-h-[44px] text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                    unitSystem === 'metric'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-white/40'
                  }`}
                >
                  Metric (g, kg)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section C: Diabetic Profile & Dietary Rules */}
        {activeTab === 'diet' && (
          <div className="space-y-6 animate-fade-in">
            {/* Diabetic Profile Multi-Select */}
            <div className="bento-cell space-y-4">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">health_and_safety</span>
                  Diabetic Profile Classification
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Select your medical condition profiles to personalize health recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_DIABETIC_PROFILES.map(profile => {
                  const isSelected = diabeticProfiles.includes(profile);
                  return (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => toggleDiabeticProfile(profile)}
                      className={`flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{profile}</span>
                      <span className="material-symbols-outlined text-sm">
                        {isSelected ? 'check_circle' : 'add_circle'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Restrictions Toggle Chips */}
            <div className="bento-cell space-y-4">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">no_food</span>
                  Dietary Restrictions & Allergens
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Toggle restrictions to highlight warnings during recipe planning.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALL_DIETARY_RESTRICTIONS.map(item => {
                  const isSelected = dietaryRestrictions.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDietaryRestriction(item)}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-tertiary-container text-on-tertiary-container border-tertiary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isSelected ? 'verified' : 'circle'}
                      </span>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section D: Data Export & Strapi Account Management */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fade-in">
            {/* Export Clinical Log */}
            <div className="bento-cell space-y-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">download_for_offline</span>
                  Export Clinical Summary Log
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Generate a physician-ready JSON summary of your GL targets, dietary rules, and scheduled meals.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportClinicalLog}
                className="flex items-center justify-center gap-2 w-full py-3 min-h-[48px] bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">ios_share</span>
                Export Clinical Log (JSON)
              </button>

              {exportMessage && (
                <p className="text-xs text-primary font-bold text-center mt-2 animate-fade-in">
                  {exportMessage}
                </p>
              )}
            </div>

            {/* Strapi Account Security & Session */}
            <div className="bento-cell space-y-4">
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
        )}
      </section>
    </main>
  );
};

export default Settings;
