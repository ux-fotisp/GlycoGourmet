/**
 * src/services/recommendationEngine.ts
 * Deterministic Clinical Smart Swap Recommendation Engine
 */

export interface DietaryClientProfile {
  id?: string;
  name?: string;
  diabeticSubtype?: string;
  dietaryRestrictions?: string[];
}

export interface CandidateIngredient {
  id: string;
  name: string;
  category: string;
  glycemicIndex?: number;
  gi?: number;
  carbs?: number;
  fiber?: number;
  netCarbs?: number;
  glycemicLoad?: number;
  dietaryFlags?: string[];
  tags?: string[];
  containsGluten?: boolean;
}

export interface SmartSwapRecommendation {
  id: string;
  name: string;
  category: string;
  glycemicIndex: number;
  glPer100g: number;
  sourceGL: number;
  deltaGL: number; // Candidate GL - Source GL (negative number indicates GL reduction)
  dietaryFlags: string[];
}

/**
 * Checks whether an ingredient violates any dietary restrictions.
 */
export function isDietarySafe(
  ingredient: CandidateIngredient,
  dietaryRestrictions: string[] = []
): boolean {
  if (!dietaryRestrictions || dietaryRestrictions.length === 0) return true;

  const nameLower = (ingredient.name || '').toLowerCase();
  const idLower = (ingredient.id || '').toLowerCase();
  const tagsLower = (ingredient.dietaryFlags || ingredient.tags || []).map((t) => t.toLowerCase());

  for (const rawRestriction of dietaryRestrictions) {
    const r = rawRestriction.toLowerCase().trim();

    if (r === 'gluten-free' || r === 'gluten_free') {
      const glutenGrains = [
        'wheat',
        'barley',
        'rye',
        'spelt',
        'farro',
        'semolina',
        'couscous',
        'bulgur',
        'durum',
        'gluten',
      ];
      const hasGlutenName = glutenGrains.some((g) => nameLower.includes(g) || idLower.includes(g));
      if (ingredient.containsGluten || hasGlutenName) {
        return false;
      }
    }

    if (r === 'vegan') {
      const animalProducts = [
        'meat',
        'beef',
        'pork',
        'chicken',
        'turkey',
        'fish',
        'salmon',
        'tuna',
        'seafood',
        'shrimp',
        'dairy',
        'milk',
        'cheese',
        'yogurt',
        'butter',
        'egg',
        'eggs',
        'honey',
        'gelatin',
        'whey',
        'casein',
      ];
      const isAnimal = animalProducts.some((a) => nameLower.includes(a) || idLower.includes(a));
      if (isAnimal && !tagsLower.includes('vegan')) {
        return false;
      }
    }

    if (r === 'vegetarian') {
      const meatProducts = [
        'meat',
        'beef',
        'pork',
        'chicken',
        'turkey',
        'fish',
        'salmon',
        'tuna',
        'seafood',
        'shrimp',
        'gelatin',
        'lard',
        'tallow',
      ];
      const isMeat = meatProducts.some((m) => nameLower.includes(m) || idLower.includes(m));
      if (isMeat && !tagsLower.includes('vegetarian')) {
        return false;
      }
    }

    if (r === 'dairy-free' || r === 'dairy_free') {
      const dairyProducts = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey', 'casein', 'dairy', 'ghee'];
      const isDairy = dairyProducts.some((d) => nameLower.includes(d) || idLower.includes(d));
      if (isDairy && !tagsLower.includes('dairy-free')) {
        return false;
      }
    }

    if (r === 'nut-free' || r === 'nut_free') {
      const nuts = ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'macadamia', 'pistachio', 'hazelnut'];
      const isNut = nuts.some((n) => nameLower.includes(n) || idLower.includes(n));
      if (isNut && !tagsLower.includes('nut-free')) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Calculates deterministic Glycemic Load per 100g for an ingredient.
 */
export function calculateGLPer100g(ingredient: CandidateIngredient): number {
  if (typeof ingredient.glycemicLoad === 'number' && Number.isFinite(ingredient.glycemicLoad)) {
    return Math.round(ingredient.glycemicLoad * 10) / 10;
  }

  const gi = Number(ingredient.glycemicIndex ?? ingredient.gi) || 0;
  const netCarbs =
    ingredient.netCarbs !== undefined
      ? Number(ingredient.netCarbs)
      : Math.max(0, (Number(ingredient.carbs) || 0) - (Number(ingredient.fiber) || 0));

  return Math.round(((gi * netCarbs) / 100) * 10) / 10;
}

/**
 * generateSmartSwapRecommendations
 *
 * Deterministically filters and ranks lower-GI ingredient alternatives
 * matching the functional category and satisfying clinical dietary safety gates.
 *
 * @param sourceIngredientId - The ID or name of the ingredient to substitute
 * @param clientProfile      - Optional client profile containing dietaryRestrictions
 * @param ingredientsMap     - Dictionary or Array of available ingredients
 * @returns SmartSwapRecommendation[] (top 5 sorted by largest GL reduction)
 */
export function generateSmartSwapRecommendations(
  sourceIngredientId: string,
  clientProfile?: DietaryClientProfile | null,
  ingredientsMap: Record<string, CandidateIngredient> | CandidateIngredient[] = []
): SmartSwapRecommendation[] {
  if (!sourceIngredientId) return [];

  // 1. Resolve ingredients list and lookup source
  const allIngredients: CandidateIngredient[] = Array.isArray(ingredientsMap)
    ? ingredientsMap
    : Object.values(ingredientsMap);

  const sourceIngredient = allIngredients.find(
    (ing) =>
      ing.id === sourceIngredientId ||
      ing.name?.toLowerCase() === sourceIngredientId.toLowerCase()
  );

  if (!sourceIngredient) return [];

  const sourceCategory = (sourceIngredient.category || 'grain').toLowerCase();
  const sourceGL = calculateGLPer100g(sourceIngredient);
  const dietaryRestrictions = clientProfile?.dietaryRestrictions || [];

  // 2. Categorical Matching & Safety Gate Filtering
  const candidates = allIngredients.filter((candidate) => {
    // Exclude self
    if (candidate.id === sourceIngredient.id) return false;

    // Must share category
    const candidateCategory = (candidate.category || '').toLowerCase();
    if (candidateCategory !== sourceCategory) return false;

    // Clinical Safety Gate (Dietary Allergies & Restrictions)
    if (!isDietarySafe(candidate, dietaryRestrictions)) {
      return false;
    }

    return true;
  });

  // 3. Metabolic Optimization & Delta Filtering
  const recommendations: SmartSwapRecommendation[] = [];

  for (const candidate of candidates) {
    const candidateGL = calculateGLPer100g(candidate);
    const deltaGL = Math.round((candidateGL - sourceGL) * 10) / 10;

    // Discard any candidates where deltaGL >= 0 (must reduce Glycemic Load)
    if (deltaGL >= 0) continue;

    recommendations.push({
      id: candidate.id,
      name: candidate.name,
      category: candidate.category,
      glycemicIndex: Number(candidate.glycemicIndex ?? candidate.gi) || 0,
      glPer100g: candidateGL,
      sourceGL,
      deltaGL,
      dietaryFlags: candidate.dietaryFlags || candidate.tags || [],
    });
  }

  // 4. Sorting: Ascending deltaGL (most negative reduction first, e.g. -15 before -5)
  recommendations.sort((a, b) => a.deltaGL - b.deltaGL);

  // 5. Return top 5 results
  return recommendations.slice(0, 5);
}

export default {
  isDietarySafe,
  calculateGLPer100g,
  generateSmartSwapRecommendations,
};
