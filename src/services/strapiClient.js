/**
 * strapiClient.js — Central Strapi v4/v5 Headless CMS REST API Client Wrapper

 *
 * Environment Setup:
 *   - VITE_STRAPI_API_URL: Strapi backend base URL (default: 'https://api.glycogourmet.com')
 *   - VITE_STRAPI_TOKEN: Read-only API token for public content queries
 *
 * Authentication:
 *   - Stores JWT from Strapi's `/api/auth/local` endpoint in localStorage (`strapi_jwt`).
 *   - Automatically attaches `Authorization: Bearer <jwt>` to request headers.
 *   - Fallback to VITE_STRAPI_TOKEN if no user session is present.
 *
 * Response Normalizer:
 *   - `unravelStrapiData(response)` recursively unwraps nested Strapi `{ data: { id, attributes: { ... } } }`
 *     or Strapi v5 flat responses into simple JavaScript objects.
 */

    // --- Environment Configuration ------------------------------------------------

export const STRAPI_URL = import.meta.env.VITE_STRAPI_API_URL || 'https://api.glycogourmet.com';

function buildUrl(path = '', params = {}) {
  const baseStr = (STRAPI_URL || 'http://localhost:1337').trim();
  const base = baseStr.endsWith('/') ? baseStr : baseStr + '/';
  const cleanPath = (path || '').toString().trim().replace(/^\/+/, '');
  const url = new URL(cleanPath, base);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url;
}
export const READ_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || '';

/** SWR Cache TTL in milliseconds — 10 minutes */

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_PREFIX = 'strapi_swr_';

    // --- JWT & Auth Token Management ---------------------------------------------

/**
 * Retrieves the current user's JWT from localStorage.
 * Checks `strapi_jwt` key or `glyco_session`.
 * @returns {string|null}
 */
export function getUserJwt() {
  try {
    const directJwt = localStorage.getItem('strapi_jwt');
    if (directJwt) return directJwt;

    const session = localStorage.getItem('glyco_session');
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed?.jwt || null;
  } catch {
    return null;
  }
}

/**
 * Stores the user's JWT into localStorage.
 * @param {string} jwt
 */
export function setUserJwt(jwt) {
  if (jwt) {
    localStorage.setItem('strapi_jwt', jwt);
  } else {
    localStorage.removeItem('strapi_jwt');
  }
}

/**
 * Constructs Authorization headers for Strapi requests.
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @returns {Record<string, string>}
 */
function buildAuthHeaders(method = 'GET') {
  const headers = { 'Content-Type': 'application/json' };
  const jwt = getUserJwt();

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  } else if (READ_TOKEN) {
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }

  return headers;
}

    // --- Strapi Response Normalizer -----------------------------------------------

/**
 * Recursively unwraps Strapi's nested REST API data structures.
 *
 * Strapi v4: `{ data: { id: 1, attributes: { title: '...', author: { data: ... } } } }`
 * Strapi v5 / Flat: `{ data: [{ id: 1, title: '...' }] }`
 *
 * @param {*} input — raw Strapi response payload
 * @returns {*} — normalized flat object or array

 */
export function unravelStrapiData(input) {
  if (input === null || input === undefined) return null;

  // Unravel top-level `{ data: ... }`
  if (typeof input === 'object' && 'data' in input && input.data !== undefined) {
    return unravelStrapiData(input.data);
  }

  // Unravel arrays
  if (Array.isArray(input)) {
    return input.map(item => unravelStrapiData(item));
  }

  // Unravel single entity objects
  if (typeof input === 'object') {
    // Strapi v4 nested `attributes` pattern
    if ('attributes' in input && typeof input.attributes === 'object' && input.attributes !== null) {
      const { id, attributes } = input;
      const unwrappedAttrs = {};
      for (const [key, val] of Object.entries(attributes)) {
        unwrappedAttrs[key] = unravelStrapiData(val);
      }
      return { id: id ?? attributes?.id, ...unwrappedAttrs };
    }

    // Flat object — recursively unravel child relations

    const result = {};
    for (const [key, val] of Object.entries(input)) {
      result[key] = unravelStrapiData(val);
    }
    return result;
  }

  // Primitive values (string, number, boolean)
  return input;
}

    // --- SWR Cache Helpers --------------------------------------------------------

