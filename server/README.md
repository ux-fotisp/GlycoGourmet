# 🛡️ GlycoGourmet — Backend Server & Strapi CMS

> **Strapi v4/v5 Headless CMS, PostgreSQL Schemas, and Clinical Tenancy Engine**  
> *Architected by [Fotis Pastrakis](https://fotisp.gr)*

---

## 📖 Canonical Documentation Notice

The complete architectural specifications, database schemas, lifecycle validation guards, REST API contracts, and deployment runbooks are maintained in the root documentation manual:

👉 **[backend_dev.md](../backend_dev.md)**

Please refer to [backend_dev.md](../backend_dev.md) for comprehensive technical details on:
- Strapi Content-Types & Canonical Schema Registry.
- Database Lifecycle Invariant Guards (`recipe`, `ingredient`, `audit-record`, `prescribed-meal-plan`).
- Row-Level Tenancy Policy (`is-dietitian-owner.js`) & Controller Overrides.
- Complete REST API Endpoints & JWT Authentication.
- Production Operations, PostgreSQL `pg_dump`/`pg_restore`, and Netlify integration.

---

## 🚀 Quickstart Commands

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Seed database with clinical roles, users, ingredients, and recipes
node seed.js

# 4. Start local development server (Port 1337)
npm run develop
```

### Running with Docker:
```bash
# From repository root
docker-compose up strapi
```
