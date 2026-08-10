import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IngredientSelector from './IngredientSelector';

// Mock ingredientStore to avoid real localStorage + ingredients.json parsing
const mockIngredientsList = [
  {
    id: 'atlantic-salmon',
    name: 'Fresh Atlantic Salmon',
    category: 'protein',
    defaultUnit: 'oz',
    defaultAmount: 6,
    nutrition: { kcal: 198, protein: 37.2, fat: 4.3, carbs: 0, glycemicIndex: null, glycemicLoad: null, netCarbs: 0, fiber: 0 },
    substitutions: [],
    defaultPrepState: 'raw',
  },
  {
    id: 'avocado-cream',
    name: 'Avocado Cream',
    category: 'fat',
    defaultUnit: 'tbsp',
    defaultAmount: 2,
    nutrition: { kcal: 50, protein: 0.5, fat: 4.5, carbs: 2, glycemicIndex: 10, glycemicLoad: 0.2, netCarbs: 1, fiber: 1 },
    substitutions: [],
    defaultPrepState: 'raw',
  },
];

vi.mock('../../utils/ingredientStore', () => ({
  getIngredientsRegistry: () => mockIngredientsList,
  getIngredientsRegistryAsync: () => Promise.resolve(mockIngredientsList),
  isCustomIngredient: (id) => typeof id === 'string' && id.startsWith('custom-'),
  invalidateIngredientCache: vi.fn(),
}));

// PREP_STATES are still sourced from nutritionCalculator
vi.mock('../../utils/nutritionCalculator', () => ({
  PREP_STATES: [
    { value: 'raw', label: 'Raw', giMultiplier: 1.0, icon: 'eco' },
    { value: 'roasted', label: 'Roasted', giMultiplier: 1.15, icon: 'local_fire_department' },
  ],
  DEFAULT_PREP_STATE: 'raw',
}));

// Mock CustomIngredientModal so it doesn't need its own deps
vi.mock('./CustomIngredientModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="custom-ingredient-modal">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

describe('IngredientSelector component', () => {
  const mockIngredients = [
    { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz', prepState: 'raw' }
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders recipe ingredient header and selected ingredient card', () => {
    render(
      <IngredientSelector
        ingredients={mockIngredients}
        onChange={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText(/Recipe Ingredients/i)).toBeDefined();
    expect(screen.getByText(/Fresh Atlantic Salmon/i)).toBeDefined();
  });

  it('opens segmented picker modal when clicking ingredient card', () => {
    render(
      <IngredientSelector
        ingredients={mockIngredients}
        onChange={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // The row card (h4) is the first match; picker also renders it in results
    fireEvent.click(screen.getAllByText(/Fresh Atlantic Salmon/i)[0]);

    expect(screen.getByText(/Select Ingredient for Slot #1/i)).toBeDefined();
    expect(screen.getByText(/All Impact Levels/i)).toBeDefined();
  });

  it('allows filtering by search input within the picker modal', () => {
    render(
      <IngredientSelector
        ingredients={mockIngredients}
        onChange={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText(/Fresh Atlantic Salmon/i)[0]);
    const searchInput = screen.getByPlaceholderText(/Search.*ingredients/i);
    fireEvent.change(searchInput, { target: { value: 'avocado' } });

    expect(searchInput.value).toBe('avocado');
    expect(screen.getByText(/Avocado Cream/i)).toBeDefined();
  });

  it('calls onAdd when Add Ingredient Slot button is clicked', () => {
    const onAddMock = vi.fn();
    render(
      <IngredientSelector
        ingredients={[]}  // empty list — no picker auto-opens, button is unambiguous
        onChange={vi.fn()}
        onAdd={onAddMock}
        onRemove={vi.fn()}
      />
    );

    const addButton = screen.getByTestId('add-ingredient-slot-btn');
    fireEvent.click(addButton);

    expect(onAddMock).toHaveBeenCalledTimes(1);
  });

  it('shows the Create Custom Ingredient button inside the picker', () => {
    render(
      <IngredientSelector
        ingredients={mockIngredients}
        onChange={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText(/Fresh Atlantic Salmon/i)[0]);

    expect(screen.getByText(/Create Custom Ingredient/i)).toBeDefined();
  });

  it('opens custom ingredient modal when Create Custom Ingredient is clicked', () => {
    render(
      <IngredientSelector
        ingredients={mockIngredients}
        onChange={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText(/Fresh Atlantic Salmon/i)[0]);
    fireEvent.click(screen.getByText(/Create Custom Ingredient/i));

    expect(screen.getByTestId('custom-ingredient-modal')).toBeDefined();
  });
});
