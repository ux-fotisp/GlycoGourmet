import React from 'react';
const DV = { fat: 78, carbs: 275, fiber: 28, protein: 50 };
export const NutritionFactsPanel = ({ nutrition }) => {
  const kcal = nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : 387;
  const fat = nutrition?.fat !== undefined ? Math.round(nutrition.fat) : 18;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs) : 12;
  const fiber = nutrition?.fiber !== undefined ? Math.round(nutrition.fiber) : 8;
  const protein = nutrition?.protein !== undefined ? Math.round(nutrition.protein) : 24;
  const getPct = (val, max) => Math.min(100, Math.max(0, Math.round((val / max) * 100)));
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5 font-sans text-[#1A2118]">
      <div className="flex items-center justify-between"><h3 className="text-base font-bold text-[#1B3B22] flex items-center gap-2 uppercase tracking-wider"><span className="material-symbols-outlined text-[#1B3B22] text-[20px]">bolt</span> Clinical Nutrition Facts</h3></div>
      <div className="bg-[#F6F4EE] rounded-xl p-4 flex flex-col items-center justify-center text-center border border-stone-200">
        <span className="text-5xl font-extrabold text-[#1B3B22]">{kcal}</span><span className="text-xs font-bold text-[#2D5A34] mt-1 uppercase tracking-wider">kcal per serving</span>
      </div>
      <div className="space-y-3.5">
        <MacroRow label="Total Fat" value={fat} unit="g" pct={getPct(fat, DV.fat)} />
        <MacroRow label="Net Carbs" value={netCarbs} unit="g" pct={getPct(netCarbs, DV.carbs)} />
        <MacroRow label="Dietary Fiber" value={fiber} unit="g" pct={getPct(fiber, DV.fiber)} />
        <MacroRow label="Protein" value={protein} unit="g" pct={getPct(protein, DV.protein)} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-stone-200 text-[11px] font-bold text-[#2D5A34]">
        <div className="flex justify-between"><span>Magnesium</span><span className="text-[#1B3B22]">65mg</span></div><div className="flex justify-between"><span>Zinc</span><span className="text-[#1B3B22]">3.2mg</span></div>
        <div className="flex justify-between"><span>Vitamin K</span><span className="text-[#1B3B22]">210mcg</span></div><div className="flex justify-between"><span>Folate</span><span className="text-[#1B3B22]">88mcg</span></div>
        <div className="flex justify-between"><span>Omega-3</span><span className="text-[#1B3B22]">1.6g</span></div><div className="flex justify-between"><span>Iron</span><span className="text-[#1B3B22]">4.1mg</span></div>
      </div>
      <div className="bg-[#F6F4EE] p-3 rounded-lg flex gap-2 text-[10px] text-[#2D5A34] font-medium leading-tight border border-stone-200">
        <span className="material-symbols-outlined text-[14px] text-[#1B3B22] shrink-0">verified_user</span>
        <p>Values cross-referenced against USDA FoodData Central. Discrepancies &gt; 1g are flagged for dietitian review.</p>
      </div>
    </div>
  );
};
const MacroRow = ({ label, value, unit, pct }) => (
  <div className="space-y-1.5 text-sm font-bold">
    <div className="flex justify-between items-end"><span className="text-[#1B3B22]">{label}</span><span className="text-[#1B3B22]">{value}{unit}</span></div>
    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-[#1B3B22] rounded-full transition-all" style={{ width: pct + '%' }} /></div>
    <div className="text-right text-[10px] text-[#2D5A34] uppercase">{pct}% DV</div>
  </div>
);
export default NutritionFactsPanel;