# 🧪 GlycoGourmet — Comprehensive Verification, Testing & QA Directives

> **Clinical-Grade Quality Assurance, Deterministic Test Protocols, CI/CD Gate Invariants, and Test-Case Inventory**  
> *Authored & Architected by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. Executive Quality Assurance Philosophy & Standards

GlycoGourmet is engineered as a clinical-grade digital metabolic health platform. In medical and metabolic software, software defects translate directly to clinical calculation errors, inaccurate bolus timing, or compromised glycemic management.

### Core Testing Invariants:
1. **Zero Flakiness:** All tests must be 100% deterministic, with zero reliance on arbitrary timing timeouts or unstable CSS selectors.
2. **Zero Metabolic Drift:** All mathematical formulas must be mathematically bounded and verified against IEEE 754 floating-point drift and division-by-zero singularities.
3. **Universal Accessibility (WCAG 2.1 AA):** Every view, dialog, and interactive control must achieve zero automated a11y violations and maintain strict chromatic contrast ratios.
4. **Tenant Isolation Verification:** Multi-tenant boundaries must be rigorously tested to ensure complete data isolation across practitioner portfolios.

---

## 2. Test Layer Architecture & Tooling Stack

```
+-----------------------------------------------------------------------------------+
|                        GLYCOGOURMET TEST PYRAMID & STACK                          |
+-----------------------------------------------------------------------------------+
| 1. Static Analysis & Types | Oxlint (v1.71) + TypeScript (v7.0 tsc --noEmit)      |
| 2. Unit Testing            | Vitest (v4.1) + V8 Coverage                          |
| 3. Integration Testing     | Vitest + React Testing Library (JSDOM)               |
| 4. End-to-End (E2E)        | Playwright Test Runner (Chromium / WebKit / Firefox) |
| 5. Accessibility (a11y)    | Playwright + @axe-core/playwright                    |
| 6. Database Verification   | Custom Invariant Validator (Node.js)                 |
+-----------------------------------------------------------------------------------+
```

---

## 3. Playwright Semantic Locator Protocol

Autonomous test agents and human engineers must adhere strictly to the **Semantic Locator Hierarchy**. Brittle selectors that bind to presentation styles or dynamic framework internals are forbidden.

### 3.1 Strict Banning Rules
1. ❌ **NO Utility CSS Class Selectors:** Never select elements via Tailwind utility classes (e.g. `page.locator('.bg-primary.text-on-primary.p-4')`).
2. ❌ **NO Hierarchical XPath Strings:** Never generate raw DOM hierarchy paths (e.g. `page.locator('xpath=/html/body/div[2]/div/div[3]/button[1]')`).
3. ❌ **NO Generated Dynamic IDs:** Never target framework-generated state IDs (e.g. `id="radix-:r1:"`).

### 3.2 Mandatory Locator Hierarchy
Target interactive elements using the following descending priority:

```
1. Semantic Test Identifiers ...... page.locator('[data-testid="recipe-gl-badge"]')
2. Explicit ARIA Roles ............ page.getByRole('button', { name: /Swap & Apply/i })
3. Accessible Form Labels ......... page.getByLabel(/Total Carbohydrates/i)
4. OOUX Domain Object Bindings .... page.locator('[data-ooux-object="Recipe"][data-ooux-id="rec_01"]')
```

---

## 4. Self-Healing Selector Protocol (OOUX Object Recovery)

When a UI refactoring modifies the DOM tree, test runners and autonomous agents execute the **OOUX Self-Healing Sequence** prior to recording a failure:

