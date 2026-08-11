import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useAuth } from '../context/AuthContext';
import { UserPreferencesProvider } from '../context/UserPreferences';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Permission & Audit Redirect Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (initialRoute = '/') =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <UserPreferencesProvider>
          <AppRoutes />
        </UserPreferencesProvider>
      </MemoryRouter>
    );

  it('redirects unapproved users (isApproved: false) attempting direct navigation to /recipes/mine to /pending-approval', () => {
    useAuth.mockReturnValue({
      user: { name: 'Audit User', roleType: 'user', isApproved: false, onboarded: true },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    renderWithProviders('/recipes/mine');
    expect(screen.getAllByText(/Account Under Review/i).length).toBeGreaterThan(0);
  });

  it('redirects unapproved users attempting direct navigation to /meal-plans to /pending-approval', () => {
    useAuth.mockReturnValue({
      user: { name: 'Audit User', roleType: 'user', isApproved: false, onboarded: true },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    renderWithProviders('/meal-plans');
    expect(screen.getAllByText(/Account Under Review/i).length).toBeGreaterThan(0);
  });

  it('redirects unapproved users attempting direct navigation to /admin-editor to /pending-approval', () => {
    useAuth.mockReturnValue({
      user: { name: 'Audit User', roleType: 'user', isApproved: false, onboarded: true },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    renderWithProviders('/admin-editor');
    expect(screen.getAllByText(/Account Under Review/i).length).toBeGreaterThan(0);
  });
});
