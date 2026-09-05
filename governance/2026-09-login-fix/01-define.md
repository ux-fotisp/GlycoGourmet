# 01 — Define Artifact

> **Change ID:** `2026-09-login-fix`  
> **Date:** `2026-09-05`  
> **Author (Agent):** `Antigravity`  
> **Risk Owner (Human):** Fotis P  
> **Framework Lineage:** DAVE+R Core Lifecycle → Module D (Governance & Delivery)

---

## 1. Problem Statement

On the live Netlify staging deployment (`https://glycogourmet.netlify.app`), attempting to log in produced an immediate user-facing failure: `"Network error during login"`.

| Field | Value |
|---|---|
| **What is changing?** | Diagnostic and architectural remediation of the staging authentication failure: routing frontend auth calls through configurable `STRAPI_URL`, adding explicit edge rewrite proxy rules for `/api/*` in Netlify configuration, aligning environment variable fallbacks, and auditing backend reachability. |
| **Why is it needed?** | The Netlify staging environment SPA routing configuration redirected all requests (`/* -> /index.html 200`) to the Single Page Application bundle. When `AuthContext.jsx` issued relative API calls (`/api/auth/local`), Netlify returned `index.html` (HTTP 200/404 with Content-Type `text/html`) instead of proxying to a backend CMS, causing JSON deserialization failure and an uncaught network error in the browser. |
| **Clinical data scope impact** | **Zero impact.** Auth controllers (`/api/auth/local`) exchange user credentials for session tokens (`jwt`) and sanitize user entities. No Protected Health Information (PHI), glycemic logs, or clinical prescriptions are modified or exposed. |
| **Tenant isolation impact** | **Zero impact.** Does not alter row-level tenancy guards (`is-dietitian-owner.js`, `is-clinic-admin.js`) or tenant scoping controllers. |

---

## 2. Blast Radius

### 2.1 RBAC Roles Affected

| Role | Impact (direct / indirect / none) | Notes |
|---|---|---|
| Patient | Indirect | Client-side login entrypoint restored once backend is reachable. |
| Dietitian | Indirect | Client-side login entrypoint restored once backend is reachable. |
| ClinicAdmin | Indirect | Client-side login entrypoint restored once backend is reachable. |
| Admin | Indirect | Client-side login entrypoint restored once backend is reachable. |
| SuperAdmin | Indirect | Client-side login entrypoint restored once backend is reachable. |

### 2.2 Strapi Content Types Affected

| Content Type UID | Impact | Notes |
|---|---|---|
| `plugin::users-permissions.user` | Indirect | Target entity for authentication `/api/auth/local`. No schema changes. |

### 2.3 Existing Invariant Tests at Risk

| Test File | Test Name / Describe Block | Risk Level (high/medium/low) |
|---|---|---|
| `tests/unit/AuthContext.spec.jsx` | `AuthContext - Base URL Handling` | Medium (updated to verify `STRAPI_URL` routing) |
| `tests/integration/TenantScopingIntegration.spec.js` | `Strapi Integration - Tenant Scoping` | Low (requires live backend) |
| `tests/e2e/auth.spec.ts` | E2E authentication flows | Low (mocked in Playwright harness) |

### 2.4 DAVE+R Planes Touched

- [x] **identity** — `src/context/AuthContext.jsx`
- [ ] **data** — No database or PHI schema changes
- [ ] **application** — Metabolic engine unchanged
- [x] **edge-api** — `netlify.toml`, `public/_redirects`, `server/config/middlewares.js`
- [ ] **ci-cd** — GitHub Actions workflows unchanged

---

## 3. Explicit Non-Goals

| Non-Goal | Rationale |
|---|---|
| **Must not alter RBAC state machine or role hierarchy** | RBAC transitions (`isApproved`, `roleType`, `ClinicBillingAdmin`) are governed separately under `ROADMAP.md` §5.1 and must remain untouched. |
| **Must not touch PHI Boundary or Clinical Intake components** | `PHIBoundaryBanner.jsx` and intake pipelines are clinical isolation boundaries; auth routing must not bleed into clinical data handling. |
| **Must not alter Metabolic Math Invariants** | Net-carbs clamping, GI/GL calculations, and unit conversions are completely out of scope. |
| **Must not fabricate a backend deployment** | Axiom 2 (evidence over assertion) prohibits inventing a cloud provider or claiming a live backend exists before one is verified. |

---

## 4. Secondary Lens Applicability

| Check | Applicable? | Notes |
|---|---|---|
| `gg-bot-fraud` (Module C) — touches public unauthenticated endpoint? | **Yes** | `/api/auth/local` is a publicly accessible endpoint. When backed by a public server, rate-limiting, CORS origin restrictions, and default credential protections are required. |

---

## 5. Evidence

All claims recorded per the typed schema `{ value, provenance, observed_at, source_url }`:

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `live_staging_url` | `https://glycogourmet.netlify.app` | `observed` | `2026-09-05T06:01:22Z` | `netlify status` / DNS lookup |
| `staging_html_interception` | `HTTP/2 404 with Content-Type text/html returning Netlify 404 page` | `observed` | `2026-09-05T06:01:23Z` | `curl -i "https://glycogourmet.netlify.app/api/auth/local" -X POST ...` |
| `recipe_api_rewrite` | `HTTP/2 200 with Content-Type text/html returning index.html` | `observed` | `2026-09-05T06:01:24Z` | `curl -i "https://glycogourmet.netlify.app/api/recipes"` |
| `demo_auth_eliminated` | `VITE_ENABLE_DEMO_AUTH=false in production build bundle index-CmprOFRd.js` | `observed` | `2026-09-05T06:03:38Z` | `curl https://glycogourmet.netlify.app/assets/index-CmprOFRd.js` |
| `domain_nxdomain` | `curl: (6) Could not resolve host: api.glycogourmet.com` | `observed` | `2026-09-05T06:18:16Z` | `curl -i https://api.glycogourmet.com --connect-timeout 5` |

---

## 6. Gate Status

| Gate | Status |
|---|---|
| Problem statement grounded in staging observation | ✅ Pass |
| Blast radius enumerated (AuthContext, Netlify proxy, .env) | ✅ Pass |
| Non-goals declared (zero RBAC / PHI / metabolic math modifications) | ✅ Pass |
| Secondary lens applicability recorded (Module C active on auth endpoint) | ✅ Pass |
| Evidence recorded with provenance | ✅ Pass |
| Ready for architect-worker | ✅ Pass |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
