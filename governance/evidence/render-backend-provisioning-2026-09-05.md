# Render Demo Backend Provisioning & Health Verification

**Evaluation Date:** 2026-09-06  
**Evaluation Time:** 04:42:28 UTC (07:42:28 EEST)  
**Evaluator:** Antigravity agent (session `e622fc11-cdd7-44ee-a2c4-e9a9ce4bcede`)  
**Repository:** `ux-fotisp/GlycoGourmet`  
**Branch:** `feat/render-demo-backend-plan`  
**Render Service:** `glycogourmet-demo-api` (`web`, Docker environment, Frankfurt region)  
**Backend URL:** `https://glycogourmet-demo-api.onrender.com`  
**DAVE+R Evidence ID:** `EVD-2026-007`  
**Provenance:** `observed`  
**Verification Status:** `verified`  

---

## 1. Scope & Security Boundaries

### Synthetic Demonstration Scope Statement
This deployed backend environment (`glycogourmet-demo-api` on Render) is provisioned exclusively for **public synthetic-data demonstration and testing**.
* Under no circumstances is real patient data, real clinician data, real clinic identifiers, or Protected Health Information (PHI) ever uploaded, stored, processed, or referenced in this environment.
* The attached PostgreSQL database (`glycogourmet-demo-postgres`) is disposable and subject to Render Free Tier lifetime limits (30-day disposable runtime, no automated backups).
* `VITE_ENABLE_DEMO_AUTH` remains disabled across all deployed builds; authentication is strictly mediated by Strapi's JWT engine.

---

## 2. Resolved Incident & Deployment Chain

The provisioning of the Render Docker service encountered and resolved four sequential issues before achieving healthy production boot:

