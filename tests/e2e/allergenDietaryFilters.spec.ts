import { test, expect } from '@playwright/test';

test.describe('Allergen Badges and Dietary Filters E2E', () => {
  const mockRecipes = [
    {
      id: 'thai-chili-lime-tofu-broccoli-stir-fry',
      title: 'Thai Chili-Lime Tofu & Broccoli Stir-Fry',
      description: 'Zesty chili-lime tofu stir-fry with broccoli and crushed peanuts.',
      imageUrl: '/assets/recipe-placeholder.svg',
      mealOccasion: 'dinner',
      glycemicIndex: 25,
      glycemicLoad: 3.6,
      netCarbs: 14.5,
      fiber: 4.8,
      status: 'published',
      publishedAt: '2026-01-01T00:00:00Z',
      allergens: ['soybeans', 'sesame', 'peanuts'],
      dietaryTags: ['vegan', 'vegetarian'],
      ingredients: [
        { ingredientId: 'extra-firm-tofu', name: 'Extra Firm Tofu', amount: 150, unit: 'g', allergens: ['soybeans'] },
        { ingredientId: 'roasted-peanuts', name: 'Crushed Peanuts', amount: 20, unit: 'g', allergens: ['peanuts'] },
        { ingredientId: 'toasted-sesame-oil', name: 'Sesame Oil', amount: 5, unit: 'ml', allergens: ['sesame'] },
      ],
      steps: [
        { title: 'Press and Cube Tofu', description: 'Press extra firm tofu and slice into cubes.' },
        { title: 'Stir-Fry & Garnish', description: 'Sauté tofu with broccoli, finishing with crushed peanuts.' },
      ],
    },
    {
      id: 'crispy-salmon-asparagus',
      title: 'Crispy Salmon & Asparagus',
      description: 'Pan-seared Atlantic salmon with tender asparagus spears.',
      imageUrl: '/assets/recipe-placeholder.svg',
      mealOccasion: 'dinner',
      glycemicIndex: 0,
      glycemicLoad: 0.7,
      netCarbs: 2.1,
      fiber: 2.8,
      status: 'published',
      publishedAt: '2026-01-01T00:00:00Z',
      allergens: ['fish'],
      dietaryTags: ['gluten_free', 'dairy_free'],
      ingredients: [
        { ingredientId: 'atlantic-salmon', name: 'Atlantic Salmon', amount: 180, unit: 'g', allergens: ['fish'] },
        { ingredientId: 'asparagus', name: 'Fresh Asparagus', amount: 120, unit: 'g', allergens: [] },
      ],
      steps: [
        { title: 'Sear Salmon', description: 'Pan-sear salmon skin-side down until golden.' },
        { title: 'Roast Asparagus', description: 'Toss asparagus with olive oil and serve hot.' },
      ],
    },
    {
      id: 'low-gi-chili-con-carne',
      title: 'Low-GI Chili con Carne with Two-Bean Base',
      description: 'Slow-simmered lean beef chili with kidney beans and black beans.',
      imageUrl: '/assets/recipe-placeholder.svg',
      mealOccasion: 'dinner',
      glycemicIndex: 28,
      glycemicLoad: 10.5,
      netCarbs: 22.4,
      fiber: 9.1,
      status: 'published',
      publishedAt: '2026-01-01T00:00:00Z',
      allergens: [],
      dietaryTags: ['dairy_free', 'gluten_free'],
      ingredients: [
        { ingredientId: 'lean-ground-beef', name: 'Lean Ground Beef', amount: 150, unit: 'g', allergens: [] },
        { ingredientId: 'black-beans', name: 'Black Beans', amount: 80, unit: 'g', allergens: [] },
      ],
      steps: [
        { title: 'Brown Beef', description: 'Brown lean ground beef with spices.' },
        { title: 'Simmer Beans', description: 'Add two-bean blend and simmer until rich.' },
      ],
    },
  ];

  test.beforeEach(async ({ page }) => {
    // 1. Inject auth session token
    await page.addInitScript(() => {
      window.localStorage.setItem('glyco_jwt', 'valid-test-jwt');
    });

    // 2. Mock current authenticated user
    await page.route('**/api/users/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'metabolictester',
          email: 'tester@glycogourmet.test',
          roleType: 'user',
          isApproved: true,
          onboarded: true,
        }),
      });
    });

    // 3. Mock recipes collection
    await page.route('**/api/recipes*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockRecipes,
        }),
      });
    });
  });

  test('surfaces WCAG-AA allergen badges and filters recipes by "Contains peanuts"', async ({ page }) => {
    await page.goto('/');

    // Locate recipe cards in the main recipe grid
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    await expect(recipeCards.first()).toBeVisible();

    // Verify initial render contains all 3 recipe cards
    await expect(recipeCards.filter({ hasText: 'Thai Chili-Lime Tofu & Broccoli Stir-Fry' })).toBeVisible();
    await expect(recipeCards.filter({ hasText: 'Crispy Salmon & Asparagus' })).toBeVisible();
    await expect(recipeCards.filter({ hasText: 'Low-GI Chili con Carne with Two-Bean Base' })).toBeVisible();

    // Verify allergen badges render with role="img" and accessible aria-label
    const peanutBadge = page.getByRole('img', { name: 'Contains peanuts' }).first();
    await expect(peanutBadge).toBeVisible();
    await expect(peanutBadge).toHaveAttribute('aria-label', 'Contains peanuts');
    await expect(peanutBadge.locator('text=Contains peanuts')).toBeVisible();

    const soyBadge = page.getByRole('img', { name: 'Contains soybeans' }).first();
    await expect(soyBadge).toBeVisible();

    // Filter recipes by searching "Contains peanuts"
    const searchInput = page.getByPlaceholder(/search recipes/i);
    await searchInput.fill('Contains peanuts');

    // Confirm that the recipe containing peanuts remains visible in the list
    await expect(recipeCards.filter({ hasText: 'Thai Chili-Lime Tofu & Broccoli Stir-Fry' })).toBeVisible();
    await expect(page.locator('text=Contains peanuts').locator('visible=true').first()).toBeVisible();

    // Confirm that excluded recipes disappear from the visible card list
    await expect(recipeCards.filter({ hasText: 'Crispy Salmon & Asparagus' })).toHaveCount(0);
    await expect(recipeCards.filter({ hasText: 'Low-GI Chili con Carne with Two-Bean Base' })).toHaveCount(0);
  });

  test('dietary tag filter chips are keyboard operable (Tab, Space, Enter)', async ({ page }) => {
    await page.goto('/');

    const recipeCards = page.locator('[data-testid="recipe-card"]');
    await expect(recipeCards.first()).toBeVisible();

    // Locate the Vegan filter switch using role and accessible name
    const veganChip = page.getByRole('switch', { name: /vegan dietary filter/i });
    await expect(veganChip).toBeVisible();
    await expect(veganChip).toHaveAttribute('aria-checked', 'false');

    // Activate using keyboard Space key
    await veganChip.focus();
    await page.keyboard.press('Space');
    await expect(veganChip).toHaveAttribute('aria-checked', 'true');

    // Verify vegan recipe card is visible and non-vegan recipe cards are excluded
    await expect(recipeCards.filter({ hasText: 'Thai Chili-Lime Tofu & Broccoli Stir-Fry' })).toBeVisible();
    await expect(recipeCards.filter({ hasText: 'Crispy Salmon & Asparagus' })).toHaveCount(0);
    await expect(recipeCards.filter({ hasText: 'Low-GI Chili con Carne with Two-Bean Base' })).toHaveCount(0);

    // Toggle off using keyboard Enter key
    await page.keyboard.press('Enter');
    await expect(veganChip).toHaveAttribute('aria-checked', 'false');

    // Verify all recipe cards return
    await expect(recipeCards.filter({ hasText: 'Crispy Salmon & Asparagus' })).toBeVisible();
    await expect(recipeCards.filter({ hasText: 'Low-GI Chili con Carne with Two-Bean Base' })).toBeVisible();
  });
});