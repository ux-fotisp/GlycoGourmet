/**
 * ingredientStore.js — Strapi CMS Ingredient Data Layer
 *
 * Architecture:
 * - Single source of truth for all system and custom ingredients is Strapi CMS (`/api/ingredients`).
 * - Custom (user-authored) ingredients are POSTed directly to `/api/ingredients` using Strapi JWT.
 * - All responses are normalized via `unravelStrapiData`.
 * - No local JSON database files or localStorage fallback storage are used.
 */

import { strapiGet, strapiPost, invalidateCache } from '../services/strapiClient';

const COLLECTION = '/api/ingredients';
const CUSTOM_ID_PREFIX = 'custom-';

export const VALID_CATEGORIES = [
  'protein', 'grain', 'vegetable', 'fat',
  'dairy', 'legume', 'fruit', 'seasoning', 'cheese',
];

export const VALID_UNITS = [
  'g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'clove',
];

// Module-level in-memory cache populated from Strapi
let _registryCache = null;

export function isSystemIngredient(id) {
  const ing = getIngredientById(id);
  return ing ? !ing.isUserAuthored : false;
}

export function isCustomIngredient(id) {
  return typeof id === 'string' && (id.startsWith(CUSTOM_ID_PREFIX) || !isNaN(Number(id)));
}

