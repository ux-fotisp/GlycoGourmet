import { test, expect } from '@playwright/test';
import {
  generateGroceryManifest,
  generateClinicalSummaryReport,
  exportFHIRMetabolicTelemetry,
} from '../../src/utils/exportPipeline';
import { applyServingScale } from '../../src/services/metabolicEngine';

test.describe('DEMO_MODE Persona End-to-End Walkthroughs', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login and initialize clean demo state
    await page.goto('/#/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Dietitian Persona Walkthrough (Dr. Sarah Chen): Onboarding, Calibration, Plan Building, Audit, & Export', async ({ page }) => {
    // -------------------------------------------------------------------------
    // 1. One-click login as Dr. Sarah Chen (Clinical Dietitian)
    // -------------------------------------------------------------------------
    await page.goto('/#/login');
    const dietitianLoginBtn = page.getByTestId('demo-login-dietitian');
    await expect(dietitianLoginBtn).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Dr. Sarah Chen')).toBeVisible();
    await dietitianLoginBtn.click();

    // Verify session established and redirected away from login
    await expect(page).not.toHaveURL(/#\/login/);

    // -------------------------------------------------------------------------
    // 2. ClientOnboardingWizard - Register a new client
    // -------------------------------------------------------------------------
    await page.goto('/#/client-roster');
    await expect(page.getByRole('heading', { name: /Client Roster/i })).toBeVisible({ timeout: 15000 });

    const addClientBtn = page.getByRole('button', { name: /Add New Client/i });
    await expect(addClientBtn).toBeVisible();
    await addClientBtn.click();

    const onboardingModal = page.getByRole('dialog');
    await expect(onboardingModal).toBeVisible();
    await expect(onboardingModal.getByRole('heading', { name: /New Client Onboarding/i })).toBeVisible();

    // Step 1: Basic Demographics
    await expect(onboardingModal.getByRole('heading', { name: /Step 1: Basic Demographics/i })).toBeVisible();
    await onboardingModal.getByPlaceholder('Jane Doe').fill('E2E Clinical Client');
    await onboardingModal.getByPlaceholder('jane@example.com').fill('e2e.client@glycodemo.com');
    await onboardingModal.getByRole('button', { name: /Next Step/i }).click();

    // Step 2: Clinical Classification
    await expect(onboardingModal.getByRole('heading', { name: /Step 2: Clinical Classification/i })).toBeVisible();
    await onboardingModal.getByRole('button', { name: 'T1D' }).click();
    await onboardingModal.getByRole('button', { name: /Next Step/i }).click();

    // Step 3: Metabolic Targets
    await expect(onboardingModal.getByRole('heading', { name: /Step 3: Metabolic Targets/i })).toBeVisible();
    await onboardingModal.getByRole('button', { name: /Next Step/i }).click();

    // Step 4: Dietary Restrictions
    await expect(onboardingModal.getByRole('heading', { name: /Step 4: Dietary Restrictions/i })).toBeVisible();
    await onboardingModal.getByRole('button', { name: 'Gluten-Free' }).click();
    await onboardingModal.getByRole('button', { name: /Complete Onboarding/i }).click();

    // Confirm wizard closed and new client appears on roster
    await expect(onboardingModal).not.toBeVisible();
    const newClientCard = page.locator('article', { hasText: 'E2E Clinical Client' });
    await expect(newClientCard).toBeVisible({ timeout: 10000 });
    await expect(newClientCard.getByText('T1D')).toBeVisible();

    // -------------------------------------------------------------------------
    // 3. ClientCalibrationDrawer - Set GL target, ISF, and CIR
    // -------------------------------------------------------------------------
    await newClientCard.getByRole('button', { name: /Calibrate/i }).scrollIntoViewIfNeeded();
    await newClientCard.getByRole('button', { name: /Calibrate/i }).click();
    const calibrationDrawer = page.getByRole('dialog');
    await expect(calibrationDrawer).toBeVisible();
    await expect(calibrationDrawer.getByRole('heading', { name: /Calibrate Targets/i })).toBeVisible();

    // Fill ISF and CIR advanced excursion metrics
    const isfInput = calibrationDrawer.getByPlaceholder('50');
    await isfInput.fill('45');
    const cirInput = calibrationDrawer.getByPlaceholder('15');
    await cirInput.fill('10');

    const saveCalibrationBtn = calibrationDrawer.getByRole('button', { name: /Save Calibration/i });
    await expect(saveCalibrationBtn).toBeEnabled();
    await saveCalibrationBtn.click();

    // Confirm drawer closed and "Forecasting Enabled" badge appears
    await expect(calibrationDrawer).not.toBeVisible();
    await expect(newClientCard.getByText('Forecasting Enabled')).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------------------
    // 4. PlanBuilder - Assign recipes from fixture catalog and verify rollup update
    // -------------------------------------------------------------------------
    await newClientCard.getByRole('link', { name: /Plan Builder/i }).scrollIntoViewIfNeeded();
    await newClientCard.getByRole('link', { name: /Plan Builder/i }).click();
    await expect(page).toHaveURL(/#\/client\/.+\/plan-builder/);
    await expect(page.getByRole('heading', { name: /Plan Builder: E2E Clinical Client/i })).toBeVisible({ timeout: 15000 });

    // Observe initial Monday GL rollup in tfoot
    const mondayFooterCell = page.locator('tfoot td').nth(1);
    await expect(mondayFooterCell.getByText('Total GL')).toBeVisible();
    const initialRollupText = (await mondayFooterCell.locator('span.font-extrabold').textContent()) || '0';
    const initialGL = Number(initialRollupText) || 0;

    // Click "+" button in Monday's first occasion slot to assign a recipe
    const addRecipeSlotBtn = page.locator('tbody tr').first().locator('td').nth(1).locator('button');
    await expect(addRecipeSlotBtn).toBeVisible();
    await addRecipeSlotBtn.click();

    // Confirm a recipe card is mounted in the slot and daily rollup updates
    const assignedSlot = page.locator('tbody tr').first().locator('td').nth(1);
    await expect(assignedSlot.locator('button[title="Remove from slot"]')).toBeVisible({ timeout: 5000 });

    await expect(mondayFooterCell.locator('span.font-extrabold')).not.toHaveText(initialRollupText, { timeout: 5000 });
    const updatedRollupText = await mondayFooterCell.locator('span.font-extrabold').textContent();
    const updatedGL = Number(updatedRollupText) || 0;
    expect(updatedGL).toBeGreaterThan(initialGL);

    // -------------------------------------------------------------------------
    // 5. DraftAuditQueue - Confirm draft_201/202/203 fixtures appear and approve one
    // -------------------------------------------------------------------------
    await page.goto('/#/admin/audit-queue');
    await expect(page.getByRole('heading', { name: /Side-by-Side Draft Audit Queue/i })).toBeVisible({ timeout: 15000 });

    // Verify all 3 demo draft fixtures appear in the selector bar
    const draft201Btn = page.getByRole('button', { name: /Roasted Cauliflower/i });
    const draft202Btn = page.getByRole('button', { name: /Mediterranean Herb/i });
    const draft203Btn = page.getByRole('button', { name: /Chia Seed/i });

    await expect(draft201Btn).toBeVisible({ timeout: 10000 });
    await expect(draft202Btn).toBeVisible();
    await expect(draft203Btn).toBeVisible();

    // Approve the currently selected draft recipe
    const approveBtn = page.getByRole('button', { name: /Approve & Publish Recipe/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Confirm approval notice appears
    await expect(page.getByText(/Successfully approved and published/i)).toBeVisible({ timeout: 8000 });

    // -------------------------------------------------------------------------
    // 6. Trigger exportPipeline.js (Grocery Manifest, Clinical Summary, FHIR Export)
    // -------------------------------------------------------------------------
    // Navigate back to PlanBuilder to exercise export modal triggers
    await page.goto('/#/client-roster');
    const clientCardInRoster = page.locator('article', { hasText: 'E2E Clinical Client' });
    await clientCardInRoster.getByRole('link', { name: /Plan Builder/i }).click();
    await expect(page.getByRole('heading', { name: /Plan Builder: E2E Clinical Client/i })).toBeVisible({ timeout: 15000 });

    // Assign a recipe to the schedule so the plan has items to export
    const assignRecipeSlotBtn = page.locator('tbody tr').first().locator('td').nth(1).locator('button');
    await assignRecipeSlotBtn.click();
    await expect(page.locator('tbody tr').first().locator('td').nth(1).locator('button[title="Remove from slot"]')).toBeVisible({ timeout: 5000 });

    // Trigger and verify Grocery Manifest modal renders populated ingredient rows
    await page.getByRole('button', { name: /Grocery/i }).click();
    const groceryDialog = page.getByRole('dialog');
    await expect(groceryDialog.getByRole('heading', { name: /Grocery Manifest/i })).toBeVisible({ timeout: 5000 });
    const groceryItems = groceryDialog.getByRole('listitem');
    await expect(groceryItems.first()).toBeVisible();
    const groceryItemCount = await groceryItems.count();
    expect(groceryItemCount).toBeGreaterThan(0);
    await groceryDialog.getByRole('button', { name: /Close/i }).click();

    // Trigger and verify Clinical Summary Report modal renders target metrics
    await page.getByRole('button', { name: /Report/i }).click();
    const reportDialog = page.getByRole('dialog');
    await expect(reportDialog.getByRole('heading', { name: /Clinical Summary Report/i })).toBeVisible({ timeout: 5000 });
    await expect(reportDialog.getByText(/Target GL:/i)).toBeVisible();
    await expect(reportDialog.getByText(/Adherence Rate:/i)).toBeVisible();
    await reportDialog.getByRole('button', { name: /Close/i }).click();

    // Directly assert deterministic mathematical outputs from exportPipeline.js
    const samplePlan = {
      id: 'plan-e2e-demo',
      weekStartDate: '2026-01-05',
      scheduledSlots: {
        monday: [{ recipeId: 'rec_1', servingsMultiplier: 1 }],
        tuesday: [{ recipeId: 'rec_2', servingsMultiplier: 1 }],
      },
      cumulativeDailyGL: { monday: 11, tuesday: 0 },
    };
    const sampleRecipes = {
      rec_1: {
        id: 'rec_1',
        title: 'Avocado Toast',
        servings: 1,
        ingredients: [
          { name: 'Avocado', amount: 50, unit: 'g', category: 'produce' },
          { name: 'Sourdough Bread', amount: 40, unit: 'g', category: 'pantry' },
        ],
      },
      rec_2: {
        id: 'rec_2',
        title: 'Grilled Salmon',
        servings: 1,
        ingredients: [
          { name: 'Wild Atlantic Salmon', amount: 150, unit: 'g', category: 'protein' },
        ],
      },
    };
    const clientProfile = {
      id: 'client-sarah-patient',
      name: 'E2E Clinical Client',
      diabeticSubtype: 'T1D',
    };
    const calibration = {
      glTargetDaily: 45,
      bolusOffsetMinutes: 15,
    };

    // Assert grocery manifest generation is non-empty, categorized, and scaled
    const manifest = generateGroceryManifest(samplePlan, sampleRecipes);
    expect(manifest.produce.length).toBeGreaterThan(0);
    expect(manifest.produce[0].name).toBe('Avocado');
    expect(manifest.produce[0].amount).toBe(50);
    expect(manifest.pantry.length).toBeGreaterThan(0);
    expect(manifest.proteins.length).toBeGreaterThan(0);

    // Assert clinical summary report generation contains real patient metadata
    const summary = generateClinicalSummaryReport(clientProfile, calibration, samplePlan, sampleRecipes);
    expect(summary.patientName).toBe('E2E Clinical Client');
    expect(summary.subtype).toBe('T1D');
    expect(summary.glTarget).toBe(45);
    expect(summary.daySummaries.length).toBeGreaterThan(0);

    // Assert FHIR R4 Bundle contains real Observation resources (LOINC 9843-4)
    const fhirBundle = exportFHIRMetabolicTelemetry(clientProfile, samplePlan);
    expect(fhirBundle.resourceType).toBe('Bundle');
    expect(fhirBundle.type).toBe('collection');
    expect(fhirBundle.entry.length).toBe(2);
    expect(fhirBundle.entry[0].resource.resourceType).toBe('Observation');
    expect(fhirBundle.entry[0].resource.code.coding[0].code).toBe('9843-4');
    expect(fhirBundle.entry[0].resource.subject.reference).toBe('Patient/client-sarah-patient');
    expect(fhirBundle.entry[0].resource.valueQuantity.value).toBe(11);
  });

  test('Patient Persona Walkthrough (Alex Rivera): Catalog, Recipe Details, Portion Scaling Invariants, & Weekly Meal Plans', async ({ page }) => {
    // -------------------------------------------------------------------------
    // 1. One-click login as Alex Rivera (Type 1 Manager / Patient)
    // -------------------------------------------------------------------------
    await page.goto('/#/login');
    const patientLoginBtn = page.getByTestId('demo-login-patient');
    await expect(patientLoginBtn).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Alex Rivera')).toBeVisible();
    await patientLoginBtn.click();

    // Verify authentication succeeds and redirects to discovery dashboard
    await expect(page).not.toHaveURL(/#\/login/);

    // -------------------------------------------------------------------------
    // 2. Browse recipe catalog & confirm fixture recipes render
    // -------------------------------------------------------------------------
    await page.goto('/#/');
    await page.waitForLoadState('domcontentloaded');

    const recipeCards = page.getByTestId('recipe-card');
    await expect(recipeCards.first()).toBeVisible({ timeout: 15000 });
    const cardCount = await recipeCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4);

    // -------------------------------------------------------------------------
    // 3. Open RecipeDetails on one recipe
    // -------------------------------------------------------------------------
    const firstRecipeCard = recipeCards.first();
    await firstRecipeCard.locator('a').first().click();
    await expect(page).toHaveURL(/#\/recipe\//);

    // Confirm clinical panels are visible
    await expect(page.getByTestId('glycemic-snapshot')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nutrition-facts-panel')).toBeVisible();

    // -------------------------------------------------------------------------
    // 4. ServingStepper portion scaling & mathematical invariant verification
    // -------------------------------------------------------------------------
    const servingStepper = page.getByRole('radiogroup', { name: /Scale serving portion size/i });
    await expect(servingStepper).toBeVisible();

    // Capture base (1x) nutritional truth values
    const baseKcalText = await page.getByTestId('nutrition-kcal').textContent();
    const baseKcal = Number(baseKcalText);
    expect(baseKcal).toBeGreaterThan(0);

    const baseNetCarbsText = await page.getByTestId('macro-net-carbs-val').textContent();
    const baseNetCarbs = parseFloat((baseNetCarbsText || '').replace('g', ''));

    const baseProteinText = await page.getByTestId('macro-protein-val').textContent();
    const baseProtein = parseFloat((baseProteinText || '').replace('g', ''));

    // Step multiplier to 2x
    await page.getByRole('radio', { name: /Scale recipe by 2x/i }).click();
    await expect(page.getByTestId('nutrition-serving-badge')).toHaveText('2x Serving');

    // Assert Calories double deterministically
    const scaled2xKcal = Number(await page.getByTestId('nutrition-kcal').textContent());
    expect(scaled2xKcal).toBe(Math.round(baseKcal * 2));

    // Assert Protein doubles deterministically
    const scaled2xProtein = parseFloat((await page.getByTestId('macro-protein-val').textContent() || '').replace('g', ''));
    expect(scaled2xProtein).toBe(Math.round(baseProtein * 2));

    // Assert Net Carbs scale proportionally
    const scaled2xNetCarbs = parseFloat((await page.getByTestId('macro-net-carbs-val').textContent() || '').replace('g', ''));
    expect(scaled2xNetCarbs).toBe(Math.round(baseNetCarbs * 2 * 10) / 10);

    // Step multiplier to 0.5x
    await page.getByRole('radio', { name: /Scale recipe by 0.5x/i }).click();
    await expect(page.getByTestId('nutrition-serving-badge')).toHaveText('0.5x Serving');
    const scaledHalfKcal = Number(await page.getByTestId('nutrition-kcal').textContent());
    expect(scaledHalfKcal).toBe(Math.round(baseKcal * 0.5));

    // Step multiplier to 1.5x
    await page.getByRole('radio', { name: /Scale recipe by 1.5x/i }).click();
    await expect(page.getByTestId('nutrition-serving-badge')).toHaveText('1.5x Serving');
    const scaled15Kcal = Number(await page.getByTestId('nutrition-kcal').textContent());
    expect(scaled15Kcal).toBe(Math.round(baseKcal * 1.5));

    // Reset multiplier to 1x
    await page.getByRole('radio', { name: /Scale recipe by 1x/i }).click();
    await expect(page.getByTestId('nutrition-serving-badge')).toHaveText('Per Serving');

    // Mathematical spot-check directly against applyServingScale
    const mockIngredients = [
      {
        amount: 100,
        unit: 'g',
        ingredient: {
          id: 'test-carb-item',
          name: 'Organic Rolled Oats',
          glycemicIndex: 50,
          nutrition: {
            defaultAmount: 100,
            carbs: 20,
            fiber: 0,
            protein: 10,
            fat: 5,
            kcal: 165,
            glycemicIndex: 50,
          },
        },
      },
    ];
    const baseScaleResult = applyServingScale(mockIngredients, 1);
    const doubledScaleResult = applyServingScale(mockIngredients, 2);

    expect(doubledScaleResult.profile.glycemicIndex).toBe(baseScaleResult.profile.glycemicIndex); // GI invariant
    expect(doubledScaleResult.profile.netCarbs).toBe(baseScaleResult.profile.netCarbs * 2); // NC scaled
    expect(doubledScaleResult.profile.glycemicLoad).toBe(baseScaleResult.profile.glycemicLoad * 2); // GL scaled
    expect(doubledScaleResult.profile.kcal).toBe(baseScaleResult.profile.kcal * 2); // Kcal scaled

    // -------------------------------------------------------------------------
    // 5. View MealPlans weekly view & confirm weekly adherence / GL budget indicator
    // -------------------------------------------------------------------------
    await page.goto('/#/meal-plans');
    await expect(page.getByRole('heading', { name: /7-Day Glycemic Meal Plan/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Tracking against your calibrated daily target of/i)).toBeVisible();

    // Check that Monday through Sunday daily cards render with GL gauges
    await expect(page.getByText('Monday')).toBeVisible();
    await expect(page.getByText('Daily GL').first()).toBeVisible();
    await expect(page.getByText(/Net Carbs/i).first()).toBeVisible();

    // Confirm grocery shopping list button is clickable
    await expect(page.getByRole('button', { name: /Grocery Shopping List/i })).toBeVisible();
  });

});
