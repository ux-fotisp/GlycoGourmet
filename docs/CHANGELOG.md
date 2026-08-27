# Changelog


### Chunk 15
* CI Strapi runtime boot established
* Live HTTP authentication fixture corrected

## [Unreleased] - Chunks 9-12
- **Security**: Fixed trust boundary by removing localStorage auth fallbacks. Locked down Strapi 
egister and update controllers to prevent client-side role forgery.
- **Tenancy**: Activated true row-level tenant isolation via is-dietitian-owner.js across all 4 clinical entities (ClientProfile, MetabolicTargetCalibration, PrescribedMealPlan, SmartSwapRule).
- **Testing**: Backfilled entity security tests and lifecycle tests. Total passing test count: 271.
- **Metabolic Engine**: Standardized calculateNetCarbs helper usage. Aggregation now fully supports multi-day clinical rollups with carbohydrate-weighted average Glycemic Load (calculateDailyRollup, calculateWeeklyAdherence, pplyServingScale).
- **Housekeeping**: Removed scratch artifacts, unified file structures, and synced architecture docs.

### Chunk 16 (Part A & B)
* Fixed Strapi v4 authorization failure where GET /api/client-profiles returned 401 Unauthorized for valid JWTs by restoring the missing 
ole relation in the extended users-permissions.user schema.
* Fixed a 500 Internal Server Error in the custom clinical entity controllers by correctly bypassing the Koa-level sanitizeQuery validation for manually injected backend relations (dietitian: user.id), opting for manual strapi.service(...).find() calls while preserving secure sanitizeOutput.
* Reconnected the missing single-recipe GI/GL values by ensuring that RecipeDetails.jsx preserves the full ingredient context (with 
utrition) when resolving swaps, so calculateMetabolicProfile receives the data it needs.
* Modified NutritionSnapshot.jsx so secondary macros expand by default (<details open>) with compliant accessible names.
* Added corresponding unit and E2E coverage for NutritionSnapshot rendering and accessibility.
