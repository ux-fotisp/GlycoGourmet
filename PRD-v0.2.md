# GlycoGourmet — Product Requirements Document (v0.2)
*Supersedes v0.1 baseline (Chunks 1–8). Incorporates UXartifact_v0.2 trust-hardening model.*

## 1. Product Vision & Value Proposition

**Core Problem:** Bridging the gap between clinical dietary requirements (e.g., glycemic load management) and practical, day-to-day patient meal planning.

**Value Proposition:** A medically accurate, HL7 FHIR-compliant dietary planning engine that tracks metabolic telemetry (carbohydrates and Glycemic Load) while generating practical outputs like grocery manifests and recipe swaps — and, as of v0.2, a trust-auditable growth and referral layer connecting self-managing patients to dietitians without algorithmic matching or punitive framing.

## 2. Target Audience (Three Personas — Updated)

| Persona | Role | Status |
|---|---|---|
| Patient / Client (e.g., "Fotis" persona) | End-user consuming plans, self-managing or dietitian-assisted | ✅ Built |
| Clinical Dietitian ("Ivana" persona) | Creator, planner, auditor of clinical content | ✅ Built |
| Clinic Administrator ("Konstantina" persona) | Growth, intake, assignment, promotion — non-clinical | 🌱 Dream (not yet a distinct role in RBAC) |

## 3. Feature Scope

### 3.1 Built (Chunks 1–8, Fully Resolved)

- Metabolic Engine: cumulative daily Glycemic Load (GL) and macro calculation with dynamic serving multipliers.
- Dietitian Toolkit: `ClientOnboardingWizard`, `ClientCalibrationDrawer`, Smart Swap Rule Editor.
- Clinical Export Pipeline: `generateGroceryManifest`, `generateClinicalSummaryReport`, `exportFHIRMetabolicTelemetry` — all HL7 FHIR/LOINC compliant.
- Recipe & Plan Management: Draft/Public recipe states, `PlanBuilder` canvas, dietary audit queue.
- Notification infrastructure: `notificationEngine.ts` (bolus reminder scheduling), `NotificationOptIn.jsx` (patient opt-in card).
- WCAG 2.1 AA compliance across all modals/drawers (Escape-to-close, `role="dialog"`, `aria-modal="true"`).
- CI/CD: 254 Vitest unit tests, full Playwright E2E suite, Oxlint + `tsc --noEmit` gates, all green.

### 3.2 Dream (Phase 2 — UXartifact_v0.2 Scope, Not Yet Built)

- **Clinic Admin role & dashboard growth tools**: referral source tracking, intake pipeline (Kanban: Inquiry → Contacted → Intake Sent → Scheduled → Active → Lapsed), funnel analytics.
- **Self-Service Failure Detection & Redirect**: passive risk scoring off existing adherence/excursion signals, non-punitive in-app nudge, opt-in handoff to Konstantina's intake queue.
- **Two-Tier Service Model**: Tier A (Full Care, ongoing) vs. Tier B (Online-Session-Only, lower fee, one-time tailored plan) — new `Session Request` queue separate from the full-care roster.
- **Curated Dietitian Directory (not matching)**: `specialties[]` taxonomy (diabetes, cholesterol/lipid, renal, GDM, etc.), filterable/sortable listing, dietitian public profile built from published recipes as portfolio.
- **Promoted Dietitian Notifications**: editorially-controlled, criteria-logged, transparently labeled ("Clinic-recommended"), gated behind `CLINIC_PRO` tier.
- **Meal-Timing Reminders**: new notification type extending `notificationEngine.ts` beyond bolus reminders.
- **Trust & Governance Layer**:
  - `ConsentRecord` object — layered, versioned, revocable consent for data sharing and redirects.
  - `AuditLogEntry` object — immutable log of every Konstantina assignment/promotion/tier decision (actor, suggested value, final value, note).
  - `NotificationPreference` object — independently toggleable categories (care reminders vs. promoted-dietitian).
  - "Why am I seeing this?" explainability panel (Fotis-facing).
  - Permissions/Consent Dashboard with one-click revocation (Fotis-facing).
  - PHI-Boundary Banner on `ClinicDashboard.jsx` (Konstantina-facing, visible enforcement of `is-dietitian-owner.js` isolation).
  - Consent-status badge (visible to Konstantina, no clinical content exposed).
  - Escalation/flag-as-wrong queue for Konstantina to contest system suggestions without penalty.

