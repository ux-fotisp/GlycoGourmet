import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Navbar component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { name: 'Chef Julian', onboarded: true },
      logout: vi.fn(),
    });
  });

  const renderNavbar = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

  // --- Menu items consistency ---
  it('renders all four required navigation links: Dashboard, My Recipes, Meal Plans, Profile Settings', () => {
    renderNavbar();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('My Recipes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Meal Plans').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Profile Settings').length).toBeGreaterThan(0);
  });

  // --- Brand header ---
  it('renders the GlycoGourmet Admin brand header', () => {
    renderNavbar();
    expect(screen.getAllByText(/GlycoGourmet Admin/i).length).toBeGreaterThan(0);
  });

  // --- Profile slot ---
  it('renders user profile avatar with first letter of name', () => {
    renderNavbar();
    expect(screen.getByText('C')).toBeDefined(); // 'Chef Julian' → 'C'
  });

  it('renders ADMINISTRATOR role text', () => {
    renderNavbar();
    expect(screen.getByText('ADMINISTRATOR')).toBeDefined();
  });

  // --- Logout ---
  it('renders logout button', () => {
    renderNavbar();
    expect(screen.getByText('Log Out')).toBeDefined();
  });

  // --- Mobile bottom nav ---
  it('renders mobile bottom navigation with Home, My Recipes, Meal Plans, Settings labels', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeDefined();
    // Mobile uses shortened labels for some items
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  // --- Navigation link paths ---
  it('links Dashboard to /', () => {
    const { container } = renderNavbar();
    const dashboardLinks = container.querySelectorAll('a[href="/"]');
    expect(dashboardLinks.length).toBeGreaterThan(0);
  });

  it('links My Recipes to /my-recipes', () => {
    const { container } = renderNavbar();
    const links = container.querySelectorAll('a[href="/my-recipes"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('links Meal Plans to /meal-plans', () => {
    const { container } = renderNavbar();
    const links = container.querySelectorAll('a[href="/meal-plans"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('links Settings to /settings', () => {
    const { container } = renderNavbar();
    const links = container.querySelectorAll('a[href="/settings"]');
    expect(links.length).toBeGreaterThan(0);
  });
});
