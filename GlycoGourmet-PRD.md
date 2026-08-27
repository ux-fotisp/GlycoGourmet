# GlycoGourmet PRD

## Current Implementation State
- **Auth**: Fully backend-enforced (no localStorage identity fallback outside VITE_ENABLE_DEMO_AUTH). Strapi register and update controllers locked down to prevent client-side privilege escalation.
- **Tenant Scoping**: Active and integration-tested via is-dietitian-owner policy and manual Koa service overrides. 100% tenant data isolation guaranteed for ClientProfile, MetabolicTargetCalibration, PrescribedMealPlan, and SmartSwapRule.
- **Metabolic Engine**: Supports daily and weekly rollups with carbohydrate-weighted Glycemic Load averaging and invariant scaling. Single-recipe view preserves GI/GL values.
- **Test Coverage**: >273 passing Vitest tests covering Security, UI components, entity lifecycles, and tenant isolation.
