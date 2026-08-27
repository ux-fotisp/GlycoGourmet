import React from 'react';
import { usePreferences } from '../../context/UserPreferences';

export const GlycemicSnapshotCard = ({ nutrition, servingMultiplier = 1 }) => {
  const { dailyGlTarget = 45 } = usePreferences();
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);
  const gi = nutrition?.glycemicIndex;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs * 10) / 10 : '--';
  
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));

  return (
    <div className="bg-success-surface rounded-card p-4 md:p-6 border border-success-border shadow-card space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-bold text-brand-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-[20px]">analytics</span>
          Glycemic Snapshot
        </h3>
        <span className="text-xs font-semibold text-brand-strong/80">
          Per {servingMultiplier}x Serving
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-success-border/60">
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-brand-strong">{gl}</span>
          <span className="text-[10px] uppercase font-bold text-brand-strong mt-1">GL / Serving</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-text-strong">{gi !== null && gi !== undefined ? Math.round(gi) : '--'}</span>
          <span className="text-[10px] uppercase font-bold text-text-body mt-1">Composite GI</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-display font-extrabold text-text-strong">{netCarbs}g</span>
          <span className="text-[10px] uppercase font-bold text-text-body mt-1">Net Carbs</span>
        </div>
      </div>

      <div className="pt-2 border-t border-success-border/60 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-brand-strong">
          <span>Daily GL Budget Used</span>
          <span>{gl} of {dailyGlTarget} GL</span>
        </div>
        <div className="w-full h-2 bg-success-border/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={gl} aria-valuemin="0" aria-valuemax={dailyGlTarget} aria-label="Daily GL Budget Progress">
          <div className="h-full bg-brand-strong rounded-full transition-all duration-500" style={{ width: `${fillWidth}%` }} />
        </div>
        <p className="text-[10px] text-brand-strong leading-tight">
          This recipe contributes {fillWidth}% of your daily {dailyGlTarget} GL target.
        </p>
      </div>
    </div>
  );
};

export default GlycemicSnapshotCard;
