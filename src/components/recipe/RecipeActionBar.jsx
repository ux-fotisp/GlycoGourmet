import React from 'react';

export const RecipeActionBar = ({ onAddToMealPlan, onToggleFavorite, isFavorite }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        // Ignored or cancelled share
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Recipe link copied to clipboard!');
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      <button 
        type="button"
        onClick={onAddToMealPlan}
        className="flex-1 bg-brand-strong hover:bg-brand-hover text-text-inverse min-h-[44px] h-12 rounded-control flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
        Add to Meal Plan
      </button>
      
      <button 
        type="button"
        onClick={onToggleFavorite}
        className={`w-12 h-12 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-control border transition-colors cursor-pointer ${
          isFavorite
            ? 'bg-success-surface border-success-border text-brand-strong'
            : 'bg-card border-border-interactive text-text-strong hover:bg-surface-container-low'
        } focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Bookmark Recipe'}
      >
        <span
          className="material-symbols-outlined text-[20px] text-brand-strong"
          style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
        >
          {isFavorite ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>

      <button 
        type="button"
        onClick={handleShare}
        className="w-12 h-12 min-h-[44px] min-w-[44px] flex items-center justify-center bg-card border border-border-interactive rounded-control text-text-strong hover:bg-surface-container-low transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
        aria-label="Share Recipe"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
      </button>
    </div>
  );
};

export default RecipeActionBar;
