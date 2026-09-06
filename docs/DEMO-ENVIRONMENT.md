# 🌐 GlycoGourmet — Demo Environment Architecture & Runbook

> **Single Source of Truth for Live Backend Services, Seeded Accounts & Integration Settings**  
> **Last Verified:** 2026-09-06 (Chunks 5–7 Verification)  
> **Platform Version:** v2.0.0-PROD

---

## 1. Environment Topology & Infrastructure

The live GlycoGourmet staging and demonstration environment operates with a decoupled frontend/backend architecture:

| Component | Provider & Service | Ingress URL / Host | Operating Database / Tier |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Netlify Edge CDN | `https://glycogourmet.netlify.app`<br>`https://deploy-preview-28--glycogourmet.netlify.app` | Static Vite bundle (React 19, Tailwind CSS v4) |
| **Backend CMS** | Render Web Service (`glycogourmet-demo-api`) | `https://glycogourmet-demo-api.onrender.com` | Headless Strapi CMS (Node.js 20 LTS) |
| **Database** | Render Managed PostgreSQL (`glycogourmet-demo-postgres`) | Internal private network connection | PostgreSQL 16 (Render Managed, NOT SQLite) |

### Key Diagnostic Endpoints
- **Liveness / Health Check:** `GET https://glycogourmet-demo-api.onrender.com/_health`  
  *Expected Response:* `HTTP 204 No Content` (0 bytes payload)
- **Strapi Administrative Console:** `GET https://glycogourmet-demo-api.onrender.com/admin`  
  *Expected Response:* `HTTP 200 OK` (Admin SPA login shell)
- **Authentication Ingress:** `POST https://glycogourmet-demo-api.onrender.com/api/auth/local`  
  *Expected Response (valid):* `HTTP 200 OK` + JWT JSON payload  
  *Expected Response (invalid):* `HTTP 400 Bad Request` (`ValidationError`)

---

## 2. Seeded Synthetic Demo Accounts

Five synthetic demo accounts are provisioned in the Render PostgreSQL database representing each persona in the GlycoGourmet clinical and administrative hierarchy:

| Account Identifier / Username | Email Address | Role Type (`roleType`) | Clinical / System Scope | Initial State |
| :--- | :--- | :--- | :--- | :--- |
| **`demo_patient`** | `demo-patient@glycogourmet.demo` | `user` | Patient persona (meal logging, personal glycemic targets) | `confirmed: true`<br>`isApproved: true` (manually approved) |
| **`demo_dietitian`** | `demo-dietitian@glycogourmet.demo` | `dietitian` | Clinical Dietitian (plan builder, calibration drawer) | `confirmed: true`<br>`isApproved: false` |
| **`demo_dietitian_b`** | `demo-dietitian-b@glycogourmet.demo` | `dietitian` | Secondary Clinical Dietitian (multi-dietitian tenancy) | `confirmed: true`<br>`isApproved: false` |
| **`demo_clinic_admin`** | `demo-clinic-admin@glycogourmet.demo` | `clinic_admin` | Clinic Administrator (growth, intake leads, PHI wall) | `confirmed: true`<br>`isApproved: false` |
| **`demo_admin`** | `demo-admin@glycogourmet.demo` | `admin` | System Administrator (tenant and role management) | `confirmed: true`<br>`isApproved: false` |

> 🔒 **Credential Security & Passwords Policy (QA-DIRECTIVE-2026 / Axiom 4):**  
> In accordance with medical digital health security standards, **passwords are never committed, printed, or recorded in documentation or repository files**.  
> Demo account passwords are set and managed manually by the risk owner via the Strapi Admin Content Manager UI directly (rather than via an automated `SEED_PASSWORD` environment variable).  
> For the complete empirical validation logs, negative controls, and credential handling audit trail, refer to [`governance/2026-09-login-fix/03-validate.md`](../governance/2026-09-login-fix/03-validate.md) (Evidence ID `EVD-2026-008`).

---

## 3. Frontend Configuration & Environment Variables

### Required Variables (`.env` / Netlify Build Environment)

