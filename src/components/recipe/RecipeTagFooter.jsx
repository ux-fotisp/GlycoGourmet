import React from 'react';
import { ALLERGEN_MAP } from '../../constants/allergens';
import { DIETARY_TAG_MAP } from '../../constants/dietaryTags';
import { deriveAllergensFromIngredients } from '../../utils/nutritionCalculator';

export const RecipeTagFooter = ({
  mealOccasion,
  glycemicLoad = 0,
  fiber = 0,
  dietaryFlags = [],
  dietaryTags = [],
  allergens = [],
  ingredients = [],
  tags = [],
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

  // Resolve allergens: explicit allergens array or derived from ingredients (Chunk 9B)
  const resolvedAllergens = React.useMemo(() => {
    if (Array.isArray(allergens) && allergens.length > 0) {
      return Array.from(new Set(allergens));
    }
    if (Array.isArray(ingredients) && ingredients.length > 0 && typeof deriveAllergensFromIngredients === 'function') {
      return deriveAllergensFromIngredients(ingredients);
    }
    return [];
  }, [allergens, ingredients]);

  // Combine dietary flags and dietary tags
  const combinedDietary = React.useMemo(() => {
    const set = new Set();
    if (Array.isArray(dietaryTags)) {
      dietaryTags.forEach((t) => {
        const meta = DIETARY_TAG_MAP[t];
        set.add(meta ? meta.label : t);
      });
    }
    if (Array.isArray(dietaryFlags)) {
      dietaryFlags.forEach((f) => set.add(f));
    }
    return Array.from(set);
  }, [dietaryTags, dietaryFlags]);

  return (
    <div className={`flex flex-col gap-1.5 ${compact ? 'pt-2' : 'pt-3'} font-sans`}>
      {/* Primary Metabolic & Dietary Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {mealOccasion && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-surface text-brand-strong border border-success-border text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">
              {occasionIcons[mealOccasion] || 'restaurant'}
            </span>
            {occasionLabel}
          </span>
        )}

        <span className={`metabolic-badge ${glBadgeClass}`}>
          GL {glycemicLoad}
          <span className="text-[9px] font-medium font-bold"> • {clinicalLabel}</span>
        </span>

        {matchedTags.map((tag, idx) => (
          <span
            key={`match-${idx}`}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-brand-container text-brand-container-on text-[10px] font-bold"
          >
            <span className="material-symbols-outlined text-[11px]">{tag.icon}</span>
            {tag.label}
          </span>
        ))}

        {combinedDietary.map((flag) => (
          <span
            key={flag}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container text-text-body text-[10px] font-semibold"
          >
            {flag}
          </span>
        ))}

        {fiber > 5 && !combinedDietary.includes('High Fiber') && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-success-surface text-brand-strong border border-success-border text-[10px] font-bold">
            <span className="material-symbols-outlined text-[11px]">grass</span>
            High Fiber
          </span>
        )}
      </div>

      {/* Allergen Badges Row (Chunk 9B FDA Taxonomy with WCAG-AA Badges) */}
      {resolvedAllergens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5" aria-label="Allergen warnings">
          {resolvedAllergens.map((allergenKey) => {
            const meta = ALLERGEN_MAP[allergenKey] || {
              value: allergenKey,
              label: allergenKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
              icon: 'warning',
            };
            const labelText = meta.label.toLowerCase();
            return (
              <span
                key={allergenKey}
                role="img"
                aria-label={`Contains ${labelText}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container border border-error/30 text-[10px] font-bold shadow-xs select-none"
              >
                <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                  {meta.icon || 'warning'}
                </span>
                <span>Contains {labelText}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecipeTagFooter;