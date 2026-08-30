import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * RecipeHeaderMeta - Top-level typography, dietary badges, chef metadata, and action bar.
 */
export const RecipeHeaderMeta = ({ recipe, onAddToPlan }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const occasionTags = recipe?.tags?.filter(t => ['Lunch', 'Dinner', 'Breakfast', 'Mediterranean', 'Salad'].includes(t)) || ['Lunch', 'Mediterranean'];
  const dietaryPills = ['Diabetic-Safe', 'Gluten-Free', 'High Protein', 'Anti-Inflammatory', 'Low Sugar'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <header className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs space-y-5 font-sans text-[#1A2118]">
      {/* Occasion Tags (Top) */}
      <div className="flex items-center gap-2 flex-wrap">
        {occasionTags.map((tag) => (
          <span 
            key={tag}
            className="text-[11px] font-extrabold uppercase tracking-wider text-sage-text bg-sage-bg px-3 py-1 rounded-full border border-sage-text/20 shadow-2xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title & Clinical Description */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-display font-extrabold text-primary leading-tight tracking-tight">
          {recipe?.title || 'Low-Glycemic Green Goddess Power Salad'}
        </h1>
        <p className="text-sm font-medium text-stone-600 leading-relaxed max-w-3xl">
          {recipe?.description || 'A nutrient-dense, clinical-grade salad optimized for steady postprandial blood glucose, featuring fiber-matrix preservation and raw cold-pressed lipids.'}
        </p>
      </div>

      {/* Metadata Row: Chef, Date, Star Rating */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold text-stone-600 py-3 border-y border-stone-100">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">person</span>
          <span>Chef: <strong className="text-primary font-bold">Dr. Mark Hyman</strong></span>
        </div>
        <span className="w-1 h-1 rounded-full bg-stone-300 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-stone-400">calendar_today</span>
          <span>Aug 24, 2026</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-stone-300 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-amber-500 fill-1">star</span>
          <span className="text-primary font-extrabold">4.8</span>
          <span className="text-stone-400 font-medium">(24 reviews)</span>
        </div>
      </div>

      {/* Dietary Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {dietaryPills.map((pill) => (
          <span
            key={pill}
            className="text-[11px] font-bold text-primary-variant bg-stone-50 border border-stone-200/80 px-3 py-1 rounded-full shadow-2xs"
          >
            {pill}
          </span>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        {/* Prominent Start Cooking Button */}
        <Link
          to={`/recipe/${recipe?.id || 'rec-power-salad'}/cook`}
          className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary-variant text-white rounded-2xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
        >
          <span className="material-symbols-outlined text-[18px]">skillet</span>
          👨🍳 Start Cooking
        </Link>

        <button
          type="button"
          onClick={onAddToPlan}
          className="flex-1 sm:flex-none px-6 py-3 bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant/40 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
          [ Add to Meal Plan ]
        </button>

        <button
          type="button"
          title={isBookmarked ? 'Bookmarked' : 'Bookmark Recipe'}
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-11 h-11 rounded-2xl border transition-colors flex items-center justify-center cursor-pointer ${
            isBookmarked
              ? 'bg-sage-bg border-sage-text/30 text-sage-text shadow-2xs'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isBookmarked ? 'bookmark_added' : 'bookmark'}
          </span>
        </button>

        <button
          type="button"
          title={isCopied ? 'Link Copied!' : 'Share Recipe'}
          onClick={handleShare}
          className="w-11 h-11 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCopied ? 'check' : 'share'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default RecipeHeaderMeta;
