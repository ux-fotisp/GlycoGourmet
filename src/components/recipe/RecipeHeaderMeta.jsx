import React from 'react';
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
export default RecipeHeaderMeta;