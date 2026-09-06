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
| **Code Changes Staged** | `fix/login-network-error` (PR #28) |
| **Telemetry Summary** | Frontend routing and edge proxy rules updated. Netlify edge proxy (`/api/*`) and CSP `connect-src` rewired to `https://glycogourmet-demo-api.onrender.com`. Live Render backend running on managed PostgreSQL; unauthenticated health check returns 204; authenticated `/api/auth/local` returns HTTP 200 with valid JWT; Gate SG-3 PHI audit PASSED. |
| **Infrastructure Finding** | Render synthetic demo backend (`glycogourmet-demo-api.onrender.com`) is live and validated on managed PostgreSQL. Netlify edge proxy `/api/*` and CSP rules updated in repo to route to Render. |

---

## 2. Promotion Decision

| Decision | Selected? | Justification |
|---|---|---|
| **Promote** (shadow → enforcing / resolved) | ⬜ | *Blocked. Awaiting Fotis's manual browser verification before PROMOTE.* |
| **Hold** (cannot promote until manual browser test) | **✅ Selected** | **HOLD — cannot promote to enforcing/resolved yet.** Chunk 7 repo-level wiring complete. Awaiting Fotis's manual browser verification before PROMOTE. In accordance with DAVE+R Axiom 2 (evidence over assertion), the fix cannot be marked resolved until an actual end-to-end browser session login is manually confirmed on the Netlify deploy preview. |
| **Rollback** (revert change) | ⬜ | *Not required; architectural fixes, database wiring, and edge proxy rewrites are verified clean.* |

---

## 3. Exit Criteria to Move from HOLD to PROMOTE

To complete the promotion of `2026-09-login-fix` to fully resolved in production:

1. **✅ Provider Selection & Provisioning (Chunk 1-3):** Render Blueprint provisioned with Web Service (`glycogourmet-demo-api`) and Managed PostgreSQL (`glycogourmet-demo-postgres`).
2. **✅ Health Verification (Chunk 4):** Unauthenticated `/_health` returns HTTP 204 with Strapi engine signature; `/admin` returns HTTP 200 SPA shell.
3. **✅ Database Connection & Seeding (Chunk 5):** Managed PostgreSQL connected; all 5 deterministic demo accounts confirmed present (`confirmed: true`); `isApproved: true` set on `demo_patient`.
4. **✅ Live JWT Authentication Verification (Chunk 5):** Authenticated `POST /api/auth/local` with `demo-patient@glycogourmet.demo` returns genuine HTTP 200 with signed JWT (`[REDACTED]`) and safe user payload (`id: 3`, `roleType: "user"`, `isApproved: true`).
5. **✅ Gate SG-3 Live Endpoint & PHI Audit (Chunk 6):** Probed 20 live routes; confirmed zero PHI or user data leakage, default-deny 403 on all protected models, active auth rate-limiting.
6. **✅ Edge Proxy Alignment & CSP Wiring (Chunk 7):** `netlify.toml`, `public/_redirects`, and `.env.example` rewired to `https://glycogourmet-demo-api.onrender.com/api/:splat`, and `https://*.onrender.com` added to CSP `connect-src`.
7. **⏳ End-to-End Browser Login Verification (Chunk 7 — Final Manual Verification):** Fotis manually tests login on PR #28 Netlify deploy preview in browser DevTools Network tab and confirms HTTP 200 and successful navigation to patient dashboard.

---

## 4. Evidence

All factual claims documented using the typed schema `{ value, provenance, observed_at, source_url }`:

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `promotion_decision` | `HOLD` (awaiting Fotis's manual browser verification) | `asserted` | `2026-09-06T06:00:00Z` | `governance/2026-09-login-fix/04-refine.md` |
| `frontend_fix_branch` | `fix/login-network-error (PR #28)` | `observed` | `2026-09-06T06:00:00Z` | `git log -n 5 fix/login-network-error` |
| `backend_deployment_status` | `Live on Render (glycogourmet-demo-api.onrender.com)` | `observed` | `2026-09-06T04:42:28Z` | `curl.exe -i https://glycogourmet-demo-api.onrender.com/_health` |
| `render_db_engine` | `Managed PostgreSQL (glycogourmet-demo-postgres)` | `observed` | `2026-09-06T05:25:00Z` | `Render startup banner 'Database: postgres'` |
| `render_live_login_verified` | `HTTP 200 with valid JWT and safe user object` | `observed` | `2026-09-06T05:35:00Z` | `POST https://glycogourmet-demo-api.onrender.com/api/auth/local` |
| `sg3_endpoint_phi_audit` | `PASS: 20 routes probed; zero PHI leaked; protected models 403` | `observed` | `2026-09-06T05:55:00Z` | `sg-3-live-endpoint-audit-2026-09-06.md` |
| `netlify_edge_proxy_target` | `https://glycogourmet-demo-api.onrender.com/api/:splat` | `observed` | `2026-09-06T06:00:00Z` | `netlify.toml and public/_redirects` |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Soak / diagnostic results documented | ✅ Pass |
| Promotion decision recorded honestly as HOLD per Axiom 2/4 | ✅ Pass |
| Chunk 5 JWT login validation completed with verified evidence | ✅ Pass |
| Chunk 6 Gate SG-3 live endpoint/PHI audit completed (PASS) | ✅ Pass |
| Chunk 7 repo-level wiring complete; awaiting browser test | ✅ Pass |
| Evidence recorded with provenance | ✅ Pass |
| Awaiting Fotis's manual browser verification before PROMOTE | ⏳ In Progress |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._

