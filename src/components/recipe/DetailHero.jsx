import React from 'react';
import { Link } from 'react-router-dom';
import { getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

/**
 * DetailHero — Interactive Hero Header with image, status badges, and serving scaler.
 *
 * Props:
 * - recipe: Recipe object
 * - nutrition: Current scaled nutrition object
 * - servingMultiplier: Current serving multiplier (1, 2, 4)
 * - onServingChange: Callback to update serving multiplier
 * - isFavorite: Boolean
 * - onToggleFavorite: Callback
 */
export const DetailHero = ({
  recipe,
  nutrition,
  servingMultiplier,
  onServingChange,
  isFavorite,
  onToggleFavorite,
}) => {
  const gi = nutrition?.glycemicIndex;
  const gl = nutrition?.glycemicLoad ?? 0;
  const glInfo = getGlycemicLoadCategory(gl);

  // GI classification
  let giLabel = 'Low GI';
  if (gi !== null && gi !== undefined) {
    if (gi > 69) giLabel = 'High GI';
    else if (gi > 55) giLabel = 'Med GI';
  }

  // Stepper control handlers
  const SERVING_OPTIONS = [1, 2, 4];
  const currentIdx = SERVING_OPTIONS.indexOf(servingMultiplier);

  const handleDecrement = () => {
    if (currentIdx > 0) onServingChange(SERVING_OPTIONS[currentIdx - 1]);
  };
  const handleIncrement = () => {
    if (currentIdx < SERVING_OPTIONS.length - 1) onServingChange(SERVING_OPTIONS[currentIdx + 1]);
  };

  return (
    <section className="space-y-5">
      {/* Image container with badges */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md">
        <img
          className="h-64 md:h-80 w-full object-cover"
          src={recipe?.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600'}
          alt={recipe?.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="bg-white/90 backdrop-blur-md text-on-surface border border-outline-variant/40 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
            {giLabel}: {gi !== null ? Math.round(gi) : '—'}
          </span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
            gl >= 20 ? 'bg-error-container text-on-error-container' :
            gl >= 11 ? 'bg-tertiary-container text-on-tertiary-container' :
            'bg-primary-container text-on-primary-container'
          }`}>
            GL: {gl} ({glInfo.label})
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

      {/* Serving Scaler Widget */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
          <span className="text-sm font-bold text-on-surface">Serving Size</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Decrement */}
          <button
            onClick={handleDecrement}
            disabled={currentIdx <= 0}
            className="w-12 h-12 rounded-full bg-surface-container-high hover:bg-primary-container/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-outline-variant/30"
            aria-label="Decrease serving size"
          >
            <span className="material-symbols-outlined text-xl text-on-surface">remove</span>
          </button>

          {/* Current value */}
          <span className="w-24 h-12 flex items-center justify-center bg-white rounded-full border border-outline-variant/30 text-sm font-bold text-primary shadow-sm">
            {servingMultiplier}× Servings
          </span>

          {/* Increment */}
          <button
            onClick={handleIncrement}
            disabled={currentIdx >= SERVING_OPTIONS.length - 1}
            className="w-12 h-12 rounded-full bg-surface-container-high hover:bg-primary-container/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-outline-variant/30"
            aria-label="Increase serving size"
          >
            <span className="material-symbols-outlined text-xl text-on-surface">add</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DetailHero;
