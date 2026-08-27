import React, { useState, useMemo } from 'react';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

/**
 * AuditComparisonView — Side-by-Side Draft Audit Comparison Engine (US-2.3)
 *
 * Compares author-submitted macronutrient claims against system-calculated
 * USDA lab ground truth, highlights discrepancies > 1.0g in Soft Rose, and
 * provides 1-click sync and publication triggers.
 */
export const AuditComparisonView = ({ recipe, onApproveAndPublish, onRejectAndRequestChanges }) => {
  // System USDA calculated ground truth
  const systemNutrition = useMemo(() => {
    return calculateRecipeNutrition(recipe?.ingredients || []);
  }, [recipe]);

  // Original author claimed nutrition (with fallback simulation for draft testing)
  const initialClaimedNutrition = useMemo(() => {
    return {
      kcal: recipe?.claimedKcal ?? recipe?.nutrition?.kcal ?? (systemNutrition.kcal + 45),
      protein: recipe?.claimedProtein ?? recipe?.nutrition?.protein ?? (systemNutrition.protein - 3.5),
      fat: recipe?.claimedFat ?? recipe?.nutrition?.fat ?? (systemNutrition.fat + 2.0),
      carbs: recipe?.claimedCarbs ?? recipe?.nutrition?.carbs ?? (systemNutrition.carbs + 8.5),
      fiber: recipe?.claimedFiber ?? recipe?.nutrition?.fiber ?? Math.max(0, systemNutrition.fiber - 2.0),
      netCarbs: recipe?.claimedNetCarbs ?? recipe?.nutrition?.netCarbs ?? (systemNutrition.netCarbs + 10.5),
      glycemicIndex: recipe?.claimedGI ?? recipe?.nutrition?.glycemicIndex ?? (systemNutrition.glycemicIndex + 12),
      glycemicLoad: recipe?.claimedGL ?? recipe?.nutrition?.glycemicLoad ?? (systemNutrition.glycemicLoad + 5),
    };
  }, [recipe, systemNutrition]);

  // Active state for author values (can be synced to system truth with 1-click)
  const [activeAuthorNutrition, setActiveAuthorNutrition] = useState(initialClaimedNutrition);
  const [isSynced, setIsSynced] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Discrepancy checker helper (> 1.0 unit threshold)
  const isDiscrepant = (authorVal, systemVal) => {
    return Math.abs((parseFloat(authorVal) || 0) - (parseFloat(systemVal) || 0)) > 1.0;
  };

  // Action 1: 1-Click Sync to System Truth
  const handleSyncToSystemTruth = () => {
    setActiveAuthorNutrition({ ...systemNutrition });
    setIsSynced(true);
  };

  // Action 2: Approve & Publish
  const handleApprove = () => {
    if (onApproveAndPublish) {
      onApproveAndPublish(recipe.id, activeAuthorNutrition);
    }
  };

  // Action 3: Reject & Request Changes
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (onRejectAndRequestChanges) {
      onRejectAndRequestChanges(recipe.id, rejectReason);
    }
    setIsRejectModalOpen(false);
  };

  
  

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 shadow-sm space-y-6 font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Draft Recipe Audit
            </span>
            <h3 className="font-display text-lg font-bold text-primary line-clamp-1">
              {recipe?.title || 'Untitled Draft Recipe'}
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Submitted by: <strong className="text-on-surface">{recipe?.authorName || 'Dietitian Contributor'}</strong> • Category: {recipe?.category || 'Main Course'} • Servings: {recipe?.servings || 1}
          </p>
        </div>

        {/* 1-Click Sync Trigger */}
        <button
          type="button"
          onClick={handleSyncToSystemTruth}
          disabled={isSynced}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            isSynced
              ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
              : 'bg-surface-container-high hover:bg-primary/10 text-primary border border-primary/30'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isSynced ? 'text-emerald-600' : 'text-primary'}`}>
            {isSynced ? 'check_circle' : 'sync'}
          </span>
          <span>{isSynced ? 'Synced to System Truth' : 'Sync to System Truth'}</span>
        </button>
      </div>

      {/* Desktop Side-by-Side 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (col-span-12 lg:col-span-6): User Submitted Data */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <span className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-600 text-base">edit_note</span>
              User Submitted Data (Author Claims)
            </span>
            {isSynced && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Overwritten with Ground Truth
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Net Carbs', authorVal: activeAuthorNutrition.netCarbs, sysVal: systemNutrition.netCarbs, unit: 'g' },
              { label: 'Total Carbs', authorVal: activeAuthorNutrition.carbs, sysVal: systemNutrition.carbs, unit: 'g' },
              { label: 'Dietary Fiber', authorVal: activeAuthorNutrition.fiber, sysVal: systemNutrition.fiber, unit: 'g' },
              { label: 'Calories', authorVal: activeAuthorNutrition.kcal, sysVal: systemNutrition.kcal, unit: 'kcal' },
              { label: 'Protein', authorVal: activeAuthorNutrition.protein, sysVal: systemNutrition.protein, unit: 'g' },
              { label: 'Fat', authorVal: activeAuthorNutrition.fat, sysVal: systemNutrition.fat, unit: 'g' },
              { label: 'Glycemic Index', authorVal: activeAuthorNutrition.glycemicIndex, sysVal: systemNutrition.glycemicIndex, unit: '' },
              { label: 'Glycemic Load', authorVal: activeAuthorNutrition.glycemicLoad, sysVal: systemNutrition.glycemicLoad, unit: 'GL' },
            ].map(row => {
              const discrepant = !isSynced && isDiscrepant(row.authorVal, row.sysVal);

              return (
                <div
                  key={row.label}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                    discrepant
                      ? 'bg-error-container/30 border-error/50 text-error'
                      : 'bg-white border-outline-variant/20 text-on-surface'
                  }`}
                >
                  <span className="font-bold text-xs">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm">
                      {row.authorVal ?? 0} {row.unit}
                    </span>
                    {discrepant && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-error text-on-error shrink-0">
                        Discrepancy &gt; 1.0
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (col-span-12 lg:col-span-6): System Ground Truth */}
        <div className="col-span-12 lg:col-span-6 bg-primary-container/10 rounded-xl p-4 border border-primary/20 space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2">
            <span className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">verified</span>
              System Ground Truth (USDA Lab Engine)
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Calculated via USDA API
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Net Carbs', sysVal: systemNutrition.netCarbs, unit: 'g' },
              { label: 'Total Carbs', sysVal: systemNutrition.carbs, unit: 'g' },
              { label: 'Dietary Fiber', sysVal: systemNutrition.fiber, unit: 'g' },
              { label: 'Calories', sysVal: systemNutrition.kcal, unit: 'kcal' },
              { label: 'Protein', sysVal: systemNutrition.protein, unit: 'g' },
              { label: 'Fat', sysVal: systemNutrition.fat, unit: 'g' },
              { label: 'Glycemic Index', sysVal: systemNutrition.glycemicIndex, unit: '' },
              { label: 'Glycemic Load', sysVal: systemNutrition.glycemicLoad, unit: 'GL' },
            ].map(row => (
              <div
                key={row.label}
                className="p-2.5 rounded-lg border border-primary/20 bg-white flex items-center justify-between text-on-surface"
              >
                <span className="font-bold text-xs text-primary">{row.label}</span>
                <span className="font-extrabold text-sm text-primary">
                  {row.sysVal ?? 0} {row.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-outline-variant/20 pt-4">
        <button
          type="button"
          onClick={() => setIsRejectModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-error-container hover:bg-error-container/80 text-error border border-error/30 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">cancel</span>
          Reject &amp; Request Changes
        </button>

        <button
          type="button"
          onClick={handleApprove}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">published_with_changes</span>
          Approve &amp; Publish Recipe
        </button>
      </div>

      {/* Revision Request Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleRejectSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md border border-outline-variant shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">rate_review</span>
                Request Revision Changes
              </h4>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Provide constructive audit feedback to the author explaining required macro adjustments or ingredient prep state corrections:
            </p>

            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please verify basmati rice carb count per serving against cooked state standards."
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-outline-variant text-xs font-bold rounded-xl hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-error text-on-error text-xs font-bold rounded-xl hover:bg-error/90 cursor-pointer shadow-xs"
              >
                Send Revision Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuditComparisonView;
