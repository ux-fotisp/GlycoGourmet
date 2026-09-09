# GlycoGourmet Platform Roadmap

**Vision:** To establish GlycoGourmet as the definitive, deterministic clinical-grade dietary prescription and metabolic forecasting ecosystem for endocrinology practices and independent registered dietitians.

## Phase 3: Pixel-Perfect UI & MagicPath Alignment — COMPLETE
Bridges the gap between functional clinical architecture and a premium, frictionless B2B product experience, adhering strictly to the MagicPath design tokens.
* **Design System Unification:** Application-wide CSS grid/flexbox refactoring mapping to MagicPath spacing, typography, and border radii.
* **Fluid Clinical Micro-Interactions:** Framer Motion/React Spring integrations for 1-click Smart Swap transitions, dynamic daily GL budget gauge fills, and drag-and-drop mechanics.
* **Granular Responsive Scaling:** Ensuring the dense 3-column (Recipe Detail) and interactive matrix layouts degrade gracefully into touch-optimized mobile viewports.

## Phase 4: Predictive Metabolic Analytics (Deterministic & Clinical)
Positions the platform as a high-value, closed-knowledge clinical tool. Completely avoids black-box AI in favor of rigorous, mathematically verifiable forecasting models.
* **Deterministic Glucose Excursion Modeling:** Calculates predicted 2-hour blood glucose curves.
* **Algorithmic Adherence Insights:** Rule-based reporting cross-referencing historical adherence to automatically surface optimal Smart Swaps.
* **Clinical IP Shielding:** Predictive modeling operates purely as B2B clinical decision support.

## Phase 5: Multi-Tenant Clinic Administration & Trust Governance (B2B SaaS)
Transforms the architecture into a scalable, multi-tenant enterprise solution for endocrinology clinics and collaborative dietetic practices.

### 5.1 Core Multi-Tenancy & Infrastructure
* **Extended RBAC Hierarchy:** `ClinicAdmin`, `Dietitian`, `Patient`, and `SuperAdmin` roles with strict tenant scoping.
* **SaaS Billing Infrastructure:** Tiered subscriptions separating independent RDNs from multi-practitioner clinic networks.
* **Practitioner Collaboration:** Secure sharing of custom rules, templates, and meal libraries across a clinic network.

### 5.2 Trust & Growth Governance Backlog (UXartifact_v0.2)
Adapts platform capabilities to real-world private clinic workflows (e.g., Greek dietetic practice), establishing transparent patient trust boundaries, non-punitive re-engagement, and audit defensibility.

#### ✅ Delivered
* **Trust-Integrity UI Foundation** `[PR #11, #12, #13 | Merged to master]`
  - `ConsentRecord` and `AuditLogEntry` append-only stores with unit suites (`consentStore.js`, `auditStore.js`).
  - `ConsentPermissionsDashboard`, `NotificationGovernancePanel`, and 6-section deep-linking `Settings.jsx`.
  - `PHIBoundaryBanner`: persistent, non-dismissible Clinic Admin operational boundary notice.
  - `EscalationFlagControl`: human-in-command escalation of operational suggestions with immutable audit logging, no auto-changes.
  - `WhyAmISeeingThisPanel`: patient-facing, non-algorithmic explainability panel with controlled non-clinical category labels (`care_reminder`, `self_service_nudge`, `promoted_dietitian`).
  - `RedirectNudgeCard`: non-punitive, dismissible dietitian-support nudge, gated by a **strict patient-role allow-list** (`user`, `patient`); unknown/missing/administrative/clinical roles fail closed. Extended in Phase 7 / Chunk 5 with a backwards-compatible `actionLabel` prop for context-specific call-to-action copy.
