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
  apiFetch,
  IS_DEMO_MODE,
  resolveDemoFixture,
} from './strapiClient';

export const snappiGet = strapiGet;
export const snappiPost = strapiPost;
export const snappiPut = strapiPut;
export const snappiDelete = strapiDelete;
export const snappiUpload = strapiUpload;
export const snappiFetch = apiFetch;
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
  apiFetch,
  IS_DEMO_MODE,
  resolveDemoFixture,
};

export default {
  snappiGet,
  snappiPost,
  snappiPut,
  snappiDelete,
  snappiUpload,
  snappiFetch,
  fetchWithRetry,
  subscribeToWakeStatus,
  getWakeStatus,
  DEFAULT_RETRY_CONFIG,
  isRetryableStatus,
  isRetryableNetworkError,
  invalidateCache,
  unravelStrapiData,
  getUserJwt,
  apiFetch,
  IS_DEMO_MODE,
  resolveDemoFixture,
};
