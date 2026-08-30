import React from 'react';
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
                <button className="w-full text-center text-xs font-bold text-[#1B3B22] hover:text-[#386A20] transition-colors">[ View Recipe &rarr; ]</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RelatedRecipesGrid;