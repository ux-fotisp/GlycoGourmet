# 🚀 GlycoGourmet — Render Demo Deployment Guide

> **Target Environment:** Public Demonstration Only (Synthetic-Data-Only)  
> **Host Provider:** Render (Free Tier Web Service + Managed PostgreSQL)  
> **Authority & Governance:** DAVE+R Framework (Axiom 2: Evidence over assertion; Axiom 3: Named human owns risk; Axiom 5: Mandatory reversibility)  
> **Prerequisite:** Chunk 1 Compatibility Audit ([`scratch/render-compatibility-audit.md`](../scratch/render-compatibility-audit.md))  

---

## 1. Non-Clinical & Synthetic-Data-Only Disclaimer

> [!CAUTION]
> **STRICT NON-CLINICAL & PHI BAN:**  
> This deployment blueprint is strictly intended for **public demonstrations with synthetic mock data**.  
> - Under **NO circumstances** may real patient health information (PHI), real dietitian credentials, real clinic records, or real clinical exports be imported, seeded, or processed.  
> - All recipes, metabolic profiles, and user accounts seeded in this environment are synthetic sample models generated for UI/UX demonstration.  
> - This environment is **not HIPAA-compliant** and does not possess a Business Associate Agreement (BAA) with Render.

---

## 2. Render Free-Tier Operational Limits & Caveats

Deploying on the Render Free Tier incurs specific operational trade-offs that must be understood and communicated:

1. **Cold Starts & Sleep After Inactivity:**
   - Free Web Services automatically spin down after **15 minutes** of HTTP inactivity.
   - The first incoming request will experience a **50–60 second cold start** delay while the container re-spins.
2. **Temporary / Disposable Database:**
   - Render Free Tier PostgreSQL databases **expire and are automatically deleted after 30 days**.
   - Free PostgreSQL instances have **zero automated backups** and no point-in-time recovery. The database is strictly ephemeral and disposable.
3. **Ephemeral Media Storage:**
   - Render containers do not provide persistent disk storage on the free plan. Any user-uploaded images or media files saved to `public/uploads` are wiped upon container restart.
   - Core recipe catalog images reference external CDN URLs (`https://images.unsplash.com`) and are unaffected.
4. **No Availability SLA:**
   - The free tier offers no uptime guarantee and is intended solely for preview, evaluation, and demonstration.

### User-Facing Demo Notice
Frontend user interfaces communicating with this environment should display the following notice:
> *“The demo backend may take up to about one minute to wake after inactivity. Please wait before retrying.”*

---

## 3. Step-by-Step Manual Render Dashboard Setup

> [!IMPORTANT]
> **Human Execution Only:**  
> Antigravity AI agents are strictly forbidden from creating cloud resources, configuring cloud billing, or creating DNS entries. These steps must be executed manually by a named human operator in the Render Dashboard.

### Step 3.1: Connect Repository via Blueprint
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Navigate to **Blueprints** → **New Blueprint Instance**.
3. Connect the `ux-fotisp/GlycoGourmet` repository.
4. Select the `feat/render-demo-backend-plan` branch (or `master` once merged).
5. Render will automatically parse [`render.yaml`](../render.yaml) located at the root of the repository.

### Step 3.2: Verify Service & Database Specifications
Render will detect two declared resources:
- **Web Service:** `glycogourmet-demo-api` (Environment: `Docker`, Context: `server`, Plan: `Free`, Region: `Frankfurt`)
- **Database:** `glycogourmet-demo-postgres` (Database: `glycogourmet`, Plan: `Free`, Region: `Frankfurt`)

### Step 3.3: Set Environment Variables & Secrets in Render Dashboard
For all variables marked with `sync: false` in `render.yaml`, populate them in the Render Dashboard under **Environment**:

| Variable Name | Description | Source |
|---|---|---|
| `NODE_ENV` | Runtime mode | Pre-set to `production` |
| `PORT` | Web service listen port | Injected dynamically by Render (or `1337`) |
| `HOST` | Bind host | Pre-set to `0.0.0.0` |
| `DATABASE_CLIENT` | Database dialect | Pre-set to `postgres` |
| `DATABASE_URL` | Connection string | Auto-populated via Blueprint from `glycogourmet-demo-postgres` |
| `DATABASE_SSL` | SSL enforcement | Pre-set to `true` |
| `PUBLIC_DEPLOYMENT`| Guard flag for `server/seed.js` | Pre-set to `true` |
| `CORS_ORIGIN` | Allowed Netlify origin | `https://glycogourmet.netlify.app` |
| `JWT_SECRET` | Strapi JWT signature secret | Generate locally (see §4) |
| `ADMIN_JWT_SECRET` | Admin authentication secret | Generate locally (see §4) |
| `APP_KEYS` | Session cookie keys | Generate locally (see §4) |
| `API_TOKEN_SALT` | API token salt | Generate locally (see §4) |
| `TRANSFER_TOKEN_SALT`| Data transfer salt | Generate locally (see §4) |
| `SEED_PASSWORD` | Demo account password | Generate locally (see §4) |

---

## 4. Secure Local-Only Secret Generation Commands

