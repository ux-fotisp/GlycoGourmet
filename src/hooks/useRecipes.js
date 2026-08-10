import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllRecipes, saveRecipe as saveRecipeToStore, invalidateRecipeCache } from '../utils/recipeStore';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to manage recipe lists, search queries, active tags, and user-created entries.
 *
 * Connected to Snappi CMS via recipeStore:
 * - Global Dashboard Feed: fetches published recipes
 * - "My Recipes" Workspace: fetches recipes by authorId
 * - Invalidates SWR caches after save operations
 */
export function useRecipes() {
  const { user } = useAuth();
  const [allRecipes, setAllRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  const refreshRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const recipes = await getAllRecipes();
      setAllRecipes(recipes ?? []);
    } catch (err) {
      console.error('[useRecipes] Failed to refresh recipes:', err);
      setAllRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecipes();
  }, [refreshRecipes]);

  /**
   * Saves a recipe to Snappi CMS, then refreshes the local list.
   * Supports both new creations and updates.
   */
  const saveRecipe = useCallback(async (recipe, options = {}) => {
    try {
      await saveRecipeToStore(recipe, options);
      // Invalidate caches and refresh
      invalidateRecipeCache();
      await refreshRecipes();
    } catch (err) {
      console.error('[useRecipes] Failed to save recipe:', err);
      throw err; // Re-throw so callers can show error notifications
    }
  }, [refreshRecipes]);

  // Performance-optimized filtration — runs only when deps change
  // Global Dashboard Feed: only published recipes
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      // Exclude draft recipes from public feed
      if (recipe?.status !== 'published') return false;

      // Recipe must match ALL active tags
      const matchesTags = activeTags.every(
        tag => Array.isArray(recipe?.tags) && recipe.tags.includes(tag)
      );

      // Search: match title or description
      const searchLower = searchText.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        (recipe?.title && recipe.title.toLowerCase().includes(searchLower)) ||
        (recipe?.description && recipe.description.toLowerCase().includes(searchLower));

      return matchesTags && matchesSearch;
    });
  }, [allRecipes, activeTags, searchText]);

  // Authored recipes view — recipes created by the current user
  // For Snappi: filters by authorId (email); fallback: isUserAuthored flag
  const authoredRecipes = useMemo(() => {
    const currentUserEmail = user?.email?.toLowerCase();
    return allRecipes.filter(recipe => {
      // Snappi authorId match
      if (currentUserEmail && recipe?.authorId?.toLowerCase() === currentUserEmail) {
        return true;
      }
      // Fallback: legacy isUserAuthored flag
      return recipe?.isUserAuthored === true;
    });
  }, [allRecipes, user?.email]);

  const toggleTag = useCallback((tag) => {
    setActiveTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags([]);
    setSearchText('');
  }, []);

  return {
    allRecipes,
    isLoading,
    recipes: filteredRecipes,
    authoredRecipes,
    searchText,
    setSearchText,
    activeTags,
    setActiveTags,
    toggleTag,
    clearFilters,
    refreshRecipes,
    saveRecipe,
  };
}

export default useRecipes;
