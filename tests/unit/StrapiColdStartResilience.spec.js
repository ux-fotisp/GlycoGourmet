import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  strapiGet,
  strapiPost,
  strapiPut,
  strapiDelete,
  strapiUpload,
  fetchWithRetry,
  isRetryableStatus,
  isRetryableNetworkError,
  subscribeToWakeStatus,
  getWakeStatus,
  DEFAULT_RETRY_CONFIG,
} from '../../src/services/strapiClient';

describe('Strapi Cold-Start Resilience & Retry Logic', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Retry Eligibility Filters', () => {
    it('identifies only HTTP 502, 503, and 504 as retryable statuses', () => {
      expect(isRetryableStatus(502)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
      expect(isRetryableStatus(504)).toBe(true);

      // Client 4xx errors must never be retryable
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(403)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
      expect(isRetryableStatus(422)).toBe(false);

      // Success & other statuses
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(201)).toBe(false);
      expect(isRetryableStatus(204)).toBe(false);
      expect(isRetryableStatus(500)).toBe(false);
    });

    it('identifies network failures, aborts, and timeouts as retryable errors', () => {
      expect(isRetryableNetworkError(new TypeError('Failed to fetch'))).toBe(true);
      expect(isRetryableNetworkError(new Error('NetworkError when attempting to fetch resource'))).toBe(true);
      expect(isRetryableNetworkError(new Error('Connection timed out'))).toBe(true);

      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      expect(isRetryableNetworkError(abortError)).toBe(true);

      const timeoutError = new Error('Timeout');
      timeoutError.name = 'TimeoutError';
      expect(isRetryableNetworkError(timeoutError)).toBe(true);

      // Non-network errors are not retryable
      expect(isRetryableNetworkError(new SyntaxError('Unexpected token'))).toBe(false);
      expect(isRetryableNetworkError(null)).toBe(false);
    });
  });

  describe('1. Network error / timeout followed by successful retry', () => {
    it('retries on network error and returns final response on attempt 2', async () => {
      const wakeUpdates = [];
      const unsubscribe = subscribeToWakeStatus((status) => {
        wakeUpdates.push({ ...status });
      });

      // Attempt 1: Network failure (Render cold start dropped connection)
      // Attempt 2: Service is awake, returns 200 OK
      global.fetch
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: { id: 42, attributes: { title: 'Cold Brew Lentil Salad' } },
          }),
        });

      const fastDelays = [5, 10, 20];
      const result = await strapiGet('/api/recipes/42', {}, { backoffDelays: fastDelays });

      // Correct attempt count: exactly 2 attempts
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Correct final unwrapped response
      expect(result).toEqual({ id: 42, title: 'Cold Brew Lentil Salad' });

      // Wake observer should have received waking state, then reset
      expect(wakeUpdates.some((s) => s.isWaking === true && s.attempt === 1)).toBe(true);
      expect(getWakeStatus().isWaking).toBe(false);

      unsubscribe();
    });

    it('retries on HTTP 502/504 gateway timeout and succeeds on retry', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          statusText: 'Bad Gateway',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: [{ id: 1, title: 'Avocado Toast' }],
          }),
        });

      const result = await strapiGet('/api/recipes', {}, { backoffDelays: [5, 10, 20] });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ id: 1, title: 'Avocado Toast' }]);
      expect(getWakeStatus().isWaking).toBe(false);
    });
  });

  describe('2. 4xx response — NO retry occurs and surfaces immediately', () => {
    it('does NOT retry on HTTP 404 and surfaces error immediately', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        strapiGet('/api/recipes/unknown', {}, { backoffDelays: [5, 10, 20] })
      ).rejects.toThrow('[strapiClient] GET /api/recipes/unknown ? 404 Not Found');

      // Crucial: exactly 1 fetch call, zero retries
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(getWakeStatus().isWaking).toBe(false);
    });

    it('does NOT retry on HTTP 400 validation error in strapiPost', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: { message: 'Invalid payload' } }),
      });

      await expect(
        strapiPost('/api/recipes', { title: '' }, { backoffDelays: [5, 10, 20] })
      ).rejects.toThrow('[strapiClient] POST /api/recipes ? 400: {"error":{"message":"Invalid payload"}}');

      // Exactly 1 fetch call, zero retries
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(getWakeStatus().isWaking).toBe(false);
    });

    it('does NOT retry on HTTP 401 unauthorized in strapiPut', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(
        strapiPut('/api/recipes/1', { title: 'New' }, { backoffDelays: [5, 10, 20] })
      ).rejects.toThrow('[strapiClient] PUT /api/recipes/1 ? 401: Unauthorized');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(getWakeStatus().isWaking).toBe(false);
    });
  });

  describe('3. Exhausting all 3 retries on persistent 503s', () => {
    it('stops after max 3 attempts and surfaces the final error', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Render service spinning up',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Render service spinning up',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Render service spinning up',
        });

      await expect(
        strapiGet('/api/recipes', {}, { backoffDelays: [5, 10, 20] })
      ).rejects.toThrow('[strapiClient] GET /api/recipes ? 503 Service Unavailable');

      // Exactly 3 attempts executed
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Wake status properly cleared after exhaustion
      expect(getWakeStatus().isWaking).toBe(false);
    });

    it('exhausts all 3 attempts on persistent network connection drops', async () => {
      global.fetch
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        strapiPost('/api/recipes', { title: 'Test' }, { backoffDelays: [5, 10, 20] })
      ).rejects.toThrow('Failed to fetch');

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(getWakeStatus().isWaking).toBe(false);
    });
  });

  describe('Wake Status Subscription Lifecycle', () => {
    it('notifies subscribers of attempt progression and cleanup', async () => {
      const stateLog = [];
      const unsubscribe = subscribeToWakeStatus((st) => {
        stateLog.push({ ...st });
      });

      global.fetch
        .mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { id: 1 } }),
        });

      await fetchWithRetry('https://api.test/recipes', {}, { backoffDelays: [5, 10, 20] });

      expect(stateLog.some((s) => s.isWaking === true && s.attempt === 1)).toBe(true);
      expect(stateLog.some((s) => s.isWaking === true && s.attempt === 2)).toBe(true);
      expect(stateLog[stateLog.length - 1].isWaking).toBe(false);

      unsubscribe();
    });
  });
});
