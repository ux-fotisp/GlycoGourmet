import React from 'react';
import { formatMediaUrl } from '../../utils/mediaUtils';

export const RecipeHero = ({ recipe, nutrition }) => {
  const gi = nutrition?.glycemicIndex;
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-sm">
      <img
        className="h-72 md:h-96 w-full object-cover"
        src={formatMediaUrl(recipe?.imageUrl)}
        alt={recipe?.title || 'Recipe Image'}
        onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        <span className="bg-brand-strong text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
          VERIFIED
        </span>
      </div>
      <div className="absolute top-4 right-4 flex flex-wrap gap-2">
        <span className="bg-white/90 backdrop-blur-md text-brand-strong px-3 py-1 rounded-full text-xs font-bold shadow-md">
          LOW GL
        </span>
      </div>

      {/* Bottom left chips */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
          GI {gi !== null && gi !== undefined ? Math.round(gi) : '--'}
        </span>
        <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
          GL {gl}
        </span>
        <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {recipe?.cookingTime || '--'} min
        </span>
      </div>
    </div>
  );
};
export default RecipeHero;
