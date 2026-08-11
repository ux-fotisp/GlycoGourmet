import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('usePermissions Hook', () => {
  it('returns false for all permissions when unauthenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canCreateDrafts).toBe(false);
    expect(result.current.canPublishPublic).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.isPendingAudit).toBe(false);
  });

  it('correctly sets permissions for an approved standard User', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { roleType: 'user', isApproved: true },
    });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canCreateDrafts).toBe(true);
    expect(result.current.canPublishPublic).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.isPendingAudit).toBe(false);
  });

  it('correctly sets permissions for an approved Dietitian', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { roleType: 'dietitian', isApproved: true },
    });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canCreateDrafts).toBe(true);
    expect(result.current.canPublishPublic).toBe(true);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.isPendingAudit).toBe(false);
  });

  it('correctly sets permissions for an approved Admin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { roleType: 'admin', isApproved: true },
    });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canCreateDrafts).toBe(true);
    expect(result.current.canPublishPublic).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
    expect(result.current.isPendingAudit).toBe(false);
  });

  it('correctly flags pending audit state and restricts permissions when isApproved is false', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { roleType: 'dietitian', isApproved: false },
    });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.isPendingAudit).toBe(true);
    expect(result.current.canCreateDrafts).toBe(false);
    expect(result.current.canPublishPublic).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
  });
});
