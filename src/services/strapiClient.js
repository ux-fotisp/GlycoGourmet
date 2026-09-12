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

import { MASTER_CLINICAL_RECIPES } from '../data/seedRecipes';
import ingredientsData from '../data/ingredients.json';

    // --- Environment Configuration ------------------------------------------------

export const STRAPI_URL = (import.meta.env.VITE_STRAPI_API_URL || '').trim().replace(/\/+$/, '');

/**
 * Build-time capability gate:
 * - VITE_DEMO_MODE=true: Standalone pitch demo build (unconditional demo mode).
 * - VITE_ALLOW_DEMO_MODE=true: Capability-enabled build (e.g. Playwright / CI test webserver).
 *   Permits per-session runtime activation via localStorage['glyco_demo_mode'] or window.__DEMO_MODE__.
 * - In production builds, both variables are absent/false, making runtime activation structurally impossible.
 * - In Vitest unit tests (MODE === 'test'), setDemoMode(true) dynamically enables fixture validation.
 */
export function isDemoAllowed() {
  if (import.meta.env.MODE === 'test' && IS_DEMO_MODE) {
    return true;
  }
  return (
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    import.meta.env.VITE_ALLOW_DEMO_MODE === 'true'
  );
}

export let IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.MODE !== 'test';

export function isDemoMode() {
  // Layer 1: Build-time capability gate
  if (!isDemoAllowed()) {
    return false;
  }

  // If built with VITE_DEMO_MODE=true (and not in unit test runner), demo mode is unconditionally active
  if (import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.MODE !== 'test') {
    return true;
  }

  // Layer 2: Runtime/Session activation (only reached if build-time capability gate passes)
  if (typeof window !== 'undefined') {
    if (window.__DEMO_MODE__ !== undefined) return Boolean(window.__DEMO_MODE__);
    if (window.localStorage.getItem('glyco_demo_mode') === 'true') return true;
  }

  return Boolean(IS_DEMO_MODE);
}

export function setDemoMode(val) {
  IS_DEMO_MODE = Boolean(val);
  if (typeof window !== 'undefined') {
    window.__DEMO_MODE__ = Boolean(val);
    if (val) {
      window.localStorage.setItem('glyco_demo_mode', 'true');
    } else {
      window.localStorage.removeItem('glyco_demo_mode');
    }
  }
}

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

// --- DEMO_MODE Fixture Data & Dispatcher -------------------------------------

export const DEMO_DRAFT_FIXTURES = [
  {
    id: 'draft_201',
    title: 'Roasted Cauliflower & Chickpea Low-GI Salad',
    category: 'Salads & Sides',
    authorName: 'Chef Dietitian Maria',
    servings: 2,
    claimedCarbs: 38.5,
    claimedFiber: 6.0,
    claimedNetCarbs: 32.5,
    claimedKcal: 340,
    claimedProtein: 12.0,
    claimedFat: 14.0,
    claimedGI: 35,
    claimedGL: 11,
    status: 'draft',
    publishedAt: null,
    createdAt: '2026-02-28T10:00:00.000Z',
    ingredients: [
      { ingredientId: 'broccoli', amount: 150, unit: 'g', prepState: 'roasted' },
      { ingredientId: 'extra-virgin-olive-oil', amount: 14, unit: 'g', prepState: 'raw' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'g', prepState: 'raw' },
    ],
  },
  {
    id: 'draft_202',
    title: 'Mediterranean Herb-Crusted Salmon with Asparagus',
    category: 'Main Course',
    authorName: 'Dr. Sarah Jenkins',
    servings: 1,
    claimedCarbs: 6.0,
    claimedFiber: 3.5,
    claimedNetCarbs: 2.5,
    claimedKcal: 290,
    claimedProtein: 34.0,
    claimedFat: 13.5,
    claimedGI: 15,
    claimedGL: 1,
    status: 'draft',
    publishedAt: null,
    createdAt: '2026-03-01T14:30:00.000Z',
    ingredients: [
      { ingredientId: 'atlantic-salmon', amount: 180, unit: 'g', prepState: 'roasted' },
      { ingredientId: 'herb-asparagus', amount: 100, unit: 'g', prepState: 'steamed' },
      { ingredientId: 'extra-virgin-olive-oil', amount: 10, unit: 'g', prepState: 'raw' },
    ],
  },
  {
    id: 'draft_203',
    title: 'Chia Seed & Greek Yogurt Berry Parfait',
    category: 'Breakfast',
    authorName: 'Elena Rostova, RD',
    servings: 1,
    claimedCarbs: 18.0,
    claimedFiber: 8.0,
    claimedNetCarbs: 10.0,
    claimedKcal: 220,
    claimedProtein: 16.0,
    claimedFat: 7.0,
    claimedGI: 22,
    claimedGL: 2,
    status: 'draft',
    publishedAt: null,
    createdAt: '2026-03-02T08:15:00.000Z',
    ingredients: [
      { ingredientId: 'greek-yogurt', amount: 150, unit: 'g', prepState: 'raw' },
      { ingredientId: 'lemon-juice', amount: 5, unit: 'g', prepState: 'raw' },
    ],
  },
];

