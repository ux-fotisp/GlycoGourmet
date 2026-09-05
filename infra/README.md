# ☁️ GlycoGourmet — Backend Hosting Provider Candidates

> **Status:** Scaffolding Only. Neither selected nor deployed.  
> **Authority:** DAVE+R Framework (Axiom 3: Named Human Owns Risk).  
> **Decision Owner:** Fotis P (Gate `SG-7`).

This directory contains pre-wired, unapplied infrastructure configuration files for the three candidate hosting providers evaluated during the DAVE+R Release Readiness Review:
1. **Render** → [`render.yaml`](./render.yaml)
2. **Railway** → [`railway.json`](./railway.json)
3. **Fly.io** → [`fly.toml`](./fly.toml)

All three configurations are pre-wired for:
- Existing Strapi server in `server/` running on Node 20 LTS.
- Managed PostgreSQL integration.
- Standard environment variables matching `.env.example`.
- Mandatory `SEED_PASSWORD` and `PUBLIC_DEPLOYMENT=true` gating (`SG-1`/`SG-3` security guard in `server/seed.js`).
- CORS origin matching Netlify production (`https://glycogourmet.netlify.app`).
- Public health-check route `/health` (`server/src/api/health/`).

---

## Comparative Evaluation Matrix

| Provider | Estimated Monthly Cost | Managed PostgreSQL Support | Deploy-from-GitHub Simplicity | Recommended Region |
|---|---|---|---|---|
| **Render** | **~$14/mo**<br>• Web Service (Starter): $7/mo<br>• PostgreSQL (Starter): $7/mo<br>*(Free tier spins down after 15m idle; free DB expires after 30d)* | **High (Native Managed)**<br>Automatic daily backups, point-in-time recovery, internal private networking, zero-maintenance. | **Highest (Zero CLI)**<br>Connect GitHub repo in dashboard, sync `infra/render.yaml` Blueprint. Automatic deploys on push. | Frankfurt (`fra` / Germany) |
| **Railway** | **~$7–$12/mo**<br>• Base platform: $5/mo (includes $5 usage credit)<br>• Compute & DB billed on exact CPU/RAM usage | **High (Integrated Plugin)**<br>One-click PostgreSQL plugin in same project canvas, private networking, automatic volume backups. | **High (Dashboard / CLI)**<br>Connect repo directly from GitHub, autodetects `server/`, automatic PR preview environments. | Frankfurt (`europe-west3`) |
| **Fly.io** | **~$5–$10/mo**<br>• 1x shared CPU 1GB RAM: ~$5.70/mo<br>• Volume storage: $0.15/GB/mo | **Medium (Fly Machine / Ext)**<br>Fly Postgres runs as an app on micro-VMs with volumes (user manages major version updates). Or Supabase integration. | **Medium (Requires CLI / CI)**<br>Requires `flyctl` CLI or dedicated GitHub Actions workflow (`flyctl deploy`) with an API token. | Frankfurt (`fra`) |

---

## Detailed Provider Profiles

### 1. Render ([`render.yaml`](./render.yaml))
- **Architecture:** Managed Web Service + Managed PostgreSQL database defined declaratively via Render Blueprints.
- **Pros:**
  - Full infrastructure declared in code (`render.yaml`).
  - Automatic secret generation (`generateValue: true`) for `JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`, and `API_TOKEN_SALT`.
  - Native health checks hitting `/health`.
  - True managed PostgreSQL with zero sysadmin overhead.
- **Cons:**
  - Free tier is unsuitable for clinical staging due to cold starts (50s) and 30-day database expiry; requires paid Starter ($14/mo total).
- **How to Deploy (when decided):**
  1. Log into Render Dashboard → **Blueprints** → **New Blueprint Instance**.
  2. Connect `ux-fotisp/GlycoGourmet` repository.
  3. Render auto-parses `infra/render.yaml` and provisions both services.

---

### 2. Railway ([`railway.json`](./railway.json))
- **Architecture:** Nixpacks-built containerized web service with connected PostgreSQL plugin on private network.
- **Pros:**
  - Lowest realistic paid cost for low-traffic clinical staging (~$7–$10/mo).
  - Excellent dashboard visual canvas.
  - Native support for ephemeral PR staging environments.
  - Generates private networking variable `${{Postgres.DATABASE_URL}}` automatically.
- **Cons:**
  - Requires manually setting secrets (`JWT_SECRET`, `SEED_PASSWORD`) in the Railway dashboard or CLI.
- **How to Deploy (when decided):**
  1. Log into Railway Dashboard → **New Project** → **Deploy from GitHub repo**.
  2. Select `ux-fotisp/GlycoGourmet` and set root directory to `server`.
  3. Add **PostgreSQL** service to the project.
  4. Link `DATABASE_URL` to `${{Postgres.DATABASE_URL}}`.

---

### 3. Fly.io ([`fly.toml`](./fly.toml))
- **Architecture:** Bare-metal Firecracker micro-VMs running Docker container from `server/Dockerfile`.
- **Pros:**
  - Ultra-fast cold boot and low latency in Frankfurt (`fra`).
  - Strict resource isolation and memory controls.
- **Cons:**
  - Fly Postgres is self-managed (runs in a Fly Machine with a volume); requires manual backup scripts or external managed database.
  - Less turnkey GitHub App workflow; typically requires a GitHub Actions deploy token.
- **How to Deploy (when decided):**
  1. Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
  2. Run `fly launch --config infra/fly.toml`
  3. Create and attach database: `fly postgres create --name glycogourmet-postgres` && `fly postgres attach glycogourmet-postgres`
  4. Set secrets: `fly secrets set JWT_SECRET=... SEED_PASSWORD=...`

---

## Next Steps for Fotis P
1. Select one of the three options based on cost vs. convenience preference.
2. Direct Antigravity or execute the selected provider's setup.
3. Configure DNS CNAME/A record for `api.glycogourmet.com` pointing to the assigned ingress.
4. Run `scripts/sg3-endpoint-audit.sh https://api.glycogourmet.com` to verify live deployment and close Gate `SG-3`.
