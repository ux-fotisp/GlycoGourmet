import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NutritionBadge from './NutritionBadge';

describe('NutritionBadge component', () => {
  // --- Numeric rendering ---
  it('renders numerical value with unit correctly', () => {
    render(<NutritionBadge label="Protein" value={34} unit="g" />);
    expect(screen.getByText('34g')).toBeDefined();
    expect(screen.getByText('Protein')).toBeDefined();
  });

  it('renders value with space-prefixed unit', () => {
    render(<NutritionBadge label="Energy" value={280} unit=" kcal" />);
    expect(screen.getByText('280 kcal')).toBeDefined();
  });

  // --- Null/undefined safety ---
  it('renders em-dash for null values', () => {
    render(<NutritionBadge label="Glycemic Index" value={null} />);
    expect(screen.getByText('—')).toBeDefined();
  });

  it('renders em-dash for undefined values', () => {
    render(<NutritionBadge label="Glycemic Load" />);
    expect(screen.getByText('—')).toBeDefined();
  });

  // --- Highlight ---
  it('applies text-tertiary when highlight is true', () => {
    const { container } = render(
      <NutritionBadge label="GI" value={53} highlight={true} />
    );
    const valueEl = container.querySelector('.font-bold.font-display');
    expect(valueEl.className).toContain('text-tertiary');
  });

  it('applies text-primary when highlight is false', () => {
    const { container } = render(
      <NutritionBadge label="Carbs" value={20} unit="g" highlight={false} />
    );
    const valueEl = container.querySelector('.font-bold.font-display');
    expect(valueEl.className).toContain('text-primary');
  });

  // --- Bento cell structure ---
  it('has min-h-[90px] for bento grid cell layout', () => {
    const { container } = render(
      <NutritionBadge label="Fat" value={5} unit="g" />
    );
    const cell = container.firstChild;
    expect(cell.className).toContain('min-h-[90px]');
    expect(cell.className).toContain('bg-surface-container-low');
    expect(cell.className).toContain('rounded-lg');
  });
});
