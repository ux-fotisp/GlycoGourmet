import React from 'react';
import { usePreferences } from '../../context/UserPreferences';
import { formatMediaUrl } from '../../utils/mediaUtils';

/**
 * DetailHero — Interactive Hero Header with chromatic GL progress meter,
 * image, status badges, and 48px discrete portion touch pills.
 */
export const DetailHero = ({
  recipe,
  nutrition,
  servingMultiplier = 1,
  onServingChange,
  isFavorite,
  onToggleFavorite,
}) => {
  const { dailyGlTarget = 45 } = usePreferences();

  const gi = nutrition?.glycemicIndex;
  const gl = Math.round(nutrition?.glycemicLoad ?? 0);
  const netCarbs = nutrition?.netCarbs ?? 0;
  const fiber = nutrition?.fiber ?? 0;

  // Preattentive fill width & chromatic styling
  const fillWidth = Math.min(100, Math.max(0, Math.round((gl / dailyGlTarget) * 100)));

  let impactLabel = 'Gentle Impact';
  let gaugeColor = 'bg-primary';
  let textColor = 'text-primary';
  let badgeBg = 'bg-primary-container text-on-primary-container';

  if (gl >= 20) {
    impactLabel = 'High Spike Risk';
    gaugeColor = 'bg-error';
    textColor = 'text-error';
    badgeBg = 'bg-error-container text-on-error-container';
  } else if (gl >= 11) {
    impactLabel = 'Moderate Impact';
    gaugeColor = 'bg-tertiary';
    textColor = 'text-tertiary';
    badgeBg = 'bg-tertiary-container text-on-tertiary-container';
  }

  // GI classification
  let giLabel = 'Low GI';
  if (gi !== null && gi !== undefined) {
    if (gi > 69) giLabel = 'High GI';
    else if (gi > 55) giLabel = 'Med GI';
  }

  // Discrete portion options
  const PORTION_OPTIONS = [0.5, 1, 1.5, 2];

  return (
    <section className="space-y-5">
      {/* Image container with badges */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md">
        <img
          className="h-64 md:h-80 w-full object-cover"
          src={formatMediaUrl(recipe?.imageUrl)}
          alt={recipe?.title || 'Recipe Details'}
          onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="bg-white/90 backdrop-blur-md text-on-surface border border-outline-variant/40 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
            {giLabel}: {gi !== null && gi !== undefined ? Math.round(gi) : '—'}
          </span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${badgeBg}`}>
            GL: {gl} ({impactLabel})
          </span>
        </div>

        {/* Tags + cooking time */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {recipe?.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="bg-primary/90 text-on-primary text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom left — cooking time */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-bold">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          {recipe?.cookingTime || '—'} min
        </div>
      </div>

      {/* Title + Description */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary-container/15 text-primary px-3 py-1 rounded-full font-label-md text-xs font-semibold">
            {recipe?.category || 'Main Course'}
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
          {recipe?.title}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl">
          {recipe?.description}
        </p>
      </div>

      {/* Preattentive GL Progress Gauge Card */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">speed</span>
            <span className="font-bold text-on-surface">Glycemic Load Gauge</span>
            <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded-full ${badgeBg}`}>
              {impactLabel}
            </span>
          </div>
          <div className="font-bold text-on-surface-variant text-[11px]">
            GL <span className={textColor}>{gl}</span> / {dailyGlTarget} Target
          </div>
        </div>

        {/* Preattentive Chromatic Progress Meter */}
        <div className="h-3 rounded-full bg-surface-container-high overflow-hidden w-full relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${gaugeColor}`}
            style={{ width: `${fillWidth}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant/70 pt-0.5">
          <span>Primary Anchors: <strong className="text-on-surface">{netCarbs}g Net Carbs</strong> • <strong className="text-on-surface">{fiber}g Fiber</strong></span>
          <span>{fillWidth}% Daily Impact</span>
        </div>
      </div>

      {/* Discrete Portion Stepper (48px Touch Pills) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
          <div>
            <span className="text-xs font-bold text-on-surface block">Portion Multiplier</span>
            <span className="text-[10px] text-on-surface-variant">Zero mental math — auto-scales GL & ingredients</span>
          </div>
        </div>

        {/* 48px Touch Pill Multipliers */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {PORTION_OPTIONS.map(mult => {
            const isActive = servingMultiplier === mult;
            return (
              <button
                key={mult}
                type="button"
                onClick={() => onServingChange(mult)}
                className={`min-h-[48px] min-w-[48px] px-4 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                  isActive
                    ? 'bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20 scale-105'
                    : 'bg-surface-container-low text-on-surface border-outline hover:border-primary/50 hover:bg-surface-container'
                }`}
                aria-label={`Scale recipe by ${mult}x`}
              >
                {mult}x
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DetailHero;
