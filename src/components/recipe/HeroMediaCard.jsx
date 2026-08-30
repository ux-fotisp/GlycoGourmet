import React from 'react';
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
export default HeroMediaCard;