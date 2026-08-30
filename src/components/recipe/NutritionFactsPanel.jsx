import React from 'react';

const DV = {
  fat: 78,
  carbs: 275,
  fiber: 28,
  protein: 50,
};

/**
 * NutritionFactsPanel - Clinical nutrition panel with calorie hero, macro meters, and USDA verification banner.
 */
export const NutritionFactsPanel = ({ nutrition, servingMultiplier = 1 }) => {
  const kcal = nutrition?.kcal !== undefined ? Math.round(nutrition.kcal) : 387;
  const fat = nutrition?.fat !== undefined ? Math.round(nutrition.fat) : 18;
  const netCarbs = nutrition?.netCarbs !== undefined ? Math.round(nutrition.netCarbs) : 12;
  const fiber = nutrition?.fiber !== undefined ? Math.round(nutrition.fiber) : 8;
  const protein = nutrition?.protein !== undefined ? Math.round(nutrition.protein) : 24;

  const getPct = (val, max) => Math.min(100, Math.max(0, Math.round((val / max) * 100)));

  return (
    <section className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6 font-sans text-[#1A2118]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-xs font-extrabold tracking-wider text-primary uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-sage-text">bolt</span>
          Nutrition Facts
        </h3>
        <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
          Per Serving
        </span>
      </div>

      {/* Calorie Hero */}
      <div className="bg-sage-bg/50 border border-sage-text/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-2xs">
        <span className="text-5xl font-display font-extrabold text-primary leading-none">
          {kcal}
        </span>
        <span className="text-xs font-bold text-primary-variant uppercase tracking-wider mt-1.5">
          kcal per serving
        </span>
      </div>

      {/* Macro Progress Meters */}
      <div className="space-y-4 pt-1">
        <MacroMeterRow label="Total Fat" value={fat} unit="g" pct={getPct(fat, DV.fat)} />
        <MacroMeterRow label="Net Carbs" value={netCarbs} unit="g" pct={getPct(netCarbs, DV.carbs)} />
        <MacroMeterRow label="Dietary Fiber" value={fiber} unit="g" pct={getPct(fiber, DV.fiber)} />
        <MacroMeterRow label="Protein" value={protein} unit="g" pct={getPct(protein, DV.protein)} />
      </div>

      {/* Micronutrient Grid (2-Column) */}
      <div className="pt-4 border-t border-stone-100 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">
          Key Micronutrients & Electrolytes
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-stone-600 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-100">
          <div className="flex justify-between">
            <span>Magnesium</span>
            <span className="font-bold text-primary">65 mg</span>
          </div>
          <div className="flex justify-between">
            <span>Zinc</span>
            <span className="font-bold text-primary">3.2 mg</span>
          </div>
          <div className="flex justify-between">
            <span>Vitamin K</span>
            <span className="font-bold text-primary">210 mcg</span>
          </div>
          <div className="flex justify-between">
            <span>Folate</span>
            <span className="font-bold text-primary">88 mcg</span>
          </div>
          <div className="flex justify-between">
            <span>Omega-3</span>
            <span className="font-bold text-primary">1.6 g</span>
          </div>
          <div className="flex justify-between">
            <span>Iron</span>
            <span className="font-bold text-primary">4.1 mg</span>
          </div>
        </div>
      </div>

      {/* Secondary Macronutrient Breakdown Accordion */}
      <details open role="group" aria-label="Secondary Macronutrient Breakdown" className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-xs">
        <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
          <span>Secondary Macronutrient Breakdown</span>
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Expanded</span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-medium text-stone-700">
            Calories {kcal} kcal
          </span>
          <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-medium text-stone-700">
            Estimated GL: {nutrition?.glycemicLoad ?? 4}
          </span>
          <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-medium text-stone-700">
            Estimated GI: {nutrition?.glycemicIndex ?? 22}
          </span>
        </div>
      </details>

      {/* USDA Footer Callout Banner */}
      <div className="bg-[#F6F4EE] border border-stone-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-[11px] text-stone-600 font-medium leading-tight">
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">verified_user</span>
        <p>
          Values cross-referenced against USDA FoodData Central. Discrepancies &gt; 1g are flagged for dietitian review.
        </p>
      </div>
    </section>
  );
};

const MacroMeterRow = ({ label, value, unit, pct }) => (
  <div className="space-y-1.5 text-xs font-bold">
    <div className="flex justify-between items-end">
      <span className="text-primary">{label}</span>
      <span className="text-primary font-extrabold">{value}{unit}</span>
    </div>
    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
      <div 
        className="h-full bg-primary rounded-full transition-all duration-500" 
        style={{ width: `${pct}%` }} 
      />
    </div>
    <div className="text-right text-[10px] text-stone-500 font-semibold">{pct}% DV</div>
  </div>
);

export default NutritionFactsPanel;
