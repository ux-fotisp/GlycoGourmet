import React from 'react';
import { formatMediaUrl } from '../../utils/mediaUtils';
import ServingStepper from './ServingStepper';
import DraftPreviewBanner from './DraftPreviewBanner';

export const DetailHero = ({
  recipe,
  servingMultiplier = 1,
  onServingChange,
  nutrition,
  isDraft = false,
  isAuditor = false,
  isFavorite = false,
  onToggleFavorite = null,
}) => {
  const metabolics = recipe?._metabolics || {
    glycemicLoad: nutrition?.glycemicLoad ?? recipe?.glycemicLoad ?? 0,
    glycemicIndex: nutrition?.glycemicIndex ?? recipe?.glycemicIndex,
    netCarbs: nutrition?.netCarbs ?? recipe?.netCarbs ?? 0,
    fiber: nutrition?.fiber ?? recipe?.fiber ?? 0,
  };

  const gl = Math.round(metabolics.glycemicLoad ?? 0);
  const gi = metabolics.glycemicIndex;

  let giLabel = 'Low GI';
  if (gi !== null && gi !== undefined) {
    if (gi > 69) giLabel = 'High GI';
    else if (gi > 55) giLabel = 'Med GI';
    else giLabel = 'Low GI';
  }

  let glBadgeClasses = 'bg-success-surface text-brand-strong border-success-border';
  if (gl >= 20) {
    glBadgeClasses = 'bg-error-container text-on-error-container border-error font-bold';
  } else if (gl >= 11) {
    glBadgeClasses = 'bg-tertiary-container text-on-tertiary-container border-tertiary font-bold';
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Preview Banner */}
      {isDraft && <DraftPreviewBanner recipe={recipe} isAuditor={isAuditor} />}

      {/* Asymmetric 2-Column Hero */}
      <div className="bg-card rounded-card p-4 md:p-6 lg:p-8 border border-border-subtle shadow-card grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Image with Overlay Badges */}
        <div className="lg:col-span-5 relative rounded-control overflow-hidden aspect-[4/3] bg-surface-container shadow-sm group">
          <img
            src={formatMediaUrl(recipe?.imageUrl)}
            alt={recipe?.title || 'Recipe Image'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <span
              data-testid="recipe-gl-badge"
              className={`${glBadgeClasses} px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm`}
            >
              GL {gl}
            </span>
            <span className="bg-white/95 backdrop-blur-md text-text-strong border border-border-subtle/60 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
              {`GI ${gi !== null && gi !== undefined ? Math.round(gi) : '—'}`}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-brand-container">timer</span>
              <span>{recipe?.cookingTime || 20} mins</span>
            </div>
            {recipe?.category && (
              <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
                {recipe.category}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Title, Description, Metabolic Pill & Portion Stepper */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-success-surface text-brand-strong border border-success-border px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              {recipe?.category || 'Recipe'}
            </span>
            {recipe?.difficulty && (
              <span className="bg-surface-container text-text-body px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                {recipe.difficulty}
              </span>
            )}
          </div>

          {/* Recipe Title: Serif Editorial */}
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-text-strong leading-tight">
            {recipe?.title}
          </h1>

          <p className="text-sm md:text-base text-text-body leading-relaxed line-clamp-3">
            {recipe?.description}
          </p>

          {/* Metabolic Summary Banner */}
          <div
            data-testid="metabolic-impact-label"
            className="bg-canvas border border-border-subtle p-3.5 rounded-control flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-strong text-xl">speed</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-body block">
                  Metabolic Curve
                </span>
                <span className="text-xs font-bold text-text-strong">
                  {gl <= 10 ? 'Minimal Glucose Impact' : gl <= 19 ? 'Moderate Glucose Curve' : 'High Glucose Load'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-card border border-border-interactive text-text-strong px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                {`GI ${gi !== null && gi !== undefined ? Math.round(gi) : '—'}`}
              </span>
              <span className={`${glBadgeClasses} px-2.5 py-1 rounded-full text-xs font-bold`}>
                GL {gl}
              </span>
            </div>
          </div>

          {/* Portions & Servings Stepper */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-body text-[18px]">group</span>
              <span className="text-xs font-bold text-text-strong">Scale Portion Multiplier</span>
            </div>
            <ServingStepper
              servingMultiplier={servingMultiplier}
              onServingChange={onServingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailHero;
