import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useAuth } from '../context/AuthContext';
import { UserPreferencesProvider } from '../context/UserPreferences';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AppRoutes navigation hierarchy', () => {
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuth.mockReturnValue({
      user: { name: 'Chef Julian', onboarded: true, roleType: 'admin', isApproved: true },
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
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

  it('renders All Recipes catalog on "/recipes/all" path', () => {
    renderWithProviders('/recipes/all');
    expect(screen.getAllByText(/GlycoGourmet Admin/i).length).toBeGreaterThan(0);
  });

  it('renders MyRecipes workspace on "/recipes/mine"', () => {
    renderWithProviders('/recipes/mine');
    expect(screen.getAllByText(/My Recipes/i).length).toBeGreaterThan(0);
  });

  it('renders MyRecipes workspace on "/my-recipes"', () => {
    renderWithProviders('/my-recipes');
    expect(screen.getAllByText(/My Recipes/i).length).toBeGreaterThan(0);
  });
});
