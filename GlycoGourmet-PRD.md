# GlycoGourmet PRD

## Current Implementation State
- **Auth**: Fully backend-enforced (no localStorage identity fallback outside VITE_ENABLE_DEMO_AUTH). Strapi register and update controllers locked down to prevent client-side privilege escalation.
- **Tenant Scoping**: Active and integration-tested via is-dietitian-owner policy and manual Koa service overrides. Tenant-isolation controller work is in progress; live CI verification remains required before merge.
- **Metabolic Engine**: Supports daily and weekly rollups with carbohydrate-weighted Glycemic Load averaging and invariant scaling. 
- **Test Coverage**: Test count pending final CI verification.
