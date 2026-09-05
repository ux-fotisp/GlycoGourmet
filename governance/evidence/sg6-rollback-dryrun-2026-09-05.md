# SG-6 Rollback Dry-Run and Deploy Reversibility Evidence

**Evaluation Date:** 2026-09-05  
**Evaluation Time:** 07:30:00 UTC (10:30:00 EEST)  
**Evaluator:** Antigravity agent (session `e622fc11-cdd7-44ee-a2c4-e9a9ce4bcede`)  
**Repository:** `ux-fotisp/GlycoGourmet`  
**DAVE+R Gate Reference:** SG-6 (Rollback documented, mechanically dry-run tested, and validated prior to merge or release)  
**Evidence Ledger ID:** `EVD-2026-005`  
**Provenance:** `observed`  

---

## 1. Executive Summary

In accordance with DAVE+R Axiom 2 (*Evidence over assertion*) and Gate **SG-6**, this document captures empirical evidence for rollback reversibility across:
1. Pull Request #26 (`feat/dave-r-governance-workers` → `master`) git merge rollback simulation.
2. Pull Request #28 (`fix/login-network-error` → `master`) git merge rollback simulation.
3. Netlify production and preview deploy reversibility via Netlify REST API deploy inspection.

All automated mechanical gates (`TO-2`, `TO-3`, `TO-6`, `INT-1`–`INT-9`, `SG-1`, `SG-2`, `EXC-1`–`EXC-7`) remain strictly enforced. Human sign-off Gate `SG-7` remains strictly manual.

---

## 2. Test Execution & Empirical Results

### 2.1 PR #26 Revert Dry-Run (`feat/dave-r-governance-workers`)

A local-only scratch branch was created off the tip of `feat/dave-r-governance-workers` (`eb3ae9f90039b44ac51f34de0ffaa1254585c4b5`). A merge-revert operation was executed against the GitHub merge-preview commit `refs/pull/26/merge` (`0295e669f54e56d8542a607a1bdd732edc2f293e`), which models the exact merge of PR #26 into `master` (`7e423881c09880cf45614be63f2f14ed7946a524`).

* **Scratch Branch:** `scratch/revert-dry-run-pr26` (local-only, not pushed)
* **Target Merge-Preview SHA:** `0295e669f54e56d8542a607a1bdd732edc2f293e` (Parent 1: `master` `7e42388`, Parent 2: PR #26 tip `eb3ae9f`)
* **Execution Command:** `Measure-Command { git revert -m 1 --no-commit 0295e669f54e56d8542a607a1bdd732edc2f293e }`
* **Result Status:** **CLEAN** (0 conflicts, all 37 files staged for reversal)
* **Elapsed Execution Time:** 79.56 ms (~80 ms)
* **Teardown Verification:** `git revert --abort`, return to `feat/dave-r-governance-workers`, branch `scratch/revert-dry-run-pr26` deleted cleanly.

### 2.2 PR #28 Revert Dry-Run (`fix/login-network-error`)

A local-only scratch branch was created off the tip of `fix/login-network-error` (`e4ba5833e4ba623cb58ea8b672b94e2e5db0b708`). A merge-revert operation was executed against the GitHub merge-preview commit `refs/pull/28/merge` (`92ef1e71ecac5e15853128beef04474488c14c98`), which models the exact merge of PR #28 into `master` (`7e423881c09880cf45614be63f2f14ed7946a524`).

* **Scratch Branch:** `scratch/revert-dry-run-pr28` (local-only, not pushed)
* **Target Merge-Preview SHA:** `92ef1e71ecac5e15853128beef04474488c14c98` (Parent 1: `master` `7e42388`, Parent 2: PR #28 tip `e4ba583`)
* **Execution Command:** `Measure-Command { git revert -m 1 --no-commit 92ef1e71ecac5e15853128beef04474488c14c98 }`
* **Result Status:** **CLEAN** (0 conflicts, all 10 files staged for reversal)
* **Elapsed Execution Time:** 91.42 ms (~91 ms)
* **Teardown Verification:** `git revert --abort`, return to `feat/dave-r-governance-workers`, branch `scratch/revert-dry-run-pr28` deleted cleanly.

---

## 3. Netlify Deploy Reversibility & One-Click Rollback Audit

Netlify deployment state was audited using `netlify api listSiteDeploys` for site `glycogourmet` (Site ID `0d98977c-9320-4c95-9e6f-b2961180a5ad`).

### 3.1 Active Deploy Previews

| PR Reference | Branch | Deploy ID | State | Deploy URL | Netlify Dashboard Direct Link |
|---|---|---|---|---|---|
| **PR #26** | `feat/dave-r-governance-workers` | `6a9bc2fb7a886b00080a45bc` | `ready` | [deploy-preview-26](https://deploy-preview-26--glycogourmet.netlify.app) | [Deploy 6a9bc2fb](https://app.netlify.com/projects/glycogourmet/deploys/6a9bc2fb7a886b00080a45bc) |
| **PR #28** | `fix/login-network-error` | `6a9bbeb837ce080008592ecf` | `ready` | [deploy-preview-28](https://deploy-preview-28--glycogourmet.netlify.app) | [Deploy 6a9bbeb8](https://app.netlify.com/projects/glycogourmet/deploys/6a9bbeb837ce080008592ecf) |

Both deploy previews build and serve without intercepting standard UI routes.

### 3.2 Production One-Click Rollback Targets

The site has 16 published, ready production deploys retained in its Netlify history. In the event of an unintended production regression following any future release, the following verified deploy IDs can be instantly activated using Netlify's one-click "Publish deploy" control:

| Priority | Netlify Deploy ID | Commit SHA | Published At (UTC) | Description / Stable Baseline |
|---|---|---|---|---|
| **Primary Rollback Target** | `6a97e55b6eec6c00089a3f65` | `56da474` | 2026-09-02T08:59:22Z | **Current Stable Production Baseline.** Phase 6 delivered; intake pipeline & trust integrity UI active. |
| **Secondary Target (Intake)** | `6a97e38ed581760008c93720` | `d997aab` | 2026-09-02T08:51:40Z | PR #14 merged baseline (IntakePipelineBoard 6-stage lifecycle). |
| **Tertiary Target (Trust UI)** | `6a97bf769d075300082b90c1` | `9000d1e` | 2026-09-02T06:17:43Z | PR #13 merged baseline (PHIBoundaryBanner, EscalationFlagControl). |
| **Quaternary Target (Settings)** | `6a967ed84cd10f000904e454` | `046aa56` | 2026-09-01T07:30:06Z | PR #12 merged baseline (ConsentPermissionsDashboard). |

---

## 4. Rollback Readiness Conclusion

* **Git Mechanical Rollback:** Both PR #26 and PR #28 can be reverted in <100ms with zero manual conflict resolution.
* **CDN / Frontend Rollback:** Production frontend can be rolled back to `6a97e55b6eec6c00089a3f65` in one click from the Netlify dashboard.
* **Backend Rollback:** Backend hosting remains unprovisioned; zero live cloud state exists to roll back.
* **Gate Status:** Gate `SG-6` dry-run requirement is **SATISFIED**. Final release co-signature remains with Fotis P under Gate `SG-7`.
