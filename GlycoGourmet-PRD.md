# GlycoGourmet PRD

## Current Implementation State
- **Auth**: Backend-enforced (no localStorage identity fallback outside VITE_ENABLE_DEMO_AUTH).
- **Tenant Scoping**: Active and integration-tested via is-dietitian-owner policy.
- **Metabolic Engine**: Supports daily and weekly rollups with carbohydrate-weighted Glycemic Load averaging and invariant scaling.
- **Test Coverage**: 271 passing Vitest tests (100% of suite).
