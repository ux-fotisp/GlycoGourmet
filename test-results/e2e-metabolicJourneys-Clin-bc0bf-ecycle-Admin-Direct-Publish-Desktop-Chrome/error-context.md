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
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - link [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - heading "GlycoGourmet Admin" [level=1] [ref=e7]
      - paragraph [ref=e8]: Managing Blood Sugar & Flavor
    - navigation [ref=e9]:
      - button "restaurant_menu Recipes expand_more" [ref=e11] [cursor=pointer]:
        - generic [ref=e12]:
          - generic [ref=e13]: restaurant_menu
          - generic [ref=e14]: Recipes
        - generic [ref=e15]: expand_more
      - link "calendar_today Meal Plans" [ref=e16] [cursor=pointer]:
        - /url: "#/meal-plans"
        - generic [ref=e17]: calendar_today
        - generic [ref=e18]: Meal Plans
      - link "settings Profile Settings" [ref=e19] [cursor=pointer]:
        - /url: "#/settings"
        - generic [ref=e20]: settings
        - generic [ref=e21]: Profile Settings
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: P
        - generic [ref=e26]:
          - generic [ref=e27]: Patient One
          - generic [ref=e28]: USER
      - button "logout Log Out" [ref=e29] [cursor=pointer]:
        - generic [ref=e30]: logout
        - text: Log Out
  - main "Recipe Editor" [ref=e32]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - heading "Create New Recipe" [level=1] [ref=e36]
        - generic [ref=e37]: Blank State
      - paragraph [ref=e38]: Formulate blood-sugar balancing meals with real-time metabolic recalculation & Strapi CMS persistence.
    - generic [ref=e40]:
      - region "Recipe Input Form" [ref=e41]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]:
              - heading "menu_book Basics & Overview" [level=3] [ref=e45]:
                - generic [ref=e46]: menu_book
                - text: Basics & Overview
              - generic [ref=e47]: Step 1 of 4
            - generic [ref=e48]:
              - generic [ref=e49]:
                - generic [ref=e50]: Recipe Title
                - textbox "Recipe Title" [ref=e52]:
                  - /placeholder: e.g. Herb-Roasted Salmon with Lemon Asparagus
              - generic [ref=e53]:
                - generic [ref=e54]: Description & Health Benefits
                - textbox "Description & Health Benefits" [ref=e55]:
                  - /placeholder: Describe the culinary flavors, aromas, and blood-sugar balancing qualities...
              - generic [ref=e56]:
                - generic [ref=e57]:
                  - generic [ref=e58]: Prep Time (min)
                  - spinbutton "Prep Time (min)" [ref=e60]
                - generic [ref=e61]:
                  - generic [ref=e62]: Cook Time (min)
                  - spinbutton "Cook Time (min)" [ref=e64]
                - generic [ref=e65]:
                  - generic [ref=e66]: Yield (Servings)
                  - spinbutton "Yield (Servings)" [ref=e68]: "1"
              - generic [ref=e69]:
                - generic [ref=e70]: Recipe Image (Strapi Media Library)
                - button "Upload recipe image to Strapi Media — drag and drop or click to browse" [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]:
                    - generic [ref=e73]: cloud_upload
                    - generic [ref=e74]: Drag & Drop or Click to Upload
                    - generic [ref=e75]: JPEG, PNG, WebP, AVIF — max 5 MB
                - button "link Or paste image URL" [ref=e77] [cursor=pointer]:
                  - generic [ref=e78]: link
                  - text: Or paste image URL
          - generic [ref=e79]:
            - generic [ref=e80]:
              - heading "sell Dietary Tags" [level=3] [ref=e81]:
                - generic [ref=e82]: sell
                - text: Dietary Tags
              - generic [ref=e83]: Step 2 of 4
            - generic [ref=e84]:
              - button "Low GI" [ref=e85] [cursor=pointer]
              - button "Keto-Friendly" [ref=e86] [cursor=pointer]
              - button "High Fiber" [ref=e87] [cursor=pointer]
              - button "High Protein" [ref=e88] [cursor=pointer]
              - button "Low Sodium" [ref=e89] [cursor=pointer]
              - button "Under 30 Min" [ref=e90] [cursor=pointer]
              - button "Low Sugar" [ref=e91] [cursor=pointer]
          - generic [ref=e92]:
            - generic [ref=e93]: Step 3 of 4
            - generic [ref=e95]:
              - generic [ref=e97]:
                - heading "Recipe Ingredients (0)" [level=3] [ref=e98]
                - paragraph [ref=e99]: Select, segment, and fine-tune ingredients for blood-sugar optimization.
              - button "add_circle Add Ingredient Slot" [ref=e100] [cursor=pointer]:
                - generic [ref=e101]: add_circle
                - text: Add Ingredient Slot
          - generic [ref=e102]:
            - generic [ref=e103]:
              - heading "format_list_numbered Instructions & Steps (1)" [level=3] [ref=e104]:
                - generic [ref=e105]: format_list_numbered
                - text: Instructions & Steps (1)
              - generic [ref=e106]: Step 4 of 4
            - generic [ref=e108]:
              - generic [ref=e109]: "01"
              - generic [ref=e110]:
                - textbox "Step 1 Heading" [ref=e111]:
                  - /placeholder: Step Heading (e.g. Sear Salmon)
                - textbox "Step 1 Description" [ref=e112]:
                  - /placeholder: Describe step preparation tasks and timing details...
                - generic [ref=e113]:
                  - generic [ref=e114]: timer
                  - spinbutton "Step 1 Timer in minutes" [ref=e115]
            - button "add Add Instruction Step" [ref=e116] [cursor=pointer]:
              - generic [ref=e117]: add
              - text: Add Instruction Step
      - region "Live Recipe Card Preview" [ref=e118]:
        - generic [ref=e119]:
          - generic [ref=e120]:
            - generic [ref=e121]: Live Preview Pane
            - generic [ref=e123]: Real-time metabolic calculation
          - generic [ref=e124]:
            - generic [ref=e125]:
              - generic [ref=e126]:
                - generic [ref=e127]: restaurant
                - paragraph [ref=e129]: Image Wireframe Placeholder
                - paragraph [ref=e130]: Drop an image file or upload to Strapi Media Library to render recipe photography.
              - generic [ref=e131]:
                - generic [ref=e132]: "GI: N/A"
                - generic [ref=e133]: •
                - generic [ref=e134]: "GL: 0"
            - generic [ref=e135]:
              - heading "Untitled Recipe" [level=3] [ref=e136]
              - generic [ref=e137]:
                - generic [ref=e138]:
                  - generic [ref=e139]: schedule
                  - generic [ref=e140]: 0 min total
                - generic [ref=e141]:
                  - generic [ref=e142]: group
                  - generic [ref=e143]: 1 serving
            - blockquote [ref=e145]: "\"Describe the culinary experience and glycemic stabilization features...\""
            - generic [ref=e147]:
              - generic [ref=e148]:
                - heading "analytics Nutritional Snapshot" [level=3] [ref=e149]:
                  - generic [ref=e150]: analytics
                  - text: Nutritional Snapshot
                - generic [ref=e151]:
                  - generic [ref=e152]: info
                  - generic [ref=e153]: Portion-adjusted calculation
              - generic [ref=e154]:
                - generic [ref=e155]:
                  - generic [ref=e156]: Glycemic Load
                  - generic [ref=e158]:
                    - generic [ref=e159]: GL 0
                    - generic [ref=e160]: 0%
                  - generic [ref=e162]: Gentle Impact
                - generic [ref=e163]:
                  - generic [ref=e164]: Glycemic Index
                  - generic [ref=e165]: GI —
                  - generic [ref=e167]: Low Speed
                - generic [ref=e168]:
                  - generic [ref=e169]: 0g
                  - generic [ref=e170]: Net Carbs
                - generic [ref=e171]:
                  - generic [ref=e172]: 0g
                  - generic [ref=e173]: Dietary Fiber
              - group [ref=e174]:
                - generic "expand_more Secondary Macros (Calories, Fat, Protein) Tap to expand breakdown" [ref=e175] [cursor=pointer]:
                  - generic [ref=e176]:
                    - generic [ref=e177]: expand_more
                    - text: Secondary Macros (Calories, Fat, Protein)
                  - generic [ref=e178]: Tap to expand breakdown
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]: Glycemic Load Gauge
                - generic [ref=e182]: GL 0 • 0g Net Carbs
              - paragraph [ref=e184]: This formulation sits in the Gentle Impact (0% of Daily Target GL).
            - generic [ref=e185]:
              - heading "Ingredients (0)" [level=4] [ref=e187]
              - generic [ref=e188]:
                - generic [ref=e189]: nutrition
                - paragraph [ref=e190]: No ingredients added yet. Preview will populate as you type.
            - button "soup_kitchen Cook Mode Preview (Saved Recipes Only)" [disabled] [ref=e192]:
              - generic [ref=e193]: soup_kitchen
              - text: Cook Mode Preview (Saved Recipes Only)
    - generic [ref=e195]:
      - generic [ref=e197]:
        - generic [ref=e198]: info
        - generic [ref=e199]: "Requires:"
        - generic [ref=e200]: Recipe Title • At least 1 Ingredient
      - generic [ref=e201]:
        - button "save Save Personal Draft" [ref=e202] [cursor=pointer]:
          - generic [ref=e203]: save
          - text: Save Personal Draft
        - generic [ref=e204]:
          - button "grading Submit to Clinical Review" [disabled] [ref=e205]:
            - generic [ref=e206]: grading
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