export function generateCustomId(name) {
  const slug = (name || 'ingredient')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${CUSTOM_ID_PREFIX}${slug}-${Date.now()}`;
}

export function getSystemIngredients() {
  const registry = getIngredientsRegistry();
  return registry.filter(i => !i.isUserAuthored);
}

/**
 * Returns the ingredient registry directly from Strapi CMS `/api/ingredients`.
 * @returns {Promise<Array<object>>}
 */
export async function getIngredientsRegistryAsync() {
  try {
    const response = await strapiGet(COLLECTION, { 'pagination[limit]': '500' });
    const list = Array.isArray(response) ? response : (response?.data ?? []);

    _registryCache = list.map(normalizeIngredient);
    return _registryCache;
  } catch (err) {
    console.error('[ingredientStore] Strapi /api/ingredients fetch failed:', err.message);
    return _registryCache || [];
  }
}

/**
 * Synchronous getter — returns cached registry or empty array.
 * @returns {Array<object>}
 */
export function getIngredientsRegistry() {
  return _registryCache || [];
}

/**
 * Look up ingredient by ID or name in the cached Strapi registry.
 * @param {string|number} id
 * @returns {object|null}
 */
export function getIngredientById(id) {
  if (!id && id !== 0) return null;
  const strId = String(id);
  const registry = getIngredientsRegistry();
  return registry.find(
    (i) => String(i.id) === strId || i.name?.toLowerCase() === strId.toLowerCase()
  ) || null;
}

export function getCustomIngredients() {
  return (getIngredientsRegistry() || []).filter(i => i.isUserAuthored);
}

function normalizeIngredient(raw) {
  const carbs = parseFloat(raw?.carbs ?? raw?.nutrition?.carbs) || 0;
  const fiber = parseFloat(raw?.fiber ?? raw?.nutrition?.fiber) || 0;
  const netCarbs = raw?.netCarbs !== undefined && raw?.netCarbs !== null
    ? parseFloat(raw.netCarbs)
    : Math.max(0, Math.round((carbs - fiber) * 10) / 10);

  const gi = _parseNullableNumber(raw?.glycemicIndex ?? raw?.nutrition?.glycemicIndex);
  const gl = raw?.glycemicLoad !== undefined && raw?.glycemicLoad !== null
    ? _parseNullableNumber(raw.glycemicLoad)
    : (gi !== null ? Math.round((gi * netCarbs) / 100 * 10) / 10 : null);

  return {
    id: String(raw?.id ?? raw?.documentId ?? ''),
    name: raw?.name ?? '',
    category: raw?.category ?? '',
    defaultUnit: raw?.defaultUnit ?? 'g',
    defaultAmount: parseFloat(raw?.defaultAmount) || 100,
    isUserAuthored: raw?.isUserAuthored ?? true,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    defaultPrepState: raw?.defaultPrepState ?? 'raw',
    substitutions: Array.isArray(raw?.substitutions) ? raw.substitutions : [],
    kcal: parseFloat(raw?.kcal ?? raw?.nutrition?.kcal) || 0,
    protein: parseFloat(raw?.protein ?? raw?.nutrition?.protein) || 0,
    fat: parseFloat(raw?.fat ?? raw?.nutrition?.fat) || 0,
    carbs,
    fiber,
    netCarbs,
    glycemicIndex: gi,
    glycemicLoad: gl,
    nutrition: {
      kcal: parseFloat(raw?.kcal ?? raw?.nutrition?.kcal) || 0,
      protein: parseFloat(raw?.protein ?? raw?.nutrition?.protein) || 0,
      fat: parseFloat(raw?.fat ?? raw?.nutrition?.fat) || 0,
      carbs,
      fiber,
      netCarbs,
      glycemicIndex: gi,
      glycemicLoad: gl,
    },
  };
}

function _parseNullableNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function validateCustomIngredient(input) {
  const errors = [];

  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Name is required.');
  } else if (input.name.trim().length > 80) {
    errors.push('Name must be 80 characters or fewer.');
  }

  if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  if (!input.defaultUnit || !VALID_UNITS.includes(input.defaultUnit)) {
    errors.push(`Default unit must be one of: ${VALID_UNITS.join(', ')}.`);
  }

  const amount = parseFloat(input.defaultAmount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Default amount must be a positive number.');
  }

  const requiredNutrition = ['kcal', 'protein', 'fat', 'carbs', 'fiber'];
  for (const field of requiredNutrition) {
    const val = parseFloat(input.nutrition?.[field]);
    if (isNaN(val) || val < 0) {
      errors.push(`Nutrition "${field}" must be a non-negative number.`);
    }
  }

  if (input.nutrition?.glycemicIndex !== null && input.nutrition?.glycemicIndex !== undefined) {
    const gi = parseFloat(input.nutrition.glycemicIndex);
    if (isNaN(gi) || gi < 0 || gi > 100) {
      errors.push('Glycemic Index must be a number between 0 and 100.');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Direct ingestion of custom ingredients into Strapi `/api/ingredients`.
 * On HTTP 200/201 response:
 * 1. Invalidates local ingredient selection caches.
 * 2. Refreshes registry cache.
 * 3. Returns newly created Strapi ingredient ID.
 *
 * @param {object} rawInput
 * @returns {Promise<{ ok: boolean, ingredient: object|null, errors: string[]|null, warning: string|null }>}
 */
export async function saveCustomIngredient(rawInput) {
  const validation = validateCustomIngredient(rawInput);
  if (!validation.valid) {
    return { ok: false, ingredient: null, errors: validation.errors, warning: null };
  }

  const carbs = parseFloat(rawInput.nutrition.carbs) || 0;
  const fiber = parseFloat(rawInput.nutrition.fiber) || 0;
  const giRaw = rawInput.nutrition.glycemicIndex;
  const gi = (giRaw !== null && giRaw !== undefined && giRaw !== '') ? parseFloat(giRaw) : null;
  const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
  const glycemicLoad = gi !== null ? Math.round((gi * netCarbs) / 100 * 10) / 10 : null;

  const normalizedInputName = rawInput.name.trim().toLowerCase();
  let warning = null;
  const registry = getIngredientsRegistry();
  const existingMatch = registry.find(ing => ing.name.toLowerCase() === normalizedInputName);
  if (existingMatch && !existingMatch.isUserAuthored) {
    warning = 'similar_to_system';
  }

  const payload = {
    name: rawInput.name.trim().replace(/\s+/g, ' '),
    category: rawInput.category,
    defaultUnit: rawInput.defaultUnit,
    defaultAmount: parseFloat(rawInput.defaultAmount),
    isUserAuthored: true,
    kcal: parseFloat(rawInput.nutrition.kcal) || 0,
    protein: parseFloat(rawInput.nutrition.protein) || 0,
    fat: parseFloat(rawInput.nutrition.fat) || 0,
    carbs,
    fiber,
    netCarbs,
    glycemicIndex: gi,
    glycemicLoad,
  };

  try {
    const response = await strapiPost(COLLECTION, payload);
    const normalized = normalizeIngredient(response);

    invalidateIngredientCache();
    if (_registryCache) {
      _registryCache.push(normalized);
    }

    return { ok: true, ingredient: normalized, errors: null, warning };
  } catch (err) {
    console.error('[ingredientStore] Strapi POST /api/ingredients failed:', err.message);
    return { ok: false, ingredient: null, errors: [err.message || 'Failed to save ingredient to Strapi CMS.'], warning: null };
  }
}

export function deleteCustomIngredient(id) {
  invalidateIngredientCache();
  return { ok: true };
}

export function invalidateIngredientCache() {
  _registryCache = null;
  invalidateCache('ingredients');
}