* **Clinic Intake Pipeline Board** `[PR #14 | Merged to master]`
  - `IntakePipelineBoard` and `IntakeLeadCard`: 6-stage lifecycle (`Inquiry` → `Contacted` → `Intake Sent` → `Scheduled` → `Active` → `Lapsed`) with explicit, keyboard-accessible stage controls (no drag-and-drop, no auto-advance).
  - De-identified operational data model (`intakeStore.js`) using neutral reference codes (e.g. `INT-1011`); zero patient identifiers or clinical telemetry in store, UI, or audit logs.
  - Two-tier service delivery (`FULL_CARE` vs. `ONLINE_SESSION_ONLY`) with distinct filters and metrics.
  - Manual, non-algorithmic dietitian assignment from the clinic roster; append-only audit entries (`intake_stage_changed`, `dietitian_assigned`, `intake_service_tier_changed`).
  - Neutral operational metrics only (total/open/scheduled/active, tier distribution) — no conversion-rate or growth-pressure metrics.

#### 🔜 Remaining Backlog
* **Referral Source Tracker** `[Konstantina | Dep: Intake Pipeline (delivered)]`
  - `ReferralSourceTracker`: attribution reporting over the existing de-identified intake lead model (GP referral, ad campaign, self-service redirect, walk-in, patient referral). Reuses `intakeStore.js` records; no new PII or clinical fields.
* **Two-Tier Service Delivery & Session Request Queue** `[Konstantina / Ivana | Dep: Intake Pipeline (delivered)]`
  - Dedicated `SessionRequestQueue` for ad-hoc `online_session_only` consultation triage, kept structurally separate from the Full Care client roster.
* **Curated Dietitian Directory (Non-Algorithmic)** `[Konstantina / Ivana | Dep: Dietitian Schema]`
  - Directory component (`DietitianDirectory`) with clinical specialty filtering (`specialties[]`: diabetes, lipids, renal, GDM) and capacity indicators—strictly directory filtering, no black-box algorithmic matching.
* **Promoted Dietitian Governance & Transparency** `[Konstantina / Fotis | Dep: NotificationPreference (delivered)]`
  - Transparently labeled promotion cards (`PromotedDietitianCard`, `PromotionConfigPanel`) accompanied by the delivered `WhyAmISeeingThisPanel` explanation panel and opt-out controls.
* **Trust & Governance Data Architecture (Backend Persistence)** `[Konstantina / Fotis | Dep: Strapi CMS]`
  - Migrate the currently local/browser-store trust and operational domains (`ConsentRecord`, `AuditLogEntry`, `NotificationPreference`, `ReferralLead`/intake records) into isolated Strapi content types and policies, physically separated from clinical telemetry tables.
  - Policy enforcement via `is-clinic-admin-owner.js` and strict exclusion from the HL7 FHIR export pipeline (`exportFHIRMetabolicTelemetry`).
  - **Known limitation surfaced during Phase 7 / Chunk 4:** the existing `ingredientStore.js` custom-ingredient collection (`saveCustomIngredient` / `getCustomIngredients`) has no per-user ownership scoping — custom ingredients are visible catalog-wide to all users, not private to their creator. Any future ownership-scoping work on `ingredientStore.js` should be evaluated alongside this backend persistence effort.
* **Trust Verification Suite & CI Quality Gate** `[QA / Systems | Dep: Playwright Matrix]`
  - Automated test classes covering audit log immutability, consent gating E2E, PHI wall isolation, notification governance, escalation flows, and non-punitive UI copy linting.
  - **CI Gate 4.5 (`npm run test:trust`):** Automated verification asserting PHI isolation walls and consent gates prior to E2E execution.
* **Documentation Consolidation** `[Systems | Dep: none]`
  - Merge `-v0.2` artifacts (`IA-v0.2.md`, `PRD-v0.2.md`, `frontend-dev-v0.2.md`, `testing-standards-v0.2.md`, `architecture-v0.2.md`) into the canonical docs (`information_architecture.md`, `frontend_dev.md`, `testing.md`, `backend_dev.md`) and append a Section 9 precedence protocol to `agentic.md`.

