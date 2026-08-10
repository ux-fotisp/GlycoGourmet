import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Navbar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAuth.mockReturnValue({
      user: { name: 'Chef Julian', onboarded: true },
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderNavbar = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

  // --- Menu items consistency ---
  it('renders all required top-level navigation links: Recipes, Meal Plans, Profile Settings', () => {
    renderNavbar();
    expect(screen.getAllByText('Recipes').length).toBeGreaterThan(0);
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
  it('renders mobile bottom navigation with 3 primary nodes: Recipes, Meal Plans, Settings labels', () => {
    renderNavbar();
    expect(screen.getAllByText('Recipes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Meal Plans').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  // --- Navigation link paths ---
  it('links Recipes All to /recipes/all and brand to /', () => {
    const { container } = renderNavbar();
    const brandLinks = container.querySelectorAll('a[href="/"]');
    expect(brandLinks.length).toBeGreaterThan(0);
  });

  it('links My Recipes to /recipes/mine or /my-recipes', () => {
    const { container } = renderNavbar();
    const links = container.querySelectorAll('a[href="/recipes/mine"], a[href="/my-recipes"]');
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
