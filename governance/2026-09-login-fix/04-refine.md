# 04 — Refine Artifact

> **Change ID:** `2026-09-login-fix`  
> **Date:** `2026-09-05`  
> **Author (Agent):** `Antigravity`  
> **Risk Owner (Human):** Fotis P  
> **Prerequisite:** `governance/2026-09-login-fix/03-validate.md` approved

---

## 1. Current State & Soak Status

| Field | Value |
|---|---|
| **Investigation Target** | Netlify Staging Login Error (`Network error during login`) |
| **Code Changes Staged** | `fix/login-network-error` (`4e601dc..e4ba583`), `feat/render-demo-backend-plan` (`f9e29c2`) |
| **Telemetry Summary** | Frontend routing and edge proxy rules verified clean in unit/E2E tests (690 Vitest tests passing, 42 Playwright tests passing). Live Render backend running on managed PostgreSQL; unauthenticated health check returns 204; authenticated `/api/auth/local` returns HTTP 200 with valid JWT and safe user object (Chunk 5 complete). |
| **Infrastructure Finding** | Render synthetic demo backend (`glycogourmet-demo-api.onrender.com`) is live on managed PostgreSQL (`glycogourmet-demo-postgres`). All 5 demo accounts present (`confirmed: true`). Live JWT authentication verified empirically. |

---

## 2. Promotion Decision

