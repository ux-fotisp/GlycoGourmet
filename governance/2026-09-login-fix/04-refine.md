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
| **Promote** (shadow → enforcing / resolved) | ⬜ | *Blocked. Cannot promote until Gate SG-3 PHI audit and Netlify edge proxy validation are completed.* |
| **Hold** (cannot promote until remaining gates clear) | **✅ Selected** | **HOLD — cannot promote to enforcing/resolved yet.** While live backend provisioning and JWT login validation (Chunk 5) are now COMPLETE with verified empirical evidence, two operational blockers prevent promotion from HOLD to PROMOTE:<br>1. **Gate SG-3 Live Endpoint & PHI Audit (Chunk 6):** Unauthenticated public endpoints (`/api/recipes`, `/api/ingredients`, `/health`) on the live Render instance must be actively scanned to prove zero leakage of patient health information, glycemic load budgets, or sensitive telemetry.<br>2. **Netlify Edge Proxy & PR #28 Alignment (Chunk 7):** Verification of Netlify edge proxy rewriting `/api/*` to the live Render backend, and end-to-end frontend staging login validation.<br>In accordance with DAVE+R Axioms 1, 2, and 4, this change-set remains on HOLD until these two operational gates are cleared. |
| **Rollback** (revert change) | ⬜ | *Not required; architectural fixes and database wiring are correct and passing all tests.* |

---

## 3. Exit Criteria to Move from HOLD to PROMOTE

To complete the promotion of `2026-09-login-fix` to fully resolved in production:

1. **✅ Provider Selection & Provisioning (Chunk 1-3):** Render Blueprint provisioned with Web Service (`glycogourmet-demo-api`) and Managed PostgreSQL (`glycogourmet-demo-postgres`).
2. **✅ Health Verification (Chunk 4):** Unauthenticated `/_health` returns HTTP 204 with Strapi engine signature; `/admin` returns HTTP 200 SPA shell.
3. **✅ Database Connection & Seeding (Chunk 5):** Managed PostgreSQL connected via commit `f9e29c2` (`Database: postgres`); all 5 deterministic demo accounts confirmed present (`confirmed: true`) in Strapi Admin Content Manager.
4. **✅ Live JWT Authentication Verification (Chunk 5):** Authenticated `POST /api/auth/local` with `demo-patient@glycogourmet.demo` returns genuine HTTP 200 with signed JWT (`[REDACTED]`) and safe user payload (`id: 3`, `roleType: "user"`, `isApproved: false`).
5. **⏳ Gate SG-3 Live Endpoint & PHI Audit (Chunk 6 — Next):** Execute unauthenticated endpoint scan on `/api/recipes`, `/api/ingredients`, and `/_health` to prove zero patient health information or metric leakage.
6. **⏳ Edge Proxy Alignment & Staging Validation (Chunk 7):** Update Netlify edge proxy `/api/*` to route to `https://glycogourmet-demo-api.onrender.com/api/:splat` and verify live browser login on Netlify deploy preview.
7. **⏳ Fresh Test Run:** Re-verify `npm run test`, `npm run test:e2e`, and `npm run build`.

---

## 4. Evidence

All factual claims documented using the typed schema `{ value, provenance, observed_at, source_url }`:

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `promotion_decision` | `HOLD` (blocked by SG-3 audit and Netlify wiring) | `asserted` | `2026-09-06T05:45:00Z` | `governance/2026-09-login-fix/04-refine.md` |
| `frontend_fix_branch` | `fix/login-network-error (commits 4e601dc..e4ba583)` | `observed` | `2026-09-05T06:25:50Z` | `git log -n 4 fix/login-network-error` |
| `backend_deployment_status` | `Live on Render (glycogourmet-demo-api.onrender.com)` | `observed` | `2026-09-06T04:42:28Z` | `curl.exe -i https://glycogourmet-demo-api.onrender.com/_health` |
| `render_db_engine` | `Managed PostgreSQL (glycogourmet-demo-postgres)` | `observed` | `2026-09-06T05:25:00Z` | `Render startup banner 'Database: postgres'` |
| `render_live_login_verified` | `HTTP 200 with valid JWT and safe user object` | `observed` | `2026-09-06T05:35:00Z` | `POST https://glycogourmet-demo-api.onrender.com/api/auth/local` |
| `render_wrong_pw_control` | `HTTP 400 ValidationError (negative control)` | `observed` | `2026-09-06T05:36:00Z` | `POST https://glycogourmet-demo-api.onrender.com/api/auth/local` |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Soak / diagnostic results documented | ✅ Pass |
| Promotion decision recorded honestly as HOLD per Axiom 2/4 | ✅ Pass |
| Chunk 5 JWT login validation completed with verified evidence | ✅ Pass |
| Remaining blockers for promotion (SG-3 and Netlify proxy) documented | ✅ Pass |
| Evidence recorded with provenance | ✅ Pass |
| Ready for Chunk 6 (Gate SG-3 Live Endpoint Audit) | ✅ Pass |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
