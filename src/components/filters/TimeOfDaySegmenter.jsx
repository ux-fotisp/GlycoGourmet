import React from 'react';

const MEAL_OCCASIONS = [
  { value: 'all', label: 'All Meals', icon: 'restaurant' },
  { value: 'breakfast', label: 'Breakfast', icon: 'egg_alt' },
  { value: 'brunch', label: 'Brunch', icon: 'brunch_dining' },
  { value: 'lunch', label: 'Lunch', icon: 'lunch_dining' },
  { value: 'dinner', label: 'Dinner', icon: 'dinner_dining' },
  { value: 'snack', label: 'Snacks', icon: 'cookie' },
  { value: 'dessert', label: 'Dessert', icon: 'cake' },
];

export const TimeOfDaySegmenter = ({
  activeOccasions = [],
  onToggle,
}) => {
  const isAll = activeOccasions.length === 0;

  return (
    <div
      role="group"
      aria-label="Meal occasion filter"
      className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
    >
      {MEAL_OCCASIONS.map(({ value, label, icon }) => {
        const isActive = value === 'all' ? isAll : activeOccasions.includes(value);

        return (
          <button
            key={value}
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={`${label} meals`}
            onClick={() => onToggle(value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap select-none active:scale-95 border ${
              isActive
                ? 'bg-primary text-on-primary border-primary shadow-sm filter-pill-active'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TimeOfDaySegmenter;