```
+-----------------------------------------------------------------------------------+
|                        SELF-HEALING SELECTOR DECISION FLOW                         |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Primary Selector Fails to Resolve Target ]                                     |
|         |                                                                         |
|         v                                                                         |
|  1. Inspect Parent Container for [data-ooux-object="<DomainEntity>"]             |
|         |                                                                         |
|         v                                                                         |
|  2. Query Child ARIA Roles (e.g. role="dialog", role="radio", role="switch")      |
|         |                                                                         |
|         v                                                                         |
|  3. Validate Semantic Accessibility Tree matches target User Intent               |
|         |                                                                         |
|         v                                                                         |
|  4. Heal Test Spec by replacing with Canonical Semantic Locator                  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 5. Vitest Invariant Rules & Synthetic Data Fuzzing Directives

All unit and integration test suites authoring metabolic assertions must systematically fuzz the following boundary conditions:

### 5.1 Fiber Inversion Anomaly
- **Phenomenon:** Total dietary fiber reported by laboratory analytical assay exceeds total reported carbohydrates.
- **Test Payload:** `Total Carbs = 4.0g`, `Dietary Fiber = 9.0g`.
- **Assertion:** `NetCarbs` must strictly clamp to `0.0g` without returning negative numbers or `-0` (`Object.is(result, -0)` must be `false`).

### 5.2 Thermal Multiplier Upper Bounds
- **Phenomenon:** Preparation methods alter starch gelatinization and retrogradation.
- **Multipliers:**
  - Raw: $1.00\times$
  - Steamed: $1.02\times$
  - Sauteed: $1.05\times$
  - Roasted: $1.15\times$
  - Boiled: $1.20\times$
  - Mashed/Processed: $1.25\times$
  - Cooled: $0.85\times$
- **Assertion:** Effective Glycemic Index ($GI_{\text{effective}}$) must clamp within $[0, 100]$.

### 5.3 Floating-Point Precision Drift (IEEE 754)
- **Phenomenon:** Standard JavaScript floating-point arithmetic produces precision artifacts (e.g. `10.3333 - 3.1111 = 7.222222222222221`).
- **Assertion:** Deterministic helper `roundToOneDecimal(val)` must round strictly to 1 decimal place (`7.2g`).

### 5.4 Zero-Division Carbohydrate Singularity
- **Phenomenon:** Multi-ingredient meal composed exclusively of pure proteins and lipids ($0\text{g}$ carbohydrates, e.g. olive oil + salmon + flank steak).
- **Assertion:**
  - Composite $GI$ must resolve to `0` (or `null` where appropriate).
  - Composite $GL$ must resolve to `0`.
  - `Number.isNaN(gl)` is strictly `false` and `Number.isFinite(gl)` is strictly `true`.

### 5.5 Multi-Day Carbohydrate-Weighted GL Averaging
- **Phenomenon:** Calculating cumulative Glycemic Load across multi-occasion meals or weekly schedules.
- **Assertion:** Rollup calculations must weight each meal's GL by its net carbohydrate mass, preventing zero-carb meals from diluting glycemic burden inappropriately.

---

## 6. Accessibility & Chromatic Compliance Directives (WCAG 2.1 AA)

### 6.1 Chromatic Spectrum (HSL Angles)
Visual regression tests assert element background tokens fall strictly within calibrated HSL ranges:

| Band Category | Target Hex Range | Hue Angle Range (HSL) | Minimum Contrast Ratio | WCAG 2.1 Status |
| :--- | :--- | :---: | :---: | :---: |
| **Low GL (Sage)** | `#D8E8CB` to `#1B3B22` | $95^\circ$ to $135^\circ$ | $\ge 4.5:1$ (AA) / $10.8:1$ (AAA) | ✅ Passes |
| **Medium GL (Amber)** | `#FFE082` to `#9E4D2A` | $30^\circ$ to $50^\circ$ | $\ge 4.5:1$ (AA) / $5.1:1$ (AA) | ✅ Passes |
| **High GL (Rose)** | `#FFDAD6` to `#BA1A1A` | $340^\circ$ to $10^\circ$ | $\ge 4.5:1$ (AA) / $5.8:1$ (AA) | ✅ Passes |

### 6.2 Touch Target Invariants
All interactive elements (buttons, radio pills, filter chips, drawer toggles) rendered on mobile viewports ($375 \times 667\text{px}$) must possess bounding dimensions $\ge 48 \times 48\text{px}$ (or minimum visual dimension $\ge 44\text{px}$ with surrounding hit area).

---

## 7. Full Test-Case Inventory Table

The following inventory details all test cases across the core `tests/` directory suite:

