/**
 * snappiClient.js — Central Snappi CMS REST API Client
 *
 * Architecture:
 * - Single abstraction over native `fetch` for all Snappi endpoints.
 * - GET requests implement Stale-While-Revalidate (SWR) caching via
 *   `sessionStorage` with a configurable TTL (default 10 min).
 * - Write endpoints (POST/PUT/DELETE) inject a user JWT from the active
 *   session when available, falling back to the public read token.
 *
 * Environment Variables (via Vite):
 *   VITE_SNAPPI_API_BASE — Snappi instance endpoint URL
 *   VITE_SNAPPI_READ_TOKEN — Read-only API key for public queries
 */

// ─── Configuration ──────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_SNAPPI_API_BASE || '';
const READ_TOKEN = import.meta.env.VITE_SNAPPI_READ_TOKEN || '';

/** SWR Cache TTL in milliseconds — 10 minutes */
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Prefix for all sessionStorage cache keys to avoid collisions */
const CACHE_PREFIX = 'snappi_swr_';

// ─── Session JWT Management ────────────────────────────────────────────────

/**
 * Retrieves the current user's JWT from the active session.
 * Returns null when no authenticated session exists.
 * @returns {string|null}
 */
function getUserJwt() {
  try {
    const session = localStorage.getItem('glyco_session');
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed?.jwt || null;
  } catch {
    return null;
  }
}

/**
 * Builds the authorization headers for a Snappi API request.
 * Write operations prefer the user JWT; read operations use the read token.
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @returns {Record<string, string>}
 */
function buildAuthHeaders(method = 'GET') {
  const headers = { 'Content-Type': 'application/json' };
  const jwt = getUserJwt();

  if (method !== 'GET' && jwt) {
    // Write operations — use user JWT
    headers['Authorization'] = `Bearer ${jwt}`;
  } else if (READ_TOKEN) {
    // Read operations — use public read token
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }

  return headers;
}

// ─── SWR Cache Helpers ─────────────────────────────────────────────────────

/**
 * Reads a cached GET response from sessionStorage.
 * Returns the data if within TTL, otherwise null.
 * @param {string} cacheKey
 * @returns {object|null}
 */
function readCache(cacheKey) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + cacheKey);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL_MS) {
      return data;
    }
    // Expired — remove stale entry
    sessionStorage.removeItem(CACHE_PREFIX + cacheKey);
    return null;
  } catch {
    return null;
  }
}

/**
 * Writes a GET response to sessionStorage.
 * @param {string} cacheKey
 * @param {*} data
 */
function writeCache(cacheKey, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + cacheKey,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // sessionStorage full — silently degrade
  }
}

/**
 * Invalidates all cached entries whose keys contain the given substring.
 * Call this after any write operation that affects a collection.
 * @param {string} collectionHint — e.g. 'recipes' or 'ingredients'
 */
export function invalidateCache(collectionHint) {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && key.includes(collectionHint)) {
        keys.push(key);
      }
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Non-critical — silently degrade
  }
}

// ─── Core Request Methods ──────────────────────────────────────────────────

/**
 * Performs a GET request to a Snappi endpoint.
 * Uses SWR caching: returns cached data immediately while revalidating in
 * the background. If no cache exists, performs a blocking fetch.
 *
 * @param {string} path — endpoint path (e.g. '/collections/recipes')
 * @param {Record<string, string>} [params] — URL search parameters
 * @returns {Promise<*>}
 */
export async function snappiGet(path, params = {}) {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const cacheKey = url.pathname + url.search;

  // 1. Return stale data immediately if available
  const cached = readCache(cacheKey);

  // 2. Revalidate (or perform first fetch)
  const fetchPromise = fetch(url.toString(), {
    method: 'GET',
    headers: buildAuthHeaders('GET'),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`[snappiClient] GET ${path} → ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    writeCache(cacheKey, data);
    return data;
  });

  // SWR: if we have cached data, return it and revalidate silently
  if (cached !== null) {
    fetchPromise.catch((err) => {
      console.warn('[snappiClient] Background revalidation failed:', err.message);
    });
    return cached;
  }

  // No cache — blocking fetch
  return fetchPromise;
}

/**
 * Performs a POST request to a Snappi endpoint.
 * Automatically invalidates related caches on success.
 *
 * @param {string} path — endpoint path (e.g. '/collections/recipes')
 * @param {object} body — JSON request payload
 * @returns {Promise<object>} — parsed JSON response
 */
export async function snappiPost(path, body) {
  const url = new URL(path, API_BASE);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: buildAuthHeaders('POST'),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[snappiClient] POST ${path} → ${res.status}: ${errText}`);
  }

  // Invalidate any caches for this collection
  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);

  return res.json();
}

/**
 * Performs a PUT request to a Snappi endpoint.
 *
 * @param {string} path — endpoint path (e.g. '/collections/recipes/abc-123')
 * @param {object} body — JSON request payload
 * @returns {Promise<object>}
 */
export async function snappiPut(path, body) {
  const url = new URL(path, API_BASE);
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: buildAuthHeaders('PUT'),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[snappiClient] PUT ${path} → ${res.status}: ${errText}`);
  }

  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);

  return res.json();
}

/**
 * Performs a DELETE request to a Snappi endpoint.
 *
 * @param {string} path — endpoint path
 * @returns {Promise<void>}
 */
export async function snappiDelete(path) {
  const url = new URL(path, API_BASE);
  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: buildAuthHeaders('DELETE'),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[snappiClient] DELETE ${path} → ${res.status}: ${errText}`);
  }

  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);
}

/**
 * Uploads a file via multipart/form-data POST.
 * Intentionally omits 'Content-Type' so the browser auto-sets the boundary.
 *
 * @param {string} path — upload endpoint path
 * @param {FormData} formData — multipart payload
 * @returns {Promise<object>}
 */
export async function snappiUpload(path, formData) {
  const url = new URL(path, API_BASE);
  const jwt = getUserJwt();

  const headers = {};
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  } else if (READ_TOKEN) {
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }
  // Do NOT set Content-Type — browser will add multipart boundary automatically

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[snappiClient] UPLOAD ${path} → ${res.status}: ${errText}`);
  }

  return res.json();
}
