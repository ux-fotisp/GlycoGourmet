# Changelog


### Chunk 15
* CI Strapi runtime boot established
* Live HTTP authentication fixture corrected

## [Unreleased] - Chunks 9-12
- **Security**: Fixed trust boundary by removing localStorage auth fallbacks. Locked down Strapi 
egister and update controllers to prevent client-side role forgery.
- **Tenancy**: Activated true row-level tenant isolation via is-dietitian-owner.js across all 4 clinical entities (ClientProfile, MetabolicTargetCalibration, PrescribedMealPlan, SmartSwapRule).
- **Testing**: Backfilled entity security tests and lifecycle tests. Total passing test count: 271.
- **Metabolic Engine**: Standardized calculateNetCarbs helper usage. Aggregation now fully supports multi-day clinical rollups with carbohydrate-weighted average Glycemic Load (calculateDailyRollup, calculateWeeklyAdherence, applyServingScale).
- **Housekeeping**: Removed scratch artifacts, unified file structures, and synced architecture docs.

### Chunk 16 (Part A & B) — Tenant Isolation Authorization & Scoping Verification (VERIFIED)
* **Auth & Role Schema Fix (401 Resolution):** Restored the native `role` manyToOne relation in `server/src/extensions/users-permissions/content-types/user/schema.json`. Without this relation definition, Strapi dropped the role relation in the DB schema on boot, causing Strapi's authentication middleware to return 401 Unauthorized when validating valid JWTs against users with null roles.
* **Tenant Isolation Controller Pattern (500 Resolution):** Implemented the canonical Strapi v4 controller override pattern across all 4 clinical entities (`client-profile`, `metabolic-target-calibration`, `prescribed-meal-plan`, `smart-swap-rule`):
  1. `await this.validateQuery(ctx)` and `await this.sanitizeQuery(ctx)`
  2. Server-side injection of `dietitian: user.id` filter for dietitian roles
  3. Query execution via `strapi.entityService.findMany` / `findOne`
  4. Output sanitization via `this.sanitizeOutput(entities, ctx)`
  5. Response transformation via `this.transformResponse(sanitizedEntities)`
* **End-to-End CI Verification:** Verified passing on GitHub Actions (runs 33079017457 and 33079705050). The live integration test (`tests/integration/TenantScopingIntegration.spec.js`) boots a real Strapi v4.25.4 instance and confirms:
  - Dietitian B authenticates via `/api/auth/local` and obtains a valid JWT
  - `GET /api/client-profiles` returns HTTP 200 with 0 records (Dietitian A's profiles are completely hidden)
  - Dietitian A receives HTTP 200 with their own profile records
  - Admin user receives HTTP 200 with full cross-tenant visibility
  - Patient user is rejected with HTTP 403/401
* **Recipe Detail Metabolic Display:** Fixed `RecipeDetails.jsx` so `resolvedIngredients` retains full ingredient reference (`ingredient: ing`), enabling `calculateMetabolicProfile` and `applyServingScale` to calculate exact GL and GI values. Kept secondary macros accessible via `<details open>` with accessible 48px touch targets in `NutritionSnapshot.jsx`.
* **Test Suite Alignment:** Updated unit tests (`TenantScopingController.spec.js`, `NutritionSnapshot.spec.jsx`) and E2E test (`metabolicJourneys.spec.ts`) to conform to backend-truth auth models and semantic role/text locators. Local Vitest suite: 271 unit tests passing.