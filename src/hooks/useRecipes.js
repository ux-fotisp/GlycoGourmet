import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllRecipes, saveRecipe as saveRecipeToStore, invalidateRecipeCache } from '../utils/recipeStore';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to manage recipe lists, search queries, active tags, and user-created entries.
 *
 * Connected to Strapi CMS via recipeStore:
 * - Dashboard Feed: Fetches `/api/recipes?populate=*&publicationState=live`
 * - "My Recipes" Workspace:
 *   * Authored Drafts (`publishedAt: null`)
 *   * Authored Published (`publicationState=live`)
 * - Invalidates SWR caches after save operations
 */
export function useRecipes() {
  const { user } = useAuth();
  const [allRecipes, setAllRecipes] = useState([]);
  const [previewRecipes, setPreviewRecipes] = useState([]); // Drafts + Published for active user
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  const refreshRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live published recipes for public feed
      const live = await getAllRecipes({ publicationState: 'live' });
      setAllRecipes(live ?? []);

      // 2. Fetch preview recipes (including drafts) for user workspace
      const preview = await getAllRecipes({ publicationState: 'preview' });
      setPreviewRecipes(preview ?? []);
    } catch (err) {
      console.error('[useRecipes] Failed to refresh Strapi recipes:', err);
      setAllRecipes([]);
      setPreviewRecipes([]);
    } fontally: {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecipes();
  }, [refreshRecipes]);

  /**
   * Saves a recipe to Strapi CMS, then refreshes local lists.
   */
  const saveRecipe = useCallback(async (recipe, options = {}) => {
    try {
      await saveRecipeToStore(recipe, options);
      invalidateRecipeCache();
      await refreshRecipes();
    } catch (err) {
      console.error('[useRecipes] Failed to save recipe to Strapi:', err);
      throw err;
    }
  }, [refreshRecipes]);

  // Dashboard Feed: only published live recipes matching search & tags
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      if (recipe?.status !== 'published' && recipe?.publishedAt === null) return false;

      const matchesTags = activeTags.every(
        tag => Array.isArray(recipe?.tags) && recipe.tags.includes(tag)
      );

      const searchLower = searchText.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        (recipe?.title && recipe.title.toLowerCase().includes(searchLower)) ||
        (recipe?.description && recipe.description.toLowerCase().includes(searchLower));

      return matchesTags && matchesSearch;
    });
  }, [allRecipes, activeTags, searchText]);

  // Authored recipes view — includes both Drafts and Published entries created by current user
  const authoredRecipes = useMemo(() => {
    const currentUserEmail = user?.email?.toLowerCase();
    const currentUserId = user?.id;

    // Combine preview list (which contains drafts) and filter by user
    return previewRecipes.filter(recipe => {
      if (currentUserEmail && recipe?.authorId?.toLowerCase() === currentUserEmail) {
        return true;
      }
      if (currentUserId && String(recipe?.authorId) === String(currentUserId)) {
        return true;
      }
      return recipe?.isUserAuthored === true;
    });
  }, [previewRecipes, user?.email, user?.id]);

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
    previewRecipes,
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
