/**
 * ingredientStore.js — Snappi CMS Ingredient Data Layer
 *
 * Architecture:
 * - TIER 1 — System seed DB (src/data/ingredients.json)
 *   • Bundled at build time. Used as local fallback when Snappi is unreachable.
 *   • Read-only reference. Never mutated at runtime.
 *
 * - TIER 2 — Snappi CMS Collection (/collections/ingredients)
 *   • The single source of truth for all ingredients (system + custom).
 *   • Custom (user-authored) ingredients are POSTed here directly.
 *   • All IDs for user-authored entries carry the "custom-" prefix.
 *
 * On read, the store tries Snappi first. If the API is unreachable, it
 * falls back to the local JSON file + localStorage custom entries,
 * maintaining backward compatibility.
 */

import ingredientsDb from '../data/ingredients.json';
import { snappiGet, snappiPost, invalidateCache } from '../services/snappiClient';

// ─── Constants ──────────────────────────────────────────────────────────────

const COLLECTION = '/collections/ingredients';
const CUSTOM_ID_PREFIX = 'custom-';

/** Local cache key for custom ingredients (fallback only) */
const STORAGE_KEY = 'glyco_custom_ingredients';

export const VALID_CATEGORIES = [
  'protein', 'grain', 'vegetable', 'fat',
  'dairy', 'legume', 'fruit', 'seasoning', 'cheese',
];

export const VALID_UNITS = [
  'g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'clove',
];

/** Maximum custom ingredients before a soft-limit warning */
const SOFT_LIMIT = 200;

// ─── Module-Level Caches ───────────────────────────────────────────────────

/** @type {Array<object>|null} — in-memory registry cache */
let _registryCache = null;

/** Set of all system IDs for O(1) lookup */
const _systemIdSet = new Set(ingredientsDb.map((i) => i.id));

// ─── ID & Classification Helpers ───────────────────────────────────────────

/**
 * Returns true if the given ID belongs to the system seed database.
 * @param {string} id
 * @returns {boolean}
 */
export function isSystemIngredient(id) {
  return _systemIdSet.has(id);
}

/**
 * Returns true if the given ID follows the required custom-ingredient format.
 * @param {string} id
 * @returns {boolean}
 */
export function isCustomIngredient(id) {
  return typeof id === 'string' && id.startsWith(CUSTOM_ID_PREFIX);
}

/**
 * Deterministically generates a safe custom ingredient ID from a name.
 * Format: "custom-{slug}-{timestamp}"
 * @param {string} name
 * @returns {string}
 */
