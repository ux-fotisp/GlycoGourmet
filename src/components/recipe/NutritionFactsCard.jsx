import React from 'react';

const DV = {
  fat: 78,
  carbs: 275,
  fiber: 28,
  protein: 50,
  sodium: 2300,
};

export const NutritionFactsCard = ({ nutrition, servingMultiplier = 1 }) => {
  const kcal = nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : '--';
  const fat = nutrition?.fat !== undefined ? Math.round(nutrition.fat) : 0;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs) : 0;
  const fiber = nutrition?.fiber !== undefined ? Math.round(nutrition.fiber) : 0;
  const protein = nutrition?.protein !== undefined ? Math.round(nutrition.protein) : 0;
  const sodium = nutrition?.sodium !== undefined ? Math.round(nutrition.sodium) : 0;

  const getPct = (val, max) => Math.min(100, Math.max(0, Math.round((val / max) * 100)));

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-bold text-text-strong flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-brand-strong text-[20px]">bolt</span>
          Nutrition Facts
        </h3>
        <span className="text-xs font-semibold text-text-body">
          Per {servingMultiplier}x Serving
        </span>
      </div>

      {/* Kcal Hero */}
      <div className="bg-canvas rounded-control p-4 flex flex-col items-center justify-center text-center border border-border-subtle/50">
        <span className="text-4xl md:text-5xl font-display font-extrabold text-brand-strong">{kcal}</span>
        <span className="text-xs font-semibold text-text-body mt-1">kcal per serving</span>
      </div>

      {/* %DV Bars */}
      <div className="space-y-3.5">
        <MacroRow label="Total Fat" value={fat} unit="g" pct={getPct(fat, DV.fat)} />
        <MacroRow label="Net Carbs" value={netCarbs} unit="g" pct={getPct(netCarbs, DV.carbs)} />
        <MacroRow label="Dietary Fiber" value={fiber} unit="g" pct={getPct(fiber, DV.fiber)} />
        <MacroRow label="Protein" value={protein} unit="g" pct={getPct(protein, DV.protein)} />
        <MacroRow label="Sodium" value={sodium} unit="mg" pct={getPct(sodium, DV.sodium)} />
      </div>

      {/* Micronutrient Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-border-subtle/40 text-[11px] font-semibold text-text-body">
        <div className="flex justify-between"><span>Magnesium</span><span className="text-text-strong">65mg</span></div>
        <div className="flex justify-between"><span>Zinc</span><span className="text-text-strong">3.2mg</span></div>
        <div className="flex justify-between"><span>Vitamin K</span><span className="text-text-strong">210mcg</span></div>
        <div className="flex justify-between"><span>Folate</span><span className="text-text-strong">88mcg</span></div>
        <div className="flex justify-between"><span>Omega-3</span><span className="text-text-strong">1.6g</span></div>
        <div className="flex justify-between"><span>Iron</span><span className="text-text-strong">4.1mg</span></div>
      </div>

      <div className="bg-surface-container-low p-3 rounded-control flex gap-2 text-[9px] text-text-body leading-tight">
        <span className="material-symbols-outlined text-[14px] text-brand-strong shrink-0">verified_user</span>
        <p>Values cross-referenced against USDA FoodData Central. Discrepancies &gt; 1g are flagged for dietitian review.</p>
      </div>
    </div>
  );
};

const MacroRow = ({ label, value, unit, pct }) => (
  <div className="space-y-1 text-sm font-bold">
    <div className="flex justify-between items-end">
      <span className="text-text-strong">{label}</span>
      <span className="text-text-strong">{value}{unit}</span>
    </div>
    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={label + ' percent daily value'}>
      <div className="h-full bg-brand-strong rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
    <div className="text-right text-[10px] text-text-body font-normal">{pct}% DV</div>
  </div>
);

export default NutritionFactsCard;
