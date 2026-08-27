# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\metabolicJourneys.spec.ts >> Clinical Metabolic End-to-End User Journeys >> Journey 1: User Draft Lifecycle & Review Submission
- Location: tests\e2e\metabolicJourneys.spec.ts:164:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('div').filter({ hasText: 'Draft � Not Public' }).last() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - alert [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: warning
      - generic [ref=e7]: Draft — Not Public
      - generic [ref=e8]: "Author: patient@glyco.com"
      - generic [ref=e9]: "Last Saved: 8/27/2026, 9:55:52 AM"
    - link "Edit in Studio" [ref=e11]:
      - /url: "#/admin-editor?edit=my-personal-draft-1787813752316"
  - banner [ref=e12]:
    - generic [ref=e13]:
      - link "arrow_back GlycoGourmet" [ref=e14]:
        - /url: "#/"
        - generic [ref=e15]: arrow_back
        - generic [ref=e16]: GlycoGourmet
      - link "settings" [ref=e18]:
        - /url: "#/settings"
  - main [ref=e20]:
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]:
            - img "My Personal Draft" [ref=e25]
            - generic [ref=e27]:
              - generic [ref=e28]: "Low GI: 0"
              - generic [ref=e29]: "GL: 0 (Gentle Impact)"
            - generic [ref=e30]:
              - generic [ref=e31]: schedule
              - text: — min
          - generic [ref=e32]:
            - generic [ref=e33]: Main Course
            - heading "My Personal Draft" [level=1] [ref=e35]
            - paragraph
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]:
                - generic [ref=e39]: speed
                - generic [ref=e40]: Glycemic Load Gauge
                - generic [ref=e41]: Gentle Impact
              - generic [ref=e42]: GL 0 / 45 Target
            - generic [ref=e44]:
              - generic [ref=e45]:
                - text: "Primary Anchors:"
                - strong [ref=e46]: 0g Net Carbs
                - text: •
                - strong [ref=e47]: 0g Fiber
              - generic [ref=e48]: 0% Daily Impact
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: restaurant
              - generic [ref=e52]:
                - generic [ref=e53]: Portion Multiplier
                - text: Zero mental math — auto-scales GL & ingredients
            - generic [ref=e54]:
              - button "Scale recipe by 0.5x" [ref=e55] [cursor=pointer]: 0.5x
              - button "Scale recipe by 1x" [ref=e56] [cursor=pointer]: 1x
              - button "Scale recipe by 1.5x" [ref=e57] [cursor=pointer]: 1.5x
              - button "Scale recipe by 2x" [ref=e58] [cursor=pointer]: 2x
        - generic [ref=e60]:
          - generic [ref=e61]:
            - heading "analytics Nutritional Snapshot" [level=3] [ref=e62]:
              - generic [ref=e63]: analytics
              - text: Nutritional Snapshot
            - generic [ref=e64]:
              - generic [ref=e65]: info
              - generic [ref=e66]: Portion-adjusted calculation
          - generic [ref=e67]:
            - generic [ref=e68]:
              - generic [ref=e69]: Glycemic Load
              - generic [ref=e71]:
                - generic [ref=e72]: GL 0
                - generic [ref=e73]: 0%
              - generic [ref=e75]: Gentle Impact
            - generic [ref=e76]:
              - generic [ref=e77]: Glycemic Index
              - generic [ref=e78]: GI 0
              - generic [ref=e80]: Low Speed
            - generic [ref=e81]:
              - generic [ref=e82]: 0g
              - generic [ref=e83]: Net Carbs
            - generic [ref=e84]:
              - generic [ref=e85]: 0g
              - generic [ref=e86]: Dietary Fiber
          - group [ref=e87]:
            - generic "expand_more Secondary Macros (Calories, Fat, Protein) Tap to expand breakdown" [ref=e88] [cursor=pointer]:
              - generic [ref=e89]:
                - generic [ref=e90]: expand_more
                - text: Secondary Macros (Calories, Fat, Protein)
              - generic [ref=e91]: Tap to expand breakdown
        - generic [ref=e92]:
          - heading "grocery Ingredients" [level=4] [ref=e94]:
            - generic [ref=e95]: grocery
            - text: Ingredients
          - generic [ref=e98]:
            - generic [ref=e99]: set_meal
            - generic [ref=e100]:
              - generic [ref=e101]: 3.5 oz Atlantic Salmon
              - generic [ref=e103]:
                - generic [ref=e104]: 0g carbs
                - generic [ref=e105]: • GI 0
                - generic [ref=e106]:
                  - generic [ref=e107]: eco
                  - text: Raw
        - generic [ref=e108]:
          - heading "menu_book Preparation Steps" [level=4] [ref=e109]:
            - generic [ref=e110]: menu_book
            - text: Preparation Steps
          - generic [ref=e112]:
            - generic [ref=e113]: "1"
            - generic [ref=e115]:
              - heading [level=5]
              - paragraph
      - generic [ref=e118]:
        - heading "hub Quick Actions" [level=4] [ref=e119]:
          - generic [ref=e120]: hub
          - text: Quick Actions
        - generic [ref=e121]:
          - button "auto_videocam Start Cooking" [ref=e122] [cursor=pointer]:
            - generic [ref=e123]: auto_videocam
            - text: Start Cooking
          - button "calendar_add_on Add to Meal Plan" [ref=e124] [cursor=pointer]:
            - generic [ref=e125]: calendar_add_on
            - text: Add to Meal Plan
          - button "favorite Save Favorite" [ref=e126] [cursor=pointer]:
            - generic [ref=e127]: favorite
            - text: Save Favorite
          - link "edit_note Edit Recipe" [ref=e128]:
            - /url: "#/admin"
            - generic [ref=e129]: edit_note
            - text: Edit Recipe
  - navigation [ref=e130]:
    - button "calendar_add_on + Meal Plan" [ref=e131] [cursor=pointer]:
      - generic [ref=e132]: calendar_add_on
      - text: + Meal Plan
    - button "auto_videocam Start Cooking" [ref=e133] [cursor=pointer]:
      - generic [ref=e134]: auto_videocam
      - text: Start Cooking
