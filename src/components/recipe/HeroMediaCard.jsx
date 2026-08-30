import React from 'react';

/**
 * HeroMediaCard - Visual hero card with verification badges and frosted glass metadata overlay.
 */
export const HeroMediaCard = ({ recipe }) => {
  const gi = recipe?.nutrition?.glycemicIndex ?? 22;
  const gl = recipe?.nutrition?.glycemicLoad ? Math.round(recipe.nutrition.glycemicLoad) : 4;
  const prepTime = recipe?.prepTime || '25 min';

  return (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-stone-200 shadow-sm border border-stone-200/80 group">
      {/* Background Image */}
      <img 
        src={recipe?.image || recipe?.imageUrl || '/recipe_detail_desktop.png'} 
        alt={recipe?.title || 'Recipe Media'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Top Overlay Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <span className="bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          VERIFIED
        </span>
        <span className="bg-sage-bg text-sage-text border border-sage-text/20 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md tracking-wider">
          LOW GL
        </span>
      </div>

      {/* Overlaid Frosted Glass Metadata Footer (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-4 text-white text-xs font-bold shadow-lg">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-sm" data-testid="recipe-gi-badge">GI {gi}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-sm text-sage-bg voice-pulse" data-testid="recipe-gl-badge">GL {gl}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-white/80">schedule</span>
            <span className="font-semibold">{prepTime}</span>
          </div>
        </div>
      </div>

      {/* Subtle Gradient Shadow Base */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroMediaCard;
