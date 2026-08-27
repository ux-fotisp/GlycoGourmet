import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NutritionSnapshot from '../../../../src/components/recipe/NutritionSnapshot';

// Mock AuthContext so UserPreferencesProvider does not throw
vi.mock('../../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    setSettings: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock NutritionBadge - use React.createElement to avoid JSX transform issues
vi.mock('../../../../src/components/ui/NutritionBadge', () => ({
  default: ({ label, value, unit }) =>
    React.createElement('div', { 'data-testid': `badge-${label}` }, `${label}: ${value}${unit}`),
}));

import { UserPreferencesProvider } from '../../../../src/context/UserPreferences';

describe('NutritionSnapshot', () => {
  const defaultNutrition = {
    glycemicLoad: 15,
    glycemicIndex: 55,
    netCarbs: 20,
    fiber: 5,
    kcal: 400,
    protein: 25,
    fat: 10,
  };

  const renderWithProvider = (ui) =>
    render(React.createElement(UserPreferencesProvider, null, ui));

  it('renders GL and GI primary anchors', () => {
    renderWithProvider(React.createElement(NutritionSnapshot, { nutrition: defaultNutrition }));
    expect(screen.getByText('GL 15')).toBeInTheDocument();
    expect(screen.getByText('GI 55')).toBeInTheDocument();
  });

  it('renders Net Carbs and Fiber badges', () => {
    renderWithProvider(React.createElement(NutritionSnapshot, { nutrition: defaultNutrition }));
    expect(screen.getByTestId('badge-Net Carbs')).toBeInTheDocument();
    expect(screen.getByTestId('badge-Dietary Fiber')).toBeInTheDocument();
  });

  it('secondary macros section is expanded by default (open attribute)', () => {
    renderWithProvider(React.createElement(NutritionSnapshot, { nutrition: defaultNutrition }));
    const details = document.querySelector('details');
    expect(details).not.toBeNull();
    expect(details.hasAttribute('open')).toBe(true);
    expect(screen.getByTestId('badge-Calories')).toBeInTheDocument();
    expect(screen.getByTestId('badge-Protein')).toBeInTheDocument();
    expect(screen.getByTestId('badge-Total Fat')).toBeInTheDocument();
  });

  it('zero-carb recipe renders GL 0 without NaN', () => {
    const zeroCarb = { glycemicLoad: 0, glycemicIndex: 0, netCarbs: 0, fiber: 0, kcal: 200, protein: 20, fat: 15 };
    renderWithProvider(React.createElement(NutritionSnapshot, { nutrition: zeroCarb }));
    expect(screen.getByText('GL 0')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('handles null nutrition gracefully with GL 0 fallback', () => {
    renderWithProvider(React.createElement(NutritionSnapshot, { nutrition: null }));
    expect(screen.getByText('GL 0')).toBeInTheDocument();
  });
});
