import React, { useState } from 'react';
import { searchUSDAFoods } from '../../services/usdaClient';
import { getAcademicGI } from '../../utils/giLookup';

/**
 * UsdaIngredientSearch — Live USDA FoodData Central Search & Auto-Fill Component
 *
 * Props:
 *   initialQuery: string
 *   onSelectFood: (foodData: object) => void
 */
export const UsdaIngredientSearch = ({ initialQuery = '', onSelectFood }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query || !query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const foods = await searchUSDAFoods(query);
      setResults(foods);
    } catch (err) {
      console.error('[UsdaIngredientSearch] USDA query failed:', err.message);
      setError('Failed to fetch USDA database items. Please check network or query.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (food) => {
    const estimatedGI = getAcademicGI(food.description, food.netCarbs);
    const gl = food.netCarbs > 0 ? Math.round((estimatedGI * food.netCarbs) / 100 * 10) / 10 : 0;

    onSelectFood({
      name: food.description,
      kcal: food.kcal,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      fiber: food.fiber,
      netCarbs: food.netCarbs,
      glycemicIndex: estimatedGI,
      glycemicLoad: gl,
      fdcId: food.fdcId,
    });
    setResults([]);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">travel_explore</span>
          <span>Import from USDA FoodData Central</span>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
          Lab Standard Data
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search USDA (e.g. Salmon, Quinoa, Asparagus)..."
          className="flex-1 bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-9 px-3 text-xs outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="h-9 px-4 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
        >
          {isSearching ? (
            <>
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Fetching…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">search</span>
              Search USDA
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="text-[11px] text-error font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          {error}
        </p>
      )}

      {hasSearched && !isSearching && results.length === 0 && !error && (
        <p className="text-xs text-on-surface-variant/70 italic py-1">
          No raw food items found in USDA database matching "{query}".
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Select item to auto-fill nutrition per 100g base:
          </p>
          <div className="space-y-1.5">
            {results.map((food) => (
              <div
                key={food.fdcId}
                onClick={() => handleSelect(food)}
                className="p-2.5 bg-white rounded-lg border border-outline-variant/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {food.description}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/70">
                    FDC #{food.fdcId} • {food.brandOwner}
                  </p>
                </div>

                <div className="text-right text-[11px] shrink-0 font-sans">
                  <p className="font-bold text-primary">{food.kcal} kcal</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {food.netCarbs}g Net Carbs • {food.protein}g Protein
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsdaIngredientSearch;
