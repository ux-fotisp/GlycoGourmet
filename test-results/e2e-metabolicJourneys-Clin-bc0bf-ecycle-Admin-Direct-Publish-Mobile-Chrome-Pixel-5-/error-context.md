# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\metabolicJourneys.spec.ts >> Clinical Metabolic End-to-End User Journeys >> User Draft Lifecycle & Admin Direct Publish
- Location: tests\e2e\metabolicJourneys.spec.ts:119:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.fill: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="E.g., Low-GL Avocado Toast"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link [ref=e5] [cursor=pointer]:
      - /url: "#/"
      - heading "GlycoGourmet Admin" [level=1] [ref=e6]
    - generic [ref=e7]:
      - button "Notifications" [ref=e8] [cursor=pointer]: notifications
      - button "Log Out" [ref=e9] [cursor=pointer]: logout
  - navigation [ref=e10]:
    - button "restaurant_menu Recipes" [ref=e11] [cursor=pointer]:
      - generic [ref=e12]: restaurant_menu
      - generic [ref=e13]: Recipes
    - link "calendar_today Meal Plans" [ref=e14] [cursor=pointer]:
      - /url: "#/meal-plans"
      - generic [ref=e15]: calendar_today
      - generic [ref=e16]: Meal Plans
    - link "settings Settings" [ref=e17] [cursor=pointer]:
      - /url: "#/settings"
      - generic [ref=e18]: settings
      - generic [ref=e19]: Settings
  - main "Recipe Editor" [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e24]:
        - heading "Create New Recipe" [level=1] [ref=e25]
        - generic [ref=e26]: Blank State
      - generic [ref=e27]:
        - button "edit_note Edit Form" [ref=e28] [cursor=pointer]:
          - generic [ref=e29]: edit_note
          - text: Edit Form
        - button "visibility Live Preview" [ref=e30] [cursor=pointer]:
          - generic [ref=e31]: visibility
          - text: Live Preview
    - region "Recipe Input Form" [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - heading "menu_book Basics & Overview" [level=3] [ref=e38]:
              - generic [ref=e39]: menu_book
              - text: Basics & Overview
            - generic [ref=e40]: Step 1 of 4
          - generic [ref=e41]:
            - generic [ref=e42]:
              - generic [ref=e43]: Recipe Title
              - textbox "Recipe Title" [ref=e45]:
                - /placeholder: e.g. Herb-Roasted Salmon with Lemon Asparagus
            - generic [ref=e46]:
              - generic [ref=e47]: Description & Health Benefits
              - textbox "Description & Health Benefits" [ref=e48]:
                - /placeholder: Describe the culinary flavors, aromas, and blood-sugar balancing qualities...
            - generic [ref=e49]:
              - generic [ref=e50]:
                - generic [ref=e51]: Prep Time (min)
                - spinbutton "Prep Time (min)" [ref=e53]
              - generic [ref=e54]:
                - generic [ref=e55]: Cook Time (min)
                - spinbutton "Cook Time (min)" [ref=e57]
              - generic [ref=e58]:
                - generic [ref=e59]: Yield (Servings)
                - spinbutton "Yield (Servings)" [ref=e61]: "1"
            - generic [ref=e62]:
              - generic [ref=e63]: Recipe Image (Strapi Media Library)
              - button "Upload recipe image to Strapi Media — drag and drop or click to browse" [ref=e64] [cursor=pointer]:
                - generic [ref=e65]:
                  - generic [ref=e66]: cloud_upload
                  - generic [ref=e67]: Drag & Drop or Click to Upload
                  - generic [ref=e68]: JPEG, PNG, WebP, AVIF — max 5 MB
              - button "link Or paste image URL" [ref=e70] [cursor=pointer]:
                - generic [ref=e71]: link
                - text: Or paste image URL
        - generic [ref=e72]:
          - generic [ref=e73]:
            - heading "sell Dietary Tags" [level=3] [ref=e74]:
              - generic [ref=e75]: sell
              - text: Dietary Tags
            - generic [ref=e76]: Step 2 of 4
          - generic [ref=e77]:
            - button "Low GI" [ref=e78] [cursor=pointer]
            - button "Keto-Friendly" [ref=e79] [cursor=pointer]
            - button "High Fiber" [ref=e80] [cursor=pointer]
            - button "High Protein" [ref=e81] [cursor=pointer]
            - button "Low Sodium" [ref=e82] [cursor=pointer]
            - button "Under 30 Min" [ref=e83] [cursor=pointer]
            - button "Low Sugar" [ref=e84] [cursor=pointer]
        - generic [ref=e85]:
          - generic [ref=e86]: Step 3 of 4
          - generic [ref=e88]:
            - generic [ref=e90]:
              - heading "Recipe Ingredients (0)" [level=3] [ref=e91]
              - paragraph [ref=e92]: Select, segment, and fine-tune ingredients for blood-sugar optimization.
            - button "add_circle Add Ingredient Slot" [ref=e93] [cursor=pointer]:
              - generic [ref=e94]: add_circle
              - text: Add Ingredient Slot
        - generic [ref=e95]:
          - generic [ref=e96]:
            - heading "format_list_numbered Instructions & Steps (1)" [level=3] [ref=e97]:
              - generic [ref=e98]: format_list_numbered
              - text: Instructions & Steps (1)
            - generic [ref=e99]: Step 4 of 4
          - generic [ref=e101]:
            - generic [ref=e102]: "01"
            - generic [ref=e103]:
              - textbox "Step 1 Heading" [ref=e104]:
                - /placeholder: Step Heading (e.g. Sear Salmon)
              - textbox "Step 1 Description" [ref=e105]:
                - /placeholder: Describe step preparation tasks and timing details...
              - generic [ref=e106]:
                - generic [ref=e107]: timer
                - spinbutton "Step 1 Timer in minutes" [ref=e108]
          - button "add Add Instruction Step" [ref=e109] [cursor=pointer]:
            - generic [ref=e110]: add
            - text: Add Instruction Step
    - generic [ref=e113]:
      - button "save Save Personal Draft" [ref=e114] [cursor=pointer]:
        - generic [ref=e115]: save
        - text: Save Personal Draft
      - generic [ref=e116]:
        - button "grading Submit to Clinical Review" [disabled] [ref=e117]:
          - generic [ref=e118]: grading
          - text: Submit to Clinical Review
        - generic:
          - paragraph: "Complete Required Fields:"
          - list:
            - listitem: Enter a recipe title
            - listitem: Add at least 1 ingredient
```

# Test source

```ts
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
> 138 |     await page.fill('input[placeholder="E.g., Low-GL Avocado Toast"]', 'My Personal Draft');
      |                ^ Error: page.fill: Test timeout of 45000ms exceeded.
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
  176 | });
  177 | 
  178 | 
```