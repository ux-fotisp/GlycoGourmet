import React, { useState, useEffect } from 'react';

/**
 * ClientCalibrationDrawer - Slide-over drawer for live editing of MetabolicTargetCalibration.
 */
export const ClientCalibrationDrawer = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    glTargetDaily: 45,
    bolusTimingOffset: 15,
  });

  useEffect(() => {
    if (client && client.calibration) {
      setFormData({
        glTargetDaily: client.calibration.glTargetDaily || 45,
        bolusTimingOffset: client.calibration.bolusTimingOffset || 15,
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


  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.glTargetDaily <= 0) {
      alert("GL Target must be greater than 0");
      return;
    }
    onSave(client.id, {
      glTargetDaily: Number(formData.glTargetDaily),
      bolusTimingOffset: Number(formData.bolusTimingOffset),
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0 bg-surface-container-low">
          <div>
            <h2 className="text-xl font-bold text-primary font-display">Calibrate Targets</h2>
            <p className="text-sm text-on-surface-variant">{client?.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Daily GL Cap ({formData.glTargetDaily})</label>
            <input type="range" min="10" max="100" value={formData.glTargetDaily} onChange={e => setFormData(prev => ({...prev, glTargetDaily: e.target.value}))} className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
            <p className="text-xs text-on-surface-variant mt-2">Adjust the patient's maximum allowable Glycemic Load per day.</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Bolus Timing Offset (mins)</label>
            <input type="number" min="0" max="60" value={formData.bolusTimingOffset} onChange={e => setFormData(prev => ({...prev, bolusTimingOffset: e.target.value}))} className="w-full border border-outline rounded-lg p-3 text-base focus:ring-2 focus:ring-primary outline-none" />
            <p className="text-xs text-on-surface-variant mt-2">Pre-meal insulin timing adjustment.</p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-on-surface font-bold hover:bg-surface-container rounded-full min-h-[48px] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-container hover:text-on-primary-container min-h-[48px] active:scale-95 transition-all shadow-md">
            Save Calibration
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientCalibrationDrawer;
