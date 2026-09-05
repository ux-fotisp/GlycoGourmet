# Release Readiness — 2026-09-05

> **Evaluation Standard:** DAVE+R Framework (Axiom 1: Gates are data; Axiom 2: Evidence over assertion; Axiom 3: Named human owns risk; Axiom 4: Shadow before enforce; Axiom 5: Mandatory reversibility).  
> **Repository:** `ux-fotisp/GlycoGourmet`  
> **Auditor Context:** Antigravity AI Agent (session `e622fc11`)  
> **Review Scope:** Governance PR #26, Login/Backend-Readiness Branch `fix/login-network-error` (PR #28), and Master Baseline.

---

## Scope

This review evaluates repository and CI readiness across two active development branches:
1. **Governance Branch (`feat/dave-r-governance-workers` / PR #26):** Mechanical gate engine (`scripts/governance-gates.js`), declarative gate sets (`testing.gate.yaml`, `security-major-upgrade.gate.yaml`), stage templates with typed evidence, exception register and triage policy (`EXC-1`–`EXC-7`), declarative evidence ledger and anti-backdating checks (`INT-1`–`INT-9`), and CI workflow automation (`.github/workflows/governance-gates.yml`).
2. **Login/Backend-Readiness Branch (`fix/login-network-error` / PR #28):** Unified API base URL routing via `STRAPI_URL`, Netlify edge proxy `/api/*` rewrite, non-production seed credential gating (`SG-1`/`SG-3` hardening), bounded CORS origin policy, and unauthenticated non-PHI health check (`/health`, `/_health`).

### Explicit Exclusions
The following operational items are out of scope for automated approval and are strictly **not performed** by any agent:
- Provisioning or configuring backend cloud infrastructure (Render, Railway, Fly.io, Strapi Cloud, or VPS).
- Registering or updating public DNS records (`api.glycogourmet.com`).
- Modifying production Netlify environment variables or secrets.
- Live observation of genuine JWT tokens against an external public backend.
- Dynamic runtime PHI inspection of unauthenticated live endpoints (`SG-3`).
- Populating human ownership, approval, or signatory roles on behalf of Fotis P or any other individual (`SG-7`).
- Merging pull requests to `master` or triggering release deployments.

---

## Evidence Snapshot

| Branch / Context | HEAD Commit SHA | PR / Workflow Run Reference | Verification Result | Date & Time Observed (UTC) |
|---|---|---|---|---|
| `master` | `7e423881c09880cf45614be63f2f14ed7946a524` | [ux-fotisp/GlycoGourmet@master](https://github.com/ux-fotisp/GlycoGourmet/tree/master) | Clean baseline; common ancestor for both active branches. | 2026-09-05T07:08:41Z |
| `feat/dave-r-governance-workers` | `92826314ed1d581cade487c4c5e399a39271c3a3` | [PR #26](https://github.com/ux-fotisp/GlycoGourmet/pull/26) / [Run 33951521115](https://github.com/ux-fotisp/GlycoGourmet/actions/runs/33951521115) | **PASS** (15s): 21 mechanical gates passed, 0 warnings, 0 failures. Artifact `9964974818` uploaded. | 2026-09-05T07:04:18Z |
| `feat/dave-r-governance-workers` | `92826314ed1d581cade487c4c5e399a39271c3a3` | [PR #26](https://github.com/ux-fotisp/GlycoGourmet/pull/26) / [Run 33951521050](https://github.com/ux-fotisp/GlycoGourmet/actions/runs/33951521050) | **PASS** (2m33s): Full Integration Tests suite passed. | 2026-09-05T07:06:35Z |
| `feat/dave-r-governance-workers` | `92826314ed1d581cade487c4c5e399a39271c3a3` | [Deploy Preview #26](https://deploy-preview-26--glycogourmet.netlify.app) | **READY** (Netlify deploy preview active; headers & redirects verified). | 2026-09-05T07:04:14Z |
| `fix/login-network-error` | `e4ba5833e4ba623cb58ea8b672b94e2e5db0b708` | [PR #28](https://github.com/ux-fotisp/GlycoGourmet/pull/28) / [Run 33951492854](https://github.com/ux-fotisp/GlycoGourmet/actions/runs/33951492854) | **PASS** (2m30s): Integration test suite passed. | 2026-09-05T07:05:52Z |
| `fix/login-network-error` | `e4ba5833e4ba623cb58ea8b672b94e2e5db0b708` | [Deploy Preview #28](https://deploy-preview-28--glycogourmet.netlify.app) | **READY** (Netlify deploy preview active; edge proxy redirect configured). | 2026-09-05T07:04:15Z |
| Local Governance Engine | `9282631` (on governance branch) | `node scripts/governance-gates.js` | **PASS**: 21 passed, 0 warnings, 0 failures. Exit code 0. | 2026-09-05T07:02:08Z |
| Local Vitest Suite | `9282631` / `e4ba583` (both branches) | `npm run test` | **PASS**: 68 passed, 1 skipped (69 files), 690 passed. Exit code 0. | 2026-09-05T07:01:15Z / 07:10:53Z |
| Local Playwright E2E Suite | `e4ba583` (on fix branch) | `npm run test:e2e` | **PASS**: 42 passed (32.4s) across Chromium, Mobile Chrome, and Mobile Safari. | 2026-09-05T07:11:28Z |
| Local Pre-Commit Gate | `9282631` / `e4ba583` (both branches) | `npm run precommit` | **PASS**: Oxlint 0 errors, `tsc --noEmit` 0 errors, DB audit clean. Exit code 0. | 2026-09-05T07:01:24Z / 07:11:34Z |
| Local Production Build | `9282631` / `e4ba583` (both branches) | `npm run build` | **PASS**: Client bundle + PWA Service Worker built clean (597ms / 566ms). | 2026-09-05T07:01:28Z / 07:11:42Z |

---

## Decision Matrix

| Decision | Status | Blocking Evidence / Preconditions | Human Action Required |
|---|---|---|---|
| **Merge Governance PR #26** | **READY** | None mechanically. All 21 mechanical gates passed in GitHub Actions CI (Run `33951521115`). Full integration test suite green (Run `33951521050`). Zero file conflicts with master. Zero file conflicts with `fix/login-network-error`. | Fotis P code review and co-signature per Axiom 3 and Gate `SG-7`. Merge PR #26 to `master`. |
| **Open Login-Fix PR** | **READY TO OPEN PR, BUT HOLD FOR BACKEND HOST** | Mechanically sound: 690 unit tests pass, 42 E2E tests pass, precommit clean, build clean. PR #28 already exists in open state with blank description. | Fotis P review of proposed PR title and body (detailed below); update PR #28 body. |
| **Merge Login-Fix PR** | **HOLD** | Cannot merge to master before a real backend host exists. Merging prematurely would point master's production Netlify redirect (`/api/*`) to a non-resolving domain (`api.glycogourmet.com` NXDOMAIN). Must be rebased on master after PR #26 merges to inherit the governance gate CI workflow. | Defer merge until backend host is provisioned and live login returns HTTP 200 + JWT. Rebase on `master`. |
| **Deploy Staging Backend** | **BLOCKED** | Hosting decision unresolved. No provider provisioned (Railway, Render, Fly.io, Strapi Cloud, or VPS). No production PostgreSQL provisioned. Production JWT secrets unconfigured. | Fotis P decision on hosting provider; provision Strapi instance and database; bind DNS for `api.glycogourmet.com`. |
| **Declare Login Resolved** | **BLOCKED** | Live empirical observation required by DAVE+R Axiom 2. External endpoint `api.glycogourmet.com` yields NXDOMAIN. No genuine HTTP 200 JSON login response with valid JWT observed from public internet. | Execute live curl check against provisioned backend returning valid JWT. Promote `governance/2026-09-login-fix/04-refine.md` off `HOLD`. |
| **Production Release** | **BLOCKED** | Multi-gate block: backend unprovisioned; live endpoint PHI audit (`SG-3`) pending live deployment; rollback dry-run (`SG-6`) pending host; human release sign-off (`SG-7`) pending. | Execute manual gates checklist (`SG-3`, `SG-6`, `SG-7`) and sign off on release co-signature. |

---

## Automated Controls Confirmed

Automated enforcement covers the following **21 mechanically enforced gates** verified in GitHub Actions CI (Run `33951521115`):

1. **`TO-2`**: Metabolic-engine floating-point assertions use explicit tolerance (`Math.abs(a - b) <= 1`), not strict `toBeCloseTo`.
2. **`TO-3`**: Playwright E2E test selectors use text/role-based locators, not brittle CSS/DOM paths (warning scan clean).
3. **`TO-6`**: React Hooks structural rule enforced: zero conditional `useEffect` calls in `src/`.
4. **`INT-1`**: Governance change-set completeness: all 4 stage artifacts (`01-define.md`, `02-architect.md`, `03-validate.md`, `04-refine.md`) present in every change folder under `governance/`.
5. **`INT-2`**: Evidence ledger YAML ([`governance/evidence/evidence-ledger.yaml`](./evidence/evidence-ledger.yaml)) and schema ([`governance/evidence/evidence.schema.yaml`](./evidence/evidence.schema.yaml)) parse without syntax or decoding errors.
6. **`INT-3`**: Required metadata completeness: every `verified` evidence entry has non-empty `source_url`, `source_type`, `recorded_at`, `observed_at`, and `source_commit` where required.
7. **`INT-4`**: Anti-backdating validation: no timestamp is in the future; `observed_at <= recorded_at` with strict clock-skew bounds.
8. **`INT-5`**: Commit existence check: all Git commit SHAs referenced in evidence records resolve to real commits in repository history.
9. **`INT-6`**: Change directory integrity: evidence entries referencing a `change_id` point to an existing, complete `governance/<change-id>/` folder.
10. **`INT-7`**: External live check durability: `external_live_check` entries cannot be marked `verified` unless supported by an Actions artifact or committed terminal transcript.
11. **`INT-8`**: Exception isolation: no active governance exception is permitted to cite `legacy-unverifiable` evidence as its sole justification.
12. **`INT-9`**: Governance status language bounding: all markdown docs are scanned to ensure universal claims ("100% fidelity", "all gates") are bounded by explicit mechanical gate IDs.
13. **`SG-1`**: RBAC state machine baseline diff: canonical role list in `src/hooks/usePermissions.js` strictly matches `['user', 'dietitian', 'clinic_admin', 'admin', 'super_admin']` per [`governance/RBAC-ROLE-MAPPING.md`](./RBAC-ROLE-MAPPING.md).
14. **`SG-2`**: `PHIBoundaryBanner.jsx` render guard audit: confirmed component returns `null` for Patient and standard Dietitian contexts, strictly restricted to Clinic Admin / Super Admin.
15. **`EXC-1`**: Exception register YAML ([`governance/exceptions/exception-register.yaml`](./exceptions/exception-register.yaml)) and schema ([`governance/exceptions/exception.schema.yaml`](./exceptions/exception.schema.yaml)) parse without syntax errors.
16. **`EXC-2`**: Active exception structure: all active exceptions validate required fields and provide non-placeholder rollback commands.
17. **`EXC-3`**: Strict expiry gate: any exception with `expires_at` in the past fails CI if status is active or approved.
18. **`EXC-4`**: Retrospective deadline gate: expedited or emergency exceptions with overdue retrospectives fail CI.
19. **`EXC-5`**: Clinical/Security gate safeguard: exceptions affecting `SG-1` through `SG-7` require a named human approver.
20. **`EXC-6`**: Maximum duration clamp: no exception duration may exceed 30 days without human renewal.
21. **`EXC-7`**: Change-set reference check: exception `change_id` references point to existing governance folders.

---

## Manual Controls Still Required

The following gates and operational requirements remain manual or blocked pending external human decisions:

1. **`SG-3` — Public Endpoint PHI Leak & Pagination Limit Audit:** Requires dynamic HTTP response scanning against a running backend instance to verify zero unauthenticated patient health metric leakage.
2. **`SG-6` — Release Rollback Dry-Run:** Requires executing and verifying a live dry-run of one-command rollback before merging a release candidate.
3. **`SG-7` — Named Human Owner Release Sign-Off:** Requires Fotis P's documented co-signature on the release PR. Agents are forbidden from approving on behalf of a human.
4. **Backend Hosting Decision & Deployment:** Selection of cloud platform, database provisioning, DNS configuration, and production environment variable management.
5. **Real JWT Login Verification:** Observation of HTTP 200 + valid JWT response against an external backend from the public internet.
6. **Exception Register Human Owner Assignment:** Assigning Fotis P or designated human custodian to `register_owner` in [`governance/exceptions/exception-register.yaml`](./exceptions/exception-register.yaml).
7. **Production Release Approval:** Final human executive decision to merge and deploy.

---

## Rollback Plan

### 1. Revert Governance PR #26 (Post-Merge)
If PR #26 is merged to `master` and needs to be rolled back in full:
```bash
# If merged via GitHub standard merge commit:
git checkout master
git pull origin master
git revert -m 1 <merge-commit-sha>
git push origin master

# If merged via GitHub squash-merge:
git checkout master
git pull origin master
git revert <squash-commit-sha>
git push origin master
```

### 2. Revert Individual Additive Governance Commits
Each additive commit on `feat/dave-r-governance-workers` is isolated with its own one-command rollback:
```bash
# Revert doc scoping and validation record:
git revert 92826314ed1d581cade487c4c5e399a39271c3a3

# Revert evidence ledger, schema, and INT-2..9 gate checks:
git revert cd0f0bf907b19f5c782f521511de0f08d53a0983

# Revert exception CI gates EXC-1..7:
git revert efe45fd0267a7134819815084011ea7be19340e1

# Revert exception register and triage policy:
git revert f5bbba5c8309e3a34a815a51965b79e2c65f9a65

# Revert canonical RBAC role mapping:
git revert a4143940c572d49e1f57e2d7870fb3895e6f54c3

# Revert mechanical gate engine and CI workflow (TO-2, TO-3, TO-6, INT-1, SG-1, SG-2):
git revert 38c3baae3549ee10eb847df089e02c6b32b35b6c

# Revert metabolic engine floating point assertions (TO-2 fix):
git revert 81adeeedb76a086058e0a370e060010041d8e134

# Revert undici CVE dependency resolution (SG-5 fix):
git revert 4bf5c76ec739e83df9926871a5ffbbf15e45a27d
```

### 3. Revert Login-Fix PR (Post-Merge)
If the login-fix branch is merged to `master` and needs to be rolled back:
```bash
git checkout master
git pull origin master
git revert -m 1 <merge-commit-sha>
git push origin master
```
Or revert individual commits on `fix/login-network-error`:
```bash
git revert e4ba5833e4ba623cb58ea8b672b94e2e5db0b708  # CORS Netlify staging origin
git revert 0b67795556dc6e18f889ef5aa51bcfcff7319c5c  # Health check endpoint
git revert 961018c0678d91b6e49e29a39a7db9d519d554a9  # Seed password gating
git revert 4e601dc6854bc6772718e244b7d19da050cb2a6b  # Relative login & Netlify redirect
```

### 4. Netlify Instant Deploy Rollback
Netlify maintains immutable deployment builds. In case of a broken web release:
1. Navigate to Netlify Dashboard → GlycoGourmet → **Deploys**.
2. Identify the last known stable production deploy (pre-merge commit).
3. Click **Deploy Details** → **Publish deploy**.
4. Rollback takes effect globally in under 5 seconds.

### 5. Backend Migration Rollback
- **Status:** **BLOCKED** pending hosting-provider selection.
- Once a provider is selected, a documented PostgreSQL rollback procedure (e.g. `pg_dump` restore or Knex down-migrations) must be validated before production exposure.

---

## Proposed Human Checklist

*All checkboxes intentionally left unchecked. To be completed by Fotis P.*

### Track A: Governance PR #26 Review & Merge
- [ ] Review PR #26 diff on GitHub ([ux-fotisp/GlycoGourmet#26](https://github.com/ux-fotisp/GlycoGourmet/pull/26)).
- [ ] Verify that all 21 automated gates are passing in GitHub Actions.
- [ ] Confirm Demetrios Petropoulos CC BY 4.0 attribution is complete across governance files.
- [ ] Sign off on Gate `SG-7` in PR review comments.
- [ ] Merge PR #26 to `master`.

### Track B: Exception Register Ownership
- [ ] Open [`governance/exceptions/exception-register.yaml`](./exceptions/exception-register.yaml).
- [ ] Update `register_owner` from `"pending-human-assignment"` to `"Fotis P"`.
- [ ] Review the triage guidelines in [`governance/exceptions/TRIAGE.md`](./exceptions/TRIAGE.md).

### Track C: Login-Fix PR #28 Scoping
- [ ] Open PR #28 on GitHub ([ux-fotisp/GlycoGourmet#28](https://github.com/ux-fotisp/GlycoGourmet/pull/28)).
- [ ] Populate PR #28 description using the prepared draft text below.
- [ ] Rebase `fix/login-network-error` onto `master` after PR #26 is merged to activate CI governance gates.
- [ ] Keep PR #28 on `HOLD` until a backend host is deployed.

### Track D: Backend Provider Decision & Deployment
- [ ] Select hosting provider: [ ] Render  [ ] Railway  [ ] Fly.io  [ ] Strapi Cloud  [ ] Dedicated VPS.
- [ ] Provision managed PostgreSQL instance.
- [ ] Deploy Strapi backend (`server/`) with production environment variables (`JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`, `API_TOKEN_SALT`).
- [ ] Bind DNS A/CNAME record for `api.glycogourmet.com` to provider ingress.
- [ ] Set `SEED_PASSWORD` or rotate randomized production seed credentials.

### Track E: Pre-Release Verification (Manual Gates)
- [ ] Execute `curl -i "https://api.glycogourmet.com/health"` to confirm HTTP 200 health response.
- [ ] Execute `curl -i "https://api.glycogourmet.com/api/auth/local"` with test credentials to confirm genuine HTTP 200 JSON with JWT.
- [ ] Execute `SG-3` audit checklist: verify zero patient carb targets, GL values, or patient IDs returned on unauthenticated routes (`/api/recipes`, `/api/ingredients`).
- [ ] Execute `SG-6` dry-run: test one-command git revert in local branch.
- [ ] Sign off on production release co-signature (`SG-7`).

---

## Proposed PR #28 Description (for `fix/login-network-error`)

```markdown
## Fix: Staging Login Network Error & Backend Deployment Readiness

### 1. Problem Statement
The Netlify staging deployment exhibited a "Network error during login" when users submitted credentials at `/login`. Root cause analysis documented in `governance/2026-09-login-fix/`:
1. `AuthContext.jsx` dispatched login requests to a hardcoded relative path `/api/auth/local` while general content calls used `STRAPI_URL`.
2. Netlify SPA catch-all rewrite rule (`/* -> /index.html 200`) intercepted unhandled `/api/*` requests, returning HTML instead of JSON.
3. No Strapi backend instance was deployed or reachable at `api.glycogourmet.com` (DNS NXDOMAIN).

### 2. Changes Introduced
- **Auth Routing (`src/context/AuthContext.jsx`):** Unified login and registration endpoints to use `getApiUrl()` routed through `STRAPI_URL` matching `strapiClient.js`.
- **Edge Proxy Rewrite (`netlify.toml`, `public/_redirects`):** Configured `/api/*` proxy rewrite pointing to `https://api.glycogourmet.com/api/:splat` preceding the SPA catch-all.
- **Credential Hardening (`server/seed.js`):** Enforced `SG-1`/`SG-3` security rule preventing hardcoded default passwords in production or public deployments (requires `SEED_PASSWORD` or auto-generates per-role cryptographic secrets).
- **CORS Bounding (`server/config/middlewares.js`):** Explicitly whitelisted Netlify origins without unsafe wildcards.
- **Health Check (`server/src/api/health/`):** Added public unauthenticated `/health` and `/_health` endpoints returning zero PHI.

### 3. Verification & Test Evidence
- Vitest Suite: 690 passed, 0 failing, 1 skipped (CI integration).
- Playwright E2E: 42 passed (Desktop Chromium, Mobile Chrome, Mobile Safari).
- Pre-Commit: Oxlint 0 errors, tsc --noEmit clean, database integrity audit clean.
- Build: Vite production bundle built clean in 566ms.

### 4. DAVE+R Lifecycle Status
⚠️ **HOLD — PENDING BACKEND HOST PROVISIONING**  
In accordance with DAVE+R Axiom 2 (evidence over assertion), this PR remains on **HOLD** and must not be merged to master until:
1. A backend hosting provider is selected and deployed.
2. DNS for `api.glycogourmet.com` resolves.
3. A live HTTP 200 login response containing a genuine JWT is empirically observed.
```

---

## Conclusion

Automated mechanical enforcement covers gates **`TO-2`, `TO-3`, `TO-6`, `INT-1` through `INT-9`, `SG-1`, `SG-2`, and `EXC-1` through `EXC-7`**. All 21 automated gates are verified clean on PR #26 in CI.

Governance PR #26 is **READY** for Fotis P's review and merge. Branch `fix/login-network-error` is **READY TO OPEN PR, BUT HOLD FOR BACKEND HOST**. Production release, live JWT validation, and live PHI auditing (`SG-3`) remain **BLOCKED** pending the backend hosting decision and deployment.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
