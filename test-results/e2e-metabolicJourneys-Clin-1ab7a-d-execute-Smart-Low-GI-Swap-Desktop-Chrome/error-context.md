# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\metabolicJourneys.spec.ts >> Clinical Metabolic End-to-End User Journeys >> Persona A (Type 1 Manager): Filter by Low GL and execute Smart Low-GI Swap
- Location: tests\e2e\metabolicJourneys.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="recipe-gl-badge"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('[data-testid="recipe-gl-badge"]').first()

```

# Test source

```ts
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Clinical Metabolic End-to-End User Journeys', () => {
  4   |   test('Persona A (Type 1 Manager): Filter by Low GL and execute Smart Low-GI Swap', async ({ page }) => {
  5   |     page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}`));
  6   |     page.on('console', msg => console.log(`[CONSOLE]: ${msg.text()}`));
  7   | 
  8   |     // 1. Inject Authenticated Patient Session
  9   |     await page.addInitScript(() => {
  10  |       const standardUser = {
  11  |         id: 'demo_user',
  12  |         name: 'Demo User',
  13  |         email: 'demo@glyco.com',
  14  |         roleType: 'admin',
  15  |         isApproved: true,
  16  |         onboarded: true,
  17  |       };
  18  |       localStorage.setItem('glyco_session', JSON.stringify(standardUser));
  19  |       const users = { 'demo@glyco.com': standardUser };
  20  |       localStorage.setItem('glyco_users', JSON.stringify(users));
  21  |     });
  22  | 
  23  |     // 2. Navigate to Catalog
  24  |     await page.goto('/#/');
  25  |     await page.waitForLoadState('networkidle');
  26  | 
  27  |     // 3. Open first recipe card from the catalog
  28  |     const recipeLink = page.locator('[data-testid="recipe-card"] a').first();
  29  |     await expect(recipeLink).toBeVisible({ timeout: 15000 });
  30  |     await recipeLink.click();
  31  | 
  32  |     // 4. Verify Recipe Detail view loaded and GL badge is visible
  33  |     await expect(page).toHaveURL(/#\/recipe\//);
  34  |     const glBadge = page.locator('[data-testid="recipe-gl-badge"]').first();
> 35  |     await expect(glBadge).toBeVisible({ timeout: 15000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  36  | 
  37  |     // 5. Test Smart Low-GI Swap Trigger if present
  38  |     const swapTrigger = page.locator('[data-testid="btn-smart-swap-white-rice"], button:has-text("Swap")').first();
  39  |     if (await swapTrigger.isVisible()) {
  40  |       await swapTrigger.click();
  41  | 
  42  |       // Check for substitution modal
  43  |       const subModal = page.locator('[role="dialog"]');
  44  |       if (await subModal.isVisible()) {
  45  |         const swapApplyButton = subModal.locator('button', { hasText: /Swap|Apply/i });
  46  |         await swapApplyButton.click();
  47  |         await expect(subModal).not.toBeVisible();
  48  |       }
  49  | 
  50  |       await expect(glBadge).toHaveClass(/voice-pulse/);
  51  |     }
  52  |   });
  53  | 
  54  |   test('Persona C (Dietitian Audit): Detect macro discrepancies > 1.0g and Sync to USDA Truth', async ({ page }) => {
  55  |     // 1. Inject Dietitian / Admin Session with full permissions
  56  |     await page.addInitScript(() => {
  57  |       const dietitianUser = {
  58  |         id: 'demo_user',
  59  |         name: 'Demo Dietitian Admin',
  60  |         email: 'demo@glyco.com',
  61  |         roleType: 'admin',
  62  |         isApproved: true,
  63  |         onboarded: true,
  64  |       };
  65  |       localStorage.setItem('glyco_session', JSON.stringify(dietitianUser));
  66  |       const users = {
  67  |         'demo@glyco.com': dietitianUser,
  68  |       };
  69  |       localStorage.setItem('glyco_users', JSON.stringify(users));
  70  |     });
  71  | 
  72  |     // 2. Navigate to Admin Audit Queue via HashRouter path
  73  |     await page.goto('/#/admin/audit-queue');
  74  |     await page.waitForLoadState('networkidle');
  75  |     await expect(page.locator('h2, h1').first()).toBeVisible();
  76  | 
  77  |     // 3. Assert Discrepancy indicator and execute Overwrite / Sync
  78  |     const discrepancyBadge = page.locator('span:has-text("Discrepancy"), span:has-text("1.0")').first();
  79  |     if (await discrepancyBadge.isVisible()) {
  80  |       const syncButton = page.locator('button:has-text("Overwrite with Ground Truth"), button:has-text("Sync")').first();
  81  |       await syncButton.click();
  82  |       await expect(discrepancyBadge).not.toBeVisible();
  83  |     }
  84  | 
  85  |     // 4. Assert Approve & Publish Action
  86  |     const approveButton = page.locator('button:has-text("Approve"), button:has-text("Publish")').first();
  87  |     if (await approveButton.isVisible()) {
  88  |       await approveButton.click();
  89  |     }
  90  |   });
  91  | 
  92  |   test('RBAC Security Gate: Unapproved user is intercepted and redirected to /pending-approval', async ({ page }) => {
  93  |     // 1. Inject unapproved user (isApproved = false) into local session
  94  |     await page.addInitScript(() => {
  95  |       const pendingUser = {
  96  |         id: 'user_pending_99',
  97  |         name: 'Pending Applicant',
  98  |         email: 'new_applicant@gmail.com',
  99  |         roleType: 'user',
  100 |         isApproved: false,
  101 |         onboarded: true,
  102 |       };
  103 |       localStorage.setItem('glyco_session', JSON.stringify(pendingUser));
  104 |       const users = {
  105 |         'new_applicant@gmail.com': pendingUser,
  106 |       };
  107 |       localStorage.setItem('glyco_users', JSON.stringify(users));
  108 |     });
  109 | 
  110 |     // 2. Attempt unauthorized deep navigation to protected recipe creation route
  111 |     
  112 |     let mockedRecipes = [];
  113 |     await page.route(/\/api\/recipes/, async route => {
  114 |       if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
  115 |         const postData = JSON.parse(route.request().postData());
  116 |         const recipe = postData.data ? postData.data : postData;
  117 |         // Inject a mocked ID if not present, based on title
  118 |         if (!recipe.id) {
  119 |           recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
  120 |         }
  121 |         mockedRecipes.push(recipe);
  122 |         await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
  123 |       } else if (route.request().method() === 'GET') {
  124 |         const url = route.request().url();
  125 |         const match = url.match(/\/api\/recipes\/([^?]+)/);
  126 |         if (match) {
  127 |            const id = match[1];
  128 |            const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
  129 |            if (found) {
  130 |              await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
  131 |            } else {
  132 |              // Fallback for mock setup
  133 |              const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
  134 |              await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
  135 |            }
```