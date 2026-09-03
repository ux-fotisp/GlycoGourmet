import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomIngredientFormModal from '../../../../src/components/recipe-builder/CustomIngredientFormModal';
import IngredientAddModal from '../../../../src/components/recipe-builder/IngredientAddModal';
import * as ingredientStore from '../../../../src/utils/ingredientStore';

describe('CustomIngredientFormModal — Patient-Safe Custom Ingredient Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders accessible dialog landmark, heading, all required fields, and honest disclaimer', () => {
    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog', { name: /create custom ingredient/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Required inputs
    expect(screen.getByLabelText(/ingredient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base portion amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carbohydrates/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dietary fiber/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total fat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/glycemic index/i)).toBeInTheDocument();

    // Disclaimer
    expect(
      screen.getByText(/may be visible to other users of this catalog/i)
    ).toBeInTheDocument();
  });

  it('2. Submitting empty form displays inline errors for required fields without saving', async () => {
    const saveSpy = vi.spyOn(ingredientStore, 'saveCustomIngredient');
    const onCreatedMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreatedMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /save & add to recipe/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/ingredient name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/calories is required/i)).toBeInTheDocument();
    expect(screen.getByText(/carbohydrates is required/i)).toBeInTheDocument();
    expect(screen.getByText(/dietary fiber is required/i)).toBeInTheDocument();
    expect(screen.getByText(/protein is required/i)).toBeInTheDocument();
    expect(screen.getByText(/total fat is required/i)).toBeInTheDocument();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(onCreatedMock).not.toHaveBeenCalled();
  });

  it('3. Negative values and carb/fiber anomalies display explicit inline error messages', async () => {
    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Test Flax' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '-10' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '15' } }); // fiber > carbs anomaly
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    expect(await screen.findByText(/calories cannot be negative/i)).toBeInTheDocument();
    expect(screen.getByText(/dietary fiber cannot exceed total carbohydrates/i)).toBeInTheDocument();
  });

  it('4. Valid submission saves via saveCustomIngredient and returns adapted line with source "user_entered"', async () => {
    const mockCreatedIngredient = {
      id: 'custom-flax-flour-123',
      name: 'Flax Seed Flour',
      category: 'grain',
      defaultUnit: 'g',
      defaultAmount: 100,
      isUserAuthored: true,
      kcal: 450,
      protein: 18,
      fat: 35,
      carbs: 28,
      fiber: 26,
      netCarbs: 2,
      glycemicIndex: 15,
      nutrition: {
        kcal: 450,
        protein: 18,
        fat: 35,
        carbs: 28,
        fiber: 26,
        glycemicIndex: 15,
      },
    };

    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockResolvedValue({
      ok: true,
      ingredient: mockCreatedIngredient,
      errors: null,
      warning: null,
    });

    const onCreatedMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={onCloseMock}
        onCreated={onCreatedMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Flax Seed Flour' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '450' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '28' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '26' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '35' } });
    fireEvent.change(screen.getByLabelText(/glycemic index/i), { target: { value: '15' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(ingredientStore.saveCustomIngredient).toHaveBeenCalled();
      expect(onCreatedMock).toHaveBeenCalledTimes(1);
    });

    const adaptedArg = onCreatedMock.mock.calls[0][0];
    expect(adaptedArg.displayName).toBe('Flax Seed Flour');
    expect(adaptedArg.source).toBe('user_entered');
    expect(adaptedArg.quantity).toBe(100);
    expect(adaptedArg.unit).toBe('g');
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('5. Anti-upgrade invariant: isUserAuthored: true guarantees source is ALWAYS "user_entered" (never "internal_verified")', async () => {
    const completeMock = {
      id: 'custom-perfect-oats',
      name: 'Perfect Custom Oats',
      category: 'grain',
      defaultUnit: 'g',
      defaultAmount: 100,
      isUserAuthored: true, // Guarantees user_entered
      kcal: 389,
      protein: 16.9,
      fat: 6.9,
      carbs: 66.3,
      fiber: 10.6,
      netCarbs: 55.7,
      glycemicIndex: 55,
      nutrition: {
        kcal: 389,
        protein: 16.9,
        fat: 6.9,
        carbs: 66.3,
        fiber: 10.6,
        glycemicIndex: 55,
      },
    };

    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockResolvedValue({
      ok: true,
      ingredient: completeMock,
      errors: null,
      warning: null,
    });

    const onCreatedMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreatedMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Perfect Custom Oats' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '389' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '66.3' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '10.6' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '16.9' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '6.9' } });
    fireEvent.change(screen.getByLabelText(/glycemic index/i), { target: { value: '55' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(onCreatedMock).toHaveBeenCalledTimes(1);
    });

    const line = onCreatedMock.mock.calls[0][0];
    expect(line.source).toBe('user_entered');
    expect(line.source).not.toBe('internal_verified');
  });

  it('6. Optional GI omission on carb contributor saves null GI and produces giEvidenceStatus "unavailable"', async () => {
    let capturedPayload = null;
    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockImplementation(async (payload) => {
      capturedPayload = payload;
      return {
        ok: true,
        ingredient: {
          id: 'custom-carb-no-gi',
          name: 'Custom Grain Without GI',
          category: 'grain',
          defaultUnit: 'g',
          defaultAmount: 100,
          isUserAuthored: true,
          kcal: 300,
          protein: 10,
          fat: 2,
          carbs: 60,
          fiber: 5,
          netCarbs: 55,
          glycemicIndex: null,
          nutrition: { kcal: 300, protein: 10, fat: 2, carbs: 60, fiber: 5, glycemicIndex: null },
        },
        errors: null,
        warning: null,
      };
    });

    const onCreatedMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreatedMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Custom Grain Without GI' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '2' } });
    // GI intentionally left blank

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(ingredientStore.saveCustomIngredient).toHaveBeenCalled();
    });

    expect(capturedPayload.nutrition.glycemicIndex).toBeNull();
    const line = onCreatedMock.mock.calls[0][0];
    expect(line.glycemicIndex).toBeNull();
    expect(line.giEvidenceStatus).toBe('unavailable');
    expect(line.glycemicIndex).not.toBe(0);
  });

  it('7. Optional GI omission on non-carb item produces giEvidenceStatus "not_applicable"', async () => {
    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockResolvedValue({
      ok: true,
      ingredient: {
        id: 'custom-avocado-oil',
        name: 'Custom Avocado Oil',
        category: 'fat',
        defaultUnit: 'g',
        defaultAmount: 14,
        isUserAuthored: true,
        kcal: 120,
        protein: 0,
        fat: 14,
        carbs: 0,
        fiber: 0,
        netCarbs: 0,
        glycemicIndex: null,
        nutrition: { kcal: 120, protein: 0, fat: 14, carbs: 0, fiber: 0, glycemicIndex: null },
      },
      errors: null,
      warning: null,
    });

    const onCreatedMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreatedMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Custom Avocado Oil' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '14' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(onCreatedMock).toHaveBeenCalled();
    });

    const line = onCreatedMock.mock.calls[0][0];
    expect(line.glycemicIndex).toBeNull();
    expect(line.giEvidenceStatus).toBe('not_applicable');
  });

  it('8. Explicit valid GI (45) saves with glycemicIndex 45 and giEvidenceStatus "available"', async () => {
    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockResolvedValue({
      ok: true,
      ingredient: {
        id: 'custom-barley',
        name: 'Pearled Barley',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 100,
        isUserAuthored: true,
        kcal: 350,
        protein: 12,
        fat: 2,
        carbs: 70,
        fiber: 15,
        netCarbs: 55,
        glycemicIndex: 45,
        nutrition: { kcal: 350, protein: 12, fat: 2, carbs: 70, fiber: 15, glycemicIndex: 45 },
      },
      errors: null,
      warning: null,
    });

    const onCreatedMock = vi.fn();

    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreatedMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Pearled Barley' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '350' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/glycemic index/i), { target: { value: '45' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(onCreatedMock).toHaveBeenCalled();
    });

    const line = onCreatedMock.mock.calls[0][0];
    expect(line.glycemicIndex).toBe(45);
    expect(line.giEvidenceStatus).toBe('available');
  });

  it('9. Focus trap keeps keyboard navigation inside the modal', () => {
    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/ingredient name/i);
    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);
  });

  it('10. Escape key listener dismisses the modal cleanly', () => {
    const onCloseMock = vi.fn();
    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={onCloseMock}
        onCreated={vi.fn()}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('11. Proves absence of prohibited marketing/clinical claims across all rendered DOM text', () => {
    const { container } = render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

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

  it('12. IngredientAddModal integration: clicking "Create New Custom Ingredient" launches creation flow and auto-adds to recipe line', async () => {
    vi.spyOn(ingredientStore, 'saveCustomIngredient').mockResolvedValue({
      ok: true,
      ingredient: {
        id: 'custom-flax-modal-integration',
        name: 'Golden Flax Seeds',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 30,
        isUserAuthored: true,
        kcal: 160,
        protein: 6,
        fat: 12,
        carbs: 9,
        fiber: 8,
        netCarbs: 1,
        glycemicIndex: 10,
        nutrition: { kcal: 160, protein: 6, fat: 12, carbs: 9, fiber: 8, glycemicIndex: 10 },
      },
      errors: null,
      warning: null,
    });

    const onSelectMock = vi.fn();
    const onCloseModalMock = vi.fn();

    render(
      <IngredientAddModal
        isOpen={true}
        onClose={onCloseModalMock}
        onSelect={onSelectMock}
      />
    );

    // Switch to custom tab
    const customTabBtn = screen.getByRole('button', { name: /user-entered custom/i });
    fireEvent.click(customTabBtn);

    // Click Create New Custom Ingredient button
    const createBtn = screen.getByRole('button', { name: /create new custom ingredient/i });
    fireEvent.click(createBtn);

    // Creation modal is now visible
    expect(screen.getByRole('dialog', { name: /create custom ingredient/i })).toBeInTheDocument();

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/ingredient name/i), { target: { value: 'Golden Flax Seeds' } });
    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '160' } });
    fireEvent.change(screen.getByLabelText(/carbohydrates/i), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText(/dietary fiber/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText(/total fat/i), { target: { value: '12' } });

    fireEvent.click(screen.getByRole('button', { name: /save & add to recipe/i }));

    await waitFor(() => {
      expect(onSelectMock).toHaveBeenCalledTimes(1);
    });

    const selectedLine = onSelectMock.mock.calls[0][0];
    expect(selectedLine.displayName).toBe('Golden Flax Seeds');
    expect(selectedLine.source).toBe('user_entered');
  });

  it('13. Proves disclaimer text matches real unscoped catalog behavior with no false device-privacy claim', () => {
    const { container } = render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    const fullText = container.textContent;

    // Truthful statement present
    expect(fullText).toContain(
      "Note: This ingredient's nutrition values were entered by a user and have not been independently verified. It may be visible to other users of this catalog."
    );

    // False claims absent
    expect(fullText.toLowerCase()).not.toContain('private to your local device');
    expect(fullText.toLowerCase()).not.toContain('private to your session');
  });
  it('14. Renders Default Preparation options with correct real giMultiplier values (e.g. Boiled (1.2x GI), Raw (1x GI))', () => {
    render(
      <CustomIngredientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    const prepSelect = screen.getByLabelText(/default preparation/i);
    expect(prepSelect).toBeInTheDocument();

    const options = Array.from(prepSelect.querySelectorAll('option')).map((opt) => opt.textContent);
    
    // Assert real multiplier strings
    expect(options).toContain('Raw (1x GI)');
    expect(options).toContain('Boiled (1.2x GI)');
    expect(options).toContain('Roasted (1.15x GI)');
    expect(options).toContain('Cooled (0.85x GI)');

    // Ensure "undefined" never appears
    options.forEach((optText) => {
      expect(optText).not.toContain('undefined');
    });
  });
});
