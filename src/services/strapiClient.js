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

export const STRAPI_URL = (import.meta.env.VITE_STRAPI_API_URL || '').trim().replace(/\/+$/, '');

function buildUrl(path = '', params = {}) {
  const baseStr = STRAPI_URL || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:1337');
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

    // --- Cold-Start Retry & Backoff Configuration --------------------------------

/**
 * Default retry configuration for Render cold-start resilience.
 * - Max 3 attempts
 * - Exponential backoff delays: 2s -> 5s -> 10s
 */
export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  backoffDelays: [2000, 5000, 10000],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determines whether an HTTP status code represents a temporary gateway / cold-start issue
 * eligible for automated retry.
 * Only 502 (Bad Gateway), 503 (Service Unavailable), and 504 (Gateway Timeout).
 * Never retries on 4xx (400, 401, 403, 404, etc.).
 *
 * @param {number} status
 * @returns {boolean}
 */
export function isRetryableStatus(status) {
  return status === 502 || status === 503 || status === 504;
}

/**
 * Determines whether an error is a retryable network failure or timeout.
 *
 * @param {Error} err
 * @returns {boolean}
 */
export function isRetryableNetworkError(err) {
  if (!err) return false;
  if (err.name === 'AbortError' || err.name === 'TimeoutError') return true;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('time out') ||
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('waking up')
  );
}

// --- Wake Status Observer (Pub/Sub) ------------------------------------------

let activeRetries = 0;
let currentWakeState = {
  isWaking: false,
  attempt: 0,
  maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
  nextRetryDelay: 0,
};

const wakeListeners = new Set();

/**
 * Returns the current backend waking/retry state.
 * @returns {{ isWaking: boolean, attempt: number, maxAttempts: number, nextRetryDelay: number }}
 */
export function getWakeStatus() {
  return currentWakeState;
}

/**
 * Subscribes a listener to backend waking status changes.
 * Immediately invokes the listener with the current state.
 *
 * @param {(status: { isWaking: boolean, attempt: number, maxAttempts: number, nextRetryDelay: number }) => void} listener
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToWakeStatus(listener) {
  wakeListeners.add(listener);
  try {
    listener(currentWakeState);
  } catch (err) {
    console.error('[strapiClient] Wake listener initial call failed:', err);
  }
  return () => {
    wakeListeners.delete(listener);
  };
}

function setWakeState(isWaking, attempt, maxAttempts, nextRetryDelay) {
  currentWakeState = {
    isWaking,
    attempt,
    maxAttempts,
    nextRetryDelay,
  };
  wakeListeners.forEach((fn) => {
    try {
      fn(currentWakeState);
    } catch (err) {
      console.error('[strapiClient] Wake listener notification failed:', err);
    }
  });
}

/**
 * Executes a fetch request wrapped with exponential backoff retry.
 * Only retries on network errors, timeouts, and HTTP 502/503/504.
 * Never retries on 4xx client errors.
 *
 * @param {string|URL} url
 * @param {RequestInit} [options]
 * @param {object} [retryOptions]
 * @param {number} [retryOptions.maxAttempts]
 * @param {number[]} [retryOptions.backoffDelays]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const maxAttempts = retryOptions.maxAttempts ?? DEFAULT_RETRY_CONFIG.maxAttempts;
  const backoffDelays = retryOptions.backoffDelays ?? DEFAULT_RETRY_CONFIG.backoffDelays;

  let isRetrying = false;
  let lastError = null;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(url.toString(), options);

        // Success or non-retryable response (including all 4xx client errors)
        if (!isRetryableStatus(res.status)) {
          return res;
        }

        // 502/503/504 Gateway or Cold-Start Status
        if (attempt < maxAttempts) {
          if (!isRetrying) {
            isRetrying = true;
            activeRetries++;
          }
          const delay = backoffDelays[attempt - 1] ?? backoffDelays[backoffDelays.length - 1];
          setWakeState(true, attempt, maxAttempts, delay);
          await sleep(delay);
        } else {
          return res;
        }
      } catch (err) {
        lastError = err;

        if (!isRetryableNetworkError(err)) {
          throw err;
        }

        if (attempt < maxAttempts) {
          if (!isRetrying) {
            isRetrying = true;
            activeRetries++;
          }
          const delay = backoffDelays[attempt - 1] ?? backoffDelays[backoffDelays.length - 1];
          setWakeState(true, attempt, maxAttempts, delay);
          await sleep(delay);
        } else {
          throw err;
        }
      }
    }
  } finally {
    if (isRetrying) {
      activeRetries = Math.max(0, activeRetries - 1);
      if (activeRetries === 0) {
        setWakeState(false, 0, maxAttempts, 0);
      }
    }
  }

  if (lastError) throw lastError;
}

    // --- Core HTTP Request Wrappers -----------------------------------------------

/**
 * Performs a GET request to Strapi with automatic retry on cold starts.
 * Automatically unwraps Strapi `{ data: ... }` response payloads via `unravelStrapiData()`.
 *
 * @param {string} path — endpoint path e.g. '/api/recipes'
 * @param {Record<string, string>} [params] — URL query parameters
 * @param {object} [retryOptions] — optional retry override parameters
 * @returns {Promise<*>} — unwrapped JavaScript objects
 */