### 1. Dockerfile `ENV` Syntax Error (`f4581ad` — 2026-09-05)
* **Symptom:** Build failed immediately during image compilation: `Syntax error - can't find = in "/opt/app". Must be of the form: name=value`.
* **Root Cause:** In `server/Dockerfile`, an unescaped trailing backslash on line 5 (`ENV NODE_ENV=\`) caused Docker BuildKit to concatenate line 6 (`WORKDIR /opt/app`) into the `ENV` instruction.
* **Resolution:** Replaced with explicit `ENV NODE_ENV=${NODE_ENV}` in commit `f4581ad`.

### 2. Strapi Develop Mode at Runtime (`25fa530` — 2026-09-05)
* **Symptom:** Docker container built successfully, but Render's port scan timed out after container start and exited with status 1: `npm error command sh -c strapi develop`.
* **Root Cause:** `server/Dockerfile` line 13 had `CMD ["npm", "run", "develop"]`. In Strapi 4, `develop` launches an interactive development watcher that failed to bind the HTTP port non-interactively within Render's scan window.
* **Resolution:** Changed `CMD` to `CMD ["npm", "run", "start"]` in commit `25fa530`, invoking production Strapi start. Confirmed `server/config/server.js` correctly reads `process.env.HOST` and `process.env.PORT`.

### 3. Missing Static `public` Directory (`0bf667e` — 2026-09-05)
* **Symptom:** Strapi crashed during bootstrap at runtime with: `error: The public folder (/opt/app/public) doesn't exist or is not accessible. Please make sure it exists.`
* **Root Cause:** `server/public` was untracked in Git (`git ls-tree` returned empty). During `COPY . .`, `/opt/app/public` was not created in the image, causing Strapi's core bootstrap validation (`@strapi/strapi/dist/core/bootstrap.js:22`) to throw.
* **Resolution:** Added `RUN mkdir -p /opt/app/public/uploads` to `server/Dockerfile` in commit `0bf667e`, and committed `.gitkeep` files in `server/public/` and `server/public/uploads/`.

### 4. Configuration of Production Secrets (Manual Operator Action — 2026-09-06)
* **Action:** Five mandatory Strapi production secrets (`JWT_SECRET`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `APP_KEYS`) were missing from the initial Render environment variables and were set directly in the Render Dashboard Environment tab by human operator Fotis.
* **Boundary Integrity:** In adherence to DAVE+R Credential Guard, no secret values, generation timestamps, or content hashes were committed to Git, logged, or recorded in governance evidence.

---

## 3. Empirical Health-Check Verification

Live verification was conducted against the provisioned Render service on 2026-09-06 at 04:42:28 UTC.

### Test Commands & Live Output

#### Probe A: Primary Health Route (`/_health`)
```bash
curl.exe -i --max-time 20 https://glycogourmet-demo-api.onrender.com/_health
```

**Observed Response:**
```http
HTTP/1.1 204 No Content
Date: Sun, 06 Sep 2026 04:42:28 GMT
Connection: keep-alive
access-control-allow-credentials: true
content-security-policy: connect-src 'self' https:;img-src 'self' data: blob: https://market-assets.strapi.io;media-src 'self' data: blob:;default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline'
referrer-policy: no-referrer
rndr-id: 1aa1173f-7694-408e
Server: cloudflare
strapi: You are so French!
strict-transport-security: max-age=31536000; includeSubDomains
vary: Origin
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-powered-by: Strapi <strapi.io>
x-render-origin-server: Render
cf-cache-status: DYNAMIC
CF-RAY: a36acea599c2b77b-ATH
alt-svc: h3=":443"; ma=86400
```

* **HTTP Status:** `204 No Content` (Strapi core health-check standard response)
* **Custom Verification Header:** `strapi: You are so French!` (authentic Strapi engine signature)
* **Origin Confirmation:** `x-render-origin-server: Render`

#### Probe B: Secondary API Route (`/api/health`)
```bash
curl.exe -i --max-time 20 https://glycogourmet-demo-api.onrender.com/api/health
```

**Observed Response:**
```http
HTTP/1.1 404 Not Found
Date: Sun, 06 Sep 2026 04:42:31 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
x-powered-by: Strapi <strapi.io>
x-render-origin-server: Render

{"data":null,"error":{"status":404,"name":"NotFoundError","message":"Not Found","details":{}}}
```

* **HTTP Status:** `404 Not Found` (Expected; `/api/health` is not declared in this Strapi schema; confirms Strapi JSON error-handling layer is active and routing correctly).

#### Probe C: Admin Panel Verification (`/admin`)
```bash
curl.exe -i --max-time 10 https://glycogourmet-demo-api.onrender.com/admin
```

**Observed Response:**
* **HTTP Status:** `200 OK`
* **Content-Type:** `text/html; charset=utf-8`
* **Payload:** Compiled Strapi admin bundle (`<title>Strapi Admin</title>`).

---

## 4. Verification Summary Table

| Endpoint | Target URL | HTTP Code | Content-Type | Payload Integrity | Verdict |
|---|---|---|---|---|---|
| Primary Health | `https://glycogourmet-demo-api.onrender.com/_health` | **204** | *(None)* | Header `strapi: You are so French!`, zero body bytes | **PASS** |
| API Probe | `https://glycogourmet-demo-api.onrender.com/api/health` | **404** | `application/json` | Standard Strapi NotFound JSON, zero secrets/PHI | **PASS** |
| Admin UI | `https://glycogourmet-demo-api.onrender.com/admin` | **200** | `text/html` | Full Strapi Admin SPA shell | **PASS** |

* **Data Safety Confirmation:** All observed response bodies contain strictly system error or UI metadata. Zero database details, zero credentials, zero emails, zero user records, and zero PHI were emitted.

---

## 5. Rollback & Containment Plan

In the event of an operational anomaly, compromise, or testing completion, containment and rollback are executed via the following procedures:

1. **Immediate Service Suspension:**
   * In the Render Dashboard, navigate to `glycogourmet-demo-api` -> **Settings** -> **Suspend Web Service**.
   * Halts all container execution immediately, preventing any inbound traffic.
2. **Credential Rotation:**
   * Before any future restart or un-suspension, rotate all five secrets (`JWT_SECRET`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `APP_KEYS`) in the Render Environment tab.
   * This invalidates any previously issued JWTs or API tokens instantly.
3. **Edge Proxy Decoupling:**
   * Ensure Netlify edge proxy rules in PR #28 (`public/_redirects` / `netlify.toml`) do not point to `https://glycogourmet-demo-api.onrender.com` until end-to-end authentication is validated and co-signed.
4. **Disposable Database Teardown:**
   * Delete or reset the `glycogourmet-demo-postgres` instance in Render to wipe all synthetic demo tables and data.
