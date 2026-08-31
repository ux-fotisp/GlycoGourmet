# GlycoGourmet — Information Architecture (v0.2)
*Incorporates UXartifact_v0.2 persona and data-flow boundaries.*

## 1. Persona / Role Hierarchy

### 1.1 Built

- **Patient / Client** — consumes meal plans, self-service tools (Recipe Studio, Meal Scheduler), views own metabolic telemetry.
- **Clinical Dietitian** — creates/audits recipes, builds plans, manages assigned client roster, full PHI access for own clients.
- **Platform Reviewer / System Admin** — audits Draft recipe queue, manages platform-wide publishing states.

### 1.2 Dream

- **Clinic Administrator** — new fourth persona. Scope: intake, referral tracking, tier assignment, dietitian directory curation, promotion configuration. **Explicit non-scope:** no visibility into glucose logs, GL targets, or any clinical note content. This boundary must be an IA-level wall, not just a backend permission check — enforced visibly via a persistent UI indicator on `ClinicDashboard.jsx`.

## 2. Site / App Map

### 2.1 Built

- `/#/dashboard` (Patient) → `MealPlanGlance`, Recipe browsing, `PlanBuilder` (self-service).
- `/#/clinic/dashboard` (Dietitian/Admin) → dietitian roster, invite flow.
- `/#/clinic/library` → shared institutional recipe/meal-plan library.
- `/#/dietitian/clients` → `ClientRoster.jsx`, gated Dietitian/Admin.
- `/#/recipe/:id` → `RecipeDetails.jsx`, Draft/Public states, `DraftPreviewBanner`.

### 2.2 Dream

- `/#/clinic/intake` → Referral Source Tracker + Intake Pipeline (Kanban stages).
- `/#/clinic/sessions` → Session Request queue (Tier B, online-only).
- `/#/clinic/directory` → curated, filterable dietitian directory (specialty, capacity) — explicitly NOT a swipe/match UI.
- `/#/clinic/promotions` → promoted-dietitian configuration panel, criteria-logged.
- `/#/settings/consent` → Patient-facing Permissions/Consent Dashboard (grant list, revoke action).
- `/#/settings/notifications` → split toggle panel: care reminders vs. promoted-dietitian nudges.

## 3. Data Flow Boundaries

### 3.1 Built

- Clinical telemetry flows one-way: Patient metrics → Dietitian view → `exportFHIRMetabolicTelemetry` → external EMR (downloadable JSON bridge only, no live API yet).
- Tenant isolation enforced server-side via `is-dietitian-owner.js` — dietitians only see their own assigned clients.

### 3.2 Dream

- **Consent Layer** (new IA node): sits between Patient and Dietitian/Clinic nodes. Lifecycle: Grant → Active → Revoked/Expired. Every cross-boundary data flow (e.g., self-service adherence data reaching Konstantina's intake queue) must pass through this layer, not bypass it.
- **PHI Boundary Wall for Clinic Admin**: Konstantina's IA branch (intake/assignment/promotion) must architecturally never intersect the clinical telemetry branch. Only a consent-status badge (boolean-like: "Consented v2.1") crosses the wall — no raw clinical values.
- **Notification Governance Branch**: currently a single "notifications" leaf; must split into two independently configurable branches (care reminders, promoted-dietitian) with separate frequency caps and quiet hours.
- **Session Request Pipeline**: parallel, lighter-weight IA branch to the full Client Roster — different retention rules (one-time engagement vs. ongoing).

## 4. Content States

### 4.1 Built

- Recipe: Draft (Not Public) → Audit Queue → Public.

### 4.2 Dream

- Dietitian Profile: Draft → Published (portfolio built from published recipes, specialty taxonomy attached).
- Referral Lead: Inquiry → Contacted → Intake Sent → Scheduled → Active → Lapsed.
- Consent: Granted → Active → Revoked/Expired (versioned; scope change triggers re-consent).