## Phase 7: Self-Service Recipe Authoring & Nutrition Provenance — ✅ COMPLETE
Gives patients (Fotis) a traceable, deterministic recipe-authoring workflow grounded in verified ingredient data, explicitly distinguishing calculated nutrition estimates from clinical advice. Built on the existing USDA FoodData Central integration and ingredient registry rather than replacing them. All five chunks are merged to `master`.

#### ✅ Delivered
* **Chunk 1 — Ingredient Provenance & Nutrition Completeness Foundation** `[Fotis | PR #15 | Merged]`
  - Centralized provenance vocabulary: `internal_verified`, `usda_fooddata_central`, `user_entered`, `needs_review`.
  - Centralized GI evidence states: `available`, `unavailable`, `not_applicable`, `needs_review`.
  - Pure deterministic completeness evaluator (`provenanceEvaluator.js`): missing nutrition never coerced to zero; missing GI on carbohydrate contributors never coerced to zero — status is `estimated`, not fabricated as `complete`.
  - Adapters (`provenanceAdapters.js`) mapping internal, USDA, custom, and legacy ingredient shapes into `ProvenanceReadyRecipeIngredientLine` without disrupting existing recipe rendering.
  - Volume/count unit conversion requires explicit ingredient-specific `densityGPerMl`/`pieceWeightG`; never defaults to a guessed density or piece weight.
  - Deterministic, non-time-based line identity; no `Date.now()`/`Math.random()` inside adapters.
* **Chunk 2 — Recipe Builder Ingredient Canvas** `[Fotis | PR #16 | Merged]`
  - `RecipeIngredientCanvas.jsx`, `IngredientCanvasRow.jsx`, `IngredientAddModal.jsx`: add/edit/remove/reorder recipe ingredient lines with explicit, accessible "Move up"/"Move down"/"Remove" controls (no drag-and-drop).
  - Truthful per-line provenance badges ("Verified database", "USDA-sourced", "User-entered", "Needs review") and incomplete-conversion warnings — zero fabricated grams.
  - Multi-source Add Ingredient modal: verified catalog search, live USDA FoodData Central search, and a strictly **read-only** existing-custom-ingredients tab (creation deferred to Chunk 4).
  - Dual-format serialization in `AdminEditor.jsx` save handlers preserves full backwards compatibility with the legacy `ingredientId`/`amount`/`unit`/`prepState` recipe-line shape.
* **Chunk 3 — Recipe Nutrition Summary** `[Fotis | PR #17 | Merged]`
  - `RecipeNutritionSummary.jsx`: truthful per-recipe and per-serving nutrition and Glycemic Load summary with three honest completeness states — `complete`, `estimated` (GL unavailable, never fabricated as 0), and `incomplete` (macros show `--`, never a fabricated number).
  - Dual-scope scaling (Per Serving / Full Recipe Total) and carbohydrate-weighted GI reused from the existing `getGlycemicLoadCategory()` categorization — no invented category labels.
  - Thermal `prepState` multipliers (`PREP_STATES` from `nutritionCalculator.js`) correctly applied to aggregate GI/GL.