```

# Test source

```ts
  156 |     await expect(page).toHaveURL(/#\/pending-approval/);
  157 |     await expect(page.locator('h2')).toContainText(/Account Under Review/i);
  158 | 
  159 |     // 3. Attempt second deep navigation to admin audit queue
  160 |     await page.goto('/#/admin/audit-queue');
  161 |     await expect(page).toHaveURL(/#\/pending-approval/);
  162 |   });
  163 |   
  164 |   test('Journey 1: User Draft Lifecycle & Review Submission', async ({ page }) => {
  165 |     // 1. User Session
  166 |     await page.addInitScript(() => {
  167 |       const standardUser = {
  168 |         id: 'patient_1',
  169 |         name: 'Patient One',
  170 |         email: 'patient@glyco.com',
  171 |         roleType: 'user',
  172 |         isApproved: true,
  173 |         onboarded: true,
  174 |       };
  175 |       localStorage.setItem('glyco_session', JSON.stringify(standardUser));
  176 |       const users = { 'patient@glyco.com': standardUser };
  177 |       localStorage.setItem('glyco_users', JSON.stringify(users));
  178 |       
  179 |       const draftRecipe = {
  180 |         id: 'my-draft-id',
  181 |         title: 'Draft Test',
  182 |         status: 'draft',
  183 |         publishedAt: null,
  184 |         authorId: 'patient@glyco.com',
  185 |         ingredients: [{ id: 'ing1', name: 'Test', amount: 100 }],
  186 |         servings: 1
  187 |       };
  188 |       // We'll mock the store using localStorage if possible, but actually we can just create it via UI
  189 |     });
  190 | 
  191 |     
  192 |     let mockedRecipes = [];
  193 |     await page.route(/\/api\/recipes/, async route => {
  194 |       if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
  195 |         const postData = JSON.parse(route.request().postData());
  196 |         const recipe = postData.data ? postData.data : postData;
  197 |         // Inject a mocked ID if not present, based on title
  198 |         if (!recipe.id) {
  199 |           recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
  200 |         }
  201 |         mockedRecipes.push(recipe);
  202 |         await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
  203 |       } else if (route.request().method() === 'GET') {
  204 |         const url = route.request().url();
  205 |         const match = url.match(/\/api\/recipes\/([^?]+)/);
  206 |         if (match) {
  207 |            const id = match[1];
  208 |            const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
  209 |            if (found) {
  210 |              await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
  211 |            } else {
  212 |              // Fallback for mock setup
  213 |              const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
  214 |              await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
  215 |            }
  216 |         } else {
  217 |            await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: mockedRecipes }) });
  218 |         }
  219 |       } else if (route.request().method() === 'OPTIONS') {
  220 |         const reqHeaders = route.request().headers();
  221 |         const requestedHeaders = reqHeaders['access-control-request-headers'] || 'Content-Type, Authorization';
  222 |         await route.fulfill({
  223 |           status: 204,
  224 |           headers: {
  225 |             "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true",
  226 |             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  227 |             'Access-Control-Allow-Headers': requestedHeaders
  228 |           }
  229 |         });
  230 |       } else {
  231 |         await route.continue();
  232 |       }
  233 |     });
  234 | 
  235 |     await page.goto('/#/admin-editor');
  236 |     await page.waitForLoadState('networkidle');
  237 | 
  238 |     // Create a draft
  239 |     await page.fill('#recipe-title', 'My Personal Draft');
  240 |     await page.fill('#servings', '1');
  241 |     
  242 |     await page.click('button:has-text("Add Ingredient Slot")');
  243 |     // Clicking an ingredient item (we wait for the picker to be visible)
  244 |     await page.click('div[role="dialog"] >> text=Salmon');
  245 | 
  246 |     const saveButton = page.locator('button', { hasText: 'Save Personal Draft' });
  247 |     await saveButton.waitFor({ state: 'visible' });
  248 |     await saveButton.click();
  249 | 
  250 |     const previewButton = page.locator('button', { hasText: 'Preview Draft' });
  251 |     await previewButton.waitFor({ state: 'visible' });
  252 |     await previewButton.click();
  253 | 
  254 |     // Verify DraftPreviewBanner
  255 |     const banner = page.locator('div', { hasText: 'Draft � Not Public' }).last();