| Variable | Required | Example / Demo Value | Purpose & Integration Behavior |
| :--- | :---: | :--- | :--- |
| **`VITE_STRAPI_API_URL`** | **Yes** | `https://glycogourmet-demo-api.onrender.com` | Base URL for all Strapi REST API calls (authentication, user profile, intake leads, consent). For local backend development, set to `http://localhost:1337`. |
| **`VITE_ENABLE_DEMO_AUTH`** | **Yes** | `false` | Fallback mock authentication. **Must remain `false` in all deployed environments** to enforce real backend JWT validation. |
| **`VITE_STRAPI_TOKEN`** | Optional | `your-read-only-api-token` | Read-only API key for unauthenticated master content queries. |
| **`VITE_USDA_API_KEY`** | Optional | `DEMO_KEY` | USDA FoodData Central API token for custom ingredient search. |

> ⚠️ **Critical Build-Time Inlining Notice (Vite):**  
> `VITE_*` environment variables are **baked directly into the compiled JavaScript bundle at build time** by Vite.  
> Changing `VITE_STRAPI_API_URL` in Netlify Site Settings or local `.env` **will NOT take effect upon browser refresh**. A full build and redeploy (`npm run build` or triggering a Netlify deploy) is strictly required for URL modifications to take effect in the client bundle.

### Netlify Edge Proxy Integration (PR #28)
To prevent cross-origin friction and guarantee smooth client requests:
- Netlify edge proxies `/api/*` requests directly to `https://glycogourmet-demo-api.onrender.com/api/:splat` via `netlify.toml` and `public/_redirects`.
- Netlify Content Security Policy (`CSP`) headers explicitly allow `connect-src 'self' https://glycogourmet-demo-api.onrender.com https://*.onrender.com https://api.nal.usda.gov`.

---

## 4. Cross-Origin Resource Sharing (CORS)

The Strapi backend on Render runs the core `'strapi::cors'` security middleware ([`server/config/middlewares.js`](../server/config/middlewares.js)).

The live backend explicitly allowlists the following client origins:
- `https://glycogourmet.netlify.app` (Netlify Production Frontend)
- `https://deploy-preview-28--glycogourmet.netlify.app` (Netlify Deploy Preview #28)
- `http://localhost:5173` (Vite Local Development Server)
- `http://localhost:4173` (Vite Local Preview Server)

Live audit verification confirmed that pre-flight `OPTIONS` and standard `POST`/`GET` requests originating from these domains receive matching `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true` headers.

---

## 5. Known Limitations & Operational Guidelines

1. **Unmounted `/api/recipes` Router (Informational):**  
   `GET /api/recipes` returns `HTTP 404 Not Found` on the live Strapi backend. The content-type schema and lifecycles for recipes exist under `server/src/api/recipe/`, but a public router file (`routes/recipe.js`) is not mounted.  
   *Operational Impact:* None for current users. The GlycoGourmet frontend operates from its rich standalone clinical recipe catalog (`src/services/recipeStore.js` and `public/data/recipes/`), which performs deterministic glycemic load calculations client-side.
2. **Account Approval Workflow (`isApproved: false` default):**  
   New user accounts created via Strapi's local registration or default seeding initialize with `isApproved: false`. Under GlycoGourmet's RBAC routing, users with `isApproved: false` are gated at an approval pending screen.  
   *Operational Requirement:* For immediate dashboard access during demonstrations, an administrator must manually toggle `isApproved: true` for the target account via the Strapi Admin Content Manager (already performed for `demo_patient`).
3. **Container Idle Spin-Down:**  
   The Render demo instance runs on Render cloud infrastructure. If idle, the service may take 30–50 seconds on initial wake-up. Health probes hitting `/_health` or initial API calls will wait for container initialization.
4. **PHI & Security Compliance:**  
   The live endpoint audit (Gate `SG-3`, [`governance/evidence/sg-3-live-endpoint-audit-2026-09-06.md`](../governance/evidence/sg-3-live-endpoint-audit-2026-09-06.md)) verified that all 20 clinical endpoints enforce default-deny (`HTTP 403`) with zero leakage of patient identifiers, carbohydrate budgets, or clinic tenant metadata.
