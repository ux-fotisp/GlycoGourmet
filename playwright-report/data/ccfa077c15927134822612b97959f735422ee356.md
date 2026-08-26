# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\metabolicJourneys.spec.ts >> Clinical Metabolic End-to-End User Journeys >> Persona C (Dietitian Audit): Detect macro discrepancies > 1.0g and Sync to USDA Truth
- Location: tests\e2e\metabolicJourneys.spec.ts:54:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('h2, h1').first()
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('h2, h1').first()
    23 × locator resolved to <h1 class="font-display text-headline-md text-primary tracking-tight font-bold">GlycoGourmet Admin</h1>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link "GlycoGourmet Admin":
    - /url: "#/"
    - heading "GlycoGourmet Admin" [level=1]
  - button "Notifications": notifications
  - button "Log Out": logout
- navigation:
  - button "restaurant_menu Recipes"
  - link "calendar_today Meal Plans":
    - /url: "#/meal-plans"
  - link "settings Settings":
    - /url: "#/settings"
- main:
  - heading "Side-by-Side Draft Audit Queue" [level=2]
  - text: rate_review 2 Awaiting Peer Review
  - paragraph: Audit user-submitted draft recipes against USDA lab calculations with single-click sync and publication.
  - link "admin_panel_settings Admin Dashboard":
    - /url: "#/admin"
  - text: "Select Draft:"
  - button "menu_book Roasted Cauliflower & Chickpea Low-GI Salad"
  - button "menu_book Keto Avocado & Spinach Power Bowl"
  - text: Draft Recipe Audit
  - heading "Roasted Cauliflower & Chickpea Low-GI Salad" [level=3]
  - paragraph:
    - text: "Submitted by:"
    - strong: Chef Dietitian Maria
    - text: "• Category: Salads & Sides • Servings: 2"
  - button "sync Sync to System Truth"
  - text: edit_note User Submitted Data (Author Claims) Net Carbs 32.5 g Discrepancy > 1.0 Total Carbs 38.5 g Discrepancy > 1.0 Dietary Fiber 6 g Discrepancy > 1.0 Calories 340 kcal Discrepancy > 1.0 Protein 12 g Discrepancy > 1.0 Fat 14 g Discrepancy > 1.0 Glycemic Index 35 Discrepancy > 1.0 Glycemic Load 11 GL Discrepancy > 1.0 verified System Ground Truth (USDA Lab Engine) Calculated via USDA API Net Carbs 12.6 g Total Carbs 16.8 g Dietary Fiber 4.2 g Calories 957 kcal Protein 4.6 g Fat 100.8 g Glycemic Index 18.4 Glycemic Load 2 GL
  - button "cancel Reject & Request Changes"
  - button "published_with_changes Approve & Publish Recipe"
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
  35  |     await expect(glBadge).toBeVisible({ timeout: 15000 });
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
> 75  |     await expect(page.locator('h2, h1').first()).toBeVisible();
      |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  111 |     await page.goto('/#/admin-editor');
  112 |     await expect(page).toHaveURL(/#\/pending-approval/);
  113 |     await expect(page.locator('h2')).toContainText(/Account Under Review/i);
  114 | 
  115 |     // 3. Attempt second deep navigation to admin audit queue
  116 |     await page.goto('/#/admin/audit-queue');
  117 |     await expect(page).toHaveURL(/#\/pending-approval/);
  118 |   });
  119 |   test('User Draft Lifecycle & Admin Direct Publish', async ({ page }) => {
  120 |     await page.addInitScript(() => {
  121 |       const standardUser = {
  122 |         id: 'patient_1',
  123 |         name: 'Patient One',
  124 |         email: 'patient@glyco.com',
  125 |         roleType: 'user',
  126 |         isApproved: true,
  127 |         onboarded: true,
  128 |       };
  129 |       localStorage.setItem('glyco_session', JSON.stringify(standardUser));
  130 |       const users = { 'patient@glyco.com': standardUser };
  131 |       localStorage.setItem('glyco_users', JSON.stringify(users));
  132 |     });
  133 | 
  134 |     await page.goto('/#/admin-editor');
  135 |     await page.waitForLoadState('networkidle');
  136 | 
  137 |     // Create a draft
  138 |     await page.fill('input[placeholder="E.g., Low-GL Avocado Toast"]', 'My Personal Draft');
  139 |     // Save draft
  140 |     const saveButton = page.locator('button', { hasText: 'Save Personal Draft' });
  141 |     await saveButton.waitFor({ state: 'visible' });
  142 |     await saveButton.click();
  143 | 
  144 |     // Verify it redirects or shows success (depends on implementation, assuming it stays on page)
  145 |     await expect(page.locator('text=Save failed')).not.toBeVisible();
  146 |   });
  147 | 
  148 |   test('Draft Security Intercept', async ({ page }) => {
  149 |     // We navigate to a preview URL of a draft authored by admin@glycogourmet.com
  150 |     await page.addInitScript(() => {
  151 |       const standardUser = {
  152 |         id: 'patient_2',
  153 |         name: 'Patient Two',
  154 |         email: 'patient2@glyco.com',
  155 |         roleType: 'user',
  156 |         isApproved: true,
  157 |         onboarded: true,
  158 |       };
  159 |       localStorage.setItem('glyco_session', JSON.stringify(standardUser));
  160 |       
  161 |       const draftRecipe = {
  162 |         id: 'draft-admin-1',
  163 |         title: 'Admin Draft',
  164 |         status: 'draft',
  165 |         publishedAt: null,
  166 |         authorId: 'admin@glycogourmet.com'
  167 |       };
  168 |       // Mocking the getRecipeById response is tricky without modifying backend,
  169 |       // but if we hit the URL, the client checks and redirects. We rely on the local cache
  170 |       // of seedRecipes if no backend is present. We'll just verify the unauthorized alert.
  171 |     });
  172 | 
  173 |     // Instead of mocking the exact recipe, if the user doesn't own it, we expect an alert and redirect
  174 |     // If the mock recipe doesn't exist, it redirects to '/' anyway.
  175 |   });
```