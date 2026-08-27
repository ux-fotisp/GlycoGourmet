import React, { useState, useEffect } from 'react';

/**
 * ClientOnboardingWizard - 4-step dialog for registering a new client.
 */
export const ClientOnboardingWizard = ({ isOpen, onClose, onComplete, dietitianId }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    diabeticSubtype: 'T2D',
    glTargetDaily: 45,
    bolusTimingOffset: 15,
    netCarbCap: '',
    glucoseUnit: 'mgdl',
    dietaryRestrictions: [],
  });

  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  

  const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }
    const profileData = {
      dietitianId,
      name: formData.name,
      email: formData.email,
      diabeticSubtype: formData.diabeticSubtype,
      dietaryRestrictions: formData.dietaryRestrictions,
    };
    const calibrationData = {
      glTargetDaily: Number(formData.glTargetDaily),
      bolusTimingOffset: Number(formData.bolusTimingOffset),
      netCarbCap: formData.netCarbCap ? Number(formData.netCarbCap) : null,
      glucoseUnit: formData.glucoseUnit,
    };
    await onComplete(profileData, calibrationData);
    setStep(1);
    setFormData({
      name: '', email: '', diabeticSubtype: 'T2D', glTargetDaily: 45,
      bolusTimingOffset: 15, netCarbCap: '', glucoseUnit: 'mgdl', dietaryRestrictions: []
    });
  };

  const toggleRestriction = (res) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(res)
        ? prev.dietaryRestrictions.filter(r => r !== res)
        : [...prev.dietaryRestrictions, res]
    }));
  };

  const RESTRICTIONS = ['Gluten-Free', 'Dairy-Free', 'Vegetarian', 'Vegan', 'Nut-Free', 'Keto-Friendly'];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-primary font-display">New Client Onboarding</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-2 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-surface-container-highest'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold">Step 1: Basic Demographics</h3>
              <div>
                <label className="block text-sm font-bold mb-1">Patient Name</label>
                <input required type="text" value={formData.name} onChange={e => updateForm({ name: e.target.value })} className="w-full border border-outline rounded-lg p-3 text-base focus:ring-2 focus:ring-primary outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Patient Email</label>
                <input required type="email" value={formData.email} onChange={e => updateForm({ email: e.target.value })} className="w-full border border-outline rounded-lg p-3 text-base focus:ring-2 focus:ring-primary outline-none" placeholder="jane@example.com" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold">Step 2: Clinical Classification</h3>
              <div className="grid grid-cols-2 gap-3">
                {['T1D', 'T2D', 'GDM', 'Prediabetes', 'InsulinResistance'].map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => updateForm({ diabeticSubtype: type })}
                    className={`p-4 rounded-xl border text-sm font-bold transition-colors min-h-[48px] ${formData.diabeticSubtype === type ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold">Step 3: Metabolic Targets</h3>
              <div>
                <label className="block text-sm font-bold mb-1">Daily GL Cap ({formData.glTargetDaily})</label>
                <input type="range" min="20" max="100" value={formData.glTargetDaily} onChange={e => updateForm({ glTargetDaily: e.target.value })} className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Bolus Timing Offset (mins pre-meal)</label>
                <input type="number" min="0" max="60" value={formData.bolusTimingOffset} onChange={e => updateForm({ bolusTimingOffset: e.target.value })} className="w-full border border-outline rounded-lg p-3 text-base focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Glucose Unit</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[48px]"><input type="radio" name="unit" checked={formData.glucoseUnit === 'mgdl'} onChange={() => updateForm({ glucoseUnit: 'mgdl' })} className="w-5 h-5 accent-primary" /> mg/dL</label>
                  <label className="flex items-center gap-2 cursor-pointer min-h-[48px]"><input type="radio" name="unit" checked={formData.glucoseUnit === 'mmol/L'} onChange={() => updateForm({ glucoseUnit: 'mmol/L' })} className="w-5 h-5 accent-primary" /> mmol/L</label>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold">Step 4: Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {RESTRICTIONS.map(res => (
                  <button
                    key={res} type="button"
                    onClick={() => toggleRestriction(res)}
                    className={`px-4 py-2 rounded-full border text-sm font-bold min-h-[48px] transition-colors ${formData.dietaryRestrictions.includes(res) ? 'bg-tertiary-container text-on-tertiary-container border-tertiary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/50'}`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-surface-container-low p-4 border-t border-outline-variant/30 flex justify-between shrink-0">
          <button type="button" onClick={step > 1 ? prevStep : onClose} className="px-6 py-2 text-primary font-bold hover:bg-primary-container/20 rounded-full min-h-[48px] transition-colors">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-container hover:text-on-primary-container active:scale-95 min-h-[48px] transition-all shadow-md">
            {step === 4 ? 'Complete Onboarding' : 'Next Step'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientOnboardingWizard;
