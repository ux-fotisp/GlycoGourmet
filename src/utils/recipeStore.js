/**
 * recipeStore.js — Snappi CMS Data Layer
 *
 * Architecture:
 * - All recipes are stored in the Snappi CMS `/collections/recipes` endpoint.
 * - GET operations use the SWR-cached snappiClient for low-cost reads.
 * - Write operations (create/update) POST/PUT to Snappi with draft/published
 *   status, invalidating local caches on success.
 * - Falls back gracefully to local /public/data/ JSON for system seed recipes
 *   if the Snappi endpoint is unreachable.
 */

import { snappiGet, snappiPost, snappiPut, invalidateCache } from '../services/snappiClient';

const COLLECTION = '/collections/recipes';

// ─── Module-Level Cache (Snappi-backed) ────────────────────────────────────

/** @type {Array<object>|null} — in-memory shallow index cache */
let _indexCache = null;

// ─── Read Operations ───────────────────────────────────────────────────────

/**
 * Returns all recipes from the Snappi recipes collection.
 *
 * On first call, fetches from Snappi (or SWR cache). Subsequent calls
 * within the same session use the in-memory cache. Call `invalidateRecipeCache()`
 * to force a fresh fetch.
 *
 * Falls back to /public/data/recipes_index.json if Snappi is unavailable.
 *
 * @param {object} [filters] — optional query filters
 * @param {string} [filters.status] — 'published' | 'draft'
 * @param {string} [filters.authorId] — filter by author user ID
 * @returns {Promise<Array<object>>}
 */
export async function getAllRecipes(filters = {}) {
  try {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.authorId) params.authorId = filters.authorId;

    const response = await snappiGet(COLLECTION, params);

    // Snappi may return { data: [...] } or a flat array
    const recipes = Array.isArray(response) ? response : (response?.data ?? []);

    // Normalize shape for frontend consumption
    _indexCache = recipes.map((r) => ({
      id: r?.id ?? '',
      title: r?.title ?? '',
      description: r?.description ?? '',
      imageUrl: r?.imageUrl ?? '',
      cookingTime: r?.cookingTime ?? 0,
      difficulty: r?.difficulty ?? '',
      tags: Array.isArray(r?.tags) ? r.tags : [],
      status: r?.status ?? 'published',
      authorId: r?.authorId ?? '',
      isUserAuthored: r?.isUserAuthored ?? (!!r?.authorId),
      ingredients: Array.isArray(r?.ingredients) ? r.ingredients : [],
      steps: Array.isArray(r?.steps) ? r.steps : [],
      servings: r?.servings ?? 1,
    }));

    return _indexCache;
  } catch (err) {
    console.warn('[recipeStore] Snappi fetch failed, falling back to local data:', err.message);
    return _fallbackToLocal();
  }
}

/**
 * Local JSON fallback — mirrors the legacy data layer.
 * Used only when the Snappi API is unreachable.
 * @returns {Promise<Array<object>>}
 */
async function _fallbackToLocal() {
  if (_indexCache) return _indexCache;
  try {
    const res = await fetch('/data/recipes_index.json');
    if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
    const systemIndex = await res.json();
    _indexCache = systemIndex.map((r) => ({
      ...r,
      isUserAuthored: r.isUserAuthored ?? false,
      status: r.status ?? 'published',
    }));
    return _indexCache;
  } catch (fallbackErr) {
    console.error('[recipeStore] Local fallback also failed:', fallbackErr);
    _indexCache = [];
    return [];
  }
}

/**
 * Fetches the full recipe object by ID from Snappi.
 * Falls back to local JSON files for system recipes.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getRecipeById(id) {
  if (!id) return null;

  try {
    const response = await snappiGet(`${COLLECTION}/${id}`);
    const recipe = response?.data ?? response;
    if (!recipe?.id) return null;

    return {
      id: recipe.id,
      title: recipe.title ?? '',
      description: recipe.description ?? '',
      imageUrl: recipe.imageUrl ?? '',
      cookingTime: recipe.cookingTime ?? 0,
      difficulty: recipe.difficulty ?? '',
      servings: recipe.servings ?? 1,
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
      status: recipe.status ?? 'published',
      authorId: recipe.authorId ?? '',
      isUserAuthored: recipe.isUserAuthored ?? (!!recipe.authorId),
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    };
  } catch (err) {
    console.warn(`[recipeStore] Snappi fetch for recipe ${id} failed:`, err.message);
    // Fallback to local file
    try {
      const res = await fetch(`/data/recipes/${id}.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

// ─── Write Operations ──────────────────────────────────────────────────────

/**
 * Saves a recipe to the Snappi CMS.
 *
 * - If the recipe has an existing Snappi `id` and the operation is an update,
 *   sends a PUT request to update the record.
 * - Otherwise, sends a POST request to create a new record.
 *
 * On success, invalidates both the SWR sessionStorage cache and the
 * in-memory index cache.
 *
 * @param {object} recipe — full recipe object including `id` and `status`
 * @param {object} [options]
 * @param {boolean} [options.isUpdate=false] — force PUT instead of POST
 * @returns {Promise<object>} — the saved recipe from Snappi
 */
export async function saveRecipe(recipe, { isUpdate = false } = {}) {
  if (!recipe?.id && !recipe?.title) {
    throw new Error('[recipeStore] Cannot save a recipe without an id or title.');
  }

  const payload = {
    id: recipe.id,
    title: recipe.title ?? '',
    description: recipe.description ?? '',
    imageUrl: recipe.imageUrl ?? '',
    cookingTime: recipe.cookingTime ?? 0,
    difficulty: recipe.difficulty ?? '',
    servings: recipe.servings ?? 1,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    status: recipe.status ?? 'draft',
    authorId: recipe.authorId ?? '',
    isUserAuthored: true,
    ingredients: (recipe.ingredients ?? []).map((ing) => ({
      ingredientId: ing?.ingredientId ?? '',
      amount: parseFloat(ing?.amount) || 0,
      unit: ing?.unit ?? 'g',
      prepState: ing?.prepState ?? 'raw',
    })),
    steps: (recipe.steps ?? []).map((step) => ({
      title: step?.title ?? '',
      description: step?.description ?? '',
      timer: step?.timer ?? null,
    })),
  };

  let saved;
  if (isUpdate && recipe.id) {
    saved = await snappiPut(`${COLLECTION}/${recipe.id}`, payload);
  } else {
    saved = await snappiPost(COLLECTION, payload);
  }

  // Invalidate caches
  invalidateRecipeCache();

  return saved?.data ?? saved;
}

/**
 * Invalidates all recipe caches (in-memory + sessionStorage SWR).
 * Call this after any write operation or when a guaranteed fresh fetch is needed.
 */
export function invalidateRecipeCache() {
  _indexCache = null;
  invalidateCache('recipes');
}
