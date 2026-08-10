/**
 * recipeStore.js — Strapi CMS Recipe Data Layer
 *
 * Architecture:
 * - All recipes are stored in Strapi `/api/recipes`.
 * - Supports Strapi's Draft & Publish feature:
 *   * Draft: `publishedAt: null`
 *   * Published: `publishedAt: new Date().toISOString()`
 * - GET requests use SWR-cached `strapiGet` wrapper.
 * - Writes (create/update) send POST/PUT to `/api/recipes` with auto cache invalidation.
 * - No static database file imports or local fallback JSON fetches exist.
 */

import { strapiGet, strapiPost, strapiPut, invalidateCache } from '../services/strapiClient';

const COLLECTION = '/api/recipes';

let _indexCache = null;

/**
 * Fetches recipes directly from Strapi CMS `/api/recipes`.
 *
 * @param {object} [options]
 * @param {'live'|'preview'} [options.publicationState='live']
 * @param {object} [options.filters]
 * @returns {Promise<Array<object>>}
 */
export async function getAllRecipes(options = {}) {
  try {
    const params = {
      populate: '*',
      publicationState: options.publicationState || 'live',
    };

    if (options.filters && typeof options.filters === 'object') {
      Object.entries(options.filters).forEach(([key, val]) => {
        params[key] = val;
      });
    }

    const response = await strapiGet(COLLECTION, params);
    const recipes = Array.isArray(response) ? response : (response?.data ?? []);

    _indexCache = recipes.map(normalizeRecipe);
    return _indexCache;
  } catch (err) {
    console.error('[recipeStore] Strapi /api/recipes fetch failed:', err.message);
    return _indexCache || [];
  }
}

/**
 * Fetches full recipe details by ID from Strapi.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function getRecipeById(id) {
  if (!id && id !== 0) return null;

  try {
    const response = await strapiGet(`${COLLECTION}/${id}`, { populate: '*' });
    const recipe = response?.data ?? response;
    if (!recipe) return null;

    return normalizeRecipe(recipe);
  } catch (err) {
    console.error(`[recipeStore] Strapi GET /api/recipes/${id} failed:`, err.message);
    return null;
  }
}

/**
 * Saves a recipe to Strapi `/api/recipes`.
 *
 * @param {object} recipe
 * @param {object} [options]
 * @param {boolean} [options.isUpdate=false]
 * @param {string|null} [options.publishedAt=null] — null for draft, ISO string for published
 * @returns {Promise<object>}
 */
export async function saveRecipe(recipe, { isUpdate = false, publishedAt = null } = {}) {
  if (!recipe?.id && !recipe?.title) {
    throw new Error('[recipeStore] Cannot save a recipe without a title.');
  }

  const finalPublishedAt = publishedAt !== undefined
    ? publishedAt
    : (recipe.status === 'published' ? (recipe.publishedAt || new Date().toISOString()) : null);

  const payload = {
    title: recipe.title ?? '',
    description: recipe.description ?? '',
    imageUrl: recipe.imageUrl ?? '',
    cookingTime: parseFloat(recipe.cookingTime) || 0,
    difficulty: recipe.difficulty ?? 'Easy',
    servings: parseFloat(recipe.servings) || 1,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    publishedAt: finalPublishedAt,
    authorId: recipe.authorId ?? '',
    isUserAuthored: true,
    ingredients: (recipe.ingredients ?? []).map((ing) => ({
      ingredientId: String(ing?.ingredientId || ing?.id || ''),
      amount: parseFloat(ing?.amount) || 0,
      unit: ing?.unit ?? 'g',
      prepState: ing?.prepState ?? 'raw',
    })),
    steps: (recipe.steps ?? []).map((step) => ({
      title: step?.title ?? '',
      description: step?.description ?? '',
      timer: step?.timer !== undefined && step?.timer !== null ? parseFloat(step.timer) : null,
    })),
  };

  let saved;
  if (isUpdate && recipe.id) {
    saved = await strapiPut(`${COLLECTION}/${recipe.id}`, payload);
  } else {
    saved = await strapiPost(COLLECTION, payload);
  }

  invalidateRecipeCache();
  return normalizeRecipe(saved?.data ?? saved);
}

function normalizeRecipe(r) {
  const publishedAt = r?.publishedAt ?? (r?.status === 'published' ? new Date().toISOString() : null);
  const status = publishedAt ? 'published' : 'draft';

  return {
    id: String(r?.id ?? r?.documentId ?? ''),
    title: r?.title ?? '',
    description: r?.description ?? '',
    imageUrl: r?.imageUrl ?? '',
    cookingTime: parseFloat(r?.cookingTime) || 0,
    difficulty: r?.difficulty ?? 'Easy',
    servings: parseFloat(r?.servings) || 1,
    tags: Array.isArray(r?.tags) ? r.tags : [],
    publishedAt,
    status,
    authorId: r?.authorId ?? '',
    isUserAuthored: r?.isUserAuthored ?? (!!r?.authorId),
    ingredients: Array.isArray(r?.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r?.steps) ? r.steps : [],
  };
}

export function invalidateRecipeCache() {
  _indexCache = null;
  invalidateCache('recipes');
}
