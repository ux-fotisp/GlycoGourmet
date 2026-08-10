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

describe('AppRoutes navigation hierarchy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { name: 'Chef Julian', onboarded: true },
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  const renderWithProviders = (initialRoute = '/') =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <UserPreferencesProvider>
          <AppRoutes />
        </UserPreferencesProvider>
      </MemoryRouter>
    );

  it('renders Dashboard layout on root path "/"', () => {
    renderWithProviders('/');
    expect(screen.getAllByText(/GlycoGourmet Admin/i).length).toBeGreaterThan(0);
  });

  it('renders Dashboard layout on "/recipes" catalog alias path', () => {
    renderWithProviders('/recipes');
    expect(screen.getAllByText(/GlycoGourmet Admin/i).length).toBeGreaterThan(0);
  });

  it('renders MyRecipes workspace on "/my-recipes"', () => {
    renderWithProviders('/my-recipes');
    expect(screen.getAllByText(/My Recipes/i).length).toBeGreaterThan(0);
  });
});