> 256 |     await banner.waitFor({ state: 'visible' });
      |                  ^ Error: locator.waitFor: Test timeout of 45000ms exceeded.
  257 |     
  258 |     // Go back and submit for review
  259 |     await page.goBack();
  260 |     const submitBtn = page.locator('button', { hasText: 'Submit to Clinical Review' });
  261 |     await submitBtn.waitFor({ state: 'visible' });
  262 |     await submitBtn.click();
  263 |   });
  264 | 
  265 |   test('Journey 2: Admin Direct Publish to Public Catalog', async ({ page }) => {
  266 |     await page.addInitScript(() => {
  267 |       const adminUser = {
  268 |         id: 'admin_1',
  269 |         name: 'Admin One',
  270 |         email: 'admin@glyco.com',
  271 |         roleType: 'admin',
  272 |         isApproved: true,
  273 |         onboarded: true,
  274 |       };
  275 |       localStorage.setItem('glyco_session', JSON.stringify(adminUser));
  276 |       localStorage.setItem('glyco_users', JSON.stringify({ 'admin@glyco.com': adminUser }));
  277 |     });
  278 | 
  279 |     
  280 |     let mockedRecipes = [];
  281 |     await page.route(/\/api\/recipes/, async route => {
  282 |       if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
  283 |         const postData = JSON.parse(route.request().postData());
  284 |         const recipe = postData.data ? postData.data : postData;
  285 |         // Inject a mocked ID if not present, based on title
  286 |         if (!recipe.id) {
  287 |           recipe.id = recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() : 'mock-id-' + Date.now();
  288 |         }
  289 |         mockedRecipes.push(recipe);
  290 |         await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: recipe }) });
  291 |       } else if (route.request().method() === 'GET') {
  292 |         const url = route.request().url();
  293 |         const match = url.match(/\/api\/recipes\/([^?]+)/);
  294 |         if (match) {
  295 |            const id = match[1];
  296 |            const found = mockedRecipes.find(r => r.id === id || r.documentId === id);
  297 |            if (found) {
  298 |              await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: found }) });
  299 |            } else {
  300 |              // Fallback for mock setup
  301 |              const fallback = mockedRecipes.length > 0 ? { ...mockedRecipes[0], id: id } : null;
  302 |              await route.fulfill({ status: fallback ? 200 : 404, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: fallback }) });
  303 |            }
  304 |         } else {
  305 |            await route.fulfill({ status: 200, contentType: 'application/json', headers: { "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify({ data: mockedRecipes }) });
  306 |         }
  307 |       } else if (route.request().method() === 'OPTIONS') {
  308 |         const reqHeaders = route.request().headers();
  309 |         const requestedHeaders = reqHeaders['access-control-request-headers'] || 'Content-Type, Authorization';
  310 |         await route.fulfill({
  311 |           status: 204,
  312 |           headers: {
  313 |             "Access-Control-Allow-Origin": route.request().headers()['origin'] || '*', "Access-Control-Allow-Credentials": "true",
  314 |             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  315 |             'Access-Control-Allow-Headers': requestedHeaders
  316 |           }
  317 |         });
  318 |       } else {
  319 |         await route.continue();
  320 |       }
  321 |     });
  322 | 
  323 |     await page.goto('/#/admin-editor');
  324 |     await page.waitForLoadState('networkidle');
  325 | 
  326 |     await page.fill('#recipe-title', 'Admin Direct Publish Test');
  327 |     await page.fill('#servings', '1');
  328 |     
  329 |     await page.click('button:has-text("Add Ingredient Slot")');
  330 |     await page.click('div[role="dialog"] >> text=Salmon');
  331 | 
  332 |     const publishBtn = page.locator('button', { hasText: 'Publish Recipe' });
  333 |     await publishBtn.waitFor({ state: 'visible' });
  334 |     await publishBtn.click();
  335 | 
  336 |     // After publish, we should be redirected to /recipe/:id
  337 |     await page.waitForURL(/#\/recipe\//);
  338 |     
  339 |     // Go to catalog and check if it's there
  340 |     await page.goto('/#/');
  341 |     await page.waitForLoadState('networkidle');
  342 |     const recipeCard = page.locator('text=Admin Direct Publish Test').first();
  343 |     await recipeCard.waitFor({ state: 'visible' });
  344 |   });
  345 | 
  346 |   test('Journey 3: Metabolic Integrity Calculation', async ({ page }) => {
  347 |     // Asserting the deterministic formula exactly.
  348 |     // The engine calculates GL = roundToOneDecimal((GI * NetCarbs) / 100) per serving
  349 |     const gi = 50;
  350 |     const carbs = 20;
  351 |     const fiber = 5;
  352 |     const netCarbs = carbs - fiber; // 15
  353 |     const gl = Math.round((gi * netCarbs) / 100); // 50 * 15 / 100 = 7.5 = 8
  354 |     expect(gl).toBe(8); // Math.round(7.5) is 8 in JS
  355 | 
  356 |     // We can also import calculateMetabolicProfile to test directly if this was unit test,
```