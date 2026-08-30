const fs = require('fs');

const heroMediaCard = `import React from 'react';
export const HeroMediaCard = ({ recipe }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-200">
      <img src={recipe?.image || '/catalog_desktop.png'} alt={recipe?.title} className="w-full h-full object-cover" />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-[#1B3B22] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified</span>VERIFIED</span>
        <span className="bg-[#386A20] text-white text-[10px] font-bold px-3 py-1 rounded-full">LOW GL</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white flex gap-6 font-bold text-sm">
        <div className="flex flex-col"><span className="text-white/70 text-[10px] uppercase">GI</span><span>{recipe?.nutrition?.glycemicIndex || 22}</span></div>
        <div className="flex flex-col"><span className="text-white/70 text-[10px] uppercase">GL</span><span>{recipe?.nutrition?.glycemicLoad ? Math.round(recipe.nutrition.glycemicLoad) : 4}</span></div>
        <div className="flex flex-col"><span className="text-white/70 text-[10px] uppercase">Prep Time</span><span>{recipe?.prepTime || '25 min'}</span></div>
      </div>
    </div>
  );
};
export default HeroMediaCard;`;

const glycemicSnapshot = `import React from 'react';
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
export default GlycemicSnapshot;`;

const nutritionFactsPanel = `import React from 'react';
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
        <p>Values cross-referenced against USDA FoodData Central. Discrepancies > 1g are flagged for dietitian review.</p>
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
export default NutritionFactsPanel;`;

const smartSwapsList = `import React from 'react';
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
export default SmartSwapsList;`;

const recipeHeaderMeta = `import React from 'react';
export const RecipeHeaderMeta = ({ recipe, onAddToPlan }) => {
  return (
    <div className="space-y-4 font-sans text-[#1A2118]">
      <div className="flex gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3B22] bg-[#D8E8CB] px-2 py-1 rounded-md">Lunch</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3B22] bg-[#D8E8CB] px-2 py-1 rounded-md">Mediterranean</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B3B22] leading-tight">{recipe?.title || 'Low-Glycemic Green Goddess Power Salad'}</h1>
      <p className="text-sm font-medium text-[#2D5A34] leading-relaxed max-w-2xl">{recipe?.description || 'A nutrient-dense, clinical-grade salad optimized for steady blood glucose.'}</p>
      <div className="flex items-center gap-4 text-xs font-bold text-[#1B3B22] border-y border-stone-200 py-3">
        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span>Chef: Dr. Hyman</div>
        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span>Aug 24, 2026</div>
        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-amber-500">star</span>4.9 (124)</div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['Diabetic-Safe', 'Gluten-Free', 'High Protein', 'Anti-Inflammatory', 'Low Sugar'].map(tag => (
          <span key={tag} className="border border-[#2D5A34]/30 text-[#2D5A34] text-[10px] font-bold px-3 py-1 rounded-full">{tag}</span>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onAddToPlan} className="bg-[#1B3B22] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D5A34] transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">add</span> [ Add to Meal Plan ]</button>
        <button className="bg-white border border-stone-200 text-[#1B3B22] px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">bookmark</span></button>
        <button className="bg-white border border-stone-200 text-[#1B3B22] px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">share</span></button>
      </div>
    </div>
  );
};
export default RecipeHeaderMeta;`;

const ingredientsSection = `import React from 'react';
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
export default IngredientsSection;`;

const instructionTimeline = `import React from 'react';
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
                  <p className="text-[11px] font-bold text-amber-800 leading-tight">Thermal Warning: Steaming increases GI from 30 -> 31 (x1.02 thermal multiplier)</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InstructionTimeline;`;

const relatedRecipesGrid = `import React from 'react';
export const RelatedRecipesGrid = ({ currentRecipeId }) => {
  return (
    <div className="space-y-6 font-sans text-[#1A2118]">
      <h3 className="text-xl font-extrabold text-[#1B3B22] uppercase tracking-wider">You Might Also Like</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] bg-stone-200 relative">
              <img src={'/catalog_desktop.png'} alt="Recipe" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-[#386A20] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">GL: {i}</div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">15 min</div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="text-[10px] font-bold text-[#2D5A34] uppercase mb-1">Breakfast</div>
              <h4 className="text-sm font-bold text-[#1B3B22] leading-tight mb-4">Low-Glycemic Power Bowl {i}</h4>
              <div className="mt-auto pt-4 border-t border-stone-100">
                <button className="w-full text-center text-xs font-bold text-[#1B3B22] hover:text-[#386A20] transition-colors">[ View Recipe -> ]</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RelatedRecipesGrid;`;

fs.writeFileSync('src/components/recipe/HeroMediaCard.jsx', heroMediaCard);
fs.writeFileSync('src/components/recipe/GlycemicSnapshot.jsx', glycemicSnapshot);
fs.writeFileSync('src/components/recipe/NutritionFactsPanel.jsx', nutritionFactsPanel);
fs.writeFileSync('src/components/recipe/SmartSwapsList.jsx', smartSwapsList);
fs.writeFileSync('src/components/recipe/RecipeHeaderMeta.jsx', recipeHeaderMeta);
fs.writeFileSync('src/components/recipe/IngredientsSection.jsx', ingredientsSection);
fs.writeFileSync('src/components/recipe/InstructionTimeline.jsx', instructionTimeline);
fs.writeFileSync('src/components/recipe/RelatedRecipesGrid.jsx', relatedRecipesGrid);
