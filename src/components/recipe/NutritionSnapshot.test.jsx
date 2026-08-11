import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
  afterEach(() => cleanup());

  // --- Primary Anchors & Accordion ---
  it('renders primary anchor bento items and secondary macro accordion', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getByText('Glycemic Index')).toBeDefined();
    expect(screen.getByText('Glycemic Load')).toBeDefined();
    expect(screen.getByText('Net Carbs')).toBeDefined();
    expect(screen.getByText('Dietary Fiber')).toBeDefined();
    expect(screen.getByText(/Secondary Macros/)).toBeDefined();
  });

  // --- Values render correctly ---
  it('displays correct numerical values', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getAllByText(/GI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/GL/i).length).toBeGreaterThan(0);
    expect(screen.getByText('17.5g')).toBeDefined();       // Net Carbs
    expect(screen.getByText('2.5g')).toBeDefined();        // Fiber
    expect(screen.getByText('291 kcal')).toBeDefined();    // Calories
    expect(screen.getByText('38g')).toBeDefined();         // Protein
    expect(screen.getByText('6.8g')).toBeDefined();        // Fat
    expect(screen.getByText('Gentle Impact')).toBeDefined(); // Preattentive GL label
  });

  // --- Responsive grid container ---
  it('uses 4-column grid on md breakpoint for primary anchors', () => {
    const { container } = render(<NutritionSnapshot nutrition={mockNutrition} />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('md:grid-cols-4');
  });

  // --- Header ---
  it('renders "Nutritional Snapshot" heading', () => {
    render(<NutritionSnapshot nutrition={mockNutrition} />);
    expect(screen.getByText(/Nutritional Snapshot/)).toBeDefined();
  });
});