| Test Case Name | Type | File Path | Status |
| :--- | :---: | :--- | :---: |
| **Route Recipe Catalog (/#/) must have zero WCAG 2.1 AA violations** | `a11y` | `tests/a11y/contrastAudit.spec.ts` | ✅ Passed |
| **Route My Recipes (/#/my-recipes) must have zero WCAG 2.1 AA violations** | `a11y` | `tests/a11y/contrastAudit.spec.ts` | ✅ Passed |
| **Route Meal Planner (/#/meal-plans) must have zero WCAG 2.1 AA violations** | `a11y` | `tests/a11y/contrastAudit.spec.ts` | ✅ Passed |
| **Primary Deep Green Gradients (#1B3B22 and #2D5A34) must maintain >= 4.5:1 text contrast** | `a11y` | `tests/a11y/contrastAudit.spec.ts` | ✅ Passed |
| **Mobile viewport (375x667px) interactive touch targets must meet >= 48x48px requirement** | `a11y` | `tests/a11y/contrastAudit.spec.ts` | ✅ Passed |
| **Persona A (Type 1 Manager): Filter by Low GL and execute Smart Low-GI Swap** | `e2e` | `tests/e2e/metabolicJourneys.spec.ts` | ✅ Passed |
| **Journey 1: Patient Draft Creation and Clinical Review Submission** | `e2e` | `tests/e2e/metabolicJourneys.spec.ts` | ✅ Passed |
| **Journey 2: Admin Direct Publish to Public Catalog** | `e2e` | `tests/e2e/metabolicJourneys.spec.ts` | ✅ Passed |
| **Journey 3: Metabolic Integrity Calculation** | `e2e` | `tests/e2e/metabolicJourneys.spec.ts` | ✅ Passed |
| **should update URL query parameters and filter recipes when clicking occasion filter pills** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should parse pre-existing query parameters from initial deep link URL** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should clear URL parameters when executing resetAll** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should re-order rendered cards ascending by numeric GL when sort changes to gl_asc** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should maintain parent form state while typing in custom ingredient drawer** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should invoke swap callback and attach voice-pulse animation class to GL badge** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should assert /recipes/mine renders both user drafts and published creations** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **should assert /recipes/all catalog renders only recipes where publishedAt !== null** | `integration` | `tests/integration/RecipeFiltering.spec.jsx` | ✅ Passed |
| **Dietitian B cannot see ClientProfiles owned by Dietitian A via GET /api/client-profiles** | `integration` | `tests/integration/TenantScopingIntegration.spec.js` | ⏸️ Skipped |
| **renders all four discrete multiplier options** | `unit` | `tests/unit/ServingStepper.spec.jsx` | ✅ Passed |
| **indicates active state with aria-checked** | `unit` | `tests/unit/ServingStepper.spec.jsx` | ✅ Passed |
| **calls onScaleChange with correct multiplier on click** | `unit` | `tests/unit/ServingStepper.spec.jsx` | ✅ Passed |
| **respects disabled state** | `unit` | `tests/unit/ServingStepper.spec.jsx` | ✅ Passed |
| **meets touch target bounding requirements >= 48px** | `unit` | `tests/unit/ServingStepper.spec.jsx` | ✅ Passed |
| **should parse valid numbers and fallback on invalid/null/undefined inputs** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should round numbers to one decimal place accurately** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should calculate standard net carbs correctly when carbs > fiber** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should clamp net carbs to exactly 0.0g when fiber strictly exceeds total carbs** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should return 0.0g when both carbohydrates and fiber are 0g** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle decimal precision safely without floating point artifacts** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle null, undefined, and non-numeric inputs defensively** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should maintain 1.00x multiplier for Raw preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 1.02x multiplier for Steamed preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 1.05x multiplier for Sauteed preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 1.15x multiplier for Roasted preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 1.20x multiplier for Boiled preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 1.25x multiplier for Mashed/Processed preparation state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should apply 0.85x multiplier for Cooled state** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should fallback to 1.00x multiplier when prepState is unrecognized, empty, or undefined** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should calculate ingredient GL correctly** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should return 0 when netCarbs <= 0 or giEffective <= 0** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should return GI = 0 and GL = 0 without NaN or Infinity for zero-carb recipes** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle completely empty or non-array ingredient input safely** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle null/empty items in ingredients array gracefully** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should guard against serving counts <= 0 by clamping minimum servings to 1** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle ingredient with zero GI and positive net carbs (recipeGI = null)** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should handle nested ingredient with defaultPrepState and amount fallback** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should calculate weighted composite GI and scale macros across multi-serving portions** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should verify default export object functionality** | `unit` | `tests/unit/metabolicEngine.spec.ts` | ✅ Passed |
| **should return zeroed profile for null/undefined/empty slots** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **Existing single-recipe GI/GL outputs are unchanged after internal calculateNetCarbs refactor** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **zero-carb singularity: should return GL = 0 at the rollup level for zero-carb meals** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should correctly weight composite GL by net carbohydrate mass, not simple average** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should sum macros correctly across multiple meal occasions** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should apply serving multipliers when provided** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should skip missing recipe IDs gracefully** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should return 100% adherence when all days are within budget** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should correctly count days over budget and compute adherence** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should handle empty plan gracefully** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should handle plan with undefined/null GL values** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should treat boundary GL equal to target as within budget (not over)** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **scaling a recipe by 2x should double NetCarbs and GL without altering GI** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **scaling by 0.5x should halve macros proportionally** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **scaling by 1x should produce identical profile** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should preserve GI invariance for zero-carb recipes at any scale** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should not mutate the original ingredient array** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should handle empty/null ingredient arrays gracefully** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |
| **should return scaled ingredient list with correct amounts** | `unit` | `tests/unit/metabolicEngineRollups.spec.ts` | ✅ Passed |

---

### 7.1 Component & Utility Test Suites Summary (`src/` and `server/`)
In addition to the core `tests/` directory, 31 component and utility test suites run under Vitest:
- **UI Components:** `Button`, `Input`, `NutritionBadge`, `SearchBar`, `TagChip`, `ConfirmDeleteModal`.
- **Recipe Domain Components:** `RecipeCard`, `NutritionSnapshot`, `IngredientList`, `SubstitutionModal`, `ServingStepper`.
- **Admin & Authoring Views:** `AdminEditor`, `AdminDashboard`, `DraftAuditQueue`, `IngredientSelector`.
- **Navigation & Layout:** `Navbar`, `ProtectedRoute`, `AppRoutes`, `ProtectedRoutePermissions`.
- **State & Custom Hooks:** `usePermissions`, `useRecipeFilters`, `ingredientStore`.
- **Math & Utilities:** `nutritionCalculator`, `unitConverter`, `exportPipeline`.
- **Backend Lifecycles:** `server/src/api/ingredient/__tests__/lifecycles.test.js`.

**Total Test Count:** **243 passing Vitest tests**, 1 skipped integration test, and 9 Playwright E2E/A11y tests.

---

## 8. Continuous Integration (CI) Gate Checks & Validation Commands

All Pull Requests and branch merges are gated by the following automated CI pipeline checks:

### 8.1 Static Analysis & Linting Gate
```bash
npm run lint
```
- Runs **Oxlint** against `src/`.
- Enforces strict syntax rules, catches dead imports, and validates React Hooks dependencies.

### 8.2 Strict TypeScript Compilation Gate
```bash
npm run typecheck
```
- Runs `tsc --noEmit` across the entire codebase.
- Enforces zero type errors, verifies domain interface contracts, and checks JSX properties.

### 8.3 Unit & Integration Test Suite Gate
```bash
npm run test
```
- Runs **Vitest** in JSDOM environment.
- Executes all 35 test suites (math engine invariants, rollups, component lifecycles, and permission guards).

### 8.4 Full Code Coverage Audit
```bash
npm run test:unit
```
- Executes Vitest with `@vitest/coverage-v8` coverage reports.

### 8.5 Automated Accessibility (WCAG 2.1 AA) Audit
```bash
npm run test:a11y
```
- Executes Playwright with `@axe-core/playwright` to audit catalog, my-recipes, and meal-planner routes.

### 8.6 End-to-End User Journey Gate
```bash
npm run test:e2e
```
- Runs Playwright browser journeys verifying end-to-end user interactions.

### 8.7 Combined Pre-Commit Validation Hook
```bash
npm run precommit
```
- Executes `npm run lint && npm run typecheck` prior to Git commit creation.

---

## 9. Document Metadata & Attribution

- **Document Version:** `2.0.0`
- **QA Lead & Systems Architect:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Testing Standard:** WCAG 2.1 Level AA, Vitest 4.x, Playwright 1.x
