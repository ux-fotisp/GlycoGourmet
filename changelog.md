# 📜 GlycoGourmet — Changelog & Evolution History

> **Semantic Versioning, Release Milestones, and Complete Development Trajectory**  
> *Authored & Maintained by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. Version History Table

| Date | Version | Type | Description | Author |
| :--- | :---: | :---: | :--- | :--- |
| **2026-09-09** | `v2.1.1` | `fix` | **Strapi Client Cold-Start Resilience & Waking UX (PR #43):** Implemented `fetchWithRetry` with exponential backoff (2s -> 5s -> 10s) targeting 502/503/504 and network errors; added `useBackendWakeStatus` observer, `BackendWakingBanner`, and toast integration; expanded Vitest suite to 78 test files / 754 tests. | Fotis Pastrakis |
| **2026-09-09** | `v2.1.0` | `feat` | **MagicPath Design System Sweep & CI Master Trunk Standardization (PRs #31–#42):** Imported MagicPath design system tokens and reconciled glycemic badge contrast (#32); added button/chip gradients and canonical 20px card radius (#33); introduced `StatusChip` (#34), `Breadcrumb` (#35), `SectionHeader` (#36), `.metabolic-card-gradient` (#37), `FilterSummaryCard` (#38), `NetCarbsFilter` / `FitsDailyBudgetChip` (#39), `.sidebar-gradient` (#40), and `VerifiedBadge` (#41); corrected CI workflow triggers from `main` to canonical `master` (#42) with governance exception `EXC-2026-002`. | Fotis Pastrakis |
| **2026-09-06** | `v2.0.1` | `fix` | **Cold-Start Delay & Governance Repair (PR #30):** Distinguished cold-start delays from auth errors; corrected stale evidence ledger SHAs. | Fotis Pastrakis |
| **2026-08-30** | `v2.0.0` | `docs` | **Documentation Consolidation:** Created root architectural suite (`information_architecture.md`, `testing.md`, `backend_dev.md`, `frontend_dev.md`, `agentic.md`, `changelog.md`, `UX.md`, `design.md`) with duplicate-content mapping. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `docs` | **Chunks 9-12 Sync:** Synchronized PRD, Technical Architecture, and Changelog documentation across clinical entities. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `chore` | **Housekeeping:** Removed orphaned CookMode components, obsolete test suites, and cleared temporary scratch scripts. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `test` | **Tenancy Testing:** Added tenant scoping integration tests for `is-dietitian-owner` policy and documented blocking architectural findings. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `feat` | **Metabolic Engine Aggregation:** Standardized `calculateNetCarbs` helper usage; added multi-day clinical rollups (`calculateDailyRollup`, `calculateWeeklyAdherence`, `applyServingScale`) with carbohydrate-weighted average Glycemic Load. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `feat` | **Chunk 8 Polish:** Completed final UI polish, contrast ratio verification, and WCAG 2.1 AA automated compliance. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `test` | **Phase 4 E2E Testing:** Implemented full Playwright browser tests for Draft Lifecycle, Personal Studio, and Admin Publishing flows. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `fix` | **Deployment Hotfix:** Removed UTF-8 Byte Order Mark (BOM) from `netlify.toml` to eliminate Netlify build configuration parsing errors. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `docs` | **API Reference:** Generated comprehensive REST API documentation for Strapi v4/v5 endpoints, query parameters, and JWT payloads. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `feat` | **Role-Differentiated Authoring:** Implemented Strapi draft/publish system, role-gated admin editor, and live draft preview mode (`DraftPreviewBanner`). | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `security` | **Trust Boundary Hardening:** Removed `localStorage` authentication identity fallbacks; locked down Strapi registration and update controllers against client-side role forgery. | Fotis Pastrakis |
| **2026-08-27** | `v1.2.0` | `security` | **Row-Level Tenancy:** Activated `is-dietitian-owner.js` policy across all 4 clinical entities (`ClientProfile`, `MetabolicTargetCalibration`, `PrescribedMealPlan`, `SmartSwapRule`). | Fotis Pastrakis |
| **2026-08-11** | `v1.1.0` | `test` | **US-1.2 to US-3.2 Unit & Integration Suites:** Added comprehensive test coverage for safe day duplication, low-GI swaps, admin dashboard, and Strapi lifecycles (bringing total passing tests to 271). | Fotis Pastrakis |
| **2026-08-11** | `v1.1.0` | `feat` | **Draft Audit Queue (US-2.3):** Implemented side-by-side Dietitian Audit queue highlighting nutritional discrepancies ($|\Delta| > 1.0\text{g}$) with 1-click USDA sync. | Fotis Pastrakis |
| **2026-08-11** | `v1.1.0` | `feat` | **Clinical Features (US-1.2, 2.2, 3.1, 3.2):** Implemented safe day plan duplication, low-GI swap presets, Admin Dashboard metrics, and database anomaly detection lifecycles. | Fotis Pastrakis |
| **2026-08-11** | `v1.1.0` | `feat` | **RBAC & Cognitive Ergonomics:** Implemented RBAC security state machine, dynamic header GL budget gauge, and initial architecture directives. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `security` | **Authentication & Approval Gatekeeper:** Implemented Users-Permissions plugin extension, Google OAuth callback override (`isApproved: false`), and admin approval gate. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `refactor` | **Navigation & Control Center:** Grouped discovery under unified `Recipes` parent node; restructured navigation for 3 primary triad nodes (`Recipes`, `Meal Plans`, `Settings`). | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Content Seeding:** Seeded novel low-GI ingredients and diabetic-friendly master recipes with automated Node.js seeder. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Interactive Drawers & Modals:** Implemented non-blocking `CustomIngredientDrawer` (Flow 2) and predictive `AddToMealPlanModal` (Flow 3) with optimistic budget sync. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `fix` | **Store Offline Resilience:** Restored seed fallback data in `recipeStore` and `ingredientStore` to prevent crashes when Strapi CMS is unreachable. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Metabolic Calculation Engine:** Implemented 5-step deterministic metabolic math engine, thermal starch preparation multipliers ($1.00\times - 1.25\times, 0.85\times$), and `useMetabolicCalculator` hook. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `qa` | **Pre-Deployment QA Audit:** Completed 6-phase pre-deployment QA audit, fixed syntax warnings, and implemented `ConfirmDeleteModal` guard. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Clinical Nutrition Ingestion:** Integrated USDA FoodData Central REST API telemetry, Sydney University GI reference mapping, and database validation scripts. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Recipe Authoring Canvas:** Built split-pane admin editor with session recovery, blank-state initialization, and Strapi CMS persistence locking. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `chore` | **Data Alignment:** Purged legacy static JSON mocks and aligned frontend 100% with Strapi CMS REST schemas. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **Strapi CMS Integration:** Configured native Strapi v4/v5 backend, JWT auth layer, multipart media upload, and draft lifecycle policies. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **OOUX Detail Architecture:** Refactored `RecipeDetail` into OOUX shell with `DetailHero`, Metabolic Bento Grid, `IngredientList`, `InstructionSteps`, `CookModeModal`, and `RecipeObjectBridge`. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `feat` | **OOUX Dashboard Architecture:** Restructured catalog dashboard with `HealthHeader`, `MealPlanGlance`, and dual-badge `RecipeCard` presentation. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `docs` | **Technical Documentation:** Authored initial Technical Architecture and Strapi CMS integration guides. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `docs` | **Clinical Context:** Documented author attribution, metabolic background, and diabetic management problem statement. | Fotis Pastrakis |
| **2026-08-10** | `v1.0.0` | `chore` | **Infrastructure Setup:** Configured Vite build pipeline, SPA single-page routing (`dist/_redirects`), and Netlify CDN deployment settings. | Fotis Pastrakis |

---

## 2. Release Milestone Summaries

### v2.1.1 — Strapi Client Cold-Start Resilience & Waking UX (PR #43)
- **Deterministic Network Resilience:** Implemented `fetchWithRetry` utility wrapping Strapi network calls in `strapiClient.js` / `snappiClient.js`:
  - Maximum 3 attempts with exponential backoff progression (2s -> 5s -> 10s).
  - Target error classification: retries only on network transport failures, fetch timeouts, and HTTP `502 Bad Gateway`, `503 Service Unavailable`, and `504 Gateway Timeout`.
  - Anti-coercion fast-fail: 4xx client errors (400, 401, 403, 404) are never retried and surface immediately to callers.
- **Global Reactive Wake-up State Observer:**
  - `useBackendWakeStatus` hook and pub-sub bus (`subscribeToBackendWakeStatus`) allowing zero-polling UI reactions.
  - Non-blocking `BackendWakingBanner` component (`aria-live="polite"`, dismissible, non-focus-trapping).
  - Toast integration inside `NetworkStatusToast` alerting users during Render free-tier cold starts without disrupting catalog exploration.
- **Forensic Deployment Audit:** Diagnosed Netlify credit freeze and 30–60s Render free-tier spin-up vs ~26s edge proxy timeout.
- **Testing & Verification:** Added 15 Vitest tests across `StrapiColdStartResilience.spec.js` and `BackendWakingUX.spec.jsx`, certifying 100% pass across 78 test files and 754 tests.

### v2.1.0 — MagicPath Design System Import & CI Trunk Alignment (PRs #31–#42)
- **MagicPath Tokens & Contrast Reconciliations (PR #32):**
  - Reconciled chromatic glycemic badge contrast against Grain Ivory canvas (`#D8E8CB` / `#2D5016` low GL, `#FFDBCF` / `#7A4A1E` medium GL, `#FFDAD6` / `#8B1A1A` high GL) satisfying WCAG 2.1 AA/AAA.
- **Button, Chip Gradients & 20px Card Radius (PR #33):**
  - Added `.btn-gradient-primary` (`linear-gradient(135deg, #1A3409 0%, #3D6B1E 100%)`) and `.btn-gradient-destructive` (`linear-gradient(135deg, #7B1818 0%, #B02020 100%)`).
  - Added `.chip-gradient-active` and updated `--radius-card` token to canonical `20px`.
- **New UI Components & Design System Enhancements (PRs #34–#41):**
  - `StatusChip` (#34): 7-state semantic lifecycle indicator (`draft`, `pending`, `published`, `verified`, `archived`, `warning`, `info`).
  - `Breadcrumb` (#35): Accessible hierarchical navigation with custom separator slots.
  - `SectionHeader` (#36): Standardized typography header with action slots.
  - `.metabolic-card-gradient` (#37): Applied to `GlycemicSnapshotCard`.
  - `FilterSummaryCard` (#38): Dynamic filter chip summary with 1-click clear.
  - `NetCarbsFilter` & `FitsDailyBudgetChip` (#39): Granular carbohydrate range controls.
  - `.sidebar-gradient` (#40): Applied to `DesktopNav` navigation rail.
  - `VerifiedBadge` (#41): Certified clinical calculation badge.
- **CI Pipeline Trunk Standardization & Governance Exception (PR #42):**
  - Aligned GitHub Actions workflow triggers in `.github/workflows/production-pipeline.yml` and `.github/workflows/integration-tests.yml` from `main` to canonical `master`.
  - Logged governance exception `EXC-2026-002` in `governance/exceptions/exception-register.yaml`.

### v2.0.0 — Unified Architecture Consolidation
- Unified and deduplicated 9 legacy specifications into 8 canonical root architectural guides:
  1. [information_architecture.md](information_architecture.md): OOUX/ORCA domain model, persona taxonomy, circadian meal segmentation, and preattentive visual feedback.
  2. [testing.md](testing.md): Full 60-test core inventory table, 243-test passing vitest suite summary, fuzzing vectors, and CI gates.
  3. [backend_dev.md](backend_dev.md): Strapi schemas, lifecycles, RBAC state machine, REST API contracts, and operations runbook.
  4. [frontend_dev.md](frontend_dev.md): React 19 architecture, Tailwind CSS v4 `@theme` configuration, metabolic math engine, and state lifecycles.
  5. [agentic.md](agentic.md): Autonomous QA directives (QA-DIRECTIVE-2026), self-healing selectors, and Antigravity orchestration.
  6. [changelog.md](changelog.md): Complete Git commit trajectory and semantic versioning tables.
  7. [UX.md](UX.md): End-to-end customer journey maps, userflows, NN/g usability heuristics, and cognitive ergonomics.
  8. [design.md](design.md): Sage & Grain Design DNA token system, color palettes, typography scales, and 8px grid units.

### v1.2.0 — Tenancy Isolation & Metabolic Rollup Engine
- **Tenant Isolation:** Enforced `is-dietitian-owner.js` row-level security policy across all 4 clinical entities (`ClientProfile`, `MetabolicTargetCalibration`, `PrescribedMealPlan`, `SmartSwapRule`).
- **Security Hardening:** Removed client-side `localStorage` authentication fallbacks; locked down Strapi registration/update endpoints against client role forgery.
- **Rollup Engine:** Expanded metabolic calculations with carbohydrate-weighted average Glycemic Load computation for multi-day rollups (`calculateDailyRollup`, `calculateWeeklyAdherence`, `applyServingScale`).
- **Testing:** Reached 100% test pass rate across 271 Vitest and Playwright test assertions.

### v1.1.0 — Clinical Audit Queue & Admin Controls
- **Audit Queue:** Introduced Dietitian Audit Queue with side-by-side comparison of author-claimed vs USDA engine-calculated macros and automatic 1-click sync.
- **Meal Planning Presets:** Added safe day duplication and low-GI swap presets.
- **Lifecycle Guards:** Enforced positive ingredient weights, non-negative net carbs, and $GL \le 100$ boundary checks before database persistence.

### v1.0.0 — Initial Platform Release
- **Core Architecture:** Decoupled React 19 SPA + Strapi CMS + PostgreSQL + USDA FoodData Central integration.
- **Deterministic Math:** 5-step metabolic engine with thermal starch gelatinization and retrogradation multipliers.
- **OOUX UI:** Action-Oriented Triad (`/#/recipes/all`, `/#/my-recipes`, `/#/meal-plans`), Metabolic Bento Grid, and Hands-free Cook Mode.

---

## 3. Document Metadata & Attribution

- **Document Version:** `2.1.1`
- **Lead Architect & Maintainer:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Repository:** `https://github.com/fotispastrakis/GlycoGourmet`
