# 02 — Architect Artifact

> **Change ID:** `2026-09-login-fix`  
> **Date:** `2026-09-05`  
> **Author (Agent):** `Antigravity`  
> **Risk Owner (Human):** Fotis P  
> **Prerequisite:** `governance/2026-09-login-fix/01-define.md` approved

---

## 1. Components Touched

| File Path | Type | Nature of Change | Purpose |
|---|---|---|---|
| `src/context/AuthContext.jsx` | context / hook | modify | Route all auth endpoints through `STRAPI_URL` via `getApiUrl()` helper; eliminate hardcoded relative fetch paths. |
| `netlify.toml` | edge-config | modify | Add `/api/*` edge proxy rewrite rule before SPA fallback catch-all. |
| `public/_redirects` | edge-config | modify | Add `/api/*` splat rewrite directive ahead of `/* /index.html 200`. |
| `.env.example` | config-template | modify | Document `VITE_STRAPI_API_URL` and `VITE_STRAPI_TOKEN`. |
| `tests/unit/AuthContext.spec.jsx` | test | modify | Unit assertions verifying `getApiUrl` respects `STRAPI_URL`. |
| `server/seed.js` | backend-script | modify | Gated default `Password123!` behind production/public deployment check (SG-1/SG-3 hardening). |
| `server/src/api/health/` | api-route / controller | new | Minimal unauthenticated `/_health` and `/api/health` endpoints returning `{ status: "ok", timestamp }`. |
| `server/config/middlewares.js` | backend-config | modify | Explicitly configured CORS middleware to allow `https://glycogourmet.netlify.app`. |

---

## 2. Core Remediation Mechanisms

### Mechanism 1 — Client Base URL Normalization (`AuthContext.jsx`)
Previously, `login()`, `register()`, `refreshUserStatus()`, and `_persistUser()` invoked relative paths directly (e.g. `fetch('/api/auth/local')`). When deployed to a CDN where the backend is hosted under a separate origin or proxied domain, relative paths defaulted to the SPA static server.
- **Architectural Fix:** Implemented `getApiUrl(endpoint)` which dynamically resolves against `STRAPI_URL = import.meta.env.VITE_STRAPI_API_URL || import.meta.env.VITE_STRAPI_URL || ''`.
- If `STRAPI_URL` is configured, requests target `https://<backend-domain>/api/...`.
- If `STRAPI_URL` is omitted, requests fall back to `/api/...`, allowing Netlify edge proxy rewrite rules to handle proxying.

### Mechanism 2 — Edge Proxy Rewrite Directives (`netlify.toml` & `public/_redirects`)
In a Single Page Application on Netlify, the rule `/* /index.html 200` catches all unmatched routes. Any request to `/api/*` received by Netlify's CDN that lacks a prior redirect rule is resolved to `index.html`.
- **Architectural Fix:** Prepended an explicit splat proxy rewrite rule:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "https://api.glycogourmet.com/api/:splat"
    status = 200
    force = true
  ```
  And in `public/_redirects`:
  ```
  /api/*  https://api.glycogourmet.com/api/:splat  200!
  /*      /index.html                              200
  ```
- This guarantees Netlify intercepts `/api/*` before the SPA catch-all and forwards requests to the designated backend.

---

## 3. The Still-Open Architecture Gap: No Live Backend Exists

While Mechanisms 1 and 2 correct the frontend routing and CDN edge proxy architecture, an exhaustive infrastructure audit revealed that **no Strapi backend is currently deployed or reachable from the public internet**:
- The domain `api.glycogourmet.com` configured in the proxy rule has **no DNS record** (`NXDOMAIN`).
- No cloud backend instances exist across Git history on Render, Railway, Fly, Heroku, Supabase, or Neon.
- Consequently, proxying `/api/*` to `https://api.glycogourmet.com` will produce `HTTP 502 Bad Gateway` at the Netlify edge until a live host is provisioned.
- The architecture is structurally ready for a backend, but the hosting provider decision and DNS mapping remain open prerequisites.

---

## 4. Shadow-Mode Mechanism (Axiom A4)

| Field | Value |
|---|---|
| **Shadow mechanism** | Feature flag `VITE_ENABLE_DEMO_AUTH`: in local dev/testing, static mock authentication allows frontend development; in production staging builds, Vite statically tree-shakes demo authentication (`VITE_ENABLE_DEMO_AUTH=false`). |
| **Flag name** | `VITE_ENABLE_DEMO_AUTH` |
| **Observable signal** | Production JS bundle inspection (`index-CmprOFRd.js`) confirmed demo credentials completely absent from production build. |
| **Minimum soak period** | 3 days |
| **Promotion criteria** | Live backend instance deployed, health check returning 200 OK, and authenticated login returning valid JWT. |

---

## 5. Rollback Command (Axiom A5)

```bash
# One-command rollback for frontend auth proxy changes
git revert 4e601dc

# Revert seed hardening
git revert 961018c

# Revert health-check endpoint
git revert 0b67795

# Revert CORS policy
git revert e4ba583
```

| Rollback Type | Command | Tested? |
|---|---|---|
| Git revert | `git revert 4e601dc` | ✅ Yes (isolated commit on `fix/login-network-error`) |
| Environment toggle | Set `VITE_STRAPI_API_URL` in Netlify dashboard | ✅ Yes |

---

## 6. WCAG 2.1 AA & Rules-of-Hooks Compliance

| Check | Status | Notes |
|---|---|---|
| React Hooks Compliance | ✅ Pass | No conditional `useEffect` or `useState`; `useAuth` remains top-level and unconditional. |
| WCAG 2.1 AA | ✅ Pass | No UI markup changes; login modal and form controls retain existing ARIA attributes and focus management. |

---

## 7. Secondary Lens Checks (`gg-bot-fraud` / Module C)

| Check | Status | Evidence |
|---|---|---|
| Seed credentials guarded | ✅ Pass | `server/seed.js` gates hardcoded `Password123!` default when `NODE_ENV=production` or `PUBLIC_DEPLOYMENT=true`. |
| CORS origin whitelist | ✅ Pass | `server/config/middlewares.js` explicitly whitelists `https://glycogourmet.netlify.app`. |
| Health-check sanitization | ✅ Pass | `server/src/api/health/` exposes `{ status: "ok", timestamp }` with zero clinical or user data. |

---

## 8. Evidence

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `auth_context_commit` | `4e601dc` | `observed` | `2026-09-05T06:08:44Z` | `git show 4e601dc` |
| `seed_hardening_commit` | `961018c` | `observed` | `2026-09-05T06:23:47Z` | `git show 961018c` |
| `health_endpoint_commit` | `0b67795` | `observed` | `2026-09-05T06:24:49Z` | `git show 0b67795` |
| `cors_policy_commit` | `e4ba583` | `observed` | `2026-09-05T06:25:14Z` | `git show e4ba583` |

---

## 9. Gate Status

| Gate | Status |
|---|---|
| All touched files enumerated with paths | ✅ Pass |
| Two core mechanisms documented | ✅ Pass |
| Open architecture gap (unprovisioned backend) recorded | ✅ Pass |
| Rollback commands documented and verified | ✅ Pass |
| WCAG / Hooks compliance verified | ✅ Pass |
| Secondary lens checks passed | ✅ Pass |
| Evidence recorded with provenance | ✅ Pass |
| Ready for validate-worker | ✅ Pass |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
