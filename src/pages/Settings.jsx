import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/UserPreferences';

export const Settings = () => {
  const { user, setPreferences } = useAuth();
  const { unitSystem, glucoseUnit, visualDensity, setSettings } = usePreferences();
  const [activeTab, setActiveTab] = useState('visuals'); // 'visuals' | 'medical'

  // Hour-based restrictions state (mock tracking for glycemic curfews)
  const [restrictStart, setRestrictStart] = useState('08:00');
  const [restrictEnd, setRestrictEnd] = useState('20:00');
  const [isCurfewEnabled, setIsCurfewEnabled] = useState(true);

  const handleSettingChange = (key, value) => {
    setSettings({ [key]: value });
  };

  const handlePreferenceToggle = (pref) => {
    const current = user?.preferences || [];
    const updated = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref];
    setPreferences(updated);
  };

  const categories = [
    'Type 1 Diabetic',
    'Type 2 Diabetic',
    'Pre-Diabetic',
    'Low GI',
    'Low Sugar',
    'High Fiber',
    'High Protein',
    'Keto-Friendly',
    'Low Sodium'
  ];

  return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0">
        
        {/* Header */}
        <header>
          <h2 className="font-display text-2xl font-bold text-primary">
            Profile Settings & Preferences
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Configure local localization settings, accessibility density, and medical warning configurations.
          </p>
        </header>

        {/* Tab Controls */}
        <div className="flex border-b border-outline-variant/30">
          <button
            onClick={() => setActiveTab('visuals')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'visuals'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Tab A: Account & Visuals
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'medical'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Tab B: Medical & Diet Rules
          </button>
        </div>

        {/* Tab Panels */}
        <section className="flex-grow max-w-2xl">
          {activeTab === 'visuals' ? (
            <div className="space-y-6 animate-fade-in">
              {/* Unit System selection */}
              <div className="bento-cell space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Measurement Unit System</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Choose how ingredient quantities and dry/wet measurements are calculated.
                  </p>
                </div>
                <div className="inline-flex bg-surface-container-high p-1 rounded-full w-full">
                  <button
                    onClick={() => handleSettingChange('unitSystem', 'imperial')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      unitSystem === 'imperial'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    Imperial (oz, cups)
                  </button>
                  <button
                    onClick={() => handleSettingChange('unitSystem', 'metric')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      unitSystem === 'metric'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    Metric (g, ml)
                  </button>
                </div>
              </div>

              {/* Glucose display unit selection */}
              <div className="bento-cell space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Glucose Reading Format</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Convert target glucose thresholds into your localized medical format.
                  </p>
                </div>
                <div className="inline-flex bg-surface-container-high p-1 rounded-full w-full">
                  <button
                    onClick={() => handleSettingChange('glucoseUnit', 'mgdl')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      glucoseUnit === 'mgdl'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    mg/dL (US Standard)
                  </button>
                  <button
                    onClick={() => handleSettingChange('glucoseUnit', 'mmoll')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      glucoseUnit === 'mmoll'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    mmol/L (International Standard)
                  </button>
                </div>
              </div>

              {/* Layout Visual Density */}
              <div className="bento-cell space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Visual Density Layout</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Enable compact row sizes to squeeze more recipe details inside visual viewports.
                  </p>
                </div>
                <div className="inline-flex bg-surface-container-high p-1 rounded-full w-full">
                  <button
                    onClick={() => handleSettingChange('visualDensity', 'comfortable')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      visualDensity === 'comfortable'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    Comfortable Grid spacing
                  </button>
                  <button
                    onClick={() => handleSettingChange('visualDensity', 'compact')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      visualDensity === 'compact'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-white/40'
                    }`}
                  >
                    High-Density Compact Grid
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Tab B: Medical & Diet Rules
            <div className="space-y-6 animate-fade-in">
              {/* Medical Taxonomy multi-select */}
              <div className="bento-cell space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Dietary & Health Profile Filters</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Select target categories to filter recipes automatically.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map(pref => {
                    const isSelected = (user?.preferences || []).includes(pref);
                    return (
                      <div
                        key={pref}
                        onClick={() => handlePreferenceToggle(pref)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold'
                            : 'bg-white border-outline-variant/45 text-on-surface-variant hover:bg-surface-container-low/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span className="text-xs">{pref}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glycemic Curfews (Hour-based restrictions) */}
              <div className="bento-cell space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Glycemic Curfew Restrictions</h3>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Restrict high carbs consumption outside active digestion hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCurfewEnabled(prev => !prev)}
                    className={`material-symbols-outlined text-xl cursor-pointer ${isCurfewEnabled ? 'text-primary' : 'text-on-surface-variant/40'}`}
                  >
                    {isCurfewEnabled ? 'toggle_on' : 'toggle_off'}
                  </button>
                </div>

                {isCurfewEnabled && (
                  <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/15 pt-3 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Active Digestion Start
                      </label>
                      <input
                        type="time"
                        value={restrictStart}
                        onChange={(e) => setRestrictStart(e.target.value)}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 h-10 outline-none focus:border-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Curfew Curbs Active
                      </label>
                      <input
                        type="time"
                        value={restrictEnd}
                        onChange={(e) => setRestrictEnd(e.target.value)}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 h-10 outline-none focus:border-primary text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </main>
  );
};

export default Settings;
