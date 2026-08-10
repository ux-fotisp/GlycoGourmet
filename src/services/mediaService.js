/**
 * mediaService.js — Snappi Media Library SDK / Asset Upload API
 *
 * Provides a single upload function that sends a file as multipart/form-data
 * to the Snappi `/media/upload` endpoint and returns the hosted asset URL.
 *
 * Usage in components:
 *   const url = await uploadToSnappiMedia(file);
 *   setFormData(prev => ({ ...prev, imageUrl: url }));
 */

import { snappiUpload } from './snappiClient';

/** Maximum file size in bytes (5 MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Accepted MIME types for recipe images */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Validates a file before upload.
 * Returns null if valid, or an error message string.
 * @param {File} file
 * @returns {string|null}
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
 * Uploads an image file to the Snappi Media Library.
 *
 * @param {File} file — browser File object from drag-and-drop or file input
 * @returns {Promise<string>} — hosted media URL
 * @throws {Error} on validation failure or upload error
 */
export async function uploadToSnappiMedia(file) {
  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt', file.name.replace(/\.[^.]+$/, ''));

  const response = await snappiUpload('/media/upload', formData);

  // Snappi returns the asset URL in response.url or response.data.url
  const assetUrl = response?.url || response?.data?.url;
  if (!assetUrl) {
    throw new Error('Upload succeeded but no asset URL was returned.');
  }

  return assetUrl;
}
