import React from 'react';
export const SmartSwapsList = ({ swaps = [], onApplySwap }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4 font-sans text-[#1A2118]">
      <div className="flex items-center justify-between"><h3 className="text-base font-bold text-[#1B3B22] flex items-center gap-2 uppercase tracking-wider"><span className="material-symbols-outlined text-[#1B3B22] text-[20px]">swap_horiz</span> Smart Swaps</h3></div>
      <div className="space-y-3 pt-1">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#F6F4EE] border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3B22]"><span>Edamame (shelled)</span><span className="text-[10px] text-[#2D5A34] bg-white px-2 py-1 rounded border border-stone-200">GL contrib: 1.2</span></div>
            <div className="flex justify-center -my-2"><span className="material-symbols-outlined text-[16px] text-[#1B3B22]">arrow_downward</span></div>
            <div className="flex justify-between items-center text-xs font-bold text-[#1B3B22]"><span>Lupini Beans</span><span className="text-[10px] bg-[#386A20] text-white px-2 py-0.5 rounded-full font-bold">-0.6 GL</span></div>
            <button type="button" onClick={() => onApplySwap?.()} className="w-full bg-[#1B3B22] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-[#2D5A34] py-2.5 mt-2">[ Apply Swap ]</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SmartSwapsList;