> [!WARNING]
> **ZERO SECRET EXPOSURE IN GIT:**  
> Run the following commands locally in your terminal. **NEVER** commit, print, place in a PR, or save these outputs to repository files. Copy the output directly into the Render Dashboard secret inputs.

```bash
# Generate high-entropy secrets for Strapi production
node -e "const crypto = require('crypto'); console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('base64'));"
node -e "const crypto = require('crypto'); console.log('ADMIN_JWT_SECRET=' + crypto.randomBytes(32).toString('base64'));"
node -e "const crypto = require('crypto'); console.log('APP_KEYS=' + crypto.randomBytes(16).toString('base64') + ',' + crypto.randomBytes(16).toString('base64'));"
node -e "const crypto = require('crypto'); console.log('API_TOKEN_SALT=' + crypto.randomBytes(16).toString('base64'));"
node -e "const crypto = require('crypto'); console.log('TRANSFER_TOKEN_SALT=' + crypto.randomBytes(16).toString('base64'));"

# Generate a strong, non-default demo seed password (SG-1 / SG-3)
node -e "const crypto = require('crypto'); console.log('SEED_PASSWORD=Demo!' + crypto.randomBytes(12).toString('base64url') + '#9');"
```

---

## 5. Safe Initial Demo-Account Procedure (SG-1 / SG-3)

- The backend seed script [`server/seed.js`](../server/seed.js) enforces the `PUBLIC_DEPLOYMENT=true` guard.
- When `PUBLIC_DEPLOYMENT=true` or `NODE_ENV=production`:
  1. The default credential `Password123!` is **never used**.
  2. If `SEED_PASSWORD` is defined in Render environment variables, that password is assigned to synthetic accounts (`dietitiana@glyco.com`, `patienta@glyco.com`, `clinicadmina@glyco.com`).
  3. If `SEED_PASSWORD` is omitted, the script auto-generates a distinct cryptographic random secret per role and prints it once to deploy stdout.
  4. Writing `.seed_data.json` to local disk is skipped to prevent credential leaks.
- To rotate demo credentials, simply update `SEED_PASSWORD` in the Render dashboard and trigger a redeployment.

---

## 6. Health & Verification Procedures

### 6.1 Health Endpoint Verification
Once the Render Web Service displays "Live", obtain the service URL (e.g. `https://glycogourmet-demo-api.onrender.com`):

```bash
# Verify public unauthenticated health endpoint
curl -i https://<your-render-service-url>/_health
```
**Expected Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok","timestamp":"2026-09-05T..."}
```

### 6.2 Sanitized Live JWT Validation Procedure
To verify that real authentication operates without exposing raw JWT tokens in shell history or CI logs:

```bash
# Request login and verify HTTP 200 + token presence without printing the token value:
curl -sS -X POST "https://<your-render-service-url>/api/auth/local" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"dietitiana...","password":"<your-seed-password>"}' \
  | node -e "
    let raw = '';
    process.stdin.on('data', c => raw += c);
    process.stdin.on('end', () => {
      try {
        const d = JSON.parse(raw);
        if (d.jwt && typeof d.jwt === 'string' && d.jwt.split('.').length === 3) {
          console.log('PASS: HTTP 200 and valid JWT structure received. Token length:', d.jwt.length);
        } else {
          console.error('FAIL: No valid JWT in response. Status or error:', d.error || d);
          process.exit(1);
        }
      } catch (e) {
        console.error('FAIL: Invalid JSON response:', e.message);
        process.exit(1);
      }
    });
  "
```
> [!NOTE]
> This command verifies the 3-part structure of the JWT without logging the token secret or payload.

---

## 7. Netlify Frontend Wiring Steps

Wiring the frontend to the Render backend must occur **ONLY AFTER** live backend health and authentication have been validated:

1. **Option A: Netlify Edge Proxy Rewrite (Recommended):**
   - In [`netlify.toml`](../netlify.toml) and [`public/_redirects`](../public/_redirects), update the upstream target:
     ```toml
     [[redirects]]
       from = "/api/*"
       to = "https://<your-render-service-url>/api/:splat"
       status = 200
       force = true
     ```
2. **Option B: Custom Domain Routing:**
   - In DNS management, add a CNAME record for `api.glycogourmet.com` pointing to the Render service ingress (`<service>.onrender.com`).
3. **Frontend Environment Variable:**
   - Verify `VITE_ENABLE_DEMO_AUTH=false` remains configured in Netlify build environment variables.

---

## 8. Rollback and Teardown Procedure (Axiom 5)

If the demo environment needs to be deactivated, quarantined, or torn down:

1. **Immediate Service Suspension:**
   - In Render Dashboard → `glycogourmet-demo-api` → **Settings** → **Suspend Web Service**.
   - Suspends all compute immediately.
2. **Proxy Target Neutralization:**
   - In Netlify, revert [`netlify.toml`](../netlify.toml) rewrite or point `/api/*` to a static 503 responder.
3. **Secret Revocation & Database Teardown:**
   - In Render Dashboard → `glycogourmet-demo-postgres` → **Settings** → **Delete Database**.
   - Deleting the database instantly renders all existing tokens and user passwords invalid.
4. **Local / Git Cleanliness:**
   - Revert any local wiring commits via `git revert <commit-sha>`.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
