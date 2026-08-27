import React from 'react';

export const RecipeMetaHeader = ({ recipe }) => {
  return (
    <div className="space-y-4">
      {/* Course Tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <span className="bg-surface-container px-2 py-1 rounded-md">{recipe?.category || 'Lunch'}</span>
        <span className="bg-surface-container px-2 py-1 rounded-md">Dinner</span>
        <span className="bg-surface-container px-2 py-1 rounded-md">Mediterranean</span>
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
        {recipe?.title}
      </h1>
      
      <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
        {recipe?.description || 'A genuinely satisfying bowl that keeps blood sugar exceptionally stable.'}
      </p>

      {/* Author & Rating Line */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">person</span>
          Chef Julian
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          June 2025
        </div>
        <div className="flex items-center gap-1 text-tertiary">
          <span className="material-symbols-outlined text-[16px]">star</span>
          4.8 (24 reviews)
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {['Diabetic-Safe', 'Gluten-Free', 'High Fiber', 'High Protein', 'Anti-Inflammatory', 'Low Sugar'].map(tag => (
          <span key={tag} className="text-primary bg-primary-container/20 border border-primary/20 px-3 py-1 rounded-full text-[11px] font-bold">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
export default RecipeMetaHeader;