export async function strapiGet(path, params = {}, retryOptions = {}) {
  const url = buildUrl(path, params);
  const cacheKey = url.pathname + url.search;
  const cached = readCache(cacheKey);

  const fetchPromise = fetchWithRetry(url.toString(), {
    method: 'GET',
    headers: buildAuthHeaders('GET'),
  }, retryOptions).then(async (res) => {
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
 * Performs a POST request to Strapi with automatic retry on cold starts.
 * @param {string} path — e.g. '/api/recipes' or '/api/ingredients'
 * @param {object} body — JSON payload (wrapped in `{ data: ... }` if Strapi expects it)
 * @param {object} [retryOptions] — optional retry override parameters
 * @returns {Promise<*>} — unwrapped response
 */
export async function strapiPost(path, body, retryOptions = {}) {
  const url = buildUrl(path);

  // Strapi standard REST API expects body payload wrapped in `{ data: { ... } }`
  const payload = body && !('data' in body) ? { data: body } : body;

  const res = await fetchWithRetry(url.toString(), {
    method: 'POST',
    headers: buildAuthHeaders('POST'),
    body: JSON.stringify(payload),
  }, retryOptions);

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
 * Performs a PUT request to Strapi with automatic retry on cold starts.
 * @param {string} path — e.g. '/api/recipes/123'
 * @param {object} body — updated fields
 * @param {object} [retryOptions] — optional retry override parameters
 * @returns {Promise<*>} — unwrapped updated record
 */
export async function strapiPut(path, body, retryOptions = {}) {
  const url = buildUrl(path);
  const payload = body && !('data' in body) ? { data: body } : body;

  const res = await fetchWithRetry(url.toString(), {
    method: 'PUT',
    headers: buildAuthHeaders('PUT'),
    body: JSON.stringify(payload),
  }, retryOptions);

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
 * Performs a DELETE request to Strapi with automatic retry on cold starts.
 * @param {string} path — e.g. '/api/recipes/123'
 * @param {object} [retryOptions] — optional retry override parameters
 * @returns {Promise<boolean>}
 */
export async function strapiDelete(path, retryOptions = {}) {
  const url = buildUrl(path);

  const res = await fetchWithRetry(url.toString(), {
    method: 'DELETE',
    headers: buildAuthHeaders('DELETE'),
  }, retryOptions);

  if (!res.ok) {
    throw new Error(`[strapiClient] DELETE ${path} ? ${res.status} ${res.statusText}`);
  }

  const collection = path.split('/').filter(Boolean)[1] || '';
  if (collection) invalidateCache(collection);

  return true;
}

/**
 * Performs a media upload (multipart/form-data) to Strapi's `/api/upload` endpoint with retry.
 * @param {string} [path] — default '/api/upload'
 * @param {FormData} formData — multipart form data with file
 * @param {object} [retryOptions] — optional retry override parameters
 * @returns {Promise<*>} — uploaded media record(s)
 */
export async function strapiUpload(path = '/api/upload', formData, retryOptions = {}) {
  const url = buildUrl(path);
  const headers = {};
  const jwt = getUserJwt();

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  } else if (READ_TOKEN) {
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }

  const res = await fetchWithRetry(url.toString(), {
    method: 'POST',
    headers,
    body: formData,
  }, retryOptions);

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`[strapiClient] UPLOAD ${path} ? ${res.status}: ${errText}`);
  }

  return res.json();
}
