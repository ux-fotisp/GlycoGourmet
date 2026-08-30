import React, { useState, useEffect } from 'react';
import { saveSmartSwapRule, getClientById } from '../../utils/clientStore';
import { generateSmartSwapRecommendations } from '../../services/recommendationEngine';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import defaultIngredients from '../../data/ingredients.json';

/**
 * SmartSwapRuleEditor - Slide-over modal for defining auto-substitution rules
 * with deterministic recommendation auto-suggestions and clinic network publishing.
 */
export const SmartSwapRuleEditor = ({ isOpen, onClose, clientId }) => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [client, setClient] = useState(null);
  const [formData, setFormData] = useState({
    sourceIngredient: '',
    targetIngredient: '',
    scope: 'all-plans',
    rationale: '',
    publishToClinic: false,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (clientId) {
      getClientById(clientId).then((res) => {
        if (res?.profile) setClient(res.profile);
      });
    }
  }, [clientId, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleAutoSuggest = () => {
    if (!formData.sourceIngredient.trim()) {
      alert('Please enter a Source Ingredient first (e.g., Jasmine White Rice).');
      return;
    }

    const suggestions = generateSmartSwapRecommendations(
      formData.sourceIngredient,
      client,
      defaultIngredients
    );
    setRecommendations(suggestions);
    setHasSearched(true);
  };

  const handleSelectRecommendation = (rec) => {
    setFormData((prev) => ({
      ...prev,
      targetIngredient: rec.name,
      rationale: `Lowers Glycemic Load by ${Math.abs(rec.deltaGL)} GL per 100g (GI: ${rec.glycemicIndex}). Compliant with patient dietary restrictions.`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSmartSwapRule({
      clientId,
      clinicId: client?.clinicId || user?.clinicId || 'clinic-glycemic-wellness',
      sourceIngredient: formData.sourceIngredient,
      targetIngredient: formData.targetIngredient,
      scope: formData.scope,
      rationale: formData.rationale,
      sharingScope: formData.publishToClinic ? 'CLINIC_SHARED' : 'PRIVATE',
      authorName: user?.name || 'Clinical Practitioner',
      createdAt: new Date().toISOString(),
    });
    setFormData({ 
      sourceIngredient: '', 
      targetIngredient: '', 
      scope: 'all-plans', 
      rationale: '', 
      publishToClinic: false 
    });
    setRecommendations([]);
    setHasSearched(false);
    onClose();
  };

  if (!isOpen) return null;

  const canShare = Boolean(permissions?.canShareTemplates);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans text-[#1A2118]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              Smart Swap Rules
            </h2>
            <p className="text-xs text-on-surface-variant">Automated clinical substitutions for {client?.name || 'Client'}</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close Smart Swap Editor"
            className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-primary-container/20 p-3.5 rounded-2xl border border-primary/20 flex gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant leading-snug">
              Rules are applied safely by cloning recipe ingredients upon assignment. Master recipe records are never mutated.
            </p>
          </div>

          {/* Source Ingredient */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
              Source Ingredient
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Jasmine White Rice" 
              value={formData.sourceIngredient} 
              onChange={(e) => {
                setFormData((p) => ({ ...p, sourceIngredient: e.target.value }));
                setHasSearched(false);
              }} 
              className="w-full border border-outline rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            />
          </div>

          {/* Target Substitute & Auto-Suggest Button */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-primary">
                Target Low-GI Substitute
              </label>
              <button
                type="button"
                onClick={handleAutoSuggest}
                className="px-3 py-1 bg-primary-variant hover:bg-primary text-white rounded-xl text-[11px] font-extrabold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                [ ✨ Auto-Suggest Alternatives ]
              </button>
            </div>

            <input 
              required 
              type="text" 
              placeholder="e.g. Cauliflower Pearl Rice" 
              value={formData.targetIngredient} 
              onChange={(e) => setFormData((p) => ({ ...p, targetIngredient: e.target.value }))} 
              className="w-full border border-outline rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            />

            {/* Recommendations List Container */}
            {hasSearched && (
              <div className="pt-2 space-y-2 animate-fade-in">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">
                  Deterministic Recommendations ({recommendations.length})
                </span>

                {recommendations.length === 0 ? (
                  <div className="p-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center text-xs text-stone-500 font-semibold">
                    No lower-GI, allergy-safe substitutes found for "{formData.sourceIngredient}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectRecommendation(rec)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                          formData.targetIngredient === rec.name
                            ? 'bg-sage-bg/40 border-sage-text/50 ring-1 ring-sage-text/30'
                            : 'bg-surface-container-low hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="text-xs font-bold text-primary truncate flex items-center gap-1.5">
                            <span>{rec.name}</span>
                            <span className="text-[10px] text-stone-400 font-medium">GI: {rec.glycemicIndex}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {rec.dietaryFlags?.slice(0, 3).map((f) => (
                              <span key={f} className="text-[9px] font-extrabold bg-white border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-md">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <span className="text-[11px] font-extrabold bg-sage-bg text-sage-text border border-sage-text/20 px-2 py-1 rounded-xl shrink-0 shadow-2xs">
                          {rec.deltaGL} GL / 100g
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Application Scope */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
              Application Scope
            </label>
            <select 
              value={formData.scope} 
              onChange={(e) => setFormData((p) => ({ ...p, scope: e.target.value }))} 
              className="w-full border border-outline rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white min-h-[44px]"
            >
              <option value="all-plans">All Plans (This Client)</option>
              <option value="current-plan">Current Plan Only</option>
            </select>
          </div>

          {/* Clinical Rationale */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
              Clinical Rationale
            </label>
            <textarea 
              rows="3" 
              placeholder="Reason for substitution..." 
              value={formData.rationale} 
              onChange={(e) => setFormData((p) => ({ ...p, rationale: e.target.value }))} 
              className="w-full border border-outline rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>

          {/* Publish to Clinic Network Toggle & Feature Gate */}
          <div className="pt-2 border-t border-stone-200/80">
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
              canShare 
                ? 'bg-[#F6F4EE] border-stone-200 hover:border-primary/40 cursor-pointer' 
                : 'bg-stone-50 border-stone-200/60 opacity-80 cursor-not-allowed'
            }`}>
              <input
                type="checkbox"
                disabled={!canShare}
                checked={formData.publishToClinic}
                onChange={(e) => setFormData((p) => ({ ...p, publishToClinic: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-primary">
                  <span>Publish to Clinic Network</span>
                  {!canShare && (
                    <span 
                      title="Clinic Pro or Enterprise required to share assets."
                      className="material-symbols-outlined text-[15px] text-amber-text"
                    >
                      lock
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                  {canShare 
                    ? 'Share this standardized substitution rule with all practitioners in your clinic.' 
                    : 'Clinic Pro or Enterprise required to share assets.'}
                </p>
              </div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 text-on-surface font-bold hover:bg-surface-container rounded-full text-xs min-h-[40px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full text-xs hover:bg-primary-container hover:text-on-primary-container min-h-[40px] active:scale-95 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Create Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartSwapRuleEditor;
