# 🚀 GlycoGourmet — Production Operations & Deployment Runbook

> **Production Deployment, Operations, and Disaster Recovery Manual**  
> *Target Architecture: Netlify SPA Frontend + Strapi v4/v5 Headless CMS (PostgreSQL) + USDA FoodData Central*

---

## 1. Environment Variable Configuration Matrix

Configure the following environment variables in the corresponding deployment environments (Netlify Dashboard & Strapi Cloud / Railway):

### Frontend Environment Variables (Netlify)

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_STRAPI_URL` | **Yes** | `https://cms.glycogourmet.com` | Public REST API endpoint of the production Strapi CMS. |
| `VITE_USDA_API_KEY` | Optional | `DEMO_KEY` (or live USDA key) | API key for live search queries to USDA FoodData Central (`api.data.gov`). |
| `NODE_VERSION` | **Yes** | `22` | Node.js runtime version for Netlify build image. |

### Backend Environment Variables (Strapi CMS / Railway / Render)

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `HOST` | **Yes** | `0.0.0.0` | Binding host address. |
| `PORT` | **Yes** | `1337` | Strapi listening port. |
| `APP_KEYS` | **Yes** | `keyA,keyB,keyC,keyD` | Comma-separated cryptographic secrets for Strapi cookies. |
| `API_TOKEN_SALT` | **Yes** | `[random-salt-string]` | Salt for API token hash generation. |
| `ADMIN_JWT_SECRET` | **Yes** | `[random-jwt-secret]` | Secret for Strapi Admin Panel authentication tokens. |
| `JWT_SECRET` | **Yes** | `[random-jwt-secret]` | Secret for `@strapi/plugin-users-permissions` JWT tokens. |
| `DATABASE_CLIENT` | **Yes** | `postgres` | Database dialect (`postgres` for production, `sqlite` for dev). |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/glycogourmet` | Production PostgreSQL connection string with SSL. |

---

## 2. First-Time Production Deployment Procedure

### Phase A: Backend CMS Provisioning (Strapi + PostgreSQL)
1. **Provision PostgreSQL Database:**
   - Create a managed PostgreSQL 16+ instance on Railway, Render, Supabase, or AWS RDS.
2. **Deploy Strapi Backend (`server/` directory):**
   - Connect the GitHub repository to your backend host (e.g. Railway or Render).
   - Set the root directory to `server/`.
   - Set the build command: `npm install && npm run build`.
   - Set the start command: `npm run start`.
   - Populate all backend environment variables from Section 1.
3. **Run Initial Database Seed:**
   - From your CI/CD runner or local workstation configured with production access:
   ```bash
   VITE_STRAPI_URL="https://cms.glycogourmet.com" \
   STRAPI_API_TOKEN="[production-admin-api-token]" \
   node scripts/seedNewRecipes.js
   ```

### Phase B: Frontend SPA Deployment (Netlify)
1. **Connect Repository to Netlify:**
   - Navigate to [Netlify App](https://app.netlify.com) $\rightarrow$ **Add new site** $\rightarrow$ **Import an existing project**.
   - Select your Git provider (GitHub / GitLab) and authorize `GlycoGourmet`.
2. **Configure Build Settings:**
   - **Base directory:** Leave empty (root).
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. **Configure Environment Variables:**
   - Under **Site configuration** $\rightarrow$ **Environment variables**, set `VITE_STRAPI_URL` and `NODE_VERSION=22`.
4. **Deploy Site:**
   - Click **Deploy Site**. Netlify will trigger the build pipeline, apply `netlify.toml` security headers, and configure SPA single-page routing via `dist/_redirects`.

---

## 3. Verification & Smoke Test Checklist

After deployment completes, execute the following smoke tests:

- [ ] **SPA Route Traversal:** Navigate to `/#/recipes/all`, `/#/my-recipes`, and `/#/meal-plans`. Verify no 404s on browser refresh.
- [ ] **Security Headers:** Inspect response headers in DevTools Network tab:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy` present with allowed origins.
- [ ] **Metabolic Calculation Invariants:** Open a recipe detail page (e.g. `/#/recipe/1`) and verify:
  - Glycemic Load (GL) is displayed with chromatic indicator (Green / Amber / Red).
  - Serving stepper (`0.5x`, `1x`, `1.5x`, `2x`) scales ingredient weights and net carbs proportionally.
- [ ] **Offline Resilience:** Disconnect internet connection in DevTools; verify the app loads cached seed recipes without blank-screen crashes.

---

## 4. Rollback & Disaster Recovery Protocol

### A. Instant Frontend Rollback (Netlify)
1. In the Netlify dashboard, navigate to **Deploys**.
2. Locate the last known healthy deployment SHA.
3. Click the options menu (`...`) and select **Publish deploy**.
4. The healthy deployment is activated globally across Netlify CDN in $< 5$ seconds.

### B. Client-Side Cache Invalidation
If client browsers encounter stale chunks or corrupted local state:
1. Advise users to perform a hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`).
2. Alternatively, invoke programmatic cache clearing from the browser console:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   window.location.reload();
   ```

### C. Database Backup & Disaster Recovery
* **Automated Daily Backups:** Ensure daily automated snapshots are enabled on your managed PostgreSQL provider.
* **Manual Database Export:**
  ```bash
  pg_dump -U [user] -h [host] -d glycogourmet -F c -b -v -f "glycogourmet_backup_$(date +%Y%m%d).dump"
  ```
* **Database Restoration:**
  ```bash
  pg_restore -U [user] -h [host] -d glycogourmet -v "glycogourmet_backup_[timestamp].dump"
  ```

---

## 5. Maintenance & Support Contact

- **Lead Architect:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Repository:** `https://github.com/fotispastrakis/GlycoGourmet`
- **Issue Tracker:** `https://github.com/fotispastrakis/GlycoGourmet/issues`
