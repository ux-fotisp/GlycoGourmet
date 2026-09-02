import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeNutritionSummary from '../../../../src/components/recipe-builder/RecipeNutritionSummary';
import { adaptInternalIngredient, adaptUsdaFood } from '../../../../src/utils/provenanceAdapters';

describe('RecipeNutritionSummary — Private Recipe Formulation Summary', () => {
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

  it('1. Renders complete status banner and accurate per-serving macros and GL when all lines are complete', () => {
    const lines = [
      adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g', prepState: 'raw' }),
    ];

    render(<RecipeNutritionSummary lines={lines} servings={1} dailyGlTarget={45} />);

    expect(screen.getByTestId('completeness-banner-complete')).toBeInTheDocument();
    expect(screen.getByText(/Complete nutrition & Glycemic Load/i)).toBeInTheDocument();

    // Macro numbers: 100g quinoa -> 120 kcal, 21.3g carbs, 4.4g protein, 1.9g fat, 2.8g fiber
    expect(screen.getByText('120 kcal')).toBeInTheDocument();
    expect(screen.getByText('21.3g')).toBeInTheDocument();
    expect(screen.getByText('4.4g')).toBeInTheDocument();
    expect(screen.getByText('1.9g')).toBeInTheDocument();
    expect(screen.getByText('2.8g')).toBeInTheDocument();

    // Glycemic Load: Net carbs = 21.3 - 2.8 = 18.5. GI = 53. GL = round((53 * 18.5) / 100) = 10
    expect(screen.getByTestId('glycemic-metrics-complete')).toBeInTheDocument();
    expect(screen.getByText('GL 10')).toBeInTheDocument();
    expect(screen.getByText('GI 53')).toBeInTheDocument();
    expect(screen.getByText(/Low GL/i)).toBeInTheDocument();
  });

  it('2. Switching scope from Per Serving to Full Recipe scales macros and GL dynamically', () => {
    const lines = [
      adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 200, unit: 'g', prepState: 'raw' }),
    ];

    // 2 servings total: total recipe = 240 kcal, per serving = 120 kcal
    render(<RecipeNutritionSummary lines={lines} servings={2} dailyGlTarget={45} />);

    // Default scope: Per Serving (1 of 2)
    expect(screen.getByText('120 kcal')).toBeInTheDocument();
    expect(screen.getByText('21.3g')).toBeInTheDocument();

    // Switch to Full Recipe Total
    const fullRecipeBtn = screen.getByRole('button', { name: /full recipe total/i });
    fireEvent.click(fullRecipeBtn)

    // Total recipe numbers
    expect(screen.getByText('240 kcal')).toBeInTheDocument();
    expect(screen.getByText('42.6g')).toBeInTheDocument();
  });

  it('3. Renders estimated state with missing GI on carbohydrate contributor and NEVER fabricates a GL number', () => {
    const missingGiCarbLine = {
      id: 'line-custom-grain',
      displayName: 'Ancient Grain Flour',
      quantity: 100,
      unit: 'g',
      normalizedGrams: 100,
      prepState: 'raw',
      source: 'user_entered',
      giEvidenceStatus: 'unavailable',
      glycemicIndex: null,
      nutritionPer100g: { energyKcal: 350, carbohydrateG: 70, fiberG: 5, proteinG: 12, fatG: 2 },
      validation: { status: 'complete', reasons: [] },
    };

    render(<RecipeNutritionSummary lines={[missingGiCarbLine]} servings={1} />);

    // Completeness alert indicates estimated
    expect(screen.getByTestId('completeness-banner-estimated')).toBeInTheDocument();
    expect(screen.getByText(/Estimated Nutrition \(GL Unavailable\)/i)).toBeInTheDocument();

    // Macros ARE calculated
    expect(screen.getByText('350 kcal')).toBeInTheDocument();
    expect(screen.getByText('70g')).toBeInTheDocument();

    // GL is suppressed with clear explanation; NO numeric GL or progress meter
    expect(screen.getByTestId('gl-unavailable-message')).toBeInTheDocument();
    expect(screen.queryByTestId('glycemic-metrics-complete')).not.toBeInTheDocument();
    expect(screen.queryByText(/GL 0/i)).not.toBeInTheDocument();
  });

  it('4. Renders incomplete state when line cannot be converted to grams and displays "--" placeholders', () => {
    const incompleteLine = {
      id: 'line-unconverted',
      displayName: 'Rolled Oats',
      quantity: 1,
      unit: 'cup',
      normalizedGrams: null,
      prepState: 'raw',
      source: 'internal_verified',
      giEvidenceStatus: 'available',
      glycemicIndex: 55,
      nutritionPer100g: { energyKcal: 380, carbohydrateG: 66, fiberG: 10, proteinG: 13, fatG: 7 },
      validation: { status: 'incomplete', reasons: ['Volume unit requires ingredient-specific density'] },
    };

    render(<RecipeNutritionSummary lines={[incompleteLine]} servings={1} />);

    // Completeness alert indicates incomplete
    expect(screen.getByTestId('completeness-banner-incomplete')).toBeInTheDocument();
    expect(screen.getByText(/Incomplete Nutrition Data/i)).toBeInTheDocument();

    // Macros show placeholders
    const placeholders = screen.getAllByText('--');
    expect(placeholders.length).toBeGreaterThanOrEqual(5);

    // GL message explains blockers
    expect(screen.getByTestId('gl-unavailable-message')).toBeInTheDocument();
  });

  it('5. Non-carbohydrate ingredients with null GI do NOT degrade recipe completeness status', () => {
    const quinoaLine = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' });
    const salmonLine = adaptInternalIngredient(salmonMock, { id: 'line-2', quantity: 150, unit: 'g' });

    // Salmon is 0g carbs, so its glycemicIndex is null and giEvidenceStatus is not_applicable
    expect(salmonLine.glycemicIndex).toBeNull();
    expect(salmonLine.giEvidenceStatus).toBe('not_applicable');

    render(<RecipeNutritionSummary lines={[quinoaLine, salmonLine]} servings={1} />);

    // Should remain COMPLETE status because non-carb ingredients are immune from GI requirement
    expect(screen.getByTestId('completeness-banner-complete')).toBeInTheDocument();
    expect(screen.getByTestId('glycemic-metrics-complete')).toBeInTheDocument();
  });

  it('6. Prep-state thermal multiplier is reflected in aggregate GI and GL', () => {
    // 100g quinoa raw (1.00x) -> GI 53, NetCarbs 18.5 -> GL = round(53 * 18.5 / 100) = 10
    const rawLine = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g', prepState: 'raw' });
    const { rerender } = render(<RecipeNutritionSummary lines={[rawLine]} servings={1} />);
    expect(screen.getByText('GL 10')).toBeInTheDocument();

    // Change prepState to boiled (1.20x) -> GI = 53 * 1.20 = 63.6 -> GL = round(63.6 * 18.5 / 100) = 12
    const boiledLine = adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g', prepState: 'boiled' });
    rerender(<RecipeNutritionSummary lines={[boiledLine]} servings={1} />);
    expect(screen.getByText('GL 12')).toBeInTheDocument();
    expect(screen.getByText('GI 64')).toBeInTheDocument();
  });

  it('7. Proves absence of prohibited marketing/clinical claims across all rendered DOM states', () => {
    const lines = [
      adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' }),
    ];

    const { container } = render(<RecipeNutritionSummary lines={lines} servings={1} />);

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

  it('8. Renders provenance breakdown badges accurately for multi-source lines', () => {
    const lines = [
      adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' }),
      adaptUsdaFood({ fdcId: 99999, description: 'USDA Turkey', kcal: 180, protein: 25, fat: 8, carbs: 0, fiber: 0 }, { id: 'line-2', quantity: 100, unit: 'g' }),
      {
        id: 'line-3',
        displayName: 'Custom Chia Seed Flour',
        quantity: 20,
        unit: 'g',
        normalizedGrams: 20,
        prepState: 'raw',
        source: 'user_entered',
        giEvidenceStatus: 'available',
        glycemicIndex: 15,
        nutritionPer100g: { energyKcal: 480, carbohydrateG: 40, fiberG: 30, proteinG: 16, fatG: 30 },
        validation: { status: 'complete', reasons: [] },
      },
    ];

    render(<RecipeNutritionSummary lines={lines} servings={1} />);

    expect(screen.getByText('1 Verified database')).toBeInTheDocument();
    expect(screen.getByText('1 USDA-sourced')).toBeInTheDocument();
    expect(screen.getByText('1 User-entered')).toBeInTheDocument();
  });

  it('9. Accessible landmark semantics and ARIA attributes are present', () => {
    const lines = [adaptInternalIngredient(quinoaMock, { id: 'line-1', quantity: 100, unit: 'g' })];
    render(<RecipeNutritionSummary lines={lines} servings={1} />);

    const region = screen.getByRole('region', { name: /recipe nutrition and metabolic summary/i });
    expect(region).toBeInTheDocument();
  });
});
