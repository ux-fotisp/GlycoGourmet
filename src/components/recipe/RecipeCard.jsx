import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateRecipeNutrition, getGlycemicLoadCategory } from '../../utils/nutritionCalculator';
import { useFavorites } from '../../hooks/useFavorites';
import { formatMediaUrl } from '../../utils/mediaUtils';

/**
 * RecipeCard — OOUX Recipe Object Card
 *
 * Renders a recipe with:
 * - Dual GI/GL badge system: GI as minimalist outline pill, GL as solid filled pill
 *   color-coded by medical severity (Low/Medium/High).
 * - Object action triggers: Favorite toggle and "+ Plan" button.
 */
export const RecipeCard = ({ recipe }) => {
  const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  const favorited = isFavorite(recipe.id);

  // ─── GI Classification ──────────────────────────────────────────────────
  const gi = nutrition.glycemicIndex;
  let giLabel = 'Low';
  if (gi !== null) {
    if (gi > 69) giLabel = 'High';
    else if (gi > 55) giLabel = 'Med';
    else giLabel = 'Low';
  }

  // ─── GL Classification ──────────────────────────────────────────────────
  const gl = nutrition.glycemicLoad ?? 0;
  const glCategory = getGlycemicLoadCategory(gl);

  // Solid pill styles per medical severity
  let glPillClasses = 'bg-primary-container text-on-primary-container';
  if (gl >= 20) {
    glPillClasses = 'bg-error-container text-on-error-container';
  } else if (gl >= 11) {
    glPillClasses = 'bg-tertiary-container text-on-tertiary-container';
  }

  const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="bg-surface-container-lowest rounded-xl flex flex-col shadow-[0_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30 card-hover-effect overflow-hidden group relative">

      {/* Image + Overlay Badges */}
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden relative">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            src={formatMediaUrl(recipe?.imageUrl)}
            alt={recipe?.title || 'Recipe'}
            onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Dual-metric badges: GI outline pill + GL solid pill */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {/* GI — Minimalist outline pill */}
            <span className="bg-white/85 backdrop-blur-md text-on-surface border border-outline-variant/50 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
              GI {gi !== null ? Math.round(gi) : '—'}
            </span>
            {/* GL — Solid filled severity pill */}
            <span className={`${glPillClasses} px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm`}>
              GL {gl}
            </span>
          </div>

          {/* Tag badge */}
          <div className="absolute top-2.5 right-2.5 flex gap-1">
            {recipe.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="bg-primary/90 text-on-primary text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Content body */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <Link to={`/recipe/${recipe.id}`} className="block">
          <h3 className="font-headline-md text-base font-bold text-on-surface truncate group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-caption text-xs text-on-surface-variant line-clamp-2 mt-0.5">
            {recipe.description}
          </p>
        </Link>

        {/* Macro summary row */}
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-medium mt-1">
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
            {nutrition.kcal} kcal
          </span>
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">nutrition</span>
            {nutrition.netCarbs}g carbs
          </span>
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {recipe.cookingTime || '—'} min
          </span>
        </div>

        {/* Dual-metric detail cells + action buttons */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/15">
          {/* GI + GL detail labels */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tight">GI</span>
              <span className="text-xs font-bold text-on-surface">
                {gi !== null ? gi : '—'} <small className="font-medium text-[9px] text-on-surface-variant">({giLabel})</small>
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

          {/* Object action triggers */}
          <div className="flex items-center gap-1">
            {/* Favorite toggle */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(recipe.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-container/15 transition-colors cursor-pointer"
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

            {/* + Plan dropdown trigger */}
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPlanMenu(!showPlanMenu); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-tertiary-container/15 transition-colors cursor-pointer"
                title="Add to Meal Plan"
                aria-label="Add to Meal Plan"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  post_add
                </span>
              </button>

              {/* Mini dropdown */}
              {showPlanMenu && (
                <div
                  className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-xl border border-outline-variant/40 py-1.5 w-36 z-50 animate-fade-in"
                  onMouseLeave={() => setShowPlanMenu(false)}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant px-3 pb-1">
                    Add to slot
                  </p>
                  {MEAL_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPlanMenu(false);
                        // In production: dispatch to meal plan store
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-primary-container/10 hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