* **Chunk 4 — Patient-Safe Custom Ingredient Creation** `[Fotis | PR #18 | Merged]`
  - `CustomIngredientFormModal.jsx`: accessible creation form for the required core macronutrients (energy, carbohydrate, fiber, protein, fat); Glycemic Index is optional and never coerced to 0 when omitted.
  - Mass-only default units (`g`, `oz`, `kg`, `lb`) at creation time — avoids the volume/count density-fabrication problem entirely for new custom ingredients.
  - Anti-upgrade invariant enforced: `isUserAuthored: true` permanently yields `source: 'user_entered'`, never `'internal_verified'`.
  - Honest data-scope disclaimer reflecting private user-scoped account storage (updated in PR #22 from the previous catalog-wide disclosure to truthful private account guarantee).
* **Chunk 5 — Private Recipe Draft Lifecycle** `[Fotis | PR #19 | Merged]`
  - Voluntary, non-punitive dietitian-review nudge in `AdminEditor.jsx` reusing the delivered `RedirectNudgeCard`/`WhyAmISeeingThisPanel` components, surfaced only when a recipe contains user-entered ingredients or estimated glycemic values.
  - Dismissing the nudge ("Keep managing my plan") never disables or gates Save Draft, Submit for Review, or Publish controls.
  - Client-side `RecipeRecalculationMetadata` snapshot (`evaluatedAt`, `completenessStatus`, `canCalculateGl`, `canCalculateNutrition`, missing-line counts) attached on save — no Strapi schema change; completeness is always freshly recalculated on load regardless of whether the historical snapshot persists.
  - Draft persistence (Strapi `status: 'draft'`), browser-session auto-save/restore (`sessionStorage`), and voluntary submission to `status: 'pending_review'` were confirmed to already exist and were hardened/integrated rather than rebuilt.

## Phase 6: Mobile-First Execution & Offline Resilience
* **PWA Foundation:** Service worker implementation caching Active Plans and the offline deterministic engine.
* **Kitchen & Cart Resilience:** Offline execution of Ambient Cook Mode and Smart Swaps.
* **Clinical Nudge Infrastructure:** Local push notifications tied to bolus timing offsets.

## Phase 8: MagicPath Design DNA, CI Trunk Standardization & Cold-Start Resilience — ✅ COMPLETE
Imports the full Google Stitch MagicPath clinical design system, standardizes CI/CD pipelines across the repository trunk, and hardens client-side network resilience against cloud-tier cold starts.

#### ✅ Delivered
* **Chunk 1 — MagicPath Design System Tokens & Badges** `[Fotis | PR #32, #33 | Merged]`
  - Reconciled chromatic glycemic badge container and text colors with Grain Ivory canvas (`#D8E8CB` / `#2D5016` low GL, `#FFDBCF` / `#7A4A1E` medium GL, `#FFDAD6` / `#8B1A1A` high GL) exceeding WCAG 2.1 AA/AAA.
  - Standardized `.btn-gradient-primary`, `.btn-gradient-destructive`, `.chip-gradient-active`, and canonical `--radius-card: 20px`.
* **Chunk 2 — Design System Component Suite** `[Fotis | PRs #34–#41 | Merged]`
  - New UI atoms: `StatusChip.jsx` (7-state semantic indicator), `Breadcrumb.jsx` (accessible navigation trail), `SectionHeader.jsx` (title and actions slot), `VerifiedBadge.jsx` (deterministic verification seal).
  - Surface gradients: `.metabolic-card-gradient` (`GlycemicSnapshotCard.jsx`) and `.sidebar-gradient` (`DesktopNav.jsx`).
  - Filtering suite: `FilterSummaryCard.jsx`, `NetCarbsFilter.jsx`, and `FitsDailyBudgetChip.jsx`.
* **Chunk 3 — CI Pipeline Trunk Alignment & Governance Exception** `[Fotis | PR #42 | Merged]`
  - Corrected pipeline workflow triggers (`production-pipeline.yml` and `integration-tests.yml`) to canonical `master`.
  - Logged governance exception `EXC-2026-002` in `governance/exceptions/exception-register.yaml`.
* **Chunk 4 — Strapi Client Cold-Start Resilience & Waking UX** `[Fotis | PR #43 | Opened / Certified]`
  - Added `fetchWithRetry` in `strapiClient.js` with 3 attempts and exponential backoff (2s -> 5s -> 10s), retrying 502/503/504 and network drops while fast-failing on 4xx.
  - Implemented `useBackendWakeStatus` reactive hook, `BackendWakingBanner`, and toast integration.
  - Expanded Vitest test suite to 78 test files and 754 tests.
