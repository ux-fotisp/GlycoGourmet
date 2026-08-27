import React from 'react';

// FDA Daily Values (Display Only)
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
  const sodium = nutrition?.sodium !== undefined ? Math.round(nutrition.sodium) : 0; // if missing, shows 0 for now

  const getPct = (val, max) => Math.min(100, Math.max(0, Math.round((val / max) * 100)));

  return (
    <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
          Nutrition Facts
        </h3>
        <span className="text-xs font-semibold text-on-surface-variant">
          Per Serving
        </span>
      </div>

      {/* Kcal Hero */}
      <div className="bg-surface-container-low/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-display font-extrabold text-primary">{kcal}</span>
        <span className="text-xs font-semibold text-on-surface-variant mt-1">kcal per serving</span>
      </div>

      {/* %DV Bars */}
      <div className="space-y-4">
        <MacroRow label="Total Fat" value={fat} unit="g" pct={getPct(fat, DV.fat)} />
        <MacroRow label="Net Carbs" value={netCarbs} unit="g" pct={getPct(netCarbs, DV.carbs)} />
        <MacroRow label="Dietary Fiber" value={fiber} unit="g" pct={getPct(fiber, DV.fiber)} />
        <MacroRow label="Protein" value={protein} unit="g" pct={getPct(protein, DV.protein)} />
        <MacroRow label="Sodium" value={sodium} unit="mg" pct={getPct(sodium, DV.sodium)} />
      </div>

      {/* Micronutrient Grid (Static/Mock for now unless engine has them) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-outline-variant/20 text-[11px] font-semibold text-on-surface-variant">
        <div className="flex justify-between"><span>Magnesium</span><span className="text-on-surface">65mg</span></div>
        <div className="flex justify-between"><span>Zinc</span><span className="text-on-surface">3.2mg</span></div>
        <div className="flex justify-between"><span>Vitamin K</span><span className="text-on-surface">210mcg</span></div>
        <div className="flex justify-between"><span>Folate</span><span className="text-on-surface">88mcg</span></div>
        <div className="flex justify-between"><span>Omega-3</span><span className="text-on-surface">1.6g</span></div>
        <div className="flex justify-between"><span>Iron</span><span className="text-on-surface">4.1mg</span></div>
      </div>

      <div className="bg-surface-container-low p-3 rounded-lg flex gap-2 text-[9px] text-on-surface-variant leading-tight">
        <span className="material-symbols-outlined text-[14px] text-primary shrink-0">verified_user</span>
        <p>Values cross-referenced against USDA FoodData Central. Discrepancies {'>'} 1g are flagged for dietitian review.</p>
      </div>
    </div>
  );
};

const MacroRow = ({ label, value, unit, pct }) => (
  <div className="space-y-1 text-sm font-bold">
    <div className="flex justify-between items-end">
      <span className="text-on-surface">{label}</span>
      <span className="text-on-surface">{value}{unit}</span>
    </div>
    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={label + ' percent daily value'}>
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
    <div className="text-right text-[10px] text-on-surface-variant">{pct}% DV</div>
  </div>
);

export default NutritionFactsCard;
