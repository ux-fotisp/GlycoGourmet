# GlycoGourmet — Information Architecture (v0.2)
*Incorporates UXartifact_v0.2 persona and data-flow boundaries (Updated with Gap-Closure Chunks 1–3).*

## 1. Persona / Role Hierarchy

### 1.1 Built (PR #14, PR #20, PR #21)

- **Patient / Client** — consumes meal plans, self-service tools (Recipe Studio, Meal Scheduler), views own metabolic telemetry, manages consent grants and notification governance.
- **Clinical Dietitian** — creates/audits recipes, builds plans, manages assigned client roster, full PHI access for own clients.
- **Clinic Administrator** — non-clinical organizational persona. Scope: intake pipeline, referral tracking, tier assignment, seat management, operational audit review. **Explicit non-scope:** zero visibility into glucose logs, GL targets, or clinical notes. Enforced visibly via persistent `PHIBoundaryBanner` and structurally via `server/src/policies/is-clinic-admin.js` with `FORBIDDEN_CLINICAL_UIDS`.
- **Platform Reviewer / System Admin** — audits Draft recipe queue, manages platform-wide publishing states and global user approval.

## 2. Site / App Map

### 2.1 Built

- `/#/dashboard` (Patient) → `MealPlanGlance`, Recipe browsing, `PlanBuilder` (self-service).
- `/#/clinic/dashboard` (Clinic Admin/Admin) → tenant seat management, dietitian roster, embedded `PHIBoundaryBanner`.
- `/#/clinic/intake` (Clinic Admin) → 6-stage `IntakePipelineBoard` (Inquiry → Contacted → Intake Sent → Scheduled → Active → Lapsed).
- `/#/clinic/library` (Dietitian/Clinic Admin) → shared institutional recipe and meal-plan library.
- `/#/dietitian/clients` (Dietitian/Admin) → `ClientRoster.jsx`, tenant-scoped via `is-dietitian-owner.js`.
- `/#/recipe/:id` → `RecipeDetails.jsx`, Draft/Public states, `DraftPreviewBanner`.
- `/#/settings/consent` (Patient) → `ConsentPermissionsDashboard` (grant list, one-click revoke action).
- `/#/settings/notifications` (Patient) → `NotificationGovernancePanel` (split toggles: care reminders vs. promoted-dietitians, quiet hours, frequency caps).

### 2.2 Remaining Backlog

- `/#/clinic/sessions` → Session Request queue (Tier B, online-session-only).
- `/#/clinic/directory` → curated, filterable dietitian directory (specialty, capacity) — non-algorithmic.
- `/#/clinic/promotions` → promoted-dietitian configuration panel, criteria-logged.

## 3. Data Flow Boundaries

### 3.1 Built & Enforced

- **Clinical Telemetry Flow**: Patient metrics → Dietitian view → `exportFHIRMetabolicTelemetry` → external EMR (downloadable JSON bridge only).
- **Tenant Isolation**: Row-level tenancy enforced via `is-dietitian-owner.js` (clinical records) and `api::clinic` controller scoping.
- **Consent Layer**: Sits between Patient and Clinic nodes (`api::consent-record`). Lifecycle: Granted → Active → Revoked/Expired. Cross-boundary intake redirects require active consent; scope allow-list defense-in-depth blocks telemetry leakage.
- **PHI Boundary Wall for Clinic Admin**: `clinic_admin` is structurally blocked from clinical telemetry endpoints via `is-clinic-admin.js` (`FORBIDDEN_CLINICAL_UIDS`). Only de-identified reference codes and consent status badges cross into administrative views.
- **Notification Governance Branch**: Split independent branches (`care_reminders` vs. `promoted_dietitians`) with separate quiet hours and frequency caps (`api::notification-preference`).

## 4. Content States

### 4.1 Built

- Recipe: Draft (Not Public) → Audit Queue → Public.
- Intake Lead: Inquiry → Contacted → Intake Sent → Scheduled → Active → Lapsed (persisted to `api::intake-lead`).
- Consent Record: Granted → Active → Revoked/Expired (versioned '2.1'; persisted to `api::consent-record`).
- Custom Ingredient: Private (`isUserAuthored: true`, scoped to `owner`, default-deny read access).

### 4.2 Remaining Backlog

- Dietitian Profile: Draft → Published (portfolio built from published recipes, specialty taxonomy attached).
