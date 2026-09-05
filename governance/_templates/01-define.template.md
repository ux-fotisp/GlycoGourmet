# 01 — Define Artifact

> **Change ID:** `<change-id>`  
> **Date:** `<YYYY-MM-DD>`  
> **Author (Agent):** `<agent-id>`  
> **Risk Owner (Human):** Fotis P

---

## 1. Problem Statement

_Ground this in `SECURITY.md`'s stated clinical data scope and tenant isolation model._

| Field | Value |
|---|---|
| **What is changing?** | _Describe the proposed RBAC/PHI/export/API change._ |
| **Why is it needed?** | _Root cause or gap in current governance posture._ |
| **Clinical data scope impact** | _Which `SECURITY.md` §2 components are affected?_ |
| **Tenant isolation impact** | _Does this cross a row-level boundary (`is-dietitian-owner.js`, `is-clinic-admin.js`)?_ |

---

## 2. Blast Radius

### 2.1 RBAC Roles Affected

| Role | Impact (direct / indirect / none) | Notes |
|---|---|---|
| Patient | | |
| Dietitian | | |
| ClinicAdmin | | |
| Admin | | |
| SuperAdmin | | |

### 2.2 Strapi Content Types Affected

| Content Type UID | Impact | Notes |
|---|---|---|
| _e.g. `api::client-profile.client-profile`_ | | |

### 2.3 Existing Invariant Tests at Risk

| Test File | Test Name / Describe Block | Risk Level (high/medium/low) |
|---|---|---|
| _e.g. `tests/unit/TenantScoping.spec.js`_ | | |

### 2.4 DAVE+R Planes Touched

- [ ] identity
- [ ] data
- [ ] application
- [ ] edge-api
- [ ] ci-cd

---

## 3. Explicit Non-Goals

_What this change must NOT touch. Be specific._

| Non-Goal | Rationale |
|---|---|
| _e.g. "Must not alter the Net-Carbs clamping invariant"_ | _Metabolic math is not in scope for this governance change._ |

---

## 4. Secondary Lens Applicability

| Check | Applicable? | Notes |
|---|---|---|
| `gg-bot-fraud` (Module C) — touches public unauthenticated endpoint? | Yes / No | _If yes, the architect-worker must include rate-limit, PHI leak, and scraping resilience checks._ |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Problem statement grounded in SECURITY.md | ⬜ Pass / ⬜ Fail |
| Blast radius enumerated | ⬜ Pass / ⬜ Fail |
| Non-goals declared | ⬜ Pass / ⬜ Fail |
| Ready for architect-worker | ⬜ Pass / ⬜ Fail |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._

