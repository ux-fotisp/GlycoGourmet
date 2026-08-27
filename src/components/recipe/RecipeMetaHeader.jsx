import React from 'react';

export const RecipeMetaHeader = ({ recipe }) => {
  const authorName = recipe?.author?.name || recipe?.authorName || recipe?.authorId || null;
  const createdDate = recipe?.createdAt ? new Date(recipe.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;
  const ratingVal = recipe?.rating ?? recipe?.reviewScore ?? null;
  const reviewsCount = recipe?.reviewCount ?? recipe?.reviewsCount ?? null;

  return (
    <div className="space-y-3 font-sans">
      {/* Category Tag */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-body">
        <span className="bg-success-surface text-brand-strong border border-success-border px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
          {recipe?.category || 'Main Course'}
        </span>
        {recipe?.difficulty && (
          <span className="bg-surface-container text-text-body px-2.5 py-0.5 rounded-full text-xs font-medium">
            {recipe.difficulty}
          </span>
        )}
      </div>

      {/* Recipe Title (Serif Editorial) */}
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text-strong leading-tight">
        {recipe?.title}
      </h1>
      
      {/* Recipe Description */}
      <p className="text-sm md:text-base text-text-body leading-relaxed">
        {recipe?.description}
      </p>

      {/* Author & Rating Line (Rendered only if actual data exists) */}
      {(authorName || createdDate || ratingVal) && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-body pt-1 border-t border-border-subtle/40">
          {authorName && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-brand-strong">person</span>
              <span>{authorName}</span>
            </div>
          )}
          {createdDate && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-text-body">calendar_today</span>
              <span>{createdDate}</span>
            </div>
          )}
          {ratingVal && (
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">star</span>
              <span>{ratingVal} {reviewsCount ? `(${reviewsCount} reviews)` : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Dietary Tags (Rendered only if actual tags exist) */}
      {recipe?.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-brand-strong bg-success-surface border border-success-border px-3 py-1 rounded-full text-[11px] font-bold">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeMetaHeader;
