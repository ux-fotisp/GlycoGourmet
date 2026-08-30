import React, { useState, useEffect } from 'react';

/**
 * ClientCalibrationDrawer - Slide-over drawer for live editing of MetabolicTargetCalibration
 * including advanced excursion parameters (ISF, CIR, target pre-meal glucose).
 */
export const ClientCalibrationDrawer = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    glTargetDaily: 45,
    bolusTimingOffset: 15,
    targetPreMealGlucose: '',
    insulinSensitivityFactor: '',
    carbToInsulinRatio: '',
  });

  useEffect(() => {
    if (client && client.calibration) {
      setFormData({
        glTargetDaily: client.calibration.glTargetDaily || 45,
        bolusTimingOffset: client.calibration.bolusTimingOffset ?? 15,
        targetPreMealGlucose: client.calibration.targetPreMealGlucose ?? '',
        insulinSensitivityFactor: client.calibration.insulinSensitivityFactor ?? '',
        carbToInsulinRatio: client.calibration.carbToInsulinRatio ?? '',
      });
    }
  }, [client, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Validation logic
  const isGLValid = Number(formData.glTargetDaily) > 0;
  const isBolusValid = Number(formData.bolusTimingOffset) >= 0;

  const isTargetBGValid =
    formData.targetPreMealGlucose === '' ||
    (Number(formData.targetPreMealGlucose) >= 50 && Number(formData.targetPreMealGlucose) <= 250);

  const isISFValid =
    formData.insulinSensitivityFactor === '' || Number(formData.insulinSensitivityFactor) > 0;

  const isCIRValid =
    formData.carbToInsulinRatio === '' || Number(formData.carbToInsulinRatio) > 0;

  const isFormValid = isGLValid && isBolusValid && isTargetBGValid && isISFValid && isCIRValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      glTargetDaily: Number(formData.glTargetDaily),
      bolusTimingOffset: Number(formData.bolusTimingOffset),
    };

    if (formData.targetPreMealGlucose !== '') {
      payload.targetPreMealGlucose = Number(formData.targetPreMealGlucose);
    }
    if (formData.insulinSensitivityFactor !== '') {
      payload.insulinSensitivityFactor = Number(formData.insulinSensitivityFactor);
    }
    if (formData.carbToInsulinRatio !== '') {
      payload.carbToInsulinRatio = Number(formData.carbToInsulinRatio);
    }

    onSave(client.id, payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans text-on-surface">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0 bg-surface-container-low">
          <div>
            <h2 className="text-xl font-bold text-primary font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
              Calibrate Targets
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{client?.name} ({client?.diabeticSubtype})</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close Drawer"
            className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Standard Daily Targets */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
              Daily Glycemic Targets
            </h3>

            {/* Daily GL Target Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-on-surface">Daily GL Cap</label>
                <span className="text-sm font-extrabold text-primary bg-surface-container-low px-2 py-0.5 rounded-md border border-outline-variant/40">
                  {formData.glTargetDaily} GL
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={formData.glTargetDaily} 
                onChange={(e) => setFormData((prev) => ({ ...prev, glTargetDaily: e.target.value }))} 
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <p className="text-xs text-on-surface-variant mt-1.5 leading-snug">
                Patient's calibrated maximum allowable daily Glycemic Load.
              </p>
            </div>

            {/* Bolus Timing Offset */}
            <div>
              <label className="block text-sm font-bold mb-1.5 text-on-surface">
                Bolus Timing Offset (minutes)
              </label>
              <input 
                type="number" 
                min="0" 
                max="60" 
                value={formData.bolusTimingOffset} 
                onChange={(e) => setFormData((prev) => ({ ...prev, bolusTimingOffset: e.target.value }))} 
                className="w-full border border-outline rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              />
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Pre-meal administration offset (typically 15–20 minutes before food ingestion).
              </p>
            </div>
          </div>

          {/* Section 2: Advanced Excursion Metrics (Optional) */}
          <div className="bg-surface-container-low rounded-2xl p-4 space-y-4 border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Advanced Excursion Metrics (Optional)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-snug">
              Configure patient-specific physiological factors for deterministic 2-hour postprandial glucose forecasting.
            </p>

            {/* Target Pre-Meal Glucose */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Target Pre-Meal Glucose (mg/dL)
              </label>
              <input 
                type="number"
                min="50"
                max="250"
                placeholder="100"
                value={formData.targetPreMealGlucose}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetPreMealGlucose: e.target.value }))}
                className={`w-full border rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  !isTargetBGValid ? 'border-red-500 focus:border-red-500' : 'border-outline focus:border-primary'
                }`}
              />
              {!isTargetBGValid ? (
                <p className="text-[11px] font-bold text-red-600">Must be between 50 and 250 mg/dL</p>
              ) : (
                <p className="text-[11px] text-on-surface-variant">Baseline euglycemic target before meals.</p>
              )}
            </div>

            {/* Insulin Sensitivity Factor (ISF) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Insulin Sensitivity Factor (ISF)
              </label>
              <input 
                type="number"
                min="1"
                max="300"
                placeholder="50"
                value={formData.insulinSensitivityFactor}
                onChange={(e) => setFormData((prev) => ({ ...prev, insulinSensitivityFactor: e.target.value }))}
                className={`w-full border rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  !isISFValid ? 'border-red-500 focus:border-red-500' : 'border-outline focus:border-primary'
                }`}
              />
              {!isISFValid ? (
                <p className="text-[11px] font-bold text-red-600">ISF must be greater than 0</p>
              ) : (
                <p className="text-[11px] text-on-surface-variant">1 Unit of insulin drops blood glucose by X mg/dL.</p>
              )}
            </div>

            {/* Carb-to-Insulin Ratio (CIR) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface">
                Carb-to-Insulin Ratio (CIR)
              </label>
              <input 
                type="number"
                min="1"
                max="100"
                placeholder="15"
                value={formData.carbToInsulinRatio}
                onChange={(e) => setFormData((prev) => ({ ...prev, carbToInsulinRatio: e.target.value }))}
                className={`w-full border rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  !isCIRValid ? 'border-red-500 focus:border-red-500' : 'border-outline focus:border-primary'
                }`}
              />
              {!isCIRValid ? (
                <p className="text-[11px] font-bold text-red-600">CIR must be greater than 0</p>
              ) : (
                <p className="text-[11px] text-on-surface-variant">1 Unit of insulin covers X grams of Net Carbs.</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-on-surface font-bold hover:bg-surface-container rounded-full text-xs min-h-[44px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            className={`px-6 py-2.5 font-bold rounded-full text-xs min-h-[44px] transition-all shadow-md flex items-center gap-1.5 ${
              isFormValid 
                ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container active:scale-95 cursor-pointer' 
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Calibration
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientCalibrationDrawer;
