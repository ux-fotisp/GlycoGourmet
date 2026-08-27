import React, { useState, useEffect } from 'react';
import { saveSmartSwapRule } from '../../utils/clientStore';

/**
 * SmartSwapRuleEditor - Slide-over modal for defining auto-substitution rules.
 */
export const SmartSwapRuleEditor = ({ isOpen, onClose, clientId }) => {
  const [formData, setFormData] = useState({
    sourceIngredient: '',
    targetIngredient: '',
    scope: 'all-plans',
    rationale: '',
  });

  

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSmartSwapRule({
      clientId,
      ...formData,
      createdAt: new Date().toISOString()
    });
    setFormData({ sourceIngredient: '', targetIngredient: '', scope: 'all-plans', rationale: '' });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary font-display">Smart Swap Rules</h2>
            <p className="text-xs text-on-surface-variant">Automated clinical substitutions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant min-h-[48px] min-w-[48px] flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-primary-container/20 p-4 rounded-xl border border-primary/20 flex gap-3">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Rules are applied safely by cloning recipe ingredients upon assignment. Master recipe records are never mutated.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Source Ingredient</label>
            <input required type="text" placeholder="e.g. Jasmine White Rice" value={formData.sourceIngredient} onChange={e => setFormData(p => ({...p, sourceIngredient: e.target.value}))} className="w-full border border-outline rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Target Low-GI Substitute</label>
            <input required type="text" placeholder="e.g. Cauliflower Pearl Rice" value={formData.targetIngredient} onChange={e => setFormData(p => ({...p, targetIngredient: e.target.value}))} className="w-full border border-outline rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Application Scope</label>
            <select value={formData.scope} onChange={e => setFormData(p => ({...p, scope: e.target.value}))} className="w-full border border-outline rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white min-h-[48px]">
              <option value="all-plans">All Plans (This Client)</option>
              <option value="current-plan">Current Plan Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Clinical Rationale</label>
            <textarea rows="3" placeholder="Reason for substitution..." value={formData.rationale} onChange={e => setFormData(p => ({...p, rationale: e.target.value}))} className="w-full border border-outline rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-on-surface font-bold hover:bg-surface-container rounded-full min-h-[48px]">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-container min-h-[48px] active:scale-95 shadow-md">
            Create Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartSwapRuleEditor;
