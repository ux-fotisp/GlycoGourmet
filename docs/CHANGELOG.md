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
* Fixed Strapi v4 authorization failure where GET /api/client-profiles returned 401 Unauthorized for valid JWTs by restoring the missing role relation in the extended users-permissions.user schema.
* [Unreleased / verification pending] Tenant-isolation controller work is in progress; live CI verification remains required before merge.
* [Unreleased / verification pending] Recipe detail GI/GL fix and secondary macro expansion work in progress; pending test verification.