import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import TagChip from '../components/ui/TagChip';
import RecipeCard from '../components/recipe/RecipeCard';
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
    'Low Sugar',
    'High Fiber',
    'High Protein',
    'Keto-Friendly',
    'Low Sodium'
  ];

  const [weeklyPlan] = useState([
    { day: 'Monday', meal: 'Crispy Salmon & Asparagus' },
    { day: 'Wednesday', meal: 'Berry Chia Power Pot' },
    { day: 'Friday', meal: 'Sprouted Grain Turkey Wrap' }
  ]);
  const hasActivePlan = weeklyPlan && weeklyPlan.length > 0;

  const WeeklyPlanPreview = () => (
    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm font-bold">calendar_today</span>
          Active Weekly Meal Plan
        </h4>
        <Link to="/meal-plans" className="text-[10px] font-bold text-primary hover:underline">
          View Details
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
        {weeklyPlan.map(item => (
          <div key={item.day} className="bg-white p-2.5 rounded-lg border border-outline-variant/20 flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold text-on-surface-variant/75 uppercase tracking-wider">{item.day}</span>
            <span className="text-xs font-bold text-on-surface truncate">{item.meal}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const densityClass = visualDensity === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <main className={`flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0 ${densityClass}`}>
        
        {/* Header greeting */}
        <header className="hidden md:block">
          <h2 className="font-display text-2xl font-bold text-on-surface">
            Hello, {user?.name || 'Chef'}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Discover meals calculated to keep your glucose stable.
          </p>
        </header>

        {/* Weekly Plan Preview */}
        {hasActivePlan ? <WeeklyPlanPreview /> : null}

        {/* AI Search Header Section */}
        <section className="w-full flex flex-col gap-4 mt-2 md:mt-0">
          <SearchBar
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search: I want a low-GI breakfast high in protein..."
          />

          {/* Dynamic Facet Chips */}
          <div className="flex flex-wrap items-center gap-xs overflow-x-auto hide-scrollbar pb-1">
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

        {/* Personalized Recommendation Matrix */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
            Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allRecipes.slice(0, 3).map(recipe => (
              <div key={recipe.id} className="bg-white p-3 rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-sm hover:border-primary transition-colors">
                <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300'} alt={recipe.title} className="w-12 h-12 rounded-lg object-cover border border-outline-variant/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-on-surface truncate">{recipe.title}</h4>
                  <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">{recipe.description}</p>
                </div>
                <Link to={`/recipe/${recipe.id}`} className="material-symbols-outlined text-primary hover:text-primary-container text-md shrink-0">
                  arrow_forward
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Recipe Grid */}
        <section className="flex-grow">
          {isLoading ? (
            // Skeleton grid — shown during the first async fetch
            <div className="recipe-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
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
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-white/40 rounded-xl border border-dashed border-outline-variant/60 p-6">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
                search_off
              </span>
              <div>
                <h3 className="font-bold text-on-surface">No Recipes Found</h3>
                <p className="text-xs text-on-surface-variant/80 mt-1 max-w-xs">
                  Try adjusting your filters or search query to find more options.
                </p>
              </div>
            </div>
          ) : (
            <div className="recipe-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
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
