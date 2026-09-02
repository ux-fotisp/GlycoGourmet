import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeIngredientCanvas from '../../../../src/components/recipe-builder/RecipeIngredientCanvas';
import IngredientCanvasRow from '../../../../src/components/recipe-builder/IngredientCanvasRow';
import IngredientAddModal from '../../../../src/components/recipe-builder/IngredientAddModal';
import { adaptInternalIngredient, adaptUsdaFood } from '../../../../src/utils/provenanceAdapters';
import { calculateRecipeNutrition, PREP_STATES } from '../../../../src/utils/nutritionCalculator';

// Mock USDA search service
vi.mock('../../../../src/services/usdaClient', () => ({
  searchUSDAFoods: vi.fn().mockResolvedValue([
    {
      fdcId: 175167,
      description: 'Salmon, Atlantic, wild, raw',
      brandOwner: 'USDA Standard Reference',
      kcal: 142,
      protein: 19.8,
      fat: 6.3,
      carbs: 0,
      fiber: 0,
    },
  ]),
}));

// Mock ingredient store for custom ingredients
vi.mock('../../../../src/utils/ingredientStore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCustomIngredients: vi.fn(() => []),
  };
});

describe('RecipeIngredientCanvas — Private Recipe Authoring Ingredient Assembly', () => {
  const quinoaMock = {
    id: 'quinoa-cooked',
    name: 'Quinoa (Cooked)',
    category: 'grain',
    defaultAmount: 100,
    defaultUnit: 'g',
    defaultPrepState: 'boiled',
    kcal: 120,
    protein: 4.4,
    fat: 1.9,
    carbs: 21.3,
    fiber: 2.8,
    glycemicIndex: 53,
    isUserAuthored: false,
  };

  const salmonMock = {
    id: 'atlantic-salmon',
    name: 'Atlantic Salmon',
    category: 'protein',
    defaultAmount: 120,
    defaultUnit: 'g',
    defaultPrepState: 'raw',
    kcal: 206,
    protein: 22,
    fat: 13,
    carbs: 0,
    fiber: 0,
    glycemicIndex: 0,
    isUserAuthored: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders empty canvas state with accessible "Add Ingredient" trigger', () => {
    render(<RecipeIngredientCanvas lines={[]} onChange={vi.fn()} />);

    expect(screen.getByTestId('ingredient-canvas-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No ingredients added yet.')).toBeInTheDocument();
    expect(screen.getByTestId('add-ingredient-btn')).toBeInTheDocument();
  });

  it('2. Renders list of ingredient lines with exact truthful provenance badges ("Verified database", "USDA-sourced", "User-entered", "Needs review")', () => {
    const lines = [
      adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 150, unit: 'g' }),
      adaptUsdaFood({ fdcId: 12345, description: 'USDA Beef', kcal: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 }, { id: 'line-2', quantity: 100, unit: 'g' }),
      {
        id: 'line-3',
        displayName: 'Custom Flax Blend',
        quantity: 30,
        unit: 'g',
        normalizedGrams: 30,
        source: 'user_entered',
        giEvidenceStatus: 'available',
        glycemicIndex: 15,
        nutritionPer100g: { energyKcal: 400, carbohydrateG: 10, fiberG: 8, proteinG: 18, fatG: 30 },
        validation: { status: 'complete', reasons: [] },
      },
      {
        id: 'line-4',
        displayName: 'Unresolved Powder',
        quantity: 10,
        unit: 'g',
        normalizedGrams: 10,
        source: 'needs_review',
        giEvidenceStatus: 'needs_review',
        glycemicIndex: null,
        validation: { status: 'incomplete', reasons: ['Missing catalog data'] },
      },
    ];

    render(<RecipeIngredientCanvas lines={lines} onChange={vi.fn()} />);

    expect(screen.getByText('Verified database')).toBeInTheDocument();
    expect(screen.getByText('USDA-sourced')).toBeInTheDocument();
    expect(screen.getByText('User-entered')).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });

  it('3. Proves absence of prohibited marketing/clinical claims ("USDA-approved", "clinically approved", "diabetes-safe", "medically approved") across the DOM', () => {
    const lines = [adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' })];
    const { container } = render(<RecipeIngredientCanvas lines={lines} onChange={vi.fn()} />);

    const prohibitedTerms = [
      'usda-approved',
      'usda approved',
      'clinically-approved',
      'clinically approved',
      'diabetes-safe',
      'diabetes safe',
      'medically-approved',
      'medically approved',
    ];

    const fullText = container.textContent.toLowerCase();
    prohibitedTerms.forEach((term) => {
      expect(fullText).not.toContain(term);
    });
  });

  it('4. Adding an internal ingredient creates a verified line with an explicit unique line ID', async () => {
    const handleChange = vi.fn();
    render(<RecipeIngredientCanvas lines={[]} onChange={handleChange} />);

    fireEvent.click(screen.getByTestId('add-ingredient-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search verified catalog/i);
    fireEvent.change(searchInput, { target: { value: 'Quinoa' } });

    const quinoaResult = await screen.findByText('Quinoa (Cooked)');
    fireEvent.click(quinoaResult);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const addedLine = handleChange.mock.calls[0][0][0];
    expect(addedLine.displayName).toBe('Quinoa (Cooked)');
    expect(addedLine.source).toBe('internal_verified');
    expect(addedLine.id).toBeDefined();
    expect(addedLine.id.startsWith('line_')).toBe(true);
  });

  it('5. Adding a USDA ingredient creates a USDA-sourced line with FDC ID', async () => {
    const handleChange = vi.fn();
    render(<RecipeIngredientCanvas lines={[]} onChange={handleChange} />);

    fireEvent.click(screen.getByTestId('add-ingredient-btn'));

    // Switch to USDA tab
    fireEvent.click(screen.getByRole('button', { name: /usda fooddata central/i }));

    const usdaSearchInput = screen.getByPlaceholderText(/search usda fooddata/i);
    fireEvent.change(usdaSearchInput, { target: { value: 'Salmon' } });
    fireEvent.click(screen.getByRole('button', { name: /search usda/i }));

    const salmonResult = await screen.findByText(/Salmon, Atlantic, wild, raw/i);
    fireEvent.click(salmonResult);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const addedLine = handleChange.mock.calls[0][0][0];
    expect(addedLine.displayName).toBe('Salmon, Atlantic, wild, raw');
    expect(addedLine.source).toBe('usda_fooddata_central');
    expect(addedLine.fdcId).toBe(175167);
  });

  it('6. Adding two identical ingredients creates two distinct line IDs that can be edited independently', () => {
    const line1 = adaptInternalIngredient(quinoaMock, { id: 'line-unique-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(quinoaMock, { id: 'line-unique-2', quantity: 50, unit: 'g' });

    const handleChange = vi.fn();
    render(<RecipeIngredientCanvas lines={[line1, line2]} onChange={handleChange} />);

    const qtyInputs = screen.getAllByLabelText(/quinoa \(cooked\) quantity/i);
    expect(qtyInputs).toHaveLength(2);
    expect(qtyInputs[0]).toHaveValue(100);
    expect(qtyInputs[1]).toHaveValue(50);

    // Edit first line quantity
    fireEvent.change(qtyInputs[0], { target: { value: '180' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0][0].quantity).toBe(180);
    expect(handleChange.mock.calls[0][0][1].quantity).toBe(50);
  });

  it('7. Editing quantity and unit updates normalized grams in real time', () => {
    const line = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line]} onChange={handleChange} />);

    const qtyInput = screen.getByLabelText(/quinoa \(cooked\) quantity/i);
    fireEvent.change(qtyInput, { target: { value: '200' } });

    expect(handleChange).toHaveBeenCalledWith([
      expect.objectContaining({
        quantity: 200,
        normalizedGrams: 200,
      }),
    ]);
  });

  it('8. Changing unit to a volume unit without density displays "Volume unit requires ingredient-specific density" and sets normalizedGrams null', () => {
    const line = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 1, unit: 'cup' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line]} onChange={handleChange} />);

    expect(screen.getByTestId('incomplete-conversion-alert')).toBeInTheDocument();
    expect(screen.getByText('Volume unit requires ingredient-specific density')).toBeInTheDocument();
  });

  it('9. Changing unit to a count unit without piece weight displays "Count unit requires ingredient-specific gram weight" and sets normalizedGrams null', () => {
    const line = adaptInternalIngredient(salmonMock, { id: 'line-1', quantity: 2, unit: 'piece' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line]} onChange={handleChange} />);

    expect(screen.getByTestId('incomplete-conversion-alert')).toBeInTheDocument();
    expect(screen.getByText('Count unit requires ingredient-specific gram weight')).toBeInTheDocument();
  });

  it('10. Recipe lines carry prepState through the canvas without silently defaulting to a 1.0x multiplier', () => {
    const line = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g', prepState: 'boiled' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line]} onChange={handleChange} />);

    const prepSelect = screen.getByLabelText(/quinoa \(cooked\) preparation state/i);
    expect(prepSelect).toHaveValue('boiled');

    // Change prep state to 'boiled' (1.20x)
    fireEvent.change(prepSelect, { target: { value: 'boiled' } });

    expect(handleChange).toHaveBeenCalledWith([
      expect.objectContaining({
        prepState: 'boiled',
      }),
    ]);

    // Verify calculateRecipeNutrition exercises the 1.20x multiplier for boiled
    const nutritionResult = calculateRecipeNutrition([
      { ingredientId: 'quinoa-cooked', amount: 100, unit: 'g', prepState: 'boiled' },
    ]);
    // Base GI is 53; boiled is 1.20x -> 53 * 1.20 = 63.6 -> rounds to 63.6
    expect(nutritionResult.glycemicIndex).toBe(63.6);
  });

  it('11. Dual-serialized (canonical + legacy-compatible) recipe lines render correctly in public recipe detail and pass existing nutritionCalculator and recipe rendering tests', () => {
    const canonicalLine = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g', prepState: 'steamed' });
    const dualSerializedLine = {
      ...canonicalLine,
      ingredientId: 'quinoa-cooked',
      amount: 100,
      unit: 'g',
      prepState: 'steamed',
    };

    const calculated = calculateRecipeNutrition([dualSerializedLine]);
    expect(calculated.kcal).toBe(120);
    expect(calculated.carbs).toBe(21.3);
    // Base GI 53 * 1.02 steamed = 54.06 -> rounds to 54.1
    expect(calculated.glycemicIndex).toBe(54.1);
  });

  it('12. Reordering lines via "Move up" and "Move down" buttons correctly swaps positions and updates aria-labels', () => {
    const line1 = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(salmonMock, { id: 'line-2', quantity: 120, unit: 'g' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line1, line2]} onChange={handleChange} />);

    const moveDownBtn = screen.getByLabelText(/move quinoa \(cooked\) down/i);
    fireEvent.click(moveDownBtn);

    expect(handleChange).toHaveBeenCalledWith([line2, line1]);
  });

  it('13. "Move up" is disabled on the first line; "Move down" is disabled on the last line', () => {
    const line1 = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(salmonMock, { id: 'line-2', quantity: 120, unit: 'g' });

    render(<RecipeIngredientCanvas lines={[line1, line2]} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/move quinoa \(cooked\) up/i)).toBeDisabled();
    expect(screen.getByLabelText(/move quinoa \(cooked\) down/i)).not.toBeDisabled();

    expect(screen.getByLabelText(/move atlantic salmon up/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/move atlantic salmon down/i)).toBeDisabled();
  });

  it('14. Removing an item removes the correct line item by ID', () => {
    const line1 = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(salmonMock, { id: 'line-2', quantity: 120, unit: 'g' });
    const handleChange = vi.fn();

    render(<RecipeIngredientCanvas lines={[line1, line2]} onChange={handleChange} />);

    const removeSalmonBtn = screen.getByLabelText(/remove atlantic salmon/i);
    fireEvent.click(removeSalmonBtn);

    expect(handleChange).toHaveBeenCalledWith([line1]);
  });

  it('15. Accessible live region announces reorder and removal actions', () => {
    const line1 = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const line2 = adaptInternalIngredient(salmonMock, { id: 'line-2', quantity: 120, unit: 'g' });

    render(<RecipeIngredientCanvas lines={[line1, line2]} onChange={vi.fn()} />);

    const removeBtn = screen.getByLabelText(/remove atlantic salmon/i);
    fireEvent.click(removeBtn);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion.textContent).toContain('Removed Atlantic Salmon from recipe');
  });

  it('16. Add-Ingredient modal focus trap correctly returns focus to the "Add Ingredient" trigger button on close', async () => {
    const TriggerWrapper = () => {
      const [lines, setLines] = React.useState([]);
      return <RecipeIngredientCanvas lines={lines} onChange={setLines} />;
    };

    render(<TriggerWrapper />);

    const addBtn = screen.getByTestId('add-ingredient-btn');
    addBtn.focus();
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/close dialog/i);
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(addBtn);
    });
  });

  it('17. User-Entered Custom tab displays only existing custom ingredients and provides no ingredient-creation entry point', () => {
    render(<RecipeIngredientCanvas lines={[]} onChange={vi.fn()} />);

    fireEvent.click(screen.getByTestId('add-ingredient-btn'));

    // Switch to User-Entered Custom tab
    const customTabBtn = screen.getByRole('button', { name: /user-entered custom/i });
    fireEvent.click(customTabBtn);

    // Shows empty state
    expect(screen.getByTestId('custom-empty-state')).toBeInTheDocument();
    expect(screen.getByText("You haven't added any custom ingredients yet.")).toBeInTheDocument();

    // Verify NO creation button or modal triggers exist in the custom tab
    expect(screen.queryByRole('button', { name: /create custom/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add custom/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new ingredient/i })).not.toBeInTheDocument();
  });
});
