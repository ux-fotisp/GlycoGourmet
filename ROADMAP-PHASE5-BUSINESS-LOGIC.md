# GlycoGourmet — Phase 5: Business Logic Gap Closure & Persona Extension

> **Status:** PLANNED — sequenced to begin after Phase 4 (Production Cutover to Supabase) reaches its 48-hour stability window and is marked COMPLETE. No implementation work in this phase touches the active Phase 4 migration critical path.
> **Source:** Derived from the cross-referenced Business Logic Gap Analysis (GitHub docs + Notion "02. Stakeholders, Personas & User Journeys" and "03. Functional Scope & Requirements"), dated 2026-09-16.
> **Owner tags follow existing persona convention:** Fotis (Patient), Ivana (Dietitian), Konstantina (Clinic Admin), SuperAdmin, Legacy Admin.

---

## Phase 5.1: Authority & Role-Model Integrity — PLANNED
Closes ambiguity in the RBAC/persona model itself before any dependent feature work begins, since every other gap below inherits from this authority model.

* **G1 — Super Admin journey definition** `[SuperAdmin | Dep: none]`
  Author the missing "Platform Provisioning & Cross-Tenant Oversight" journey (tenant creation, first-admin invite, step-up auth gate on cross-tenant PHI view, tenant deactivation trigger).
* **G2 — Admin/SuperAdmin/Dietitian precedence table** `[SuperAdmin, Ivana | Dep: G1]`
  Publish a per-action authority matrix; set a deprecation date for the Legacy `Admin` compatibility role.

## Phase 5.2: Consent & Recipe Lifecycle State Machines — PLANNED
Models the two cross-cutting concerns that are currently referenced in prose but never implemented as explicit, testable states.

* **G5 — Consent lifecycle state machine** `[Ivana, Konstantina | Dep: G1]`
  Implement Granted → Active → Revoked → Expired states with defined side effects at each transition, decoupled from the RBAC role model.
* **G6 — Recipe audit-state machine** `[Ivana | Dep: none]`
  Replace binary Draft/Public with Draft → In Review → Changes Requested → Approved → Public; enforce role permissions per transition.

## Phase 5.3: Clinical Safety Guards — PLANNED
Addresses the two gaps with direct patient-safety exposure; highest priority within Phase 5.

* **G7 — Smart Swap clinical validation contract** `[Ivana | Dep: G6]`
  Add allergy/contraindication check and dietitian-override log alongside the existing GL/macro tolerance check.
* **G8 — Calibration sign-off & range guard** `[Ivana | Dep: none]`
  Add a hard clinical-range server-side guard plus mandatory dietitian confirmation before `insulinSensitivityFactor` / `targetBolusOffsetMinutes` go live for a patient.

## Phase 5.4: Operational & Compliance Traceability — PLANNED

* **G9 — Export audit ledger** `[SuperAdmin | Dep: G1]`
  Append-only log of exporter identity, patient ID, export type, and timestamp for every FHIR/grocery/clinical-summary export; itself excluded from the FHIR bundle.
* **G10 — Dietitian reassignment/offboarding flow** `[Konstantina, SuperAdmin | Dep: G1, G5]`
  Define ownership transfer, historical-plan attribution, and patient notification when a dietitian leaves or is reassigned.

## Phase 5.5: New Persona-Driven Flows — PLANNED
Promotes backlog components that already implied undocumented flows into first-class, spec'd journeys.

* **G3 — Patient-initiated dietitian referral** `[Konstantina, Fotis | Dep: G5]`
  Spec `DietitianDirectory` browse → request → SLA-bound accept/decline → escalation-to-Konstantina-if-unclaimed, feeding into the existing Dietitian Client Setup journey on acceptance.
* **G4 — Dietitian promotion explainability** `[Konstantina | Dep: G3]`
  Define `PromotionConfigPanel` criteria as a deterministic, auditable rule set with a patient/dietitian-facing explanation panel (mirrors the existing `RedirectNudgeCard.jsx` transparency invariant).

---

## Sequencing & Dependencies

```
Phase 4 (Production Cutover) — COMPLETE + 48h stability window
        │
        ▼
Phase 5.1 (G1, G2)  →  Phase 5.2 (G5, G6)  →  Phase 5.3 (G7, G8)
        │                                              │
        ▼                                              ▼
Phase 5.4 (G9, G10) ◄────────────────────────  Phase 5.5 (G3, G4)
```

## Exit Criteria for Phase 5

* All 10 gaps (G1–G10) have merged code + passing Vitest/Playwright coverage.
* Role-precedence table and consent/recipe state machines are documented in `information_architecture.md` and `RBAC-ROLE-MAPPING.md`.
* No regression in existing 254+ Vitest / Playwright suite.
* Governance sign-off recorded in `governance/` per the DAVE+R framework, mirroring the existing `AUDIT-2026-09-05.md` pattern.

---

*See also: `ROADMAP.md` (Phases 3–4 and Trust & Growth Governance Backlog), `PRD-v0.2.md` §2 (Persona table), Notion "GlycoGourmet — Project Hub" pages 02, 03, and 06.*
