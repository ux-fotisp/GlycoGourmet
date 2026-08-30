import React, { useState } from 'react';
import TimeOfDaySegmenter from './TimeOfDaySegmenter';
import MetabolicSortMenu from './MetabolicSortMenu';
import GLRangeFilter from './GLRangeFilter';
import ActiveFilterChips from './ActiveFilterChips';
import { DIETARY_TAGS } from '../../constants/dietaryTags';

const QUICK_PRESETS = [
  { id: 'ultra_low_gl', label: 'Ultra-Low GL (<5)', icon: 'bolt' },
  { id: 'quick_prep', label: 'Under 15m Prep', icon: 'schedule' },
  { id: 'safe_dinner', label: 'Safe Dinner Options', icon: 'verified_user' },
];

export const RecipeFilterBar = ({
  activeOccasions = [],
  activeSort = 'gl_asc',
  activeBands = [],
  maxGL = null,
  activeDietary = [],
  searchText = '',
  activeFilterCount = 0,
  activeFiltersList = [],
  resultCountLabel = '',
  toggleOccasion,
  setSort,
  toggleBand,
  setMaxGL,
  toggleDietary,
  setSearchText,
  applyPreset,
  resetAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      role="search"
      aria-label="Recipe filters"
      className="filter-bar-glass p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary text-lg">search</span>
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search recipes: low-GI breakfast, high protein, peanuts..."
            className="glyco-input pl-10 h-11 rounded-full text-sm"
            aria-label="Search recipes"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer md:hidden shrink-0 relative"
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">
            {isExpanded ? 'expand_less' : 'tune'}
          </span>
          {!isExpanded && activeFilterCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary text-on-tertiary text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div
        id="filter-panel"
        className={`space-y-3 transition-all duration-200 overflow-hidden ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[600px] md:opacity-100'
        }`}
      >
        <TimeOfDaySegmenter
          activeOccasions={activeOccasions}
          onToggle={toggleOccasion}
        />

        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <MetabolicSortMenu activeSort={activeSort} onSort={setSort} />
          <div className="flex-1">
            <GLRangeFilter
              activeBands={activeBands}
              onToggleBand={toggleBand}
              maxGL={maxGL}
              onMaxGLChange={setMaxGL}
            />
          </div>
        </div>

        {/* Dietary Tag Filter Chip Set (Keyboard Operable with Tab / Enter / Space) */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Dietary tag filters">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">restaurant_menu</span>
            Dietary:
          </span>
          {DIETARY_TAGS.map(({ value, label, icon }) => {
            const isActive = activeDietary.includes(value);
            return (
              <button
                key={value}
                type="button"
                role="switch"
                tabIndex={0}
                aria-checked={isActive}
                aria-label={`${label} dietary filter`}
                onClick={() => toggleDietary(value)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleDietary(value);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  isActive
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            Quick:
          </span>
          {QUICK_PRESETS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer select-none active:scale-95 border border-outline-variant/30"
              aria-label={`Apply preset: ${label}`}
            >
              <span className="material-symbols-outlined text-[13px] text-tertiary">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <ActiveFilterChips
          filters={activeFiltersList}
          onResetAll={resetAll}
          resultLabel={resultCountLabel}
        />
      </div>
    </div>
  );
};

export default RecipeFilterBar;