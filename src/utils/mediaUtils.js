import { STRAPI_URL } from '../services/strapiClient';

export const PLACEHOLDER_IMAGE = '/assets/recipe-placeholder.svg';

/**
 * Formats a media asset URL from Strapi:
 * - Prepends VITE_STRAPI_API_URL if relative `/uploads/...` path is received.
 * - Returns local SVG fallback `/assets/recipe-placeholder.svg` if url is missing/null.
 *
 * @param {string} [url]
 * @returns {string}
 */
export function formatMediaUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return PLACEHOLDER_IMAGE;
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('/uploads/')) {
    return `${STRAPI_URL.replace(/\/$/, '')}${cleanUrl}`;
  }
  return cleanUrl;
}

export default formatMediaUrl;
