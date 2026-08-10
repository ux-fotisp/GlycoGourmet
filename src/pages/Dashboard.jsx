import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import TagChip from '../components/ui/TagChip';
import RecipeCard from '../components/recipe/RecipeCard';
import HealthHeader from '../components/dashboard/HealthHeader';
import MealPlanGlance from '../components/dashboard/MealPlanGlance';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { usePreferences } from '../context/UserPreferences';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    recipes: filteredRecipes,
    searchText,
    setSearchText,
    activeTags,
    setActiveTags,
    toggleTag,
    allRecipes,
    clearFilters,
    isLoading,
  } = useRecipes();
  const { visualDensity } = usePreferences();

  // Pre-seed filters based on user onboarding preferences
  useEffect(() => {
    if (user?.preferences) {
      const initialTags = [];
      user.preferences.forEach(pref => {
        if (pref.includes('Keto')) initialTags.push('Keto-Friendly');
        if (pref.includes('High Fiber')) initialTags.push('High Fiber');
        if (pref.includes('Type 2') || pref.includes('Low GI')) initialTags.push('Low GI');
      });
      setActiveTags(initialTags);
    }
  }, [user, setActiveTags]);

  const filterTags = [
    'Low GI',
    'Keto-Friendly',
    'Under 30 Min',
    'High Fiber',
    'High Protein',
    'Low Sugar',
    'Low Sodium',
  ];

  const densityClass = visualDensity === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <main className={`flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0 ${densityClass}`}>
        
        {/* ① Health Context Header */}
        <HealthHeader />

        {/* ② Conditional Meal Plan Glance */}
        <MealPlanGlance />

        {/* ③ Sticky Search & Tag Filtering Toolbar */}
        <section className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md py-3 -mx-edge-margin md:-mx-lg px-edge-margin md:px-lg space-y-3 border-b border-outline-variant/20">
          <SearchBar
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search: I want a low-GI breakfast high in protein..."
          />

          {/* Horizontal scrollable tag chips */}
          <div className="flex items-center gap-xs overflow-x-auto hide-scrollbar pb-1">
            {filterTags.map(tag => {
              const isSelected = activeTags.includes(tag);
              return (
                <TagChip
                  key={tag}
                  label={tag}
                  active={isSelected}
                  onClick={() => toggleTag(tag)}
                />
              );
            })}
            
            {activeTags.length > 0 && (
              <>
                <div className="h-6 w-[1px] bg-outline-variant/60 mx-1 shrink-0" />
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-tertiary font-label-md text-xs font-bold hover:underline cursor-pointer py-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">clear_all</span>
                  Clear Filters
                </button>
              </>
            )}
          </div>
        </section>

        {/* ④ Personalized Recommendation Matrix */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
            Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allRecipes.slice(0, 3).map(recipe => (
              <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="bg-white p-3 rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-sm hover:border-primary transition-colors group">
                <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300'} alt={recipe.title} className="w-12 h-12 rounded-lg object-cover border border-outline-variant/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">{recipe.title}</h4>
                  <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">{recipe.description}</p>
                </div>
                <span className="material-symbols-outlined text-primary hover:text-primary-container text-md shrink-0">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ⑤ Recipe Grid */}
        <section className="flex-grow">
          {isLoading ? (
            // Skeleton grid — shown during the first async fetch
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-container-low/60 rounded-xl overflow-hidden border border-outline-variant/20 animate-pulse">
                  <div className="h-44 bg-outline-variant/20" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-outline-variant/20 rounded w-3/4" />
                    <div className="h-3 bg-outline-variant/15 rounded w-full" />
                    <div className="h-3 bg-outline-variant/15 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
            /* Empty state — accessible with auto_awesome icon and reset CTA */
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/40 rounded-xl border border-dashed border-outline-variant/60 p-8" role="status" aria-live="polite">
              <span className="material-symbols-outlined text-6xl text-primary/30">
                auto_awesome
              </span>
              <div>
                <h3 className="font-bold text-on-surface text-lg">No Recipes Match</h3>
                <p className="text-sm text-on-surface-variant/80 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Try adjusting your filters or search query to discover more glucose-friendly recipes.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Responsive recipe card grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              
              {/* Add New Placeholder/Request Card */}
              <div className="bg-surface-container-low/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-outline-variant/60 cursor-pointer hover:bg-surface-container hover:border-primary transition-all text-center min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[28px]">add</span>
                </div>
                <div>
                  <p className="font-label-md font-bold text-sm text-on-surface">Request a Custom Recipe</p>
                  <p className="text-caption text-xs text-on-surface-variant/85 mt-1 max-w-[180px] mx-auto leading-relaxed">
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
