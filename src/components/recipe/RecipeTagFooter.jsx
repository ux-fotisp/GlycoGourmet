import React from 'react';

export const RecipeTagFooter = ({
  mealOccasion,
  glycemicLoad = 0,
  fiber = 0,
  dietaryFlags = [],
  matchedTags = [],
  compact = true,
}) => {
  const occasionLabels = {
    breakfast: 'Breakfast',
    brunch: 'Brunch',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    dessert: 'Dessert',
  };
  const occasionLabel = occasionLabels[mealOccasion] || mealOccasion;
  const occasionIcons = {
    breakfast: 'egg_alt',
    brunch: 'brunch_dining',
    lunch: 'lunch_dining',
    dinner: 'dinner_dining',
    snack: 'cookie',
    dessert: 'cake',
  };

  const glBadgeClass = glycemicLoad <= 10
    ? 'metabolic-badge--low'
    : glycemicLoad <= 19
      ? 'metabolic-badge--med'
      : 'metabolic-badge--high';

  const clinicalLabel = glycemicLoad <= 10
    ? 'Gentle'
    : glycemicLoad <= 19
      ? 'Moderate'
      : 'Spike Risk';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? 'pt-2' : 'pt-3'}`}>
      {mealOccasion && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold">
          <span className="material-symbols-outlined text-[12px]">
            {occasionIcons[mealOccasion] || 'restaurant'}
          </span>
          {occasionLabel}
        </span>
      )}

      <span className={`metabolic-badge ${glBadgeClass}`}>
        GL {glycemicLoad}
        <span className="text-[9px] font-medium font-bold">� {clinicalLabel}</span>
      </span>

      {matchedTags.map((tag, idx) => (
        <span
          key={`match-${idx}`}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/12 text-primary text-[10px] font-bold ring-1 ring-primary/30"
        >
          <span className="material-symbols-outlined text-[11px]">{tag.icon}</span>
          {tag.label}
        </span>
      ))}

      {dietaryFlags.map(flag => (
        <span
          key={flag}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-semibold"
        >
          {flag}
        </span>
      ))}

      {fiber > 5 && !dietaryFlags.includes('High Fiber') && (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-container/15 text-primary text-[10px] font-bold">
          <span className="material-symbols-outlined text-[11px]">grass</span>
          High Fiber
        </span>
      )}
    </div>
  );
};

export default RecipeTagFooter;
