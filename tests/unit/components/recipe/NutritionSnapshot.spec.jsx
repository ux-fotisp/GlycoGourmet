import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NutritionSnapshot from '../../../../src/components/recipe/NutritionSnapshot';
import { UserPreferencesProvider } from '../../../../src/context/UserPreferences';

// Mock the badge component to simplify testing
vi.mock('../../../../src/components/ui/NutritionBadge', () => {
  return {
    default: ({ label, value, unit }) => (
      <div data-testid={adge-}>
        {label}: {value}{unit}
      </div>
    ),
  };
});

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

  const renderWithProvider = (ui) => {
    return render(
      <UserPreferencesProvider>
        {ui}
      </UserPreferencesProvider>
    );
  };

  it('renders primary anchors correctly', () => {
    renderWithProvider(<NutritionSnapshot nutrition={defaultNutrition} />);
    
    // Check GL
    expect(screen.getByText('GL 15')).toBeInTheDocument();
    
    // Check GI
    expect(screen.getByText('GI 55')).toBeInTheDocument();
    
    // Check Badges
    expect(screen.getByTestId('badge-Net Carbs')).toHaveTextContent('Net Carbs: 20g');
    expect(screen.getByTestId('badge-Dietary Fiber')).toHaveTextContent('Dietary Fiber: 5g');
  });

  it('renders secondary macros inside an expanded details element by default', () => {
    renderWithProvider(<NutritionSnapshot nutrition={defaultNutrition} />);
    
    const details = screen.getByRole('group', { name: /secondary macronutrient breakdown/i });
    expect(details).toBeInTheDocument();
    expect(details).toHaveAttribute('open'); // should be expanded by default

    // Check Secondary Badges
    expect(screen.getByTestId('badge-Calories')).toHaveTextContent('Calories: 400 kcal');
    expect(screen.getByTestId('badge-Protein')).toHaveTextContent('Protein: 25g');
    expect(screen.getByTestId('badge-Total Fat')).toHaveTextContent('Total Fat: 10g');
  });

  it('handles missing nutrition data gracefully', () => {
    renderWithProvider(<NutritionSnapshot nutrition={null} />);
    
    expect(screen.getByText('GL 0')).toBeInTheDocument();
    expect(screen.getByText('GI —')).toBeInTheDocument();
  });
});