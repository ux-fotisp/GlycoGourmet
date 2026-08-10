import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute component authentication checks', () => {
  it('shows loading spinner when auth status is loading', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Carefully preparing your kitchen...')).toBeDefined();
  });

  it('redirects to /login when user is unauthenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeDefined();
  });

  it('redirects to /onboarding when user is authenticated but not onboarded', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Julian', onboarded: false },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Dashboard</div>} />
          </Route>
          <Route path="/onboarding" element={<div>Onboarding Gateway</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Onboarding Gateway')).toBeDefined();
  });

  it('renders child routes when user is authenticated and onboarded', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Julian', onboarded: true },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard')).toBeDefined();
  });
});
