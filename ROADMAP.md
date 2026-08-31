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

* **Clinic Admin Workflow & Referral Tracking** `[Konstantina | Dep: RBAC Hierarchy]`
  - Intake pipeline board (`IntakePipelineBoard`) tracking lead sources (`ReferralSourceTracker`: GP referral, ad campaign, self-service redirect, walk-in, patient referral).
  - Funnel conversion analytics, clinic-level capacity balancing, and intake status management.
* **Self-Service Failure Detection & Non-Punitive Redirect** `[Fotis | Dep: Adherence Engine]`
  - Detection of consecutive non-logging days or adherence drops triggering a soft, reversible redirect nudge card (`RedirectNudgeCard`) connecting patients to professional dietitian support.
* **Two-Tier Service Delivery & Session Request Queue** `[Konstantina / Ivana | Dep: Intake Pipeline]`
  - Explicit care tier segmentation (`full_care` vs. `online_session_only`) paired with a dedicated session request queue (`SessionRequestQueue`) for ad-hoc consultation triage.
* **Curated Dietitian Directory (Non-Algorithmic)** `[Konstantina / Ivana | Dep: Dietitian Schema]`
  - Directory component (`DietitianDirectory`) with clinical specialty filtering (`specialties[]`: diabetes, lipids, renal, GDM) and capacity indicators—strictly directory filtering, no black-box algorithmic matching.
* **Promoted Dietitian Governance & Transparency** `[Konstantina / Fotis | Dep: NotificationPreference]`
  - Transparently labeled promotion cards (`PromotedDietitianCard`, `PromotionConfigPanel`) accompanied by a "Why Am I Seeing This?" explanation panel (`WhyAmISeeingThisPanel`) and opt-out controls.
* **Granular Notification Governance** `[Fotis | Dep: PWA Engine]`
  - Independent category toggles for clinical care reminders vs. promoted updates (`NotificationGovernancePanel`, `OptInToggle`) with quiet hours and frequency cap enforcement.
* **Trust & Governance Data Architecture** `[Konstantina / Fotis | Dep: Strapi CMS]`
  - Non-clinical schema namespace physically isolated from clinical telemetry tables:
    - `ConsentRecord`: Granular scope (`adherence_history`), versioned scope changes, and expiration tracking.
    - `AuditLogEntry`: Append-only immutable log recording administrative suggestions vs. final actions.
    - `NotificationPreference`: Independent category states and frequency caps.
    - `ReferralLead`: Lead lifecycle entity with stage tracking and dietitian assignment.
  - Policy enforcement via `is-clinic-admin-owner.js` and strict exclusion from the HL7 FHIR export pipeline (`exportFHIRMetabolicTelemetry`).
* **UI Component Ecosystem** `[All Personas | Dep: Design DNA]`
  - Specialized trust and administration components: `KonstantinaView`, `WhyAmISeeingThisPanel`, `ConsentPermissionsDashboard`, `PHIBoundaryBanner`, `EscalationFlagControl`, `ConsentStatusBadge`, `RedirectNudgeCard`, `NotificationGovernancePanel`, `ReferralSourceTracker`, `IntakePipelineBoard`, `SessionRequestQueue`, `DietitianDirectory`, `PromotionConfigPanel`, `AuditLogViewer`.
* **Trust Verification Suite & CI Quality Gate** `[QA / Systems | Dep: Playwright Matrix]`
  - Automated test classes covering audit log immutability, consent gating E2E, PHI wall isolation, notification governance, escalation flows, and non-punitive UI copy linting.
  - **CI Gate 4.5 (`npm run test:trust`):** Automated verification asserting PHI isolation walls and consent gates prior to E2E execution.

## Phase 6: Mobile-First Execution & Offline Resilience
* **PWA Foundation:** Service worker implementation caching Active Plans and the offline deterministic engine.
* **Kitchen & Cart Resilience:** Offline execution of Ambient Cook Mode and Smart Swaps.
* **Clinical Nudge Infrastructure:** Local push notifications tied to bolus timing offsets.
