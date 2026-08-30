import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RecipeTagFooter } from './RecipeTagFooter';

describe('RecipeTagFooter Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders standard glycemic load and clinical speed badges', () => {
    render(<RecipeTagFooter glycemicLoad={5} fiber={6} mealOccasion="lunch" />);
    expect(screen.getByText(/GL 5/)).toBeDefined();
    expect(screen.getByText(/Gentle/)).toBeDefined();
    expect(screen.getByText('Lunch')).toBeDefined();
    expect(screen.getByText('High Fiber')).toBeDefined();
  });

  it('renders allergen badges from explicit allergens array with role="img" and aria-label', () => {
    render(
      <RecipeTagFooter
        glycemicLoad={8}
        allergens={['tree_nuts', 'peanuts', 'milk']}
      />
    );

    const treeNutsBadge = screen.getByLabelText('Contains tree nuts');
    expect(treeNutsBadge).toBeDefined();
    expect(treeNutsBadge.getAttribute('role')).toBe('img');
    expect(treeNutsBadge.textContent).toContain('Contains tree nuts');

    const peanutsBadge = screen.getByLabelText('Contains peanuts');
    expect(peanutsBadge).toBeDefined();
    expect(peanutsBadge.getAttribute('role')).toBe('img');
    expect(peanutsBadge.textContent).toContain('Contains peanuts');

    const milkBadge = screen.getByLabelText('Contains milk');
    expect(milkBadge).toBeDefined();
    expect(milkBadge.getAttribute('role')).toBe('img');
    expect(milkBadge.textContent).toContain('Contains milk');
  });

  it('derives allergens from ingredients when allergens prop is empty', () => {
    const ingredients = [
      { ingredientId: 'atlantic-salmon', name: 'Salmon', allergens: ['fish'] },
      { ingredientId: 'parmesan', name: 'Cheese', allergens: ['milk'] },
    ];
    render(<RecipeTagFooter glycemicLoad={2} ingredients={ingredients} />);

    const fishBadge = screen.getByLabelText('Contains fish');
    expect(fishBadge).toBeDefined();
    expect(fishBadge.getAttribute('role')).toBe('img');

    const milkBadge = screen.getByLabelText('Contains milk');
    expect(milkBadge).toBeDefined();
    expect(milkBadge.getAttribute('role')).toBe('img');
  });

  it('does not render allergen container when recipe has no allergens', () => {
    render(<RecipeTagFooter glycemicLoad={1} allergens={[]} ingredients={[]} />);
    expect(screen.queryByLabelText('Allergen warnings')).toBeNull();
  });
});