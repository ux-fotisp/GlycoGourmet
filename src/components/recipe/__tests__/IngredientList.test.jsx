import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { IngredientList } from '../IngredientList';
import { usePreferences } from '../../../context/UserPreferences';

vi.mock('../../../context/UserPreferences', () => ({
  usePreferences: vi.fn(),
}));

vi.mock('../../../utils/unitConverter', () => ({
  convertAmountAndUnit: vi.fn((amt, unit) => ({ amount: amt, unit: unit || 'g' })),
}));

vi.mock('../../../utils/nutritionCalculator', () => ({
  getPrepStateLabel: vi.fn(() => 'Raw'),
  PREP_STATES: [{ value: 'raw', icon: 'eco', label: 'Raw' }],
  getIngredientById: vi.fn((id) => ({
    id,
    name: id === 'cauliflower-rice' ? 'Cauliflower Rice' : 'White Rice',
    defaultAmount: 100,
    category: 'grain',
    nutrition: { carbs: 28, fiber: 0.4, netCarbs: 27.6, glycemicIndex: 73 },
  })),
}));

describe('US-2.2: IngredientList Smart Low-GI Swap Presets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    usePreferences.mockReturnValue({ unitSystem: 'metric' });
  });

  afterEach(() => {
    cleanup();
  });

  const sampleIngredients = [
    { ingredientId: 'white-rice', originalId: 'white-rice', name: 'White Rice', amount: 100, unit: 'g', prepState: 'boiled' },
  ];

  it('Scenario 2.1: Renders ghost button [ Swap with Cauliflower Rice (GL -12) ] for high-GI White Rice', () => {
    render(
      <IngredientList
        ingredients={sampleIngredients}
        servingMultiplier={1}
        swappedIngredients={{}}
      />
    );

    const swapBtn = screen.getByRole('button', { name: /Swap with Cauliflower Rice \(GL -12\)/i });
    expect(swapBtn).toBeDefined();
  });

  it('Scenario 2.2: Invokes onQuickSwap callback with target ID when swap button is clicked', () => {
    const handleQuickSwap = vi.fn();

    render(
      <IngredientList
        ingredients={sampleIngredients}
        servingMultiplier={1}
        swappedIngredients={{}}
        onQuickSwap={handleQuickSwap}
      />
    );

    const swapBtn = screen.getByRole('button', { name: /Swap with Cauliflower Rice \(GL -12\)/i });
    fireEvent.click(swapBtn);

    expect(handleQuickSwap).toHaveBeenCalledWith('white-rice', 'cauliflower-rice');
  });
});
