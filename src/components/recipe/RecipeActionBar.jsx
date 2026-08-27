import React from 'react';

export const RecipeActionBar = ({ onAddToMealPlan, onToggleFavorite, isFavorite }) => {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button 
        onClick={onAddToMealPlan}
        className="flex-1 bg-primary hover:bg-primary/90 text-on-primary h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer shadow-sm min-h-[48px]"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
        Add to Meal Plan
      </button>
      
      <button 
        onClick={onToggleFavorite}
        className="w-12 h-12 flex items-center justify-center bg-white border border-outline-variant/40 rounded-xl text-on-surface hover:bg-surface-container transition-colors min-h-[48px] min-w-[48px] cursor-pointer"
        aria-label="Bookmark Recipe"
      >
        <span className="material-symbols-outlined">{isFavorite ? 'bookmark' : 'bookmark_border'}</span>
      </button>

      <button 
        className="w-12 h-12 flex items-center justify-center bg-white border border-outline-variant/40 rounded-xl text-on-surface hover:bg-surface-container transition-colors min-h-[48px] min-w-[48px] cursor-pointer"
        aria-label="Share Recipe"
      >
        <span className="material-symbols-outlined">share</span>
      </button>
    </div>
  );
};
export default RecipeActionBar;
