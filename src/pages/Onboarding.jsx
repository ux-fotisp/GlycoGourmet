import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const DIETARY_OPTIONS = [
  { id: 't1d',       label: 'Type 1 Diabetic',    desc: 'Focus on insulin sensitivity & precise carb loads', icon: 'water_drop' },
  { id: 't2d',       label: 'Type 2 Diabetic',    desc: 'Focus on slowing absorption & low glycemic loads',  icon: 'monitor_heart' },
  { id: 'pred',      label: 'Pre-Diabetic',        desc: 'Focus on balanced macros & lifestyle control',      icon: 'trending_down' },
  { id: 'keto',      label: 'Keto-Friendly Focus', desc: 'Minimal carb counts & healthy fat replacement',     icon: 'local_fire_department' },
  { id: 'low-na',    label: 'Low Sodium Focus',    desc: 'Cardiovascular safety & flavor optimization',       icon: 'favorite' },
  { id: 'hi-fiber',  label: 'High Fiber Focus',    desc: 'Excellent prebiotic load & delayed digestion',      icon: 'grass' },
];

// Single-select toggle row
const SegmentRow = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{label}</p>
    <div className="inline-flex bg-surface-container-high p-1 rounded-full gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-lowest'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
    {options.find(o => o.value === value)?.desc && (
      <p className="text-[10px] text-on-surface-variant mt-1 ml-1">
        {options.find(o => o.value === value).desc}
      </p>
    )}
  </div>
);

export const Onboarding = () => {
  const { setPreferences, setSettings } = useAuth();
  const navigate = useNavigate();

  const [selectedPrefs, setSelectedPrefs] = useState([]);
  const [unitSystem,    setUnitSystem]    = useState('imperial');
  const [glucoseUnit,   setGlucoseUnit]   = useState('mgdl');
  const [visualDensity, setVisualDensity] = useState('comfortable');

  const handleToggle = (label) => {
    setSelectedPrefs(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  const _save = () => {
    setPreferences(selectedPrefs);
    setSettings({ unitSystem, glucoseUnit, visualDensity });
  };

  const handleSave = () => {
    _save();
    navigate('/');
  };

  const handleSkip = () => {
    setPreferences([]);
    setSettings({ unitSystem: 'imperial', glucoseUnit: 'mgdl', visualDensity: 'comfortable' });
    navigate('/');
  };

  return (
    <main className="min-h-screen w-full bg-surface flex items-center justify-center p-edge-margin">
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/35 max-w-2xl w-full flex flex-col gap-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            Welcome to GlycoGourmet!
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Let's personalize your experience. Configure your health profile and display preferences below.
          </p>
        </div>

        {/* ── Section 1: Dietary profile ── */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            My Dietary Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DIETARY_OPTIONS.map((opt) => {
              const isSelected = selectedPrefs.includes(opt.label);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggle(opt.label)}
                  className={`pref-card text-center flex flex-col justify-between items-center gap-2 hover:bg-surface-container-low/30 ${
                    isSelected ? 'pref-card--selected' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-on-surface-variant/45'}`}
                      style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                      {opt.icon}
                    </span>
                    <span className="font-label-md font-bold text-sm text-on-surface">{opt.label}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 2: Localization ── */}
        <section className="border-t border-outline-variant/20 pt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            Units & Display
          </h3>

          <SegmentRow
            label="Measurement System"
            value={unitSystem}
            onChange={setUnitSystem}
            options={[
              { value: 'imperial', label: 'Imperial', desc: 'oz, lbs, cups — common in the US' },
              { value: 'metric',   label: 'Metric',   desc: 'g, ml, kg — common in EU/UK' },
            ]}
          />

          <SegmentRow
            label="Blood Glucose Display Unit"
            value={glucoseUnit}
            onChange={setGlucoseUnit}
            options={[
              { value: 'mgdl',  label: 'mg/dL',  desc: 'Standard in the United States' },
              { value: 'mmoll', label: 'mmol/L',  desc: 'Standard in Europe & UK (÷ 18)' },
            ]}
          />
        </section>

        {/* ── Section 3: Visual Accessibility ── */}
        <section className="border-t border-outline-variant/20 pt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            Visual Accessibility
          </h3>

          <SegmentRow
            label="Recipe Grid Density"
            value={visualDensity}
            onChange={setVisualDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable', desc: 'Larger cards — easier for visual impairments' },
              { value: 'compact',     label: 'High-Density', desc: 'More recipes visible at once' },
            ]}
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-outline-variant/20">
          <Button onClick={handleSave} className="flex-1 font-bold h-12">
            Get Started
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="px-6 font-semibold">
            Skip for Now
          </Button>
        </div>

      </div>
    </main>
  );
};

export default Onboarding;
