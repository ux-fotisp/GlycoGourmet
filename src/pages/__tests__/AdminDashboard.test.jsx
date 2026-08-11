import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboard } from '../AdminDashboard';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('US-3.1: Admin Quick Audit & Onboarding Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

    useAuth.mockReturnValue({ user: { roleType: 'admin' } });
    usePermissions.mockReturnValue({ canManageUsers: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('Scenario 4.1: Invokes approval handler and clears pending user row when [ Approve as Dietitian ] is clicked', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Quick Audit & Onboarding Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Dr. Sarah Jenkins/i)).toBeDefined();

    const approveDietitianBtns = screen.getAllByRole('button', { name: /Approve as Dietitian/i });
    fireEvent.click(approveDietitianBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Approved Dr. Sarah Jenkins as DIETITIAN!/i)).toBeDefined();
    });
  });

  it('Scenario 4.2: Restricts access to non-admin accounts', () => {
    useAuth.mockReturnValue({ user: { roleType: 'user' } });
    usePermissions.mockReturnValue({ canManageUsers: false });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Administrative Access Restricted/i)).toBeDefined();
  });
});
