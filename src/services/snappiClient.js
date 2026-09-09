/**
 * snappiClient.js — Compatibility Bridge for Strapi CMS Client
 *
 * All request functions delegate directly to `strapiClient.js`.
 */

import {
  strapiGet,
  strapiPost,
  strapiPut,
  strapiDelete,
  strapiUpload,
  fetchWithRetry,
  subscribeToWakeStatus,
  getWakeStatus,
  DEFAULT_RETRY_CONFIG,
  isRetryableStatus,
  isRetryableNetworkError,
  invalidateCache,
  unravelStrapiData,
  getUserJwt,
} from './strapiClient';

export const snappiGet = strapiGet;
export const snappiPost = strapiPost;
export const snappiPut = strapiPut;
export const snappiDelete = strapiDelete;
export const snappiUpload = strapiUpload;
export {
  fetchWithRetry,
  subscribeToWakeStatus,
  getWakeStatus,
  DEFAULT_RETRY_CONFIG,
  isRetryableStatus,
  isRetryableNetworkError,
  invalidateCache,
  unravelStrapiData,
  getUserJwt,
};

export default {
  snappiGet,
  snappiPost,
  snappiPut,
  snappiDelete,
  snappiUpload,
  fetchWithRetry,
  subscribeToWakeStatus,
  getWakeStatus,
  DEFAULT_RETRY_CONFIG,
  isRetryableStatus,
  isRetryableNetworkError,
  invalidateCache,
  unravelStrapiData,
  getUserJwt,
};
