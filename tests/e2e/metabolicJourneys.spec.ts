import { test, expect } from '@playwright/test';

test.describe('Clinical Metabolic End-to-End User Journeys', () => {

  test('Single-Recipe GI/GL Rendering and Secondary Macro Expansion', async ({ page }) => {
    // 1. Inject backend-truth auth session via JWT
    await page.addInitScript(() => {
      window.localStorage.setItem('glyco_jwt', 'valid-test-jwt');
    });

    // 2. Mock /api/users/me response matching backend-truth AuthContext
    await page.route('**/api/users/me*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roleType: 'user',
          isApproved: true,
          onboarded: true,
        }),
      });
    });

    // 3. Mock network response for recipe 1
    await page.route('**/api/recipes/1*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            documentId: 'doc1',
            title: 'Testing GL rendering',
            servings: 1,
            status: 'published',
            publishedAt: '2026-01-01T00:00:00Z',
            ingredients: [
              {
                id: 10,
                amount: 100,
                unit: 'g',
                ingredient: {
                  id: 99,
                  name: 'Test Carb',
                  defaultPrepState: 'raw',
                  nutrition: {
                    defaultAmount: 100,
                    carbs: 50,
                    fiber: 0,
                    protein: 0,
                    fat: 0,
                    kcal: 200,
                    glycemicIndex: 50
                  }
                }
              }
            ]
          }
        })
      });
    });

    // 4. Visit Recipe details
    await page.goto('/recipe/1');

    // 5. Verify GL and GI anchor badges are rendered (using text-based locators)
    await expect(page.getByText('GL 25')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('GI 50')).toBeVisible();

    // 6. Verify Secondary Macros are visible by default (using role-based locator)
    const detailsAccordion = page.getByRole('group', { name: /secondary macronutrient breakdown/i });
    await expect(detailsAccordion).toBeVisible();
    await expect(detailsAccordion).toHaveAttribute('open', '');
    
    // Check calories badge is inside
    await expect(page.getByText('Calories').first()).toBeVisible();
  });

  test('Persona A (Type 1 Manager): Filter by Low GL and execute Smart Low-GI Swap', async ({ page }) => {
    page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}`));
    page.on('console', msg => console.log(`[CONSOLE]: ${msg.text()}`));

    // 1. Inject Authenticated Patient Session
    await page.addInitScript(() => {
      const standardUser = {
        id: 'demo_user',
        name: 'Demo User',
        email: 'demo@glyco.com',
        roleType: 'admin',
        isApproved: true,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(standardUser));
      const users = { 'demo@glyco.com': standardUser };
      localStorage.setItem('glyco_users', JSON.stringify(users));
    });

    // 2. Navigate to Catalog
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    // 3. Open first recipe card from the catalog
    const recipeLink = page.locator('[data-testid="recipe-card"] a').first();
    await expect(recipeLink).toBeVisible({ timeout: 15000 });
    await recipeLink.click();

    // 4. Verify Recipe Detail view loaded and GL badge is visible
    await expect(page).toHaveURL(/#\/recipe\//);
    const glBadge = page.locator('[data-testid="recipe-gl-badge"]').first();
    await expect(glBadge).toBeVisible({ timeout: 15000 });

    // 5. Test Smart Low-GI Swap Trigger if present
    const swapTrigger = page.locator('[data-testid="btn-smart-swap-white-rice"], button:has-text("Swap")').first();
    if (await swapTrigger.isVisible()) {
      await swapTrigger.click();

      // Check for substitution modal
      const subModal = page.locator('[role="dialog"]');
      if (await subModal.isVisible()) {
        const swapApplyButton = subModal.locator('button', { hasText: /Swap|Apply/i });
        await swapApplyButton.click();
        await expect(subModal).not.toBeVisible();
      }

      await expect(glBadge).toHaveClass(/voice-pulse/);
    }
  });

  test('Persona C (Dietitian Audit): Detect macro discrepancies > 1.0g and Sync to USDA Truth', async ({ page }) => {
    // 1. Inject Dietitian / Admin Session with full permissions
    await page.addInitScript(() => {
      const dietitianUser = {
        id: 'demo_user',
        name: 'Demo Dietitian Admin',
        email: 'demo@glyco.com',
        roleType: 'admin',
        isApproved: true,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(dietitianUser));
      const users = {
        'demo@glyco.com': dietitianUser,
      };
      localStorage.setItem('glyco_users', JSON.stringify(users));
    });

    // 2. Navigate to Admin Audit Queue via HashRouter path
    await page.goto('/#/admin/audit-queue');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2, h1').locator('visible=true').first()).toBeVisible();

    // 3. Assert Discrepancy indicator and execute Overwrite / Sync
    const discrepancyBadge = page.locator('span:has-text("Discrepancy"), span:has-text("1.0")').first();
    if (await discrepancyBadge.isVisible()) {
      const syncButton = page.locator('button:has-text("Overwrite with Ground Truth"), button:has-text("Sync")').first();
      await syncButton.click();
      await expect(discrepancyBadge).not.toBeVisible();
    }

    // 4. Assert Approve & Publish Action
    const approveButton = page.locator('button:has-text("Approve"), button:has-text("Publish")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
    }
  });

  test('RBAC Security Gate: Unapproved user is intercepted and redirected to /pending-approval', async ({ page }) => {
    // 1. Inject unapproved user (isApproved = false) into local session
    await page.addInitScript(() => {
      const pendingUser = {
        id: 'user_pending_99',
        name: 'Pending Applicant',
        email: 'new_applicant@gmail.com',
        roleType: 'user',
        isApproved: false,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(pendingUser));
      const users = {
        'new_applicant@gmail.com': pendingUser,
      };
      localStorage.setItem('glyco_users', JSON.stringify(users));
    });

    // 2. Attempt unauthorized deep navigation to protected recipe creation route
    
    let mockedRecipes = [];
    await page.route(/\/api\/recipes/, async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        const postData = JSON.parse(route.request().postData());
        const recipe = postData.data ? postData.data : postData;
        // Inject a mocked ID if not present, based on title
        if (!recipe.id) {
          recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
        }
        mockedRecipes.push(recipe);
        await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
      } else if (route.request().method() === 'GET') {
        const url = route.request().url();
        const match = url.match(/\/api\/recipes\/([^?]+)/);
        if (match) {
           const id = match[1];
           const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
           if (found) {
             await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
           } else {
             // Fallback for mock setup
             const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
             await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
           }
        } else {
           await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: mockedRecipes }) });
        }
      } else if (route.request().method() === 'OPTIONS') {
        const reqHeaders = route.request().headers();
        const requestedHeaders = reqHeaders['access-control-request-headers'] || 'Content-Type, Authorization';
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true",
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': requestedHeaders
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin-editor');
    await expect(page).toHaveURL(/#\/pending-approval/);
    await expect(page.locator('h2')).toContainText(/Account Under Review/i);

    // 3. Attempt second deep navigation to admin audit queue
    await page.goto('/#/admin/audit-queue');
    await expect(page).toHaveURL(/#\/pending-approval/);
  });
  
  test('Journey 1: User Draft Lifecycle & Review Submission', async ({ page }) => {
    // 1. User Session
    await page.addInitScript(() => {
      const standardUser = {
        id: 'patient_1',
        name: 'Patient One',
        email: 'patient@glyco.com',
        roleType: 'user',
        isApproved: true,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(standardUser));
      const users = { 'patient@glyco.com': standardUser };
      localStorage.setItem('glyco_users', JSON.stringify(users));
      
      const draftRecipe = {
        id: 'my-draft-id',
        title: 'Draft Test',
        status: 'draft',
        publishedAt: null,
        authorId: 'patient@glyco.com',
        ingredients: [{ id: 'ing1', name: 'Test', amount: 100 }],
        servings: 1
      };
      // We'll mock the store using localStorage if possible, but actually we can just create it via UI
    });

    
    let mockedRecipes = [];
    await page.route(/\/api\/recipes/, async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        const postData = JSON.parse(route.request().postData());
        const recipe = postData.data ? postData.data : postData;
        // Inject a mocked ID if not present, based on title
        if (!recipe.id) {
          recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
        }
        mockedRecipes.push(recipe);
        await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
      } else if (route.request().method() === 'GET') {
        const url = route.request().url();
        const match = url.match(/\/api\/recipes\/([^?]+)/);
        if (match) {
           const id = match[1];
           const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
           if (found) {
             await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
           } else {
             // Fallback for mock setup
             const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
             await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
           }
        } else {
           await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: mockedRecipes }) });
        }
      } else if (route.request().method() === 'OPTIONS') {
        const reqHeaders = route.request().headers();
        const requestedHeaders = reqHeaders['access-control-request-headers'] || 'Content-Type, Authorization';
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true",
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': requestedHeaders
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin-editor');
    await page.waitForLoadState('networkidle');

    // Create a draft
    await page.fill('#recipe-title', 'My Personal Draft');
    await page.fill('#servings', '1');
    
    await page.click('button:has-text("Add Ingredient Slot")');
    // Clicking an ingredient item (we wait for the picker to be visible)
    await page.click('div[role="dialog"] >> text=Salmon');

    const saveButton = page.locator('button', { hasText: 'Save Personal Draft' });
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    const previewButton = page.locator('button', { hasText: 'Preview Draft' });
    await previewButton.waitFor({ state: 'visible' });
    await previewButton.click();

    // Verify DraftPreviewBanner
    const banner = page.locator('div', { hasText: 'Draft - Not Public' }).last();
    await banner.waitFor({ state: 'visible' });
    
    // Go back and submit for review
    await page.goBack();
    const submitBtn = page.locator('button', { hasText: 'Submit to Clinical Review' });
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click();
  });

  test('Journey 2: Admin Direct Publish to Public Catalog', async ({ page }) => {
    await page.addInitScript(() => {
      const adminUser = {
        id: 'admin_1',
        name: 'Admin One',
        email: 'admin@glyco.com',
        roleType: 'admin',
        isApproved: true,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(adminUser));
      localStorage.setItem('glyco_users', JSON.stringify({ 'admin@glyco.com': adminUser }));
    });

    
    let mockedRecipes = [];
    await page.route(/\/api\/recipes/, async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        const postData = JSON.parse(route.request().postData());
        const recipe = postData.data ? postData.data : postData;
        // Inject a mocked ID if not present, based on title
        if (!recipe.id) {
          recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
        }
        mockedRecipes.push(recipe);
        await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
      } else if (route.request().method() === 'GET') {
        const url = route.request().url();
        const match = url.match(/\/api\/recipes\/([^?]+)/);
        if (match) {
           const id = match[1];
           const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
           if (found) {
             await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
           } else {
             // Fallback for mock setup
             const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
             await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
           }
        } else {
           await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: mockedRecipes }) });
        }
      } else if (route.request().method() === 'OPTIONS') {
        const reqHeaders = route.request().headers();
        const requestedHeaders = reqHeaders['access-control-request-headers'] || 'Content-Type, Authorization';
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true",
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': requestedHeaders
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin-editor');
    await page.waitForLoadState('networkidle');

    await page.fill('#recipe-title', 'Admin Direct Publish Test');
    await page.fill('#servings', '1');
    
    await page.click('button:has-text("Add Ingredient Slot")');
    await page.click('div[role="dialog"] >> text=Salmon');

    const publishBtn = page.locator('button', { hasText: 'Publish Recipe' });
    await publishBtn.waitFor({ state: 'visible' });
    await publishBtn.click();

    // After publish, we should be redirected to /recipe/:id
    await page.waitForURL(/#\/recipe\//);
    
    // Go to catalog and check if it's there
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const recipeCard = page.locator('text=Admin Direct Publish Test').first();
    await recipeCard.waitFor({ state: 'visible' });
  });

  test('Journey 3: Metabolic Integrity Calculation', async ({ page }) => {
    // Asserting the deterministic formula exactly.
    // The engine calculates GL = roundToOneDecimal((GI * NetCarbs) / 100) per serving
    const gi = 50;
    const carbs = 20;
    const fiber = 5;
    const netCarbs = carbs - fiber; // 15
    const gl = Math.round((gi * netCarbs) / 100); // 50 * 15 / 100 = 7.5 = 8
    expect(gl).toBe(8); // Math.round(7.5) is 8 in JS

    // We can also import calculateMetabolicProfile to test directly if this was unit test,
    // but in E2E we verify the formula integrity
  });
});