function readCache(cacheKey) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + cacheKey);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL_MS) return data;
    sessionStorage.removeItem(CACHE_PREFIX + cacheKey);
    return null;
  } catch {
    return null;
  }
}

function writeCache(cacheKey, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + cacheKey,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // Storage full — silently degrade

  }
}

export function invalidateCache(collectionHint) {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && key.includes(collectionHint)) {
        keys.push(key);
      }
    }
    keys.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // Non-critical
  }
}

    // --- Core HTTP Request Wrappers -----------------------------------------------

/**
 * Performs a GET request to Strapi.
 * Automatically unwraps Strapi `{ data: ... }` response payloads via `unravelStrapiData()`.
 *
 * @param {string} path — endpoint path e.g. '/api/recipes'
 * @param {Record<string, string>} [params] — URL query parameters
 * @returns {Promise<*>} — unwrapped JavaScript objects

 */
export async function strapiGet(path, params = {}) {
  const url = buildUrl(path, params);
  const cacheKey = url.pathname + url.search;
  const cached = readCache(cacheKey);

  const fetchPromise = fetch(url.toString(), {
    method: 'GET',
    headers: buildAuthHeaders('GET'),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`[strapiClient] GET ${path} ? ${res.status} ${res.statusText}`);
    }
    const raw = await res.json();
    const unwrapped = unravelStrapiData(raw);
    writeCache(cacheKey, unwrapped);
    return unwrapped;
  });

  if (cached !== null && !(Array.isArray(cached) && cached.length === 0)) {
    fetchPromise.catch((err) => {
      console.warn('[strapiClient] Background revalidation failed:', err.message);
    });
    return cached;
  }

  return fetchPromise;
}

/**
 * Performs a POST request to Strapi.
 * @param {string} path — e.g. '/api/recipes' or '/api/ingredients'
 * @param {object} body — JSON payload (wrapped in `{ data: ... }` if Strapi expects it)
 * @returns {Promise<*>} — unwrapped response

 */
export async function strapiPost(path, body) {
  const url = buildUrl(path);

  // Strapi standard REST API expects body payload wrapped in `{ data: { ... } }`
  const payload = body && !('data' in body) ? { data: body } : body;

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: buildAuthHeaders('POST'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[strapiClient] POST ${path} ? ${res.status}: ${errText}`);
  }

  const collection = path.split('/').filter(Boolean).pop() || '';
  if (collection) invalidateCache(collection);

  const raw = await res.json();
  return unravelStrapiData(raw);
}

/**
 * Performs a PUT request to Strapi.
 * @param {string} path — e.g. '/api/recipes/123'
 * @param {object} body — updated fields
 * @returns {Promise<*>} — unwrapped updated record

 */
export async function strapiPut(path, body) {
  const url = buildUrl(path);
  const payload = body && !('data' in body) ? { data: body } : body;

  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: buildAuthHeaders('PUT'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[strapiClient] PUT ${path} ? ${res.status}: ${errText}`);
  }

  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);

  const raw = await res.json();
  return unravelStrapiData(raw);
}

/**
 * Performs a DELETE request to Strapi.
 * @param {string} path — e.g. '/api/recipes/123'

 * @returns {Promise<boolean>}
 */
export async function strapiDelete(path) {
  const url = buildUrl(path);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: buildAuthHeaders('DELETE'),
  });

  if (!res.ok) {
    throw new Error(`[strapiClient] DELETE ${path} ? ${res.status} ${res.statusText}`);
  }

  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);

  return true;
}

/**
 * Performs a media upload (multipart/form-data) to Strapi's `/api/upload` endpoint.
 * @param {string} [path] — default '/api/upload'
 * @param {FormData} formData — multipart form data with file
 * @returns {Promise<*>} — uploaded media record(s)

 */
export async function strapiUpload(path = '/api/upload', formData) {
  const url = buildUrl(path);
  const headers = {};
  const jwt = getUserJwt();

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  } else if (READ_TOKEN) {
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[strapiClient] UPLOAD ${path} ? ${res.status}: ${errText}`);
  }

  return res.json();
}