## 4. Key User Journeys

### 4.1 Built

1. **Dietitian Client Setup** — Admin navigates `ClientOnboardingWizard`, sets metabolic targets via `ClientCalibrationDrawer`.
2. **Plan Construction** — Dietitian uses `PlanBuilder` canvas to schedule slots and assign serving multipliers.
3. **Auditing & Validation** — Recipes sit in "Draft — Not Public" queue for clinical audit before release.
4. **Clinical Export** — User triggers `exportPipeline.js` to download Grocery Manifests or FHIR Observations.

### 4.2 Dream

5. **Self-Service Redirect Journey** — Risk signal accumulates → soft non-punitive nudge → layered consent → redirect to Konstantina's intake queue tagged "self-service redirect."
6. **Tiered Service Selection Journey** — Patient chooses Full Care or Online-Session-Only at redirect or signup; Konstantina confirms capacity/fee routing.
7. **Curated Directory Assignment Journey** — Patient/Konstantina filters dietitian directory by specialty; Konstantina confirms final assignment (no algorithmic score shown).
8. **Clinic Growth & Retention Journey** — Konstantina tracks referral source → intake stage → conversion → funnel analytics on `ClinicDashboard.jsx`.
9. **Consent Lifecycle Journey** — Patient grants layered consent → sees status in Permissions Dashboard → revokes at will → downstream access removed same session.

## 5. Trust & Governance Model (New Section)

This section codifies UXartifact_v0.2. Two relationships are hardened explicitly:

**Patient ↔ System:** every automated suggestion (redirect nudge, tier offer, promoted-dietitian notification) must be explainable, non-punitive, reversible, and consent-gated with granular, versioned scope.

**Clinic Admin ↔ System:** every assignment/promotion action is human-in-command (system suggests, Konstantina confirms/edits/rejects), immutably logged, and visibly bounded from PHI via a persistent UI indicator, not just backend policy.

## 6. Non-Functional Constraints Carried Forward

- WCAG 2.1 AA strict on all new UI (explainability panel, permissions dashboard, PHI banner, escalation control).
- HL7 FHIR/LOINC compliance boundary: consent, audit, and notification-preference objects are explicitly **non-clinical** and must never enter the `exportFHIRMetabolicTelemetry` pipeline.
- Metabolic math tolerance conventions (`toBeLessThanOrEqual(1)`) remain unchanged and apply only to the metabolic engine, not new trust objects.

## 7. Key Decisions Log (Appended)

- **Decision:** Introduce Clinic Admin as a distinct persona/role, separate from Dietitian. *Rationale:* Konstantina's job (growth, intake, assignment) is materially different from clinical planning and must not inherit PHI access by default.
- **Decision:** Reject algorithmic/swipe-based dietitian matching in favor of a curated, filterable directory. *Rationale:* Preserves "serious platform" positioning; avoids consumer-dating-app framing in a medical context.
- **Decision:** Separate `ConsentRecord`, `AuditLogEntry`, and `NotificationPreference` from clinical telemetry schemas. *Rationale:* Keeps the FHIR export boundary and PHI wall intact while making trust mechanics auditable.
- **Decision:** Frame self-service failure detection as an opt-in, non-punitive nudge rather than a gate or block. *Rationale:* Preserves patient agency (Fotis persona); DIY patients disengage if the redirect feels punitive.