export function generateCustomId(name) {
  const slug = (name || 'ingredient')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${CUSTOM_ID_PREFIX}${slug}-${Date.now()}`;
}

// ─── Read Operations ───────────────────────────────────────────────────────

/**
 * Returns the frozen Tier 1 system ingredient array.
 * The freeze prevents accidental runtime mutation anywhere in the app.
 * @returns {ReadonlyArray<object>}
 */
export function getSystemIngredients() {
  return Object.freeze([...ingredientsDb]);
}

/**
 * Returns the unified, merged ingredient registry from Snappi CMS.
 * Falls back to local data (seed JSON + localStorage) when Snappi is unavailable.
 *
 * @returns {Promise<Array<object>>}
 */
export async function getIngredientsRegistryAsync() {
  try {
    const response = await snappiGet(COLLECTION);
    const list = Array.isArray(response) ? response : (response?.data ?? []);

    _registryCache = list.map(normalizeIngredient);
    return _registryCache;
  } catch (err) {
    console.warn('[ingredientStore] Snappi fetch failed, using local fallback:', err.message);
    return _getLocalFallbackRegistry();
  }
}

/**
 * Synchronous getter — returns the last cached registry.
 * Falls back to local seed JSON + localStorage entries if no cache exists.
 * This is required for compatibility with the synchronous nutritionCalculator.
 * @returns {Array<object>}
 */
export function getIngredientsRegistry() {
  if (_registryCache) return _registryCache;
  return _getLocalFallbackRegistry();
}

/**
 * Local fallback registry: seed JSON + localStorage custom entries.
 * @returns {Array<object>}
 */
function _getLocalFallbackRegistry() {
  const custom = _readLocalCustomIngredients();
  const safeCustom = custom.filter((c) => !isSystemIngredient(c.id));
  return [...ingredientsDb, ...safeCustom];
}

/**
 * Looks up an ingredient by ID.
 * Uses the in-memory registry cache for O(n) scan.
 * @param {string} id
 * @returns {object|null}
 */
export function getIngredientById(id) {
  if (!id || typeof id !== 'string') return null;

  // Check current registry cache first
  const registry = getIngredientsRegistry();
  const found = registry.find((i) => i.id === id);
  if (found) return found;

  // Check local seed DB as final fallback
  return ingredientsDb.find((i) => i.id === id) || null;
}

/**
 * Safely reads custom ingredients from localStorage (fallback only).
 * @returns {Array<object>}
 */
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

/**
 * Reads custom ingredients (backward compatibility shim).
 * @returns {Array<object>}
 */
export function getCustomIngredients() {
  return _readLocalCustomIngredients();
}

// ─── Normalization ─────────────────────────────────────────────────────────

/**
 * Normalizes a Snappi ingredient response into the canonical frontend shape.
 * @param {object} raw
 * @returns {object}
 */
function normalizeIngredient(raw) {
  return {
    id: raw?.id ?? '',
    name: raw?.name ?? '',
    category: raw?.category ?? '',
    defaultUnit: raw?.defaultUnit ?? 'g',
    defaultAmount: parseFloat(raw?.defaultAmount) || 100,
    isUserAuthored: raw?.isUserAuthored ?? false,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    defaultPrepState: raw?.defaultPrepState ?? 'raw',
    substitutions: Array.isArray(raw?.substitutions) ? raw.substitutions : [],
    nutrition: {
      kcal: parseFloat(raw?.kcal ?? raw?.nutrition?.kcal) || 0,
      protein: parseFloat(raw?.protein ?? raw?.nutrition?.protein) || 0,
      fat: parseFloat(raw?.fat ?? raw?.nutrition?.fat) || 0,
      carbs: parseFloat(raw?.carbs ?? raw?.nutrition?.carbs) || 0,
      fiber: parseFloat(raw?.fiber ?? raw?.nutrition?.fiber) || 0,
      netCarbs: parseFloat(raw?.netCarbs ?? raw?.nutrition?.netCarbs) || 0,
      glycemicIndex: _parseNullableNumber(raw?.glycemicIndex ?? raw?.nutrition?.glycemicIndex),
      glycemicLoad: _parseNullableNumber(raw?.glycemicLoad ?? raw?.nutrition?.glycemicLoad),
    },
  };
}

/**
 * Parse a value to a number, returning null if NaN.
 * @param {*} val
 * @returns {number|null}
 */
function _parseNullableNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ─── Validation ─────────────────────────────────────────────────────────────

/**
 * Validates a raw custom ingredient input object.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 * @param {object} input
 * @returns {{ valid: boolean, errors?: string[] }}
 */
export function validateCustomIngredient(input) {
  const errors = [];

  // — Name
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Name is required.');
  } else if (input.name.trim().length > 80) {
    errors.push('Name must be 80 characters or fewer.');
  }

  // — Category
  if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  // — Default unit
  if (!input.defaultUnit || !VALID_UNITS.includes(input.defaultUnit)) {
    errors.push(`Default unit must be one of: ${VALID_UNITS.join(', ')}.`);
  }

  // — Default amount
  const amount = parseFloat(input.defaultAmount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Default amount must be a positive number.');
  }

  // — Nutrition: required numeric fields
  const requiredNutrition = ['kcal', 'protein', 'fat', 'carbs', 'fiber'];
  for (const field of requiredNutrition) {
    const val = parseFloat(input.nutrition?.[field]);
    if (isNaN(val) || val < 0) {
      errors.push(`Nutrition "${field}" must be a non-negative number.`);
    }
  }

  // — GI range (only if provided and not null)
  if (input.nutrition?.glycemicIndex !== null && input.nutrition?.glycemicIndex !== undefined) {
    const gi = parseFloat(input.nutrition.glycemicIndex);
    if (isNaN(gi) || gi < 0 || gi > 100) {
      errors.push('Glycemic Index must be a number between 0 and 100.');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// ─── Write Operations (Snappi + localStorage fallback) ──────────────────────

/**
 * Saves a new custom ingredient to the Snappi CMS.
 *
 * On success, invalidates local caches (SWR + in-memory) so the ingredient
 * list updates immediately.
 *
 * Falls back to localStorage persistence if Snappi is unreachable.
 *
 * @param {object} rawInput — form state from CustomIngredientModal
 * @returns {Promise<{
 *   ok: boolean,
 *   ingredient: object|null,
 *   errors: string[]|null,
 *   warning: 'similar_to_system'|null
 * }>}
 */
export async function saveCustomIngredient(rawInput) {
  // 1. Validate
  const validation = validateCustomIngredient(rawInput);
  if (!validation.valid) {
    return { ok: false, ingredient: null, errors: validation.errors, warning: null };
  }

  // 2. Derive auto-calculated fields (user cannot set these manually)
  const carbs = parseFloat(rawInput.nutrition.carbs) || 0;
  const fiber = parseFloat(rawInput.nutrition.fiber) || 0;
  const giRaw = rawInput.nutrition.glycemicIndex;
  const gi = (giRaw !== null && giRaw !== undefined && giRaw !== '')
    ? parseFloat(giRaw)
    : null;

  const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
  const glycemicLoad = gi !== null
    ? Math.round((gi * netCarbs) / 100 * 10) / 10
    : null;

  // 3. Block any attempt to target or overwrite a system ID
  if (rawInput.id && isSystemIngredient(rawInput.id)) {
    return {
      ok: false,
      ingredient: null,
      errors: ['This ID conflicts with a system ingredient. System ingredients cannot be overwritten.'],
      warning: null,
    };
  }

  // 4. Build the canonical ingredient ID
  let id = rawInput.id;
  if (!id || !isCustomIngredient(id)) {
    id = generateCustomId(rawInput.name);
  }

  // 5. Detect if the name is suspiciously similar to an existing system ingredient
  const normalizedInputName = rawInput.name.trim().toLowerCase();
  let warning = null;
  const systemMatch = ingredientsDb.find(
    (sys) => sys.name.toLowerCase() === normalizedInputName
  );
  if (systemMatch) {
    warning = 'similar_to_system';
  }

  // 6. Build the canonical custom ingredient object
  const now = new Date().toISOString();

  const ingredient = {
    id,
    name: rawInput.name.trim().replace(/\s+/g, ' '),
    category: rawInput.category,
    defaultUnit: rawInput.defaultUnit,
    defaultAmount: parseFloat(rawInput.defaultAmount),
    isUserAuthored: true,
    createdAt: rawInput.createdAt || now,
    updatedAt: now,
    defaultPrepState: rawInput.defaultPrepState || 'raw',
    substitutions: [],
    kcal: parseFloat(rawInput.nutrition.kcal) || 0,
    protein: parseFloat(rawInput.nutrition.protein) || 0,
    fat: parseFloat(rawInput.nutrition.fat) || 0,
    carbs,
    fiber,
    netCarbs,
    glycemicIndex: gi,
    glycemicLoad,
    // Keep nested nutrition for backward compatibility
    nutrition: {
      kcal: parseFloat(rawInput.nutrition.kcal) || 0,
      protein: parseFloat(rawInput.nutrition.protein) || 0,
      fat: parseFloat(rawInput.nutrition.fat) || 0,
      carbs,
      fiber,
      netCarbs,
      glycemicIndex: gi,
      glycemicLoad,
    },
  };

  // 7. Persist to Snappi CMS
  try {
    await snappiPost(COLLECTION, ingredient);
    // Invalidate caches so getIngredientsRegistry fetches fresh data
    invalidateIngredientCache();
  } catch (err) {
    console.warn('[ingredientStore] Snappi POST failed, saving to localStorage:', err.message);
    // Fallback: persist to localStorage
    _saveToLocalStorage(ingredient);
  }

  return { ok: true, ingredient, errors: null, warning };
}

/**
 * Local-only fallback write (mirrors legacy behavior).
 * @param {object} ingredient
 */
function _saveToLocalStorage(ingredient) {
  try {
    const existing = _readLocalCustomIngredients();
    const idx = existing.findIndex((c) => c.id === ingredient.id);
    if (idx > -1) {
      existing[idx] = ingredient;
    } else {
      if (existing.length >= SOFT_LIMIT) {
        console.warn('[ingredientStore] Soft limit of custom ingredients reached.');
      }
      existing.push(ingredient);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[ingredientStore] Failed to write to localStorage:', err);
  }
}

/**
 * Deletes a custom ingredient by ID.
 * BLOCKS deletion of system ingredients.
 *
 * @param {string} id
 * @returns {{ ok: boolean, error?: string }}
 */
export function deleteCustomIngredient(id) {
  if (!isCustomIngredient(id)) {
    return { ok: false, error: 'Only custom ingredients (custom- prefix) can be deleted.' };
  }
  if (isSystemIngredient(id)) {
    return { ok: false, error: 'System ingredients cannot be deleted.' };
  }

  // Remove from localStorage fallback
  const existing = _readLocalCustomIngredients();
  const filtered = existing.filter((c) => c.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[ingredientStore] Failed to delete from localStorage:', err);
  }

  invalidateIngredientCache();
  return { ok: true };
}

/**
 * Partially updates an existing custom ingredient.
 * Merges the patch into the stored object, then re-runs full validation.
 *
 * @param {string} id — must start with "custom-"
 * @param {object} patch — partial fields to update
 * @returns {Promise<{ ok: boolean, ingredient: object|null, errors?: string[] }>}
 */
export async function updateCustomIngredient(id, patch) {
  if (!isCustomIngredient(id)) {
    return { ok: false, ingredient: null, errors: ['Only custom ingredients can be updated.'] };
  }

  const current = getIngredientById(id);
  if (!current) {
    return { ok: false, ingredient: null, errors: [`No custom ingredient found with id: ${id}`] };
  }

  const merged = {
    ...current,
    ...patch,
    id, // ID is immutable after creation
    nutrition: { ...current.nutrition, ...(patch.nutrition || {}) },
  };

  return saveCustomIngredient(merged);
}

/**
 * Invalidates all ingredient caches (SWR + in-memory).
 */
export function invalidateIngredientCache() {
  _registryCache = null;
  invalidateCache('ingredients');
}
