import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

/**
 * Custom hook to check, add, and remove favorite recipes.
 */
export function useFavorites() {
  const { user, addFavorite, removeFavorite } = useAuth();

  const favorites = user?.favorites || [];

  const isFavorite = useCallback((recipeId) => {
    if (!recipeId) return false;
    return (user?.favorites || []).includes(recipeId);
  }, [user?.favorites]);

  const toggleFavorite = useCallback((recipeId) => {
    if (!recipeId) return;
    if (isFavorite(recipeId)) {
      removeFavorite(recipeId);
    } else {
      addFavorite(recipeId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  };
}

export default useFavorites;
