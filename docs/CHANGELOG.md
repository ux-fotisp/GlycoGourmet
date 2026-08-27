# Changelog

## [Unreleased] - Chunks 9-12
- **Security**: Fixed trust boundary by removing localStorage auth fallbacks. Locked down Strapi 
egister and update controllers to prevent client-side role forgery.
- **Tenancy**: Activated true row-level tenant isolation via is-dietitian-owner.js across all 4 clinical entities (ClientProfile, MetabolicTargetCalibration, PrescribedMealPlan, SmartSwapRule).
- **Testing**: Backfilled entity security tests and lifecycle tests. Total passing test count: 271.
- **Metabolic Engine**: Standardized calculateNetCarbs helper usage. Aggregation now fully supports multi-day clinical rollups with carbohydrate-weighted average Glycemic Load (calculateDailyRollup, calculateWeeklyAdherence, pplyServingScale).
- **Housekeeping**: Removed scratch artifacts, unified file structures, and synced architecture docs.
