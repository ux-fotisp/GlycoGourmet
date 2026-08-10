/**
 * ingredientStore.js — Strapi CMS Ingredient Data Layer
 *
 * Architecture:
 * - TIER 1 — System seed DB (src/data/ingredients.json)
 *   • Bundled at build time as fallback when Strapi is unreachable.
 *
 * - TIER 2 — Strapi CMS Collection (/api/ingredients)
 *   • Single source of truth for all ingredients (system + custom).
 *   • Custom (user-authored) ingredients are POSTed directly to `/api/ingredients` with JWT.
 *   • Normalizes Strapi responses via `unravelStrapiData`.
 */

import ingredientsDb from '../data/ingredients.json';
import { strapiGet, strapiPost, invalidateCache } from '../services/strapiClient';

// ─── Constants ──────────────────────────────────────────────────────────────

const COLLECTION = '/api/ingredients';
const CUSTOM_ID_PREFIX = 'custom-';
const STORAGE_KEY = 'glyco_custom_ingredients';

export const VALID_CATEGORIES = [
  'protein', 'grain', 'vegetable', 'fat',
  'dairy', 'legume', 'fruit', 'seasoning', 'cheese',
];

export const VALID_UNITS = [
  'g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'clove',
];

const SOFT_LIMIT = 200;

// ─── Module-Level Caches ───────────────────────────────────────────────────

let _registryCache = null;
const _systemIdSet = new Set(ingredientsDb.map((i) => i.id));

// ─── ID & Classification Helpers ───────────────────────────────────────────

export function isSystemIngredient(id) {
  return _systemIdSet.has(id);
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

// ─── Read Operations ───────────────────────────────────────────────────────

export function getSystemIngredients() {
  return Object.freeze([...ingredientsDb]);
}

/**
 * Returns the merged ingredient registry from Strapi CMS `/api/ingredients`.
 * Falls back to local data (seed JSON + localStorage) when Strapi is unavailable.
 *
 * @returns {Promise<Array<object>>}
 */
export async function getIngredientsRegistryAsync() {
  try {
    const response = await strapiGet(COLLECTION, { pagination: { limit: 500 } });
    const list = Array.isArray(response) ? response : (response?.data ?? []);

    _registryCache = list.map(normalizeIngredient);
    return _registryCache;
  } catch (err) {
    console.warn('[ingredientStore] Strapi fetch failed, using local fallback:', err.message);
    return _getLocalFallbackRegistry();
  }
}

/**
 * Synchronous getter — returns the last cached registry or local fallback.
 * @returns {Array<object>}
 */
export function getIngredientsRegistry() {
  if (_registryCache) return _registryCache;
  return _getLocalFallbackRegistry();
}

function _getLocalFallbackRegistry() {
  const custom = _readLocalCustomIngredients();
  const safeCustom = custom.filter((c) => !isSystemIngredient(c.id));
  return [...ingredientsDb, ...safeCustom];
}

export function getIngredientById(id) {
  if (!id && id !== 0) return null;
  const strId = String(id);

  const registry = getIngredientsRegistry();
  const found = registry.find((i) => String(i.id) === strId || i.name?.toLowerCase() === strId.toLowerCase());
  if (found) return found;

  return ingredientsDb.find((i) => String(i.id) === strId) || null;
}

function _readLocalCustomIngredients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomIngredients() {
  return _readLocalCustomIngredients();
}

// ─── Normalization ─────────────────────────────────────────────────────────

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

// ─── Validation ─────────────────────────────────────────────────────────────

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

// ─── Write Operations (Strapi /api/ingredients) ──────────────────────

/**
 * Direct ingestion of custom ingredients into Strapi `/api/ingredients`.
 * On HTTP 200/201:
 * 1. Invalidates local ingredient caches.
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

  if (rawInput.id && isSystemIngredient(rawInput.id)) {
    return {
      ok: false,
      ingredient: null,
      errors: ['This ID conflicts with a system ingredient. System ingredients cannot be overwritten.'],
      warning: null,
    };
  }

  const normalizedInputName = rawInput.name.trim().toLowerCase();
  let warning = null;
  const systemMatch = ingredientsDb.find(sys => sys.name.toLowerCase() === normalizedInputName);
  if (systemMatch) {
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

    // Invalidate local ingredient caches and update registry cache immediately
    invalidateIngredientCache();
    if (_registryCache) {
      _registryCache.push(normalized);
    }

    return { ok: true, ingredient: normalized, errors: null, warning };
  } catch (err) {
    console.warn('[ingredientStore] Strapi POST /api/ingredients failed, saving to localStorage:', err.message);

    const localId = rawInput.id || generateCustomId(rawInput.name);
    const localIngredient = {
      ...payload,
      id: localId,
      nutrition: { ...payload },
    };
    _saveToLocalStorage(localIngredient);
    invalidateIngredientCache();

    return { ok: true, ingredient: localIngredient, errors: null, warning };
  }
}

function _saveToLocalStorage(ingredient) {
  try {
    const existing = _readLocalCustomIngredients();
    const idx = existing.findIndex((c) => c.id === ingredient.id);
    if (idx > -1) {
      existing[idx] = ingredient;
    } else {
      existing.push(ingredient);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[ingredientStore] Failed to write to localStorage:', err);
  }
}

export function deleteCustomIngredient(id) {
  if (!isCustomIngredient(id)) {
    return { ok: false, error: 'Only custom ingredients can be deleted.' };
  }
  const existing = _readLocalCustomIngredients();
  const filtered = existing.filter((c) => String(c.id) !== String(id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[ingredientStore] Deletion error:', err);
  }
  invalidateIngredientCache();
  return { ok: true };
}

export function invalidateIngredientCache() {
  _registryCache = null;
  invalidateCache('ingredients');
}