let demoLiveRecipes = Array.isArray(MASTER_CLINICAL_RECIPES) ? [...MASTER_CLINICAL_RECIPES] : [];
let demoDraftRecipes = [...DEMO_DRAFT_FIXTURES];
let demoIngredients = Array.isArray(ingredientsData) ? [...ingredientsData] : [];

export function resetDemoFixtures() {
  demoLiveRecipes = Array.isArray(MASTER_CLINICAL_RECIPES) ? [...MASTER_CLINICAL_RECIPES] : [];
  demoDraftRecipes = [...DEMO_DRAFT_FIXTURES];
  demoIngredients = Array.isArray(ingredientsData) ? [...ingredientsData] : [];
}

/**
 * Deterministic fixture resolver for Strapi CMS REST calls in DEMO_MODE.
 *
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {string} path - URL endpoint path
 * @param {Record<string, any>} [params] - Query parameters
 * @param {any} [body] - Request body payload
 * @returns {any}
 */
export function resolveDemoFixture(method = 'GET', path = '', params = {}, body = null) {
  const m = (method || 'GET').toUpperCase();
  const cleanPath = (path || '').toString().trim();

  // Extract path without query parameters if any were passed in path
  const pathWithoutQuery = cleanPath.split('?')[0];
  const queryStr = cleanPath.includes('?') ? cleanPath.split('?')[1] : '';
  const mergedParams = { ...params };
  if (queryStr) {
    const sp = new URLSearchParams(queryStr);
    sp.forEach((val, key) => {
      mergedParams[key] = val;
    });
  }

  // Normalize path to start with /api
  let normalized = pathWithoutQuery.startsWith('/') ? pathWithoutQuery : '/' + pathWithoutQuery;
  if (!normalized.startsWith('/api')) {
    normalized = '/api' + normalized;
  }
  if (normalized.length > 4 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // 1. /api/recipes
  if (normalized === '/api/recipes') {
    if (m === 'GET') {
      const isDraftQuery =
        mergedParams['filters[publishedAt][$null]'] === 'true' ||
        mergedParams['filters[publishedAt][$null]'] === true ||
        mergedParams.publicationState === 'preview';

      if (isDraftQuery) {
        return { data: [...demoDraftRecipes] };
      }
      return { data: [...demoLiveRecipes] };
    }

    if (m === 'POST') {
      const payload = body && 'data' in body ? body.data : (body || {});
      const newRecipe = {
        id: payload.id || `demo-recipe-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (newRecipe.publishedAt === null || newRecipe.status === 'draft') {
        demoDraftRecipes.unshift(newRecipe);
      } else {
        demoLiveRecipes.unshift(newRecipe);
      }
      return { data: newRecipe };
    }
  }

  // 2. /api/recipes/:id
  const recipeMatch = normalized.match(/^\/api\/recipes\/([^/]+)$/);
  if (recipeMatch) {
    const id = recipeMatch[1];
    if (m === 'GET') {
      const found =
        demoLiveRecipes.find((r) => String(r.id) === String(id)) ||
        demoDraftRecipes.find((r) => String(r.id) === String(id));
      return { data: found || null };
    }
    if (m === 'PUT') {
      const payload = body && 'data' in body ? body.data : (body || {});
      let target = demoLiveRecipes.find((r) => String(r.id) === String(id));
      if (target) {
        Object.assign(target, payload, { updatedAt: new Date().toISOString() });
        return { data: target };
      }
      target = demoDraftRecipes.find((r) => String(r.id) === String(id));
      if (target) {
        Object.assign(target, payload, { updatedAt: new Date().toISOString() });
        if (payload.publishedAt) {
          demoDraftRecipes = demoDraftRecipes.filter((r) => String(r.id) !== String(id));
          demoLiveRecipes.unshift(target);
        }
        return { data: target };
      }
      return { data: { id, ...payload } };
    }
    if (m === 'DELETE') {
      demoLiveRecipes = demoLiveRecipes.filter((r) => String(r.id) !== String(id));
      demoDraftRecipes = demoDraftRecipes.filter((r) => String(r.id) !== String(id));
      return { data: { id } };
    }
  }

  // 3. /api/ingredients
  if (normalized === '/api/ingredients') {
    if (m === 'GET') {
      return { data: [...demoIngredients] };
    }
    if (m === 'POST') {
      const payload = body && 'data' in body ? body.data : (body || {});
      const newIng = {
        id: payload.id || `custom-ing-${Date.now()}`,
        ...payload,
        isUserAuthored: true,
        createdAt: new Date().toISOString(),
      };
      demoIngredients.push(newIng);
      return { data: newIng };
    }
  }

  // 4. /api/upload
  if (normalized === '/api/upload') {
    return [
      {
        id: 9001,
        name: 'demo-dish.jpg',
        url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
        mime: 'image/jpeg',
        ext: '.jpg',
        width: 1200,
        height: 800,
        formats: {
          thumbnail: {
            url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
          },
        },
      },
    ];
  }

  // 5. /api/users/me
  if (normalized === '/api/users/me') {
    let currentUser = null;
    try {
      const stored = localStorage.getItem('glyco_current_user') || localStorage.getItem('glyco_session');
      if (stored) currentUser = JSON.parse(stored);
    } catch {}
    return currentUser || {
      id: 1,
      username: 'demo_user',
      email: 'demo@glyco.com',
      roleType: 'user',
      isApproved: true,
      confirmed: true,
      onboarded: true,
    };
  }

  // 6. /api/auth/local
  if (normalized === '/api/auth/local') {
    const email = body?.identifier || 'demo@glyco.com';
    return {
      jwt: `demo-token-${Date.now()}`,
      user: {
        id: 1,
        username: email.split('@')[0],
        email: email,
        roleType: email.includes('dietitian') ? 'dietitian' : 'user',
        isApproved: true,
        confirmed: true,
        onboarded: true,
      },
    };
  }

  // 7. /api/users/:id
  const userMatch = normalized.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch) {
    const id = userMatch[1];
    const payload = body && 'data' in body ? body.data : (body || {});
    return { id, ...payload };
  }

  // 8. General fallback for any other Strapi endpoint
  return { data: { success: true, endpoint: normalized } };
}

/**
 * Shared helper for Strapi-bound requests outside strapiClient.
 * In live mode (IS_DEMO_MODE=false), calls standard window.fetch(url, options).
 * In demo mode (IS_DEMO_MODE=true), checks if the target URL targets the Strapi API base
 * and resolves via resolveDemoFixture, returning a mock Response object.
 *
 * @param {string|URL} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  if (!isDemoMode()) {
    return fetch(url, options);
  }

  const rawUrl = typeof url === 'string' ? url : url.toString();
  let pathname = '';
  const params = {};

  try {
    const urlObj = new URL(rawUrl, 'http://localhost:1337');
    pathname = urlObj.pathname;
    urlObj.searchParams.forEach((val, key) => {
      params[key] = val;
    });
  } catch {
    pathname = rawUrl.split('?')[0];
  }

  const isStrapiTarget =
    pathname.startsWith('/api/') ||
    pathname === '/api' ||
    rawUrl.includes('/api/') ||
    (STRAPI_URL && rawUrl.startsWith(STRAPI_URL));

  if (isStrapiTarget) {
    const method = (options.method || 'GET').toUpperCase();
    let body = options.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const fixture = resolveDemoFixture(method, pathname, params, body);
    const jsonStr = JSON.stringify(fixture);

    if (typeof Response !== 'undefined') {
      return new Response(jsonStr, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => fixture,
      text: async () => jsonStr,
    };
  }

  return fetch(url, options);
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
  if (isDemoMode()) {
    const fixture = resolveDemoFixture('GET', path, params);
    return unravelStrapiData(fixture);
  }

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
  if (isDemoMode()) {
    const fixture = resolveDemoFixture('POST', path, {}, body);
    return unravelStrapiData(fixture);
  }

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
  if (isDemoMode()) {
    const fixture = resolveDemoFixture('PUT', path, {}, body);
    return unravelStrapiData(fixture);
  }

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
  if (isDemoMode()) {
    resolveDemoFixture('DELETE', path);
    return true;
  }

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
  if (isDemoMode()) {
    return resolveDemoFixture('POST', path || '/api/upload', {}, formData);
  }

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