| Decision | Selected? | Justification |
|---|---|---|
| **Promote** (shadow → enforcing / resolved) | **✅ Selected** | **PROMOTE — Code-ready for merge.** The code fix on `fix/login-network-error` (PR #28) and backend infrastructure on `feat/render-demo-backend-plan` are functionally verified and ready to merge to `master`. The entire chain of empirical evidence across Chunks 1–7 is complete and verified (Chunks 1–7 all PASS/COMPLETE, plus real incognito browser login verified on Deploy Preview #28 with zero errors).<br><br>*Operational Scope Boundary:* PROMOTE certifies that the code and infrastructure are technically resolved and ready for merge. Per Section 6, automatic live deployment to production remains separately gated on Netlify billing credit replenishment or plan upgrade by Fotis P, and does not block code-level approval. |
| **Hold** (cannot promote until remaining gate clears) | ⬜ | *Cleared. All technical blockers, backend provisioning, PostgreSQL wiring, and live browser validations are complete.* |
| **Rollback** (revert change) | ⬜ | *Not required; architectural fixes, database wiring, and endpoint security policies are verified clean.* |

---

## 3. Exit Criteria to Move from HOLD to PROMOTE

All exit criteria are now fully satisfied:

1. **✅ Provider Selection & Provisioning (Chunk 1-3):** Render Blueprint provisioned with Web Service (`glycogourmet-demo-api`) and Managed PostgreSQL (`glycogourmet-demo-postgres`).
2. **✅ Health Verification (Chunk 4):** Unauthenticated `/_health` returns HTTP 204 with Strapi engine signature; `/admin` returns HTTP 200 SPA shell.
3. **✅ Database Connection & Seeding (Chunk 5):** Managed PostgreSQL connected via commit `f9e29c2` (`Database: postgres`); all 5 deterministic demo accounts confirmed present (`confirmed: true`) in Strapi Admin Content Manager.
4. **✅ Live JWT Authentication Verification (Chunk 5):** Authenticated `POST /api/auth/local` with `demo-patient@glycogourmet.demo` returns genuine HTTP 200 with signed JWT (`[REDACTED]`) and safe user payload (`id: 3`, `roleType: "user"`, `isApproved: true`).
5. **✅ Gate SG-3 Live Endpoint & PHI Audit (Chunk 6):** Probed 20 live routes; confirmed zero PHI or user data leakage, default-deny 403 on all protected models, active auth rate-limiting (`EVD-2026-009`).
6. **✅ Edge Proxy Alignment & Staging Validation (Chunk 7):** Netlify edge proxy rewriting `/api/*` to `https://glycogourmet-demo-api.onrender.com/api/:splat` configured in `netlify.toml` and `public/_redirects` (commit `a0e10f5`).
7. **✅ Live Browser Verification (Chunk 7 Closeout):** Real incognito browser login executed and confirmed by Fotis P on Deploy Preview #28; post-login onboarding screen rendered with 0 console errors (`EVD-2026-010`).
8. **✅ Fresh Quality Gate Runs:** Re-verified `node scripts/governance-gates.js` (21/21 passed) and `npm run precommit` (690 Vitest tests, 42 E2E tests, Oxlint clean, TypeScript clean).

---

## 4. Evidence

All factual claims documented using the typed schema `{ value, provenance, observed_at, source_url }`:

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `promotion_decision` | `PROMOTE (code-ready; production publish gated on Netlify billing)` | `asserted` | `2026-09-06T06:40:00Z` | `governance/2026-09-login-fix/04-refine.md` |
| `frontend_fix_branch` | `fix/login-network-error (commits 4e601dc..e4ba583)` | `observed` | `2026-09-05T06:25:50Z` | `git log -n 4 fix/login-network-error` |
| `backend_deployment_status` | `Live on Render (glycogourmet-demo-api.onrender.com)` | `observed` | `2026-09-06T04:42:28Z` | `curl.exe -i https://glycogourmet-demo-api.onrender.com/_health` |
| `render_db_engine` | `Managed PostgreSQL (glycogourmet-demo-postgres)` | `observed` | `2026-09-06T05:25:00Z` | `Render startup banner 'Database: postgres'` |
| `render_live_login_verified` | `HTTP 200 with valid JWT and safe user object` | `observed` | `2026-09-06T05:35:00Z` | `POST https://glycogourmet-demo-api.onrender.com/api/auth/local` |
| `render_wrong_pw_control` | `HTTP 400 ValidationError (negative control)` | `observed` | `2026-09-06T05:36:00Z` | `POST https://glycogourmet-demo-api.onrender.com/api/auth/local` |
| `sg3_endpoint_phi_audit` | `PASS: 20 routes probed; zero PHI or user data leaked; all protected models 403` | `observed` | `2026-09-06T05:55:00Z` | `file:///governance/evidence/sg-3-live-endpoint-audit-2026-09-06.md` |
| `browser_login_verified` | `Real incognito browser login succeeded, onboarding screen rendered, 0 console errors` | `observed` | `2026-09-06T06:38:00Z` | `https://deploy-preview-28--glycogourmet.netlify.app` |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Soak / diagnostic results documented | ✅ Pass |
| Promotion decision transitioned to PROMOTE per Axiom 2/4 | ✅ Pass |
| Chunk 5 JWT login validation completed with verified evidence | ✅ Pass |
| Chunk 6 Gate SG-3 live endpoint/PHI audit completed (PASS) | ✅ Pass |
| Chunk 7 Netlify edge proxy wiring completed (PASS) | ✅ Pass |
| Live browser authentication verified on Deploy Preview #28 | ✅ Pass |
| Evidence recorded with provenance in ledger (EVD-2026-010) | ✅ Pass |
| Ready for master merge decision by Fotis P | ✅ Pass |

---

## 6. Forward-Looking Operational Risk Note (Observed 2026-09-06)

> ⚠️ **NEW Non-Code Operational Blocker: Netlify Production Publishing Paused**  
> **Classification:** External Hosting Account Constraint (Independent of Code Readiness)  
> **Observed Date:** 2026-09-06  
> **Action Owner (Human):** Fotis P  
> 
> **Operational Context & Release Boundary:**
> - **Code Readiness Unaffected:** This is purely an external Netlify account billing constraint (exhausted billing credits for the current cycle) and is strictly independent of code readiness. All code changes across PR #28 (`fix/login-network-error`) and backend infrastructure on Render are functionally complete and verified. This does **not** alter or invalidate the technical `PROMOTE` decision or any completed/passed audit records for Chunks 1–7.
> - **Deploy Previews Functional:** Staging and preview validation via Netlify deploy previews continues to operate normally (including PR #28's preview build).
> - **Production Merge Gated on Billing:** Merging PR #28 into `master` will **not** automatically deploy to live production while billing credits remain exhausted. Production release timing is therefore separately gated on Fotis P verifying or resolving credit allocation in the Netlify billing dashboard.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._


