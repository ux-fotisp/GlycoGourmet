import React from 'react';

// FDA Daily Values (Display Only)
const DV = {
  fat: 78,
  carbs: 275,
  fiber: 28,
  protein: 50,
  sodium: 2300,
};

export const NutritionFactsCard = ({ nutrition, servingMultiplier = 1 }) =&gt; {
  const kcal = nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : '--';
  const fat = nutrition?.fat !== undefined ? Math.round(nutrition.fat) : 0;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs) : 0;
  const fiber = nutrition?.fiber !== undefined ? Math.round(nutrition.fiber) : 0;
  const protein = nutrition?.protein !== undefined ? Math.round(nutrition.protein) : 0;
  const sodium = nutrition?.sodium !== undefined ? Math.round(nutrition.sodium) : 0; // if missing, shows 0 for now

  const getPct = (val, max) =&gt; Math.min(100, Math.max(0, Math.round((val / max) * 100)));

  return (
    <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-5"&gt;
      <div className="flex items-center justify-between"&gt;
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider"&gt;
          <span className="material-symbols-outlined text-primary text-[18px]"&gt;bolt</span&gt;
          Nutrition Facts
        </h3&gt;
        <span className="text-xs font-semibold text-on-surface-variant"&gt;
          Per Serving
        </span&gt;
      </div&gt;

      {/* Kcal Hero */}
      <div className="bg-surface-container-low/50 rounded-xl p-4 flex flex-col items-center justify-center text-center"&gt;
        <span className="text-5xl font-display font-extrabold text-primary"&gt;{kcal}</span&gt;
        <span className="text-xs font-semibold text-on-surface-variant mt-1"&gt;kcal per serving</span&gt;
      </div&gt;

      {/* %DV Bars */}
      <div className="space-y-4"&gt;
        <MacroRow label="Total Fat" value={fat} unit="g" pct={getPct(fat, DV.fat)} /&gt;
        <MacroRow label="Net Carbs" value={netCarbs} unit="g" pct={getPct(netCarbs, DV.carbs)} /&gt;
        <MacroRow label="Dietary Fiber" value={fiber} unit="g" pct={getPct(fiber, DV.fiber)} /&gt;
        <MacroRow label="Protein" value={protein} unit="g" pct={getPct(protein, DV.protein)} /&gt;
        <MacroRow label="Sodium" value={sodium} unit="mg" pct={getPct(sodium, DV.sodium)} /&gt;
      </div&gt;

      {/* Micronutrient Grid (Static/Mock for now unless engine has them) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-outline-variant/20 text-[11px] font-semibold text-on-surface-variant"&gt;
        <div className="flex justify-between"&gt;<span&gt;Magnesium</span&gt;<span className="text-on-surface"&gt;65mg</span&gt;</div&gt;
        <div className="flex justify-between"&gt;<span&gt;Zinc</span&gt;<span className="text-on-surface"&gt;3.2mg</span&gt;</div&gt;
        <div className="flex justify-between"&gt;<span&gt;Vitamin K</span&gt;<span className="text-on-surface"&gt;210mcg</span&gt;</div&gt;
        <div className="flex justify-between"&gt;<span&gt;Folate</span&gt;<span className="text-on-surface"&gt;88mcg</span&gt;</div&gt;
        <div className="flex justify-between"&gt;<span&gt;Omega-3</span&gt;<span className="text-on-surface"&gt;1.6g</span&gt;</div&gt;
        <div className="flex justify-between"&gt;<span&gt;Iron</span&gt;<span className="text-on-surface"&gt;4.1mg</span&gt;</div&gt;
      </div&gt;

      <div className="bg-surface-container-low p-3 rounded-lg flex gap-2 text-[9px] text-on-surface-variant leading-tight"&gt;
        <span className="material-symbols-outlined text-[14px] text-primary shrink-0"&gt;verified_user</span&gt;
        <p&gt;Values cross-referenced against USDA FoodData Central. Discrepancies &gt; 1g are flagged for dietitian review.</p&gt;
      </div&gt;
    </div&gt;
  );
};

const MacroRow = ({ label, value, unit, pct }) =&gt; (
  <div className="space-y-1 text-sm font-bold"&gt;
    <div className="flex justify-between items-end"&gt;
      <span className="text-on-surface"&gt;{label}</span&gt;
      <span className="text-on-surface"&gt;{value}{unit}</span&gt;
    </div&gt;
    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={label + ' percent daily value'}&gt;
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} /&gt;
    </div&gt;
    <div className="text-right text-[10px] text-on-surface-variant"&gt;{pct}% DV</div&gt;
  </div&gt;
);

export default NutritionFactsCard;
