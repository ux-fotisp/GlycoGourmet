import React from 'react';

const SORT_OPTIONS = [
  { value: 'gl_asc', label: 'Lowest Glycemic Load (GL ↑)', shortLabel: 'GL ↑' },
  { value: 'gi_asc', label: 'Lowest Glycemic Index (GI ↑)', shortLabel: 'GI ↑' },
  { value: 'nc_asc', label: 'Lowest Net Carbs (NC ↑)', shortLabel: 'NC ↑' },
  { value: 'fiber_desc', label: 'Highest Fiber (g ↓)', shortLabel: 'Fiber ↓' },
];

export const MetabolicSortMenu = ({ activeSort = 'gl_asc', onSort }) => {
  return (
    <div className="relative flex items-center gap-2">
      <label
        htmlFor="metabolic-sort"
        className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[15px]">sort</span>
        Sort:
      </label>
      <div className="relative">
        <select
          id="metabolic-sort"
          value={activeSort}
          onChange={(e) => onSort(e.target.value)}
          aria-label="Sort recipes by metabolic metric"
          className="appearance-none bg-surface-container-lowest border border-outline-variant/60 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-on-surface cursor-pointer hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          expand_more
        </span>
      </div>
    </div>
  );
};

export default MetabolicSortMenu;
