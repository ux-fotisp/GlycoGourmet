import React from 'react';
export const InstructionTimeline = ({ instructions }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 font-sans text-[#1A2118]">
      <h3 className="text-lg font-bold text-[#1B3B22] flex items-center gap-2 uppercase tracking-wider border-b border-stone-200 pb-4 mb-6"><span className="material-symbols-outlined">format_list_numbered</span> Step-by-Step Culinary Instructions</h3>
      <div className="space-y-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1B3B22] text-white font-bold text-sm shrink-0">{step}</div>
            <div className="bg-[#F6F4EE] border border-stone-200 p-4 rounded-xl flex-grow">
              <p className="text-sm font-medium text-[#1B3B22] leading-relaxed">Steam the broccoli florets for exactly 4 minutes. Do not overcook as this degrades the fiber matrix.</p>
              {step === 2 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-[18px]">warning</span>
                  <p className="text-[11px] font-bold text-amber-800 leading-tight">Thermal Warning: Steaming increases GI from 30 &rarr; 31 (x1.02 thermal multiplier)</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InstructionTimeline;