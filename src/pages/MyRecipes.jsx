import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import RecipeCard from '../components/recipe/RecipeCard';
import Button from '../components/ui/Button';
import { formatMediaUrl } from '../utils/mediaUtils';

export const MyRecipes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('authored'); // 'authored' | 'favorites'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'draft' | 'published'

  const { authoredRecipes, allRecipes } = useRecipes();
  const { favorites } = useFavorites();

  const favoritedRecipes = allRecipes.filter(r => favorites.includes(r.id));
  
  const filteredAuthored = authoredRecipes.filter(r => {
    if (statusFilter === 'all') return true;
    const isDraft = r.status === 'draft' || !r.publishedAt;
    if (statusFilter === 'draft') return isDraft;
    return !isDraft;
  });

    const handleCardClick = (recipe) => {
    if (recipe.status === 'draft' || recipe.isUserAuthored) {
      navigate(`/admin-editor?edit=${recipe.id}`);
    } else {
      navigate(`/recipe/${recipe.id}`);
    }
  };


  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-edge-margin md:px-lg py-sm md:py-lg flex flex-col gap-md md:gap-lg mb-24 md:mb-0">

      
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">
            My Recipes & Collection
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Manage your self-authored Strapi entries and saved community favorites.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin')}
          className="font-bold flex items-center gap-1.5 h-10 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Create New Recipe
        </Button>
      </header>

      {/* Tab Controls */}
      <div className="flex border-b border-outline-variant/30">
        <button
          onClick={() => setActiveTab('authored')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'authored'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          My Authored Recipes ({authoredRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Saved Favorites ({favoritedRecipes.length})
        </button>
      </div>

            {/* Tab Content */}
      <section className="flex-grow">
        {activeTab === 'authored' && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === 'draft' ? 'bg-tertiary text-white' : 'bg-surface-container hover:bg-surface-container-high'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === 'published' ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high'}`}
            >
              Published
            </button>
          </div>
        )}
        {activeTab === 'authored' ? (
          filteredAuthored.length === 0 ? (

            <div className="py-20 text-center space-y-4 bg-white rounded-xl border border-dashed border-outline-variant/50 max-w-md mx-auto">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                edit_document
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-md text-on-surface">No authored recipes yet</h3>
                <p className="text-xs text-on-surface-variant px-6 max-w-sm mx-auto leading-relaxed">
                  Tap the button above to begin drafting, logging macros, and planning glycemic loads with Strapi CMS.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {filteredAuthored.map((recipe) => {
                const isDraft = recipe.status === 'draft' || !recipe.publishedAt;
                const badgeClass = isDraft
                  ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/30 font-bold'
                  : 'bg-primary-container text-on-primary-container border-primary/20 font-bold';

                return (
                  <div
                    key={recipe.id}
                    onClick={() => handleCardClick(recipe)}
                    className="bg-white rounded-xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30 card-hover-effect cursor-pointer group relative overflow-hidden"
                  >
                    {/* Image Frame */}
                    <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden rounded-lg relative">
                      <img
                        className="w-full h-full object-cover"
                        src={formatMediaUrl(recipe.imageUrl)}
                        alt={recipe.title || 'Authored Recipe'}
                        onError={(e) => { e.target.src = '/assets/recipe-placeholder.svg'; }}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeClass}`}>
                          {isDraft ? 'Draft' : 'Published'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <h4 className="font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                        {recipe.title || 'Untitled Recipe'}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {recipe.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col gap-2 border-t border-outline-variant/15 pt-2.5 mt-auto">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {recipe.cookingTime || 0} min
                        </span>
                      </div>
                      <div className="flex gap-2 w-full justify-end">
                        {isDraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/recipe/${recipe.id}?preview=true`);
                            }}
                            className="flex-1 flex justify-center items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer border border-outline-variant/50 hover:bg-surface-container"
                          >
                            Preview Draft
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin-editor?edit=${recipe.id}`);
                          }}
                          className={`flex-1 flex justify-center items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                            isDraft
                              ? 'bg-tertiary text-on-tertiary hover:bg-tertiary-container'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {isDraft ? 'Resume Editing' : 'Edit Recipe'}
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Favorites Tab
          favoritedRecipes.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-xl border border-dashed border-outline-variant/50 max-w-md mx-auto">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-md text-on-surface">Your Collection is Empty</h3>
                <p className="text-xs text-on-surface-variant px-6 max-w-sm mx-auto leading-relaxed">
                  Bookmark community recipes from the main feed to gather low-glycemic inspiration right here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {favoritedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )
        )}
      </section>

    </main>
  );
};

export default MyRecipes;
