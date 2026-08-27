import React from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const GlycemicSnapshotCard = ({ nutrition, servingMultiplier = 1 }) => {
  const { dailyGlTarget = 45 } = usePreferences();
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);
  const gi = nutrition?.glycemicIndex;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs) : '--';
  
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));

  return (
    <div className="bg-surface-container-low/50 rounded-2xl p-5 border border-outline-variant/30 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
          Glycemic Snapshot
        </h3>
        <span className="text-xs font-semibold text-on-surface-variant">
          Per Serving
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-outline-variant/20">
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-primary">{gl}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">GL / Serving</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-on-surface">{gi !== null && gi !== undefined ? Math.round(gi) : '--'}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Composite GI</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-on-surface">{netCarbs}g</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Net Carbs</span>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant/20 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
          <span>Daily GL Budget Used</span>
          <span>{gl} of {dailyGlTarget} GL</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={gl} aria-valuemin="0" aria-valuemax={dailyGlTarget} aria-label="Daily GL Budget Progress">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${fillWidth}%` }} />
        </div>
        <p className="text-[10px] text-on-surface-variant leading-tight">
          Consuming this recipe uses {fillWidth}% of your daily {dailyGlTarget} GL target.
        </p>
      </div>
    </div>
  );
};
export default GlycemicSnapshotCard;
