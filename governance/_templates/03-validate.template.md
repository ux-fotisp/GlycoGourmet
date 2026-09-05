# 03 — Validate Artifact

> **Change ID:** `<change-id>`  
> **Date:** `<YYYY-MM-DD>`  
> **Author (Agent):** `<agent-id>`  
> **Risk Owner (Human):** Fotis P  
> **Prerequisite:** `governance/<change-id>/02-architect.md` approved

---

## 1. CI Run Evidence (Axiom A2 — anti-fabrication)

_Every value below must be freshly observed, never remembered from a prior session._

| Field | Value |
|---|---|
| **Target branch** | _e.g. `feat/gov-<change-id>`_ |
| **GitHub Actions run ID** | _e.g. `33079705050`_ |
| **Run URL** | _e.g. `https://github.com/ux-fotisp/GlycoGourmet/actions/runs/33079705050`_ |
| **Run status** | ⬜ ✅ Success / ⬜ ❌ Failure |
| **Commit SHA** | _e.g. `e87027c`_ |
| **Observation timestamp** | _e.g. `2026-09-05T08:00:00Z`_ |

---

## 2. Vitest Suite Verification (Axiom A2)

_Do NOT assume "690 tests" — re-run or re-read the actual CI output._

| Field | Value |
|---|---|
| **Total test files** | _e.g. `68`_ |
| **Total tests passing** | _e.g. `690`_ |
| **Total tests failing** | _Must be `0`_ |
| **Total tests skipped** | _e.g. `1` (TenantScopingIntegration — CI Live DB only)_ |
| **Evidence source** | _CI run output URL or local `npm run test` terminal output_ |

### 2.1 Coverage Thresholds (metabolic engine)

| Metric | Required | Actual |
|---|---|---|
| Lines | 100% | __%  |
| Functions | 100% | __% |
| Branches | 100% | __% |
| Statements | 100% | __% |

---

## 3. Floating-Point Tolerance Assertions

_Required for any change adjacent to the metabolic math engine._

| Check | Status | Notes |
|---|---|---|
| Uses `toBeLessThanOrEqual(1)` for delta assertions (not `toBeCloseTo`) | ⬜ Pass / ⬜ N/A | |
| `roundToOneDecimal()` used for display values | ⬜ Pass / ⬜ N/A | |
| `Object.is(result, -0)` returns `false` for net-carb clamping | ⬜ Pass / ⬜ N/A | |
| `Number.isNaN()` returns `false` for zero-carb singularity | ⬜ Pass / ⬜ N/A | |
| `Number.isFinite()` returns `true` for all computed values | ⬜ Pass / ⬜ N/A | |

---

## 4. E2E Locator Compliance

_Required for any change introducing new Playwright tests._

| Check | Status | Notes |
|---|---|---|
| All selectors use semantic test IDs (`[data-testid="..."]`) | ⬜ Pass / ⬜ N/A | |
| ARIA role-based locators used (`page.getByRole(...)`) | ⬜ Pass / ⬜ N/A | |
| Form label locators used (`page.getByLabel(...)`) | ⬜ Pass / ⬜ N/A | |
| **Zero** utility CSS class selectors | ⬜ Pass / ⬜ N/A | |
| **Zero** hierarchical XPath strings | ⬜ Pass / ⬜ N/A | |
| **Zero** dynamic state IDs (`radix-:r*:`, `headlessui-*`) | ⬜ Pass / ⬜ N/A | |

---

## 5. Architect Design Verification

_Cross-check the Architect artifact's claims against actual repo state._

| Architect Claim | Verified? | Evidence |
|---|---|---|
| _e.g. "usePermissions.js already exports canViewClinicalData"_ | ⬜ Yes / ⬜ No | _File line reference_ |
| _e.g. "is-clinic-admin.js blocks FORBIDDEN_CLINICAL_UIDS"_ | ⬜ Yes / ⬜ No | _File line reference_ |

---

## 6. Gate Status

| Gate | Status |
|---|---|
| CI run evidence cited with real run ID | ⬜ Pass / ⬜ Fail |
| Vitest suite re-verified (not assumed) | ⬜ Pass / ⬜ Fail |
| Floating-point checks passed (or N/A) | ⬜ Pass / ⬜ Fail |
| E2E locator compliance verified (or N/A) | ⬜ Pass / ⬜ Fail |
| Architect claims cross-checked | ⬜ Pass / ⬜ Fail |
| Ready for execute-worker | ⬜ Pass / ⬜ Fail |
