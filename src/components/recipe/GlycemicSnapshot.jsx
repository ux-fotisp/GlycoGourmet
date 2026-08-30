import React from 'react';
export const GlycemicSnapshot = ({ dailyGlTarget = 45, profile }) => {
  const gl = Math.round(profile?.glycemicLoad ?? 4);
  const gi = profile?.glycemicIndex ?? 22;
  const netCarbs = profile?.netCarbs !== undefined ? Math.round(profile.netCarbs * 10) / 10 : 18;
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));
  return (
    <div className="bg-[#D8E8CB] rounded-2xl p-6 border border-[#386A20]/20 space-y-4 font-sans text-[#1A2118]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1B3B22] flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[#1B3B22] text-[20px]">analytics</span> Glycemic Snapshot
        </h3>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#386A20]/30">
        <div className="flex flex-col items-center justify-center text-center px-2"><span className="text-3xl font-extrabold text-[#1B3B22]">{gl}</span><span className="text-[10px] uppercase font-bold text-[#1B3B22] mt-1">GL / Serving</span></div>
        <div className="flex flex-col items-center justify-center text-center px-2"><span className="text-3xl font-extrabold text-[#1B3B22]">{Math.round(gi)}</span><span className="text-[10px] uppercase font-bold text-[#1B3B22] mt-1">Composite GI</span></div>
        <div className="flex flex-col items-center justify-center text-center px-2"><span className="text-3xl font-extrabold text-[#1B3B22]">{netCarbs}g</span><span className="text-[10px] uppercase font-bold text-[#1B3B22] mt-1">Net Carbs</span></div>
      </div>
      <div className="pt-4 border-t border-[#386A20]/30 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-[#1B3B22]"><span>Daily GL Budget Used</span><span>{gl} of {dailyGlTarget} GL</span></div>
        <div className="w-full h-2 bg-[#1B3B22]/10 rounded-full overflow-hidden"><div className="h-full bg-[#1B3B22] rounded-full transition-all duration-500" style={{ width: fillWidth + '%' }} /></div>
        <p className="text-[11px] text-[#1B3B22] font-medium leading-tight">Consuming this recipe uses {fillWidth}% of your daily {dailyGlTarget} GL target.</p>
      </div>
    </div>
  );
};
export default GlycemicSnapshot;