/**
 * mediaService.js — Strapi Media Library Upload Service
 *
 * Provides media validation and `uploadToStrapiMedia(file)`:
 * Sends multipart/form-data to Strapi's `/api/upload` endpoint.
 * Prepends VITE_STRAPI_API_URL if relative path `/uploads/...` is returned.
 */

import { strapiUpload, STRAPI_URL } from './strapiClient';

/** Maximum file size in bytes (5 MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Accepted MIME types for recipe images */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Validates a media file before uploading.
 * @param {File} file
 * @returns {string|null} — error string or null if valid
 */
export function validateMediaFile(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type "${file.type}". Accepted: JPEG, PNG, WebP, AVIF.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum allowed: 5 MB.`;
  }
  return null;
}

/**
 * Uploads an image file to the Strapi Media Library (`/api/upload`).
 *
 * @param {File} file — browser File object
 * @returns {Promise<string>} — hosted full image URL
 */
export async function uploadToStrapiMedia(file) {
  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('files', file);

  const response = await strapiUpload('/api/upload', formData);

  // Strapi returns an array of media objects: [{ id, url, formats, ... }]
  const mediaItem = Array.isArray(response) ? response[0] : response;
  let assetPath = mediaItem?.url || mediaItem?.data?.url || mediaItem?.formats?.medium?.url;

  if (!assetPath) {
    throw new Error('Upload succeeded but no image URL was returned from Strapi.');
  }

  // Prepend VITE_STRAPI_API_URL if the returned path is relative (starts with '/uploads/')
  if (assetPath.startsWith('/')) {
    assetPath = `${STRAPI_URL.replace(/\/$/, '')}${assetPath}`;
  }

  return assetPath;
}

/** Legacy alias for backward compatibility */
export const uploadToSnappiMedia = uploadToStrapiMedia;

export default {
  validateMediaFile,
  uploadToStrapiMedia,
  uploadToSnappiMedia,
};
