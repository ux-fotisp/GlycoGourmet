import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { usePreferences } from '../context/UserPreferences';
import { useRecipes } from '../hooks/useRecipes';
import { useRecipeFilters } from '../hooks/useRecipeFilters';
import { HealthHeader } from '../components/dashboard/HealthHeader';
import { MealPlanGlance } from '../components/dashboard/MealPlanGlance';
import NotificationOptIn from '../components/patient/NotificationOptIn';
import RedirectNudgeCard from '../components/patient/RedirectNudgeCard';
import RecipeFilterBar from '../components/filters/RecipeFilterBar';
import RecipeCard from '../components/recipe/RecipeCard';

const PATIENT_ROLES = new Set(['user', 'patient']);

export const Dashboard = () => {
  const { role } = usePermissions();
  const {
    allRecipes,
    isLoading,
  } = useRecipes();
  const { visualDensity } = usePreferences();

  // Strict Patient Allow-List: RedirectNudgeCard renders strictly for confirmed patient roles.
  // Defaults to false if role is missing, null, undefined, unknown, or administrative.
  const isPatient = Boolean(role && PATIENT_ROLES.has(role.toLowerCase()));

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
      
      {/* Clinical Pre-Meal Bolus Nudge Opt-In */}
      <NotificationOptIn />

      {/* Voluntary Dietitian Support Bridge (Strict Patient Allow-List context only) */}
      {isPatient && <RedirectNudgeCard />}

      {/* Today's Meal Plan Summary */}
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl">search_off</span>
            <p className="text-sm font-semibold">No recipes found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;