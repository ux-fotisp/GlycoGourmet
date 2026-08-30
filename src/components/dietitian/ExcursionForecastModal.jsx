import React from 'react';
import ExcursionChart from './ExcursionChart';
import { predictGlucoseExcursion } from '../../services/excursionEngine';

/**
 * ExcursionForecastModal - Dialog rendering deterministic postprandial glucose prediction curve.
 */
export const ExcursionForecastModal = ({
  isOpen,
  onClose,
  recipe,
  calibration,
  clientName = 'Client',
  onOpenSwapEditor,
}) => {
  if (!isOpen || !recipe) return null;

  const bolusOffset = calibration?.bolusOffsetMinutes ?? calibration?.bolusTimingOffset ?? 15;
  const isf = calibration?.insulinSensitivityFactor ?? 50;
  const cir = calibration?.carbToInsulinRatio ?? 15;

  const gl = recipe?.glycemicLoad ?? recipe?.metabolicProfile?.glycemicLoad ?? 6;
  const gi = recipe?.glycemicIndex ?? recipe?.metabolicProfile?.glycemicIndex ?? 30;
  const netCarbs = recipe?.netCarbs ?? recipe?.metabolicProfile?.netCarbs ?? 18;

  const chartData = predictGlucoseExcursion({
    glycemicLoad: gl,
    glycemicIndex: gi,
    netCarbs,
    calibration: calibration || {},
  });

  const peakPoint = chartData.reduce((max, pt) => (pt.predictedGlucose > max.predictedGlucose ? pt : max), chartData[0]);
  const isPeakHyper = peakPoint.predictedGlucose > 180;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans text-[#1A2118]"
      role="dialog" 
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-[#F6F4EE] border-b border-stone-200 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">show_chart</span>
              <h3 className="text-lg font-display font-extrabold text-primary">
                Predictive Glucose Excursion
              </h3>
            </div>
            <p className="text-xs font-bold text-stone-600">
              {recipe.title} &bull; <span className="text-primary font-extrabold">{clientName}</span>
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-stone-500">
              <span className="bg-white border border-stone-200 px-2 py-0.5 rounded-md text-primary font-bold">
                Assuming {bolusOffset}m Pre-Meal Bolus
              </span>
              <span className="bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                ISF: {isf} &bull; CIR: {cir}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Forecast Modal"
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Peak Summary Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isPeakHyper 
              ? 'bg-rose-bg/60 border-rose-text/20 text-rose-text' 
              : 'bg-sage-bg/60 border-sage-text/20 text-primary'
          }`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">
                {isPeakHyper ? 'warning' : 'verified'}
              </span>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider">
                  {isPeakHyper ? 'Predicted Glycemic Spike' : 'Stable Postprandial Curve'}
                </div>
                <p className="text-[11px] font-medium text-stone-600 mt-0.5">
                  Predicted Peak: <strong>{peakPoint.predictedGlucose} mg/dL</strong> at +{peakPoint.time} mins
                </p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              isPeakHyper ? 'bg-rose-text text-white' : 'bg-sage-text text-white'
            }`}>
              {isPeakHyper ? 'Exceeds 180 Cap' : 'Within Euglycemic Target'}
            </span>
          </div>

          {/* Chart Component */}
          <ExcursionChart data={chartData} />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F6F4EE] border-t border-stone-200 flex justify-between items-center">
          <span className="text-[11px] text-stone-500 font-medium">
            Calculated via deterministic physiological kinetics model.
          </span>

          <div className="flex items-center gap-2">
            {isPeakHyper && onOpenSwapEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSwapEditor(recipe);
                }}
                className="px-4 py-2 bg-sage-bg hover:bg-sage-bg/80 text-sage-text border border-sage-text/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                [ Find Lower-GI Swap ]
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-variant transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcursionForecastModal;
