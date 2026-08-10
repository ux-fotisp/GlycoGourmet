import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PendingApproval from './PendingApproval';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PendingApproval component', () => {
  const mockRefreshUserStatus = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { email: 'pending@glyco.com', isApproved: false },
      refreshUserStatus: mockRefreshUserStatus,
      logout: mockLogout,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <PendingApproval />
      </MemoryRouter>
    );

  it('renders account review heading and explanation text', () => {
    renderComponent();
    expect(screen.getByText(/Account Under Review/i)).toBeDefined();
    expect(screen.getByText(/An administrator must audit your account/i)).toBeDefined();
  });

  it('displays registered email and pending audit badge', () => {
    renderComponent();
    expect(screen.getByText('pending@glyco.com')).toBeDefined();
    expect(screen.getByText(/Pending Audit/i)).toBeDefined();
  });

  it('calls refreshUserStatus when Refresh Status button is clicked', async () => {
    mockRefreshUserStatus.mockResolvedValue({ isApproved: false });
    renderComponent();

    const refreshBtn = screen.getByText('Refresh Status').closest('button');
    fireEvent.click(refreshBtn);

    expect(mockRefreshUserStatus).toHaveBeenCalledTimes(1);
  });

  it('calls logout when Log Out button is clicked', async () => {
    renderComponent();
    const logoutBtn = screen.getByText('Log Out').closest('button');
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
