import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/UserPreferences';
import { useRecipes } from '../hooks/useRecipes';
import { useRecipeFilters } from '../hooks/useRecipeFilters';
import { HealthHeader } from '../components/dashboard/HealthHeader';
import { MealPlanGlance } from '../components/dashboard/MealPlanGlance';
import RecipeFilterBar from '../components/filters/RecipeFilterBar';
import RecipeCard from '../components/recipe/RecipeCard';

export const Dashboard = () => {
  const { /* user */ } = useAuth();
  const {
    allRecipes,
    isLoading,
  } = useRecipes();
  const { visualDensity } = usePreferences();

  const {
    recipes: filteredRecipes,
    resultCountLabel,
    activeFilterCount,
    activeFiltersList,
    activeOccasions,
    activeSort,
    activeBands,
    maxGL,
    activeDietary,
    searchText,
    toggleOccasion,
    setSort,
    toggleBand,
    setMaxGL,
    toggleDietary,
    setSearchText,
    applyPreset,
    resetAll,
  } = useRecipeFilters(allRecipes);

  const densityClass = visualDensity === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <main className={`flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-md flex flex-col gap-md md:gap-lg mb-24 md:mb-8 ${densityClass}`}>
      <HealthHeader />
      <MealPlanGlance />

      <section className="sticky top-0 z-20">
        <RecipeFilterBar
          activeOccasions={activeOccasions}
          activeSort={activeSort}
          activeBands={activeBands}
          maxGL={maxGL}
          activeDietary={activeDietary}
          searchText={searchText}
          activeFilterCount={activeFilterCount}
          activeFiltersList={activeFiltersList}
          resultCountLabel={resultCountLabel}
          toggleOccasion={toggleOccasion}
          setSort={setSort}
          toggleBand={toggleBand}
          setMaxGL={setMaxGL}
          toggleDietary={toggleDietary}
          setSearchText={setSearchText}
          applyPreset={applyPreset}
          resetAll={resetAll}
        />
      </section>

      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base font-bold text-primary">auto_awesome</span>
            Recommended For You
          </h3>
          <span className="text-[11px] font-medium text-on-surface-variant">
            Based on your glycemic profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allRecipes.slice(0, 3).map(recipe => (
            <Link
              key={recipe.id}
              to={`/recipe/${recipe.id}`}
              className="bg-white p-3.5 rounded-2xl border border-outline-variant/30 flex items-center gap-3.5 shadow-sm hover:border-primary/60 hover:shadow-md transition-all duration-200 group"
            >
              <img
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300'}
                alt={recipe.title}
                className="w-14 h-14 rounded-xl object-cover border border-outline-variant/20 shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-primary-container/15 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    {recipe.tags?.[4] || 'Low GI'}
                  </span>
                  {recipe.cookingTime && (
                    <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">schedule</span>
                      {recipe.cookingTime}m
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                  {recipe.title}
                </h4>
                <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                  {recipe.description}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex-grow space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
            <span>Explore Diabetic Kitchen Recipes</span>
            <span className="text-xs font-semibold text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/20">
              {filteredRecipes.length} meals
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-container-low/60 rounded-2xl overflow-hidden border border-outline-variant/20 animate-pulse">
                <div className="h-48 bg-outline-variant/20" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-outline-variant/20 rounded w-3/4" />
                  <div className="h-3 bg-outline-variant/15 rounded w-full" />
                  <div className="h-3 bg-outline-variant/15 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/70 rounded-2xl border border-dashed border-outline-variant/60 p-8 shadow-sm" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">
                search_off
              </span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">No Recipes Match</h3>
              <p className="text-sm text-on-surface-variant/85 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {activeFilterCount > 0
                  ? 'No recipes match this combination of filters. Try relaxing your criteria.'
                  : 'Try adjusting your search query to discover more glucose-friendly recipes.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {maxGL !== null && maxGL < 15 && (
                <button
                  onClick={() => setMaxGL(15)}
                  className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-primary/8 text-on-surface-variant hover:text-primary px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer border border-outline-variant/30 hover:border-primary/30"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Relax GL Cap to 15
                </button>
              )}
              {activeOccasions.length > 0 && (
                <button
                  onClick={() => toggleOccasion('all')}
                  className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-primary/8 text-on-surface-variant hover:text-primary px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer border border-outline-variant/30 hover:border-primary/30"
                >
                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  View All Meal Times
                </button>
              )}
              <button
                onClick={resetAll}
                className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}

            <div className="bg-surface-container-low/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3.5 border-2 border-dashed border-outline-variant/60 cursor-pointer hover:bg-surface-container-low hover:border-primary transition-all text-center min-h-[320px] group">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[30px]">add</span>
              </div>
              <div>
                <p className="font-label-md font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  Request a Custom Recipe
                </p>
                <p className="text-caption text-xs text-on-surface-variant/85 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Have a meal in mind? Ask our AI assistant to compile a low-GI version.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
