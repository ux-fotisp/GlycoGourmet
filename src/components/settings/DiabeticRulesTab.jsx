import React from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const DiabeticRulesTab = () => {
  const {
    diabeticProfiles = ['T2D'],
    dietaryRestrictions = ['Gluten-Free'],
    setDiabeticProfiles,
    setDietaryRestrictions,
  } = usePreferences();

  // Canonical Diabetic Subtypes (IA-v0.2 & domain.ts specification)
  const ALL_DIABETIC_PROFILES = [
    { key: 'T1D', label: 'Type 1 Diabetes (T1D)' },
    { key: 'T2D', label: 'Type 2 Diabetes (T2D)' },
    { key: 'GDM', label: 'Gestational Diabetes (GDM)' },
    { key: 'Prediabetes', label: 'Prediabetes' },
    { key: 'InsulinResistance', label: 'Insulin Resistance' },
  ];

  const toggleDiabeticProfile = (profileKey) => {
    const updated = diabeticProfiles.includes(profileKey)
      ? diabeticProfiles.filter((p) => p !== profileKey)
      : [...diabeticProfiles, profileKey];
    setDiabeticProfiles(updated);
  };

  // Dietary Restrictions Toggle Chips
  const ALL_DIETARY_RESTRICTIONS = [
    'Gluten-Free',
    'Lactose-Free',
    'Nut-Free',
    'Halal',
    'Vegetarian',
    'Vegan',
    'Kosher',
    'Low-Sodium',
  ];

  const toggleDietaryRestriction = (item) => {
    const updated = dietaryRestrictions.includes(item)
      ? dietaryRestrictions.filter((i) => i !== item)
      : [...dietaryRestrictions, item];
    setDietaryRestrictions(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in" role="tabpanel" aria-label="Diabetic and Dietary Rules">
      {/* Diabetic Subtypes Selector */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">clinical_notes</span>
            Diabetic Subtype Classification
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Select your diabetic classification to tailor circadian glycemic thresholds and Smart Swap rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {ALL_DIABETIC_PROFILES.map(({ key, label }) => {
            const isSelected = diabeticProfiles.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDiabeticProfile(key)}
                className={`p-3 min-h-[48px] rounded-xl text-xs font-bold border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span>{label}</span>
                <span className="material-symbols-outlined text-sm">
                  {isSelected ? 'check_circle' : 'add_circle'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Restrictions Toggle Chips */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
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
          {ALL_DIETARY_RESTRICTIONS.map((item) => {
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
  );
};

export default DiabeticRulesTab;