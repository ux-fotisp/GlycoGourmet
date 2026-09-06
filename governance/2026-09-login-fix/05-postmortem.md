# 05 — Postmortem & Final Workflow Artifact

> **Change ID:** `2026-09-login-fix`  
> **Date:** `2026-09-06`  
> **Author (Agent):** `Antigravity`  
> **Risk Owner (Human):** Fotis P  
> **Merged Commit:** `786c527d9a1ae28086ccfcf8fb1c7ba33ed6f8ab`  
> **Merged At:** `2026-09-06T07:16:39Z`  
> **Merged By:** `ux-fotisp`

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 Original Defect
When users submitted credentials on the Netlify staging deployment (`/login`), the application immediately produced a generic red error message: `"Network error during login"`.

### 1.2 Root Cause
A thorough clinical and architectural trace in `01-define.md` and `02-architect.md` revealed a three-part failure:
1. **Client URL Discrepancy:** `src/context/AuthContext.jsx` dispatched login requests to a hardcoded relative path `/api/auth/local`, whereas general content lookups in `strapiClient.js` correctly referenced `STRAPI_URL`.
2. **Netlify Edge Rewrite Trap:** The Netlify SPA catch-all rule (`/* -> /index.html 200`) intercepted unhandled relative `/api/*` calls at the edge. Because `/api/auth/local` was not forwarded to an external API, Netlify responded with the HTML index page (HTTP 200, Content-Type: `text/html`). The frontend JSON parser failed when parsing HTML, throwing a Network Error.
3. **Backend Ingress Absence:** Even if relative paths had been rewritten, `api.glycogourmet.com` returned DNS `NXDOMAIN`. No public Strapi backend instance was provisioned or reachable.

---

## 2. Technical Execution Summary (Chunks 1–7)

The resolution was executed through seven modular chunks under the DAVE+R framework:

1. **Chunk 1–3 (Infrastructure Provisioning):** Defined and deployed a containerized Render Blueprint (`render.yaml`) provisioning web service `glycogourmet-demo-api` and managed PostgreSQL instance `glycogourmet-demo-postgres`.
2. **Chunk 4 (Health & Probe Ingress):** Bound unauthenticated `/health` and `/_health` endpoints in Strapi returning HTTP 200/204 with engine timestamps and zero PHI.
3. **Chunk 5 (Database Wiring, SG-1/SG-3 Hardening & JWT Verification):** Resolved database misconfiguration where Strapi defaulted to SQLite; wired connection to Render managed PostgreSQL (`Database: postgres`). Enforced `SG-1`/`SG-3` credential hardening in `server/seed.js`, added deterministic synthetic demo accounts (`demo-patient@glycogourmet.demo`, `demo-dietitian@glycogourmet.demo`, etc.) and an opt-in `RUN_DEMO_SEED=true` bootstrap hook. Successfully executed live authenticated `POST /api/auth/local` with verified HTTP 200 and genuine signed JWT (`[REDACTED]`).
4. **Chunk 6 (Gate SG-3 Live Endpoint & PHI Audit):** Probed 20 live Strapi routes on `https://glycogourmet-demo-api.onrender.com`. Confirmed zero PHI leakage, verified default-deny HTTP 403 on all protected collections, and verified auth endpoint rate-limiting (`EVD-2026-009`).
5. **Chunk 7 (Edge Proxy Rewiring & Browser Closeout):** Updated Netlify edge proxy (`netlify.toml` and `public/_redirects`) to route `/api/*` to `https://glycogourmet-demo-api.onrender.com/api/:splat`. Updated CSP `connect-src` to allow `https://*.onrender.com`. Validated real incognito browser login on Deploy Preview #28, rendering `/onboarding` with 0 console errors (`EVD-2026-010`).

---

## 3. The PR #29 / PR #28 Mix-Up and Conflict Resolution

### 3.1 The Mix-Up
During the transition from testing to merge, two pull requests were active against `master`:
- **PR #29 (`feat/render-demo-backend-plan`):** Infrastructure blueprints, database configurations, and audit evidence artifacts.
- **PR #28 (`fix/login-network-error`):** Frontend auth routing, Netlify edge proxy rewrites, CORS origin policies, and health check endpoints.

