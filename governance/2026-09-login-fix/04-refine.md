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
| **Code Changes Staged** | `fix/login-network-error` (`4e601dc..e4ba583`) |
| **Telemetry Summary** | Frontend routing and edge proxy rules verified clean in unit/E2E tests (690 Vitest tests passing, 42 Playwright tests passing). |
| **Infrastructure Finding** | No Strapi backend instance is deployed or reachable from the public internet. Target domain `api.glycogourmet.com` has no DNS records. |

---

## 2. Promotion Decision

| Decision | Selected? | Justification |
|---|---|---|
| **Promote** (shadow → enforcing / resolved) | ⬜ | *Blocked. Cannot declare victory without a verified end-to-end login.* |
| **Hold** (cannot promote until live backend exists) | **✅ Selected** | **HOLD — cannot promote to enforcing/resolved until a real backend exists.** In accordance with DAVE+R Axiom 2 (evidence over assertion), the fix cannot be marked resolved until a genuine `HTTP 200` with a valid JWT payload is observed against a real, reachable Strapi backend. |
| **Rollback** (revert change) | ⬜ | *Not required; architectural fixes are correct and passing all test suites.* |

---

## 3. Exit Criteria to Move from HOLD to PROMOTE

To complete the promotion of `2026-09-login-fix` to fully resolved in production:

1. **Provider Selection & Provisioning:** Fotis selects and approves a hosting option (Render, Railway, VPS, or Strapi Cloud).
2. **Health Verification:** Unauthenticated health check endpoint returns `HTTP 200`:
   ```bash
   curl -i "https://<live-backend-host>/api/health"
   # Must return: {"status":"ok","timestamp":"..."}
   ```
3. **Database Seeding & Credential Rotation:** Seeding script executed against staging database under SG-1/SG-3 guard (randomized per-run passwords or documented rotation, never committing `Password123!`).
4. **Live JWT Authentication Verification:** Authenticated login returns genuine token:
   ```bash
   curl -i "https://<live-backend-host>/api/auth/local" -X POST \
     -H "Content-Type: application/json" \
     -d '{"identifier":"<real-seeded-user>","password":"<real-seeded-password>"}'
   # Must return: HTTP 200 with JSON payload containing .jwt and sanitized .user
   ```
5. **Edge Proxy Alignment:** `netlify.toml`, `public/_redirects`, and Netlify environment variable `VITE_STRAPI_API_URL` updated to point at the confirmed live URL.
6. **Fresh Test Run:** Re-run `npm run test`, `npm run test:e2e`, and `npm run build`.

---

## 4. Evidence

All factual claims documented using the typed schema `{ value, provenance, observed_at, source_url }`:

| Claim / Key | Value | Provenance (`observed` / `asserted` / `estimated`) | Observed At (ISO 8601) | Source URL / Command |
|---|---|---|---|---|
| `promotion_decision` | `HOLD` | `asserted` | `2026-09-05T06:26:55Z` | `governance/2026-09-login-fix/04-refine.md` |
| `frontend_fix_branch` | `fix/login-network-error (commits 4e601dc..e4ba583)` | `observed` | `2026-09-05T06:25:50Z` | `git log -n 4 fix/login-network-error` |
| `backend_deployment_status` | `Unprovisioned / No DNS for api.glycogourmet.com` | `observed` | `2026-09-05T06:18:16Z` | `curl -i https://api.glycogourmet.com --connect-timeout 5` |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Soak / diagnostic results documented | ✅ Pass |
| Promotion decision recorded honestly as HOLD per Axiom 2/4 | ✅ Pass |
| Clear, testable exit criteria documented | ✅ Pass |
| Evidence recorded with provenance | ✅ Pass |
| Governance pilot cycle completed (HOLD state) | ✅ Pass |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
