# GlycoGourmet Platform Roadmap

**Vision:** To establish GlycoGourmet as the definitive, deterministic clinical-grade dietary prescription and metabolic forecasting ecosystem for endocrinology practices and independent registered dietitians.

## Phase 3: Pixel-Perfect UI & MagicPath Alignment (CURRENT)
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
  - `RedirectNudgeCard`: non-punitive, dismissible dietitian-support nudge, gated by a **strict patient-role allow-list** (`user`, `patient`); unknown/missing/administrative/clinical roles fail closed.
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
* **Trust Verification Suite & CI Quality Gate** `[QA / Systems | Dep: Playwright Matrix]`
  - Automated test classes covering audit log immutability, consent gating E2E, PHI wall isolation, notification governance, escalation flows, and non-punitive UI copy linting.
  - **CI Gate 4.5 (`npm run test:trust`):** Automated verification asserting PHI isolation walls and consent gates prior to E2E execution.
* **Documentation Consolidation** `[Systems | Dep: none]`
  - Merge `-v0.2` artifacts (`IA-v0.2.md`, `PRD-v0.2.md`, `frontend-dev-v0.2.md`, `testing-standards-v0.2.md`, `architecture-v0.2.md`) into the canonical docs (`information_architecture.md`, `frontend_dev.md`, `testing.md`, `backend_dev.md`) and append a Section 9 precedence protocol to `agentic.md`.

## Phase 7: Self-Service Recipe Authoring & Nutrition Provenance (NEW)
Gives patients (Fotis) a traceable, deterministic recipe-authoring workflow grounded in verified ingredient data, explicitly distinguishing calculated nutrition estimates from clinical advice. Builds on the existing USDA FoodData Central integration and ingredient registry rather than replacing them.

* **Ingredient Provenance & Nutrition Completeness Foundation** `[Fotis | Dep: Ingredient Registry, USDA Client]`
  - Domain model distinguishing ingredient source state: `internal_verified`, `usda_fooddata_central`, `user_entered`, `needs_review`.
  - Deterministic completeness evaluator (`canCalculateNutrition`, `canCalculateGl`) — never coerces missing nutrition or GI values to zero.
  - Adapters mapping existing master ingredients and USDA import results into the provenance-aware shape without disrupting current recipe rendering.
* **Recipe Builder Ingredient Canvas** `[Fotis | Dep: Provenance Foundation]`
  - Search, add, edit, remove, and reorder ingredients with normalized-unit conversion and visible source/validation badges (Verified database, USDA-sourced, User-entered, Needs review).
* **Deterministic Recipe Nutrition Summary** `[Fotis | Dep: Provenance Foundation]`
  - Per-recipe and per-serving carbohydrate, fiber, net carbohydrate, protein, fat, energy, and carbohydrate-weighted Glycemic Load, with explicit "complete / partial estimate / needs ingredient data" states.
* **Patient-Safe Custom Ingredient Workflow** `[Fotis | Dep: Provenance Foundation]`
  - USDA FoodData Central import path plus a constrained custom-ingredient entry flow; user-entered ingredients are never silently upgraded to "verified."
* **Private Recipe Draft Lifecycle** `[Fotis | Dep: Ingredient Canvas, Nutrition Summary]`
  - Save/resume private drafts with recalculation metadata; optional, non-blocking submission for dietitian review reusing the delivered `RedirectNudgeCard` / `WhyAmISeeingThisPanel` patterns.

## Phase 6: Mobile-First Execution & Offline Resilience
* **PWA Foundation:** Service worker implementation caching Active Plans and the offline deterministic engine.
* **Kitchen & Cart Resilience:** Offline execution of Ambient Cook Mode and Smart Swaps.
* **Clinical Nudge Infrastructure:** Local push notifications tied to bolus timing offsets.
