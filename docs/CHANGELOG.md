# Changelog

All notable changes to GlycoGourmet will be documented in this file.

## [Phase 4: Security Hardening & CI Verification] — Chunks 9–17
- **Authentication Modernization**: Removed insecure localStorage identity fallbacks. Frontend now strictly relies on /api/users/me JWT backend-truth verification.
- **Server-Side Privilege Protection**: Locked down Strapi 
egister and update controllers to systematically strip privileged fields (
oleType, isApproved, clientIds, licenseId) from incoming payloads, preventing client-side forgery.
- **Role Relation Schema Fix (401 Resolution)**: Restored the native 
ole manyToOne relation in users-permissions schema extension, ensuring valid JWTs are correctly authorized without throwing 401s.
- **Tenant Isolation (500 Resolution)**: Enforced strict row-level scoping across clinical entities (client-profile, metabolic-target-calibration, prescribed-meal-plan, smart-swap-rule) using a canonical Strapi v4 override pattern (alidateQuery -> sanitizeQuery -> server-side dietitian filter -> entityService -> sanitizeOutput).
- **Live CI Integration Testing**: Built a GitHub Actions pipeline that boots a live Strapi v4.25.4 instance, seeds SQLite test data, and runs real E2E cross-tenant isolation assertions (verified green in GitHub Actions runs 33101524223 and 33102014459).
- **Single-Recipe Metabolic Display (Chunk 17)**: Connected the deterministic metabolic engine output directly to RecipeDetails.jsx. 
  - GI/GL values now accurately reflect scaled ingredients.
  - Rendered explicit portion scaling labels (per 1x serving) in NutritionSnapshot.
  - Expanded secondary macros natively (<details open>) with an accessible 48px hit target, providing Calories, Total Carbohydrates, Protein, and Total Fat. Missing fields predictably display —.
- **E2E & Unit Test Upgrades**: Modernized the E2E suite (metabolicJourneys.spec.ts) with strict backend JWT injection and semantic accessible locators. Currently 271 passing unit tests and 1 passing multi-tenant integration suite.

## [Phase 3: Recipe Lifecycle, Planning & Audits]
- **Recipe Lifecycle Gating**: Implemented Draft/Public status mechanisms and preview modes. 
- **Dietitian Audit Queue**: Implemented discrepancy flags when author inputs deviate from the deterministic calculation engine (e.g. deltaGL > 1.0 or deltaNetCarbs > 1.0g).
- **Plan Functions & Presets**: Enabled safe meal plan duplication across the 7-day calendar scheduler, tracking daily GL adherence targets.
- **Smart Low-GI Swaps**: Automatically detects high-GI staples and pairs them with clinical low-GI alternatives, dynamically recalculating the recipe's metabolic profile without page reloads.

## [Phase 2: Deterministic Engine & USDA Integration]
- **Metabolic Engine (metabolicEngine.ts)**: Built a pure (1)$ math engine decoupled from UI state, evaluating Glycemic Load via carbohydrate-weighted GI interpolation and zero-division protections.
- **Thermal Preparation Multipliers**: Enforced scientifically backed GI modifiers for preparation states (e.g., roasted, cooled, mashed).
- **USDA FoodData Central Ingestion**: Implemented foundation for live nutrient data fetching and normalization into the engine's core schema.

## [Phase 1: Original Platform & Design System]
- **OOUX-Driven Information Architecture**: Designed the progressive disclosure bento-grid (NutritionSnapshot) and deep green visual token system (#1B3B22 to #386A20).
- **WCAG 2.1 AA Compliance**: Standardized ARIA schemas, min-h-[48px] interactive touch targets, and high-contrast color pairings.
- **Strapi CMS Bootstrapping**: Scaffolded the underlying headless CMS capabilities and headless schema mapping.
