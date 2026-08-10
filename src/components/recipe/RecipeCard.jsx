import React from 'react';
import { Link } from 'react-router-dom';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

export const RecipeCard = ({ recipe }) => {
  const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);

  // Determine GI classification label & style
  let giLabel = 'Low GI';
  let giColorClass = 'text-primary';
  const gi = nutrition.glycemicIndex;

  if (gi !== null) {
    if (gi > 69) {
      giLabel = 'High GI';
      giColorClass = 'text-error font-bold';
    } else if (gi > 55) {
      giLabel = 'Med GI';
      giColorClass = 'text-tertiary';
    } else {
      giLabel = 'Low GI';
      giColorClass = 'text-primary';
    }
  }

  const gl = nutrition.glycemicLoad ?? 0;
  const glCategory = getGlycemicLoadCategory(gl);

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-sm shadow-[0_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30 card-hover-effect cursor-pointer"
    >
      <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden rounded-lg relative">
        <img
          className="w-full h-full object-cover"
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300'}
          alt={recipe.title}
        />
        {/* Dual-metric pill overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-outline-variant/40 shadow-sm text-[11px] font-bold">
          <span className={giColorClass}>
            GI: {gi !== null ? Math.round(gi) : 'N/A'}
          </span>
          <span className="text-on-surface-variant/40">•</span>
          <span className={glCategory.colorClass}>
            GL: {gl}
          </span>
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          {recipe.tags?.slice(0, 1).map(tag => (
            <span key={tag} className="bg-primary/95 text-on-primary text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface truncate">
          {recipe.title}
        </h3>
        <p className="text-caption text-xs text-on-surface-variant line-clamp-2">
          {recipe.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-outline-variant/20">
        <div className="bg-surface-container-low p-2 rounded-lg flex flex-col justify-center">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">
            Glycemic Index
          </span>
          <span className={`text-sm md:text-md font-bold ${giColorClass}`}>
            {gi !== null ? gi : '—'}{' '}
            {gi !== null && <small className="font-normal text-[10px] opacity-80">({giLabel})</small>}
          </span>
        </div>
        <div className="bg-surface-container-low p-2 rounded-lg flex flex-col justify-center">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">
            Glycemic Load
          </span>
          <span className={`text-sm md:text-md font-bold ${glCategory.colorClass}`}>
            {gl} <small className="font-normal text-[10px] opacity-80">({glCategory.label})</small>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