PR #29 was merged to `master` first at commit `27a0367e253c860e75f738d4290bb8efcf4b5275`. In the operating session, this merge event was initially mistaken by human operator Fotis P for the merge of PR #28. 

The discrepancy was caught through **direct GitHub API verification** (`gh pr view 28 --json state,merged` / `pull_request_read`), which proved that PR #28 remained `OPEN` and `merged: false`.

### 3.2 Resulting Merge Conflict & Governance Regression Risk
Because PR #29 merged into `master`, the `master` tip advanced past PR #28's base (`a7c6818` → `27a0367`). This divergence triggered a merge conflict between PR #28 and `master` across:
- `.env.example`
- `README.md`
- `server/seed.js`
- `governance/2026-09-login-fix/04-refine.md`

Critically, the conflict in `04-refine.md` presented a **genuine governance regression risk**:
- PR #28's branch had an older snapshot of `04-refine.md` recording status as `HOLD` (awaiting manual browser validation).
- Master's version of `04-refine.md` (brought in via PR #29) already recorded the final `PROMOTE` decision, closing evidence `EVD-2026-010`, and Section 6's forward-looking Netlify billing risk note.
A naive git merge or picking "ours" on PR #28 would have silently regressed the official governance status back to `HOLD`.

### 3.3 Resolution Mechanics
The conflict was resolved via a disciplined three-way merge:
1. **Authoritative Governance Preservation:** Master's incoming `04-refine.md` was preserved in full as authoritative (`PROMOTE`, `EVD-2026-010`, Netlify billing note).
2. **Environment & Doc Harmonization:** Merged `.env.example` and `README.md` to reference `VITE_STRAPI_API_URL` pointing to `https://glycogourmet-demo-api.onrender.com`, retained all optional keys (`VITE_STRAPI_TOKEN`, `VITE_ENABLE_DEMO_AUTH`, `VITE_USDA_API_KEY`), and preserved links to `docs/DEMO-ENVIRONMENT.md`.
3. **PR #28 Code Invariance:** Confirmed 100% of PR #28's actual code changes (`netlify.toml`, `public/_redirects`, `server/config/middlewares.js`, `src/context/AuthContext.jsx`, `tests/unit/AuthContext.spec.jsx`, health endpoints) merged cleanly without regression.
4. **Pre-Push Quality Gates:** Re-ran all gates before pushing:
   - `npm run lint`: 0 errors
   - `npx tsc --noEmit`: 0 errors
   - `npx vitest run`: 690 passed, 0 failed
   - `node scripts/governance-gates.js`: 21/21 mechanical gates passed
   - `npm run precommit`: Database integrity verified (74 ingredients, 31 recipes clean)
   - `npm run build`: Production bundle and PWA service worker generated cleanly in 600ms

The resolved branch was pushed to `origin/fix/login-network-error` (commit `e820fe20ff0e935a741e3987a765b33a1eaf0709`), restoring PR #28 to a `MERGEABLE` status.

---

## 4. Final Verified Merge Event

- **Target PR:** [PR #28](https://github.com/ux-fotisp/GlycoGourmet/pull/28) (`fix/login-network-error` → `master`)
- **Merge Commit SHA:** `786c527d9a1ae28086ccfcf8fb1c7ba33ed6f8ab`
- **Merged By:** `ux-fotisp` (Fotis P)
- **Merged At:** `2026-09-06T07:16:39Z`
- **Merge State:** Successfully merged into `master` with zero conflicts.

---

## 5. Lessons Learned & Preventative Engineering Gates

1. **Deterministic Merge Verification:** Never assume a green CI run or GitHub Actions build notification indicates that a specific PR was merged. When multiple pull requests touch shared infrastructure or documentation, always verify status programmatically via `gh pr view <number> --json state,merged,mergeCommit`.
2. **Anti-Regression Governance Guards:** In multi-stage governance cycles (DAVE+R), later stage artifacts (`04-refine.md`) must not be overwritten by earlier branch snapshots. Automated gate checks (`scripts/governance-gates.js`) should verify that once an evidence ID or promotion decision is recorded on master, branch reconciliation does not downgrade status.
3. **Edge Proxy Validation Protocol:** Frontends utilizing edge redirects (`netlify.toml` / `_redirects`) must have automated integration tests verifying that API routes are proxied to real backend endpoints rather than falling back to the SPA HTML entrypoint.
