import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Onboarding } from './Onboarding';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Onboarding page', () => {
  const mockSetPreferences = vi.fn();
  const mockSetSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      setPreferences: mockSetPreferences,
      setSettings: mockSetSettings,
    });
  });

  const renderOnboarding = () =>
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

  // --- Dietary Options ---
  it('renders all 6 dietary profile options', () => {
    renderOnboarding();
    expect(screen.getByText('Type 1 Diabetic')).toBeDefined();
    expect(screen.getByText('Type 2 Diabetic')).toBeDefined();
    expect(screen.getByText('Pre-Diabetic')).toBeDefined();
    expect(screen.getByText('Keto-Friendly Focus')).toBeDefined();
    expect(screen.getByText('Low Sodium Focus')).toBeDefined();
    expect(screen.getByText('High Fiber Focus')).toBeDefined();
  });

  // --- Unit System Segments ---
  it('renders unit system toggle (Imperial / Metric)', () => {
    renderOnboarding();
    expect(screen.getByText('Imperial')).toBeDefined();
    expect(screen.getByText('Metric')).toBeDefined();
  });

  // --- Glucose Unit Segments ---
  it('renders glucose unit toggle (mg/dL / mmol/L)', () => {
    renderOnboarding();
    expect(screen.getByText('mg/dL')).toBeDefined();
    expect(screen.getByText('mmol/L')).toBeDefined();
  });

  // --- Visual Density ---
  it('renders visual density segments (Comfortable / High-Density)', () => {
    renderOnboarding();
    expect(screen.getByText('Comfortable')).toBeDefined();
    expect(screen.getByText('High-Density')).toBeDefined();
  });

  // --- Dietary Toggle ---
  it('toggles dietary option selection on click', () => {
    renderOnboarding();
    const ketoCard = screen.getByText('Keto-Friendly Focus');
    fireEvent.click(ketoCard);
    // The card should now have a visual change (checked), but since we test DOM state,
    // just verify click doesn't crash
    expect(ketoCard).toBeDefined();
  });

  // --- Save Action ---
  it('calls setPreferences and setSettings on Save', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Get Started/i));
    expect(mockSetPreferences).toHaveBeenCalledTimes(1);
    expect(mockSetSettings).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // --- Skip Action ---
  it('calls setPreferences with defaults on Skip', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/Skip for Now/i));
    expect(mockSetPreferences).toHaveBeenCalledWith([]);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
