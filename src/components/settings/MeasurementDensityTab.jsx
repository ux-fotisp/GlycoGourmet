import React from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const MeasurementDensityTab = () => {
  const {
    unitSystem,
    glucoseUnit,
    visualDensity,
    setUnitSystem,
    setGlucoseUnit,
    setVisualDensity,
  } = usePreferences();

  return (
    <div className="space-y-6 animate-fade-in" role="tabpanel" aria-label="Measurement and UI Density Preferences">
      {/* Unit System Segmenter */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">scale</span>
            Measurement Unit System
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Determines culinary weights and volumes across recipe cards and grocery manifests.
          </p>
        </div>

        <div className="flex gap-2 max-w-sm">
          <button
            type="button"
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              unitSystem === 'imperial'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            US Imperial (oz, lbs, cups)
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              unitSystem === 'metric'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Metric (g, kg, ml)
          </button>
        </div>
      </div>

      {/* Blood Glucose Units Segmenter */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bloodtype</span>
            Blood Glucose Reading Standard
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Calibration unit for CGM telemetry charts and glucose excursion curves.
          </p>
        </div>

        <div className="flex gap-2 max-w-sm">
          <button
            type="button"
            onClick={() => setGlucoseUnit('mgdl')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              glucoseUnit === 'mgdl'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            mg/dL (US Standard)
          </button>
          <button
            type="button"
            onClick={() => setGlucoseUnit('mmoll')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              glucoseUnit === 'mmoll'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            mmol/L (International)
          </button>
        </div>
      </div>

      {/* Visual UI Density Control (Comfortable vs Compact) */}
      <div className="bento-cell bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">density_medium</span>
            User Interface Display Density
          </h3>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Controls spacing, typography scale, and card padding across Discovery and Meal Scheduler.
          </p>
        </div>

        <div className="flex gap-2 max-w-sm">
          <button
            type="button"
            onClick={() => setVisualDensity('comfortable')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              visualDensity === 'comfortable'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Comfortable (Standard)
          </button>
          <button
            type="button"
            onClick={() => setVisualDensity('compact')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              visualDensity === 'compact'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Compact (High Density)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementDensityTab;