import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NutritionSnapshot from './NutritionSnapshot';

const mockNutrition = {
  glycemicIndex: 53,
  glycemicLoad: 9.3,
  netCarbs: 17.5,
  fiber: 2.5,
  carbs: 20,
  protein: 38,
  fat: 6.8,
  kcal: 291,
};

describe('NutritionSnapshot component', () => {
  // --- 8-column bento grid ---
  it('renders all 8 nutrition badges', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getByText('Glycemic Index')).toBeDefined();
    expect(screen.getByText('Glycemic Load')).toBeDefined();
    expect(screen.getByText('Net Carbs')).toBeDefined();
    expect(screen.getByText('Fibers')).toBeDefined();
    expect(screen.getByText('Total Carbs')).toBeDefined();
    expect(screen.getByText('Protein')).toBeDefined();
    expect(screen.getByText('Healthy Fats')).toBeDefined();
    expect(screen.getByText('Energy')).toBeDefined();
  });

  // --- Values render correctly ---
  it('displays correct numerical values', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getByText('53')).toBeDefined();      // GI
    expect(screen.getByText('9.3')).toBeDefined();      // GL
    expect(screen.getByText('17.5g')).toBeDefined();    // Net Carbs
    expect(screen.getByText('2.5g')).toBeDefined();     // Fiber
    expect(screen.getByText('20g')).toBeDefined();      // Total Carbs
    expect(screen.getByText('38g')).toBeDefined();      // Protein
    expect(screen.getByText('6.8g')).toBeDefined();     // Fat
    expect(screen.getByText('291 kcal')).toBeDefined(); // Energy
  });

  // --- Responsive grid container ---
  it('uses 8-column grid on lg breakpoint', () => {
    const { container } = render(<NutritionSnapshot nutrition={mockNutrition} />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('lg:grid-cols-8');
  });

  // --- Header ---
  it('renders "Nutritional Snapshot" heading', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getByText('Nutritional Snapshot')).toBeDefined();
  });

  // --- Scaling test: 2x serving ---
  it('renders scaled values when nutrition is pre-scaled', () => {
    const scaled2x = {
      ...mockNutrition,
      kcal: 582,
      protein: 76,
      fat: 13.6,
      carbs: 40,
      netCarbs: 35,
      fiber: 5,
      glycemicIndex: 53, // stays same
      glycemicLoad: 18.6,
    };
    render(<NutritionSnapshot nutrition={scaled2x} />);
    expect(screen.getByText('582 kcal')).toBeDefined();
    expect(screen.getByText('76g')).toBeDefined();
    expect(screen.getByText('53')).toBeDefined();  // GI unchanged
    expect(screen.getByText('18.6')).toBeDefined(); // GL scaled
  });
});
