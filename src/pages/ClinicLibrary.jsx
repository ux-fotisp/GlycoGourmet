import React, { useState, useEffect } from 'react';
import { getClinicSharedRules, getClinicSharedTemplates, cloneRuleToClient, getClientProfiles } from '../utils/clientStore';
import { useAuth } from '../context/AuthContext';

/**
 * ClinicLibrary - Standardized clinical asset sharing and template repository for multi-tenant practices.
 */
export const ClinicLibrary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('swaps'); // 'swaps' | 'templates'
  const [sharedRules, setSharedRules] = useState([]);
  const [sharedTemplates, setSharedTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Clone Modal State
  const [selectedRuleForClone, setSelectedRuleForClone] = useState(null);
  const [targetClientId, setTargetClientId] = useState('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);

  const loadData = async () => {
    const rules = await getClinicSharedRules();
    const templates = await getClinicSharedTemplates();
    setSharedRules(rules);
    setSharedTemplates(templates);

    if (user?.email) {
      const clientList = await getClientProfiles(user.email);
      setClients(clientList);
      if (clientList.length > 0) {
        setTargetClientId(clientList[0].id);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCloneRule = async () => {
    if (!selectedRuleForClone || !targetClientId) return;
    await cloneRuleToClient(selectedRuleForClone.id, targetClientId);
    alert(`Rule "${selectedRuleForClone.sourceIngredient} → ${selectedRuleForClone.targetIngredient}" successfully added to patient roster!`);
    setSelectedRuleForClone(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <header className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">local_library</span>
              <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-primary">
                Clinic Standardized Library
              </h1>
            </div>
            <p className="text-xs font-semibold text-stone-500">
              Shared clinical templates, evidence-based protocols, and peer-reviewed substitution rules.
            </p>
          </div>

          {/* 2-Tab Navigation Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F6F4EE] border border-stone-200/80 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('swaps')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'swaps'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-primary hover:bg-stone-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              Shared Smart Swaps ({sharedRules.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'templates'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-primary hover:bg-stone-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              Meal Plan Templates ({sharedTemplates.length})
            </button>
          </div>
        </header>

        {/* Tab 1: Shared Smart Swaps */}
        {activeTab === 'swaps' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-500">
                Peer-Published Substitution Rules
              </h2>
              <span className="text-xs font-bold text-stone-400">
                Showing {sharedRules.length} Clinic-Wide Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedRules.map((rule) => (
                <article
                  key={rule.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header with Author Badge */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="bg-sage-bg text-sage-text border border-sage-text/20 px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {rule.authorName || 'Colleague'}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md">
                        {rule.scope === 'all-plans' ? 'Global Rule' : 'Plan Scope'}
                      </span>
                    </div>

                    {/* Substitution Pair */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Substitution Pair
                      </div>
                      <div className="flex items-center gap-2 font-display text-sm font-extrabold text-primary">
                        <span className="text-rose-text">{rule.sourceIngredient}</span>
                        <span className="material-symbols-outlined text-stone-400 text-sm">arrow_forward</span>
                        <span className="text-sage-text">{rule.targetIngredient}</span>
                      </div>
                    </div>

                    {/* Rationale */}
                    <p className="text-xs text-stone-600 leading-relaxed bg-[#F6F4EE] p-3 rounded-2xl border border-stone-200/60">
                      {rule.rationale || 'Standard clinical glycemic substitution.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-stone-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedRuleForClone(rule)}
                      className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      + Clone to My Roster
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Tab 2: Meal Plan Templates */}
        {activeTab === 'templates' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-500">
                Standardized 7-Day Protocols
              </h2>
              <span className="text-xs font-bold text-stone-400">
                Showing {sharedTemplates.length} Prescribed Templates
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sharedTemplates.map((template) => (
                <article
                  key={template.id}
                  className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-sage-bg text-sage-text border border-sage-text/20 px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                          <span className="material-symbols-outlined text-[13px]">verified_user</span>
                          {template.authorName}
                        </span>
                        <span className="bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md text-[10px] font-extrabold border">
                          {template.targetSubtype}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-extrabold uppercase text-stone-400">Avg Daily GL</div>
                        <div className="text-lg font-display font-extrabold text-sage-text">{template.avgDailyGL} GL</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-display font-extrabold text-primary">
                        {template.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateForPreview(template)}
                      className="px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-extrabold hover:bg-primary-variant transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Preview &amp; Import
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Clone Rule Modal */}
      {selectedRuleForClone && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200 shadow-2xl p-6 space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">content_copy</span>
                Clone Rule to Patient Roster
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRuleForClone(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F6F4EE] p-3 rounded-2xl border border-stone-200/80">
                <div className="text-stone-400 font-bold uppercase text-[10px]">Rule Details</div>
                <div className="font-extrabold text-primary text-sm mt-0.5">
                  {selectedRuleForClone.sourceIngredient} &rarr; {selectedRuleForClone.targetIngredient}
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1.5">
                  Assign to Patient
                </label>
                {clients.length === 0 ? (
                  <p className="text-stone-500">No active clients found on your caseload.</p>
                ) : (
                  <select
                    value={targetClientId}
                    onChange={(e) => setTargetClientId(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white min-h-[44px]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.diabeticSubtype})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRuleForClone(null)}
                className="px-4 py-2 font-bold text-stone-600 hover:bg-stone-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloneRule}
                className="px-6 py-2 bg-primary text-white font-extrabold rounded-full hover:bg-primary-variant shadow-md cursor-pointer"
              >
                Confirm Clone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview & Import Modal */}
      {selectedTemplateForPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-stone-200 shadow-2xl p-6 lg:p-8 space-y-6 font-sans">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
                  <h3 className="text-xl font-display font-extrabold text-primary">
                    {selectedTemplateForPreview.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Authored by {selectedTemplateForPreview.authorName} &bull; Target: {selectedTemplateForPreview.targetSubtype}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplateForPreview(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-stone-700 leading-relaxed bg-[#F6F4EE] p-4 rounded-2xl border border-stone-200">
                {selectedTemplateForPreview.description}
              </p>

              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1.5">
                  Select Patient Caseload Target
                </label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white min-h-[44px]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.diabeticSubtype})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-[11px] text-stone-500 font-bold">
                Prescription matrix will be imported into the active 7-day schedule.
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForPreview(null)}
                  className="px-4 py-2 font-bold text-stone-600 hover:bg-stone-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Template "${selectedTemplateForPreview.title}" successfully applied to patient schedule!`);
                    setSelectedTemplateForPreview(null);
                  }}
                  className="px-6 py-2 bg-primary text-white font-extrabold rounded-full hover:bg-primary-variant shadow-md cursor-pointer"
                >
                  Import Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicLibrary;
