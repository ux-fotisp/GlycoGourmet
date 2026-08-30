import React from 'react';
export const IngredientsSection = ({ ingredients, metabolicCalculation, onServingChange, servings = 1 }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 font-sans text-[#1A2118]">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
        <h3 className="text-lg font-bold text-[#1B3B22] flex items-center gap-2 uppercase tracking-wider"><span className="material-symbols-outlined">grocery</span> Ingredients Matrix</h3>
        <div className="flex items-center gap-3 bg-[#F6F4EE] border border-stone-200 rounded-lg px-2 py-1">
          <button onClick={() => onServingChange?.(Math.max(1, servings - 1))} className="text-[#1B3B22] font-bold px-2 py-1 hover:bg-stone-200 rounded">-</button>
          <span className="text-sm font-bold text-[#1B3B22]">{servings} Servings</span>
          <button onClick={() => onServingChange?.(servings + 1)} className="text-[#1B3B22] font-bold px-2 py-1 hover:bg-stone-200 rounded">+</button>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#386A20] flex items-center justify-center text-white text-xs font-bold">{22 + i}</div>
              <div>
                <div className="text-sm font-bold text-[#1B3B22]">Broccoli Florets</div>
                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mt-1 border border-amber-200">Steamed x1.02</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#1B3B22]">150 g</div>
              <div className="text-[11px] font-bold text-[#2D5A34]">6g NC</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-[#1B3B22] text-white rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Metabolic Calculation</h4>
        <div className="flex justify-between items-center text-sm font-mono">
          <div className="flex flex-col gap-1"><span>Composite GI: 22</span><span>NCTotal / Serving: 18g</span></div>
          <div className="text-right"><div className="text-white/70 text-xs">round((22 * 18) / 100)</div><div className="text-lg font-bold text-[#D8E8CB]">Result: GL = 4</div></div>
        </div>
      </div>
    </div>
  );
};
export default IngredientsSection;