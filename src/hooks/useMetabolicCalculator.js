import { useMemo } from 'react';
import {
  calculateRecipeNutrition,
  scaleNutrition,
  getGlycemicLoadCategory,
} from '../utils/nutritionCalculator';

/**
 * useMetabolicCalculator — Reactive Metabolic Calculation Hook
 *
 * Binds recipe ingredients and active serving counts dynamically to calculate:
 *   - Net Carbs (total and per serving)
 *   - Composite Glycemic Index (GI)
 *   - Scaled Glycemic Load (GL)
 *   - Category & Color Token mapping (Low/Medium/High GL)
 *
 * @param {object} recipeData — recipe object with `ingredients` and `servings`
 * @param {number} [activeServings] — current active serving multiplier or selected servings
 * @returns {object} — { nutrition, scaledNutrition, glCategory, isZeroCarb }
 */
export function useMetabolicCalculator(recipeData, activeServings) {
  const ingredients = useMemo(() => {
    if (!recipeData) return [];
    return Array.isArray(recipeData.ingredients)
      ? recipeData.ingredients
      : (recipeData.ingredients?.data || []);
  }, [recipeData]);

  const baseServings = useMemo(() => {
    const raw = Number(recipeData?.servings);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [recipeData?.servings]);

  const currentServings = useMemo(() => {
    const raw = Number(activeServings);
    return Number.isFinite(raw) && raw > 0 ? raw : baseServings;
  }, [activeServings, baseServings]);

  const baseNutrition = useMemo(() => {
    return calculateRecipeNutrition(ingredients);
  }, [ingredients]);

  const multiplier = useMemo(() => {
    return currentServings / baseServings;
  }, [currentServings, baseServings]);

  const scaledNutrition = useMemo(() => {
    return scaleNutrition(baseNutrition, multiplier);
  }, [baseNutrition, multiplier]);

  const glCategory = useMemo(() => {
    return getGlycemicLoadCategory(scaledNutrition.glycemicLoad);
  }, [scaledNutrition.glycemicLoad]);

  const isZeroCarb = useMemo(() => {
    return scaledNutrition.netCarbs <= 0;
  }, [scaledNutrition.netCarbs]);

  return {
    nutrition: baseNutrition,
    scaledNutrition,
    glCategory,
    isZeroCarb,
    multiplier,
    currentServings,
    baseServings,
  };
}

export default useMetabolicCalculator;
