import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateRecipeNutrition } from '../../utils/nutritionCalculator';
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
  const gl = metabolics.glycemicLoad ?? nutrition.glycemicLoad ?? 0;

  let glPillClasses = 'bg-success-surface text-brand-strong border border-success-border';
  if (gl >= 20) {
    glPillClasses = 'bg-error-container text-on-error-container font-bold';
  } else if (gl >= 11) {
    glPillClasses = 'bg-tertiary-container text-on-tertiary-container font-bold';
  }

  return (
    <div data-testid="recipe-card" className="bg-card rounded-card flex flex-col shadow-card border border-border-subtle card-hover-effect overflow-hidden group relative">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden relative">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            src={formatMediaUrl(recipe?.imageUrl)}
            alt={recipe?.title || 'Recipe'}
            onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-white/95 backdrop-blur-md text-text-strong border border-border-subtle/60 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
              GI {gi !== null && gi !== undefined ? Math.round(gi) : '—'}
            </span>
            <span className={`${glPillClasses} px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm`}>
              GL {gl}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            {recipe.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="bg-brand-strong/90 text-text-inverse text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-4 md:p-5 flex flex-col gap-2 flex-grow">
        <Link to={`/recipe/${recipe.id}`} className="block">
          <h3 className="font-display text-lg font-bold text-text-strong truncate group-hover:text-brand-strong transition-colors">
            {recipe.title}
          </h3>
          <p className="text-caption text-xs text-text-body line-clamp-2 mt-1 leading-relaxed">
            {recipe.description}
          </p>
        </Link>

        {/* Metabolic Badges Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-subtle/50">
          <div className="flex items-center gap-1.5 text-xs text-text-body">
            <span className="material-symbols-outlined text-[15px] text-brand-strong">grain</span>
            <span><strong className="text-text-strong font-bold">{metabolics.netCarbs}g</strong> Net Carbs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-body">
            <span className="material-symbols-outlined text-[15px] text-brand-strong">eco</span>
            <span><strong className="text-text-strong font-bold">{metabolics.fiber}g</strong> Fiber</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <button
            type="button"
            title="Add to Meal Plan"
            aria-label="Add to Meal Plan"
            onClick={() => setShowPlanMenu(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-strong hover:text-brand-hover transition-colors py-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong rounded-control focus-visible:outline-none"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            <span>+ Meal Plan</span>
          </button>

          <button
            type="button"
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => toggleFavorite(recipe.id)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none ${
              favorited ? 'text-tertiary bg-tertiary/10' : 'text-text-body hover:bg-surface-container'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        <RecipeTagFooter
          mealOccasion={recipe.mealOccasion}
          glycemicLoad={gl}
          fiber={metabolics.fiber}
          dietaryTags={recipe.dietaryTags}
          dietaryFlags={recipe.dietaryFlags || []}
          allergens={recipe.allergens}
          ingredients={recipe.ingredients}
          tags={recipe.tags}
          category={recipe.category}
          matchedTags={recipe._matchedTags}
        />
      </div>

      <AddToMealPlanModal
        recipe={recipe}
        isOpen={showPlanMenu}
        onClose={() => setShowPlanMenu(false)}
      />
    </div>
  );
};

export default RecipeCard;