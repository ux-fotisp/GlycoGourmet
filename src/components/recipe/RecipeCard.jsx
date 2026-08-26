import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';
import { useFavorites } from '../../hooks/useFavorites';
import { formatMediaUrl } from '../../utils/mediaUtils';
import AddToMealPlanModal from './AddToMealPlanModal';
import RecipeTagFooter from './RecipeTagFooter';

export const RecipeCard = ({ recipe }) => {
  const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  const favorited = isFavorite(recipe.id);

  const metabolics = recipe._metabolics || {
    glycemicLoad: nutrition.glycemicLoad ?? 0,
    glycemicIndex: nutrition.glycemicIndex,
    netCarbs: nutrition.netCarbs ?? 0,
    fiber: nutrition.fiber ?? 0,
  };

  const gi = metabolics.glycemicIndex ?? nutrition.glycemicIndex;
  let giLabel = 'Low';
  if (gi !== null) {
    if (gi > 69) giLabel = 'High';
    else if (gi > 55) giLabel = 'Med';
    else giLabel = 'Low';
  }

  const gl = metabolics.glycemicLoad ?? nutrition.glycemicLoad ?? 0;
  const glCategory = getGlycemicLoadCategory(gl);

  let glPillClasses = 'bg-primary-container text-on-primary-container';
  if (gl >= 20) {
    glPillClasses = 'bg-error-container text-on-error-container';
  } else if (gl >= 11) {
    glPillClasses = 'bg-tertiary-container text-on-tertiary-container';
  }

  return (
    <div data-testid="recipe-card" className="bg-surface-container-lowest rounded-2xl flex flex-col shadow-[0_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30 card-hover-effect overflow-hidden group relative">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden relative">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            src={formatMediaUrl(recipe?.imageUrl)}
            alt={recipe?.title || 'Recipe'}
            onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-white/90 backdrop-blur-md text-on-surface border border-outline-variant/50 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
              GI {gi !== null ? Math.round(gi) : '-'}
            </span>
            <span className={`${glPillClasses} px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm`}>
              GL {gl}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            {recipe.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="bg-primary/90 text-on-primary text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-4 md:p-5 flex flex-col gap-2 flex-grow">
        <Link to={`/recipe/${recipe.id}`} className="block">
          <h3 className="font-headline-md text-base font-bold text-on-surface truncate group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-caption text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
            {recipe.description}
          </p>
        </Link>

        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-semibold mt-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">local_fire_department</span>
            {nutrition.kcal} kcal
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">nutrition</span>
            {metabolics.netCarbs}g carbs
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
            {recipe.cookingTime || '-'} min
          </span>
        </div>

        <RecipeTagFooter
          mealOccasion={recipe.mealOccasion}
          glycemicLoad={gl}
          glycemicIndex={gi}
          fiber={metabolics.fiber}
          dietaryFlags={recipe.dietaryFlags || []}
          matchedTags={recipe._matchedTags || []}
          compact={true}
        />

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tight">GI</span>
              <span className="text-xs font-bold text-on-surface">
                {gi !== null ? gi : '-'} <small className="font-medium text-[9px] text-on-surface-variant">({giLabel})</small>
              </span>
            </div>
            <div className="w-px h-6 bg-outline-variant/30" />
            <div className="flex flex-col">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tight">GL</span>
              <span className={`text-xs font-bold ${glCategory.colorClass}`}>
                {gl} <small className="font-medium text-[9px]">({glCategory.label})</small>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(recipe.id); }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>

            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPlanMenu(!showPlanMenu); }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-tertiary-container/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Add to Meal Plan"
                aria-label="Add to Meal Plan"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  post_add
                </span>
              </button>

              <AddToMealPlanModal
                recipe={recipe}
                isOpen={showPlanMenu}
                onClose={() => setShowPlanMenu(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
