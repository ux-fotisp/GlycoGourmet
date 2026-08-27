import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

describe('AuthContext Strict Backend Trust', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
    localStorage.clear();
    // Ensure demo auth is off for strict testing
    import.meta.env.VITE_ENABLE_DEMO_AUTH = 'false';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('login() rejects when Strapi returns 401 and does NOT fall back to local check', async () => {
    // Seed local storage with a fake user to prove we don't fall back
    localStorage.setItem('glyco_users', JSON.stringify({
      'test@glyco.com': { email: 'test@glyco.com', password: 'password123', roleType: 'admin' }
    }));

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Invalid credentials' } })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login('test@glyco.com', 'password123');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/local', expect.objectContaining({
      method: 'POST'
    }));
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
    // JWT should not be set
    expect(localStorage.getItem('glyco_jwt')).toBeNull();
  });

  it('register() does not set roleType via request payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jwt: 'fake-jwt',
        user: { id: 1, email: 'new@glyco.com', roleType: 'user' }
      })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('New User', 'new@glyco.com', 'password123');
    });

    // Check what was sent to the server
    const fetchCall = global.fetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);

    // The payload MUST NOT contain roleType
    expect(requestBody).not.toHaveProperty('roleType');
    expect(requestBody.email).toBe('new@glyco.com');
  });

  it('refreshUserStatus() invalidates session on a failed /api/users/me call rather than reusing cached local data', async () => {
    localStorage.setItem('glyco_jwt', 'stale-jwt');
    // Stale local data that should NOT be used
    localStorage.setItem('glyco_users', JSON.stringify({
      'stale@glyco.com': { email: 'stale@glyco.com' }
    }));

    global.fetch.mockResolvedValueOnce({
      ok: false, // 401 Unauthorized
      status: 401
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial refresh in useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/users/me', expect.objectContaining({
      headers: { Authorization: 'Bearer stale-jwt' }
    }));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    // JWT should be purged
    expect(localStorage.getItem('glyco_jwt')).toBeNull();
  });
});