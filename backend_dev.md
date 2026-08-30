# 🛡️ GlycoGourmet — Backend Architecture, APIs & Operations Manual

> **Headless Strapi CMS (v4/v5), PostgreSQL Schemas, RBAC Security Guards, REST API Reference, and Production Operations Runbook**  
> *Authored & Architected by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. System Topology & Backend Data Flow

GlycoGourmet operates as a decoupled Single Page Application (SPA) architecture powered by a headless **Strapi CMS (v4/v5)** backend, a managed **PostgreSQL** relational database, and real-time integration with **USDA FoodData Central**:

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 19 SPA + Netlify CDN)"]
        UI["React 19 UI
(Tailwind CSS v4)"]
        Router["React Router v7
(HashRouter & Guard Matrix)"]
        Store["Client Store Layer
(recipeStore / ingredientStore)"]
        Engine["Deterministic Metabolic Engine
(metabolicEngine.ts)"]
    end

    subgraph Backend ["Backend CMS Tier (Strapi v4/v5 on Railway / Render)"]
        StrapiAPI["Strapi REST Endpoints
(/api/recipes, /api/ingredients, /api/client-profiles)"]
        AuthModule["@strapi/plugin-users-permissions
(JWT Authentication & RBAC)"]
        Policies["Policy Layer
(is-dietitian-owner.js Tenant Guard)"]
        Lifecycles["Database Lifecycle Guards
(lifecycles.js Validation Gates)"]
        DB[(Managed PostgreSQL 16+ Database)]
    end

    subgraph External ["External Clinical Services"]
        USDA["USDA FoodData Central REST API
(api.data.gov Telemetry)"]
    end

    UI <--> Router
    Router <--> Store
    Store <--> Engine
    Store <--"SWR Cached REST (Bearer JWT)"--> StrapiAPI
    StrapiAPI <--> AuthModule
    StrapiAPI <--> Policies
    Policies <--> Lifecycles
    Lifecycles <--> DB
    Store <--"Live Nutrient Search"--> USDA
```

---

## 2. Strapi Content Types & Relational Schema Architecture

The Strapi CMS data layer defines 8 core collection types and user schemas:

### 2.1 Extended User Entity (`plugin::users-permissions.user`)
- **`roleType`** (Enum): `'user'` | `'dietitian'` | `'admin'`.
- **`isApproved`** (Boolean, default `false`): Security verification gate. Unapproved users are redirected to `/#/pending-approval`.
- **`onboarded`** (Boolean, default `false`): Tracks clinical intake completion.
- **`licenseId`** (String, optional): Practitioner license or registration number.
- **`credential`** (String, optional): Clinical designation (e.g. RDN, CDCES, MD).
- **`clinicName`** (String, optional): Associated hospital, practice, or clinic.
- **`auditNotes`** (Text): Administrative notes recorded during role elevation audits.

---

### 2.2 Master Recipe Entity (`api::recipe.recipe`)
- **`title`** (String, required): Recipe display title.
- **`description`** (Text): Clinical description and preparation overview.
- **`category`** (String): Recipe classification (e.g. `"Entrée"`, `"Salad"`, `"Bowl"`).
- **`mealOccasion`** (Enum, required): `breakfast` | `brunch` | `lunch` | `dinner` | `snack` | `dessert`.
- **`prepTime`** / **`cookTime`** (Integer): Times in minutes.
- **`servings`** (Integer, default `1`): Base portion count.
- **`ingredients`** (JSON / Component): Array of `{ ingredientId, amount, unit, prepState, customName }`.
- **`instructions`** (JSON): Array of sequential preparation step strings.
- **`glycemicIndex`** (Integer, 0–100): Net-carbohydrate weighted composite GI.
- **`glycemicLoad`** (Integer, 0–100): Portioned glycemic load per serving.
- **`glycemicImpact`** (Enum): `'Optimal Low-GI'` | `'Moderate Impact'` | `'High Spike Risk'`.
- **`nutrition`** (JSON): `{ kcal, protein, fat, carbs, fiber, netCarbs }`.
- **`status`** (Enum, default `'draft'`): `'draft'` | `'published'`.
- **`publishedAt`** (DateTime, nullable): ISO timestamp set exclusively by Dietitians/Admins upon certification.
- **`authorId`** (String / Relation): Submitter user ID.

---

### 2.3 Master Ingredient Entity (`api::ingredient.ingredient`)
- **`name`** (String, required): Common ingredient name.
- **`category`** (Enum): `protein` | `grain` | `vegetable` | `fat` | `dairy` | `legume` | `fruit` | `seasoning` | `cheese`.
- **`defaultAmount`** / **`defaultUnit`**: Baseline culinary measurement (e.g. `100g`, `1 cup`).
- **`defaultPrepState`** (Enum): `raw` | `steamed` | `sauteed` | `roasted` | `boiled` | `mashed_processed` | `cooled`.
- **`nutrition`** (JSON): Baseline macronutrient and GI profile per default amount.
- **`substitutions`** (JSON): Array of `SmartSwapPairing` definitions (`{ ingredientId, name, reason, expectedGlReduction }`).
- **`fdcId`** (Integer, optional): Ingestion reference linking to USDA FoodData Central.
- **`isUserAuthored`** (Boolean, default `false`): Flag distinguishing custom entries from ground truth.

---

### 2.4 Clinical Client Profile (`api::client-profile.client-profile`)
- **`dietitian`** (Relation, Many-to-One): Managing Dietitian user (`1:N`).
- **`patient`** (Relation, One-to-One): Subject Patient user (`1:1`).
- **`diabeticSubtype`** (Enum, required): `'T1D'` | `'T2D'` | `'GDM'` | `'Prediabetes'` | `'InsulinResistance'`.
- **`dietaryRestrictions`** (JSON): Array of clinical restriction tokens (e.g. `['gluten-free', 'dairy-free']`).
- **`status`** (Enum, default `'active'`): `'active'` | `'archived'`.

---

### 2.5 Metabolic Target Calibration (`api::metabolic-target-calibration.metabolic-target-calibration`)
- **`clientProfile`** (Relation, One-to-One): Unique link to parent `ClientProfile`.
- **`glTargetDaily`** (Decimal, default `45`): Target daily cumulative Glycemic Load budget (e.g. 45–60 GL/day).
- **`bolusOffsetMinutes`** (Integer, default `15`): Pre-meal insulin bolus timing offset (e.g. 15–30 min).
- **`netCarbCapDaily`** (Decimal, optional): Optional daily net carbohydrate ceiling (g).
- **`calorieBudgetDaily`** (Integer, optional): Optional daily energy target.
- **`glucoseUnit`** (Enum, default `'mg/dL'`): `'mg/dL'` | `'mmol/L'`.
- **`updatedByDietitian`** (Relation, Many-to-One): Last modifying clinician.

---

### 2.6 Prescribed Meal Plan (`api::prescribed-meal-plan.prescribed-meal-plan`)
- **`clientProfile`** (Relation, Many-to-One): Target patient profile (`N:1`).
- **`dietitian`** (Relation, Many-to-One): Authoring clinician (`N:1`).
- **`weekStartDate`** (Date, required): ISO Monday date (`YYYY-MM-DD`).
- **`scheduledSlots`** (JSON, required): 42-slot map: `{ [dayOfWeek]: { [occasion]: recipeId } }`.
- **`cumulativeDailyGL`** (JSON): Daily computed cumulative GL totals (`{ monday: 42, tuesday: 38, ... }`).
- **`cumulativeDailyNetCarbs`** (JSON): Daily net carbohydrate totals.
- **`status`** (Enum, default `'active'`): `'draft'` | `'active'` | `'archived'`.

---

### 2.7 Smart Swap Rule (`api::smart-swap-rule.smart-swap-rule`)
- **`clientProfile`** (Relation, Many-to-One): Subject client profile.
- **`sourceIngredient`** (String, required): High/Med-GI ingredient to substitute.
- **`targetIngredient`** (String, required): Clinically approved low-GI alternative.
- **`scope`** (String, default `'all-plans'`): `'all-plans'` or specific `PrescribedMealPlan` ID.
- **`reason`** (Text): Clinical rationale for automated substitution.
- **`createdByDietitian`** (Relation, Many-to-One): Authoring clinician.

---

### 2.8 Dietitian Audit Record (`api::audit-record.audit-record`)
- **`recipe`** (Relation, One-to-One): Target recipe being audited.
- **`authorGL`** / **`systemGL`** (Decimal): Author-claimed vs. USDA engine-calculated GL.
- **`deltaGL`** (Decimal): Absolute difference $|\text{authorGL} - \text{systemGL}|$.
- **`authorNetCarbs`** / **`systemNetCarbs`** (Decimal): Author-claimed vs. engine-calculated net carbs.
- **`deltaNetCarbs`** (Decimal): Absolute difference $|\text{authorNetCarbs} - \text{systemNetCarbs}|$.
- **`flagged`** (Boolean, default `false`): Enforced `true` whenever delta $> 1.0\text{g}$.
- **`status`** (Enum, default `'passed'`): `'passed'` | `'pending'` | `'rejected'`.
- **`auditedByDietitian`** (Relation, Many-to-One): Reviewing clinician.

---

## 3. Database Lifecycle Invariant Guards & Safety Gates

Strapi database lifecycles enforce strict physiological and clinical safety invariants prior to persistence:

### 3.1 Recipe & Ingredient Macro Invariant Guards
Executed in `server/src/api/recipe/content-types/recipe/lifecycles.js` and `server/src/api/ingredient/content-types/ingredient/lifecycles.js`:

```javascript
function validateRecipePayload(data) {
  if (!data) return;

  // 1. Strict Positive Weight Invariant
  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach((item, idx) => {
      const amount = parseFloat(item?.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new ValidationError(`Ingredient [${idx}]: Amount must be strictly > 0g.`);
      }
    });
  }

  // 2. Fiber Inversion Anomaly Check
  const carbs = parseFloat(data.carbs ?? data.nutrition?.carbs) || 0;
  const fiber = parseFloat(data.fiber ?? data.nutrition?.fiber) || 0;
  const netCarbs = parseFloat(data.netCarbs ?? data.nutrition?.netCarbs) || (carbs - fiber);
  const gl = parseFloat(data.glycemicLoad ?? data.nutrition?.glycemicLoad) || 0;

  if (fiber > carbs) {
    throw new ValidationError(`Macronutrient Anomaly: Fiber (${fiber}g) cannot exceed Total Carbs (${carbs}g).`);
  }

  // 3. Non-Negative Net Carbs Invariant
  if (netCarbs < 0) {
    throw new ValidationError(`Macronutrient Anomaly: Net Carbs (${netCarbs}g) cannot be negative.`);
  }

  // 4. Physical Glycemic Load Boundary (0-100)
  if (gl > 100) {
    throw new ValidationError(`Physiological Ceiling Violation: GL (${gl}) exceeds physical maximum of 100.`);
  }
}
```

---

### 3.2 Automated Audit Discrepancy Gate
Executed in `server/src/api/audit-record/content-types/audit-record/lifecycles.js`:

```javascript
const DISCREPANCY_THRESHOLD = 1.0;

function evaluateDiscrepancyGate(data) {
  if (!data) return;

  const deltaGL = Math.round(Math.abs(parseFloat(data.authorGL) - parseFloat(data.systemGL)) * 100) / 100;
  const deltaNetCarbs = Math.round(Math.abs(parseFloat(data.authorNetCarbs) - parseFloat(data.systemNetCarbs)) * 100) / 100;

  data.deltaGL = deltaGL;
  data.deltaNetCarbs = deltaNetCarbs;

  const hasDiscrepancy = deltaGL > DISCREPANCY_THRESHOLD || deltaNetCarbs > DISCREPANCY_THRESHOLD;
  data.flagged = hasDiscrepancy;

  // Immutably enforce pending review status
  if (hasDiscrepancy) {
    data.status = 'pending';
  }
}
```

---

### 3.3 Prescribed Meal Plan Publication Safety Gate
Executed in `server/src/api/prescribed-meal-plan/content-types/prescribed-meal-plan/lifecycles.js`:
- Scans all referenced recipe IDs in `scheduledSlots`.
- Verifies that every recipe exists in the database.
- **Rejects uncertified drafts:** If any recipe has `status === 'draft'` or `publishedAt === null`, transaction is aborted with `ValidationError`.

---

## 4. RBAC, Authentication & Tenant Scoping Policies

### 4.1 Role-Based Access Control State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticated : POST /api/auth/local (JWT)
    Authenticated --> PendingApproval : isApproved === false
    PendingApproval --> /pending-approval : Intercept Navigation
    Authenticated --> PatientTier : isApproved === true && roleType === 'user'
    Authenticated --> DietitianTier : isApproved === true && roleType === 'dietitian'
    Authenticated --> AdminTier : isApproved === true && roleType === 'admin'

    PatientTier --> PersonalWorkspace : Author Drafts & Meal Plans
    DietitianTier --> CohortWorkspace : Prescribe Plans & Audit Queue
    AdminTier --> SystemAdmin : Full Publishing & User Elevation
```

---

### 4.2 Users-Permissions Server Extension (`strapi-server.js`)
Located at `server/src/extensions/users-permissions/strapi-server.js`:
- Intercepts auth callbacks (e.g. Google OAuth) and automatically sets `isApproved: false` for newly registered accounts.
- Sanitizes user payloads returned to the client, preventing unauthorized client-side role mutations.

---

### 4.3 Tenant Isolation Policy (`is-dietitian-owner.js`)
Located at `server/src/policies/is-dietitian-owner.js`:
- Guards clinical endpoints for `ClientProfile`, `MetabolicTargetCalibration`, `PrescribedMealPlan`, and `SmartSwapRule`.
- Rejects unauthenticated callers immediately.
- Enforces that dietitians can only access client records linked to their own `user.id`.
- Bypasses restriction for users with `roleType === 'admin'`.

---

## 5. Strapi REST API Specifications & Reference

All endpoints are served from `https://cms.glycogourmet.com/api` (or local development `http://localhost:1337/api`).

### 5.1 Authentication & Profile Endpoints

#### Local Authentication (Sign In)
- **Endpoint:** `POST /api/auth/local`
- **Access:** Public
- **Request Body:**
```json
{
  "identifier": "dietitian@glyco.com",
  "password": "secure_password_here"
}
```
- **Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "username": "dr_sarah",
    "email": "dietitian@glyco.com",
    "provider": "local",
    "roleType": "dietitian",
    "isApproved": true,
    "onboarded": true,
    "licenseId": "RD-884920",
    "credential": "RDN, CDCES",
    "clinicName": "Metabolic Wellness Center"
  }
}
```

#### Get Current User Profile
- **Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response (200 OK):** Current sanitized user record.

---

### 5.2 Recipe Management Endpoints

#### Fetch Published Recipes (Catalog View)
- **Endpoint:** `GET /api/recipes`
- **Query Parameters:**
  - `populate=*`: Expands nested relations and ingredient components.
  - `filters[status][$eq]=published`: Filters to publicly certified recipes.
  - `sort[0]=nutrition.glycemicLoad:asc`: Sorts by lowest Glycemic Load.
- **Example Request:**
```http
GET /api/recipes?populate=*&filters[status][$eq]=published&sort[0]=nutrition.glycemicLoad:asc HTTP/1.1
Host: cms.glycogourmet.com
Authorization: Bearer <JWT>
```

#### Fetch Single Recipe by Slug or ID
- **Endpoint:** `GET /api/recipes/:id`
- **Query Parameters:** `populate=*`

#### Create Recipe (Draft / Published)
- **Endpoint:** `POST /api/recipes`
- **Headers:** `Authorization: Bearer <JWT>`
- **Payload Example:**
```json
{
  "data": {
    "title": "Avocado & Wild Salmon Grain Bowl",
    "category": "Bowl",
    "mealOccasion": "dinner",
    "prepTime": 15,
    "cookTime": 20,
    "servings": 2,
    "status": "draft",
    "publishedAt": null,
    "authorId": "user_44",
    "nutrition": {
      "kcal": 460,
      "protein": 34.0,
      "fat": 18.0,
      "carbs": 24.0,
      "fiber": 8.0,
      "netCarbs": 16.0,
      "glycemicIndex": 28,
      "glycemicLoad": 4
    },
    "ingredients": [
      {
        "ingredientId": "wild-salmon",
        "amount": 200,
        "unit": "g",
        "prepState": "roasted"
      },
      {
        "ingredientId": "avocado-raw",
        "amount": 100,
        "unit": "g",
        "prepState": "raw"
      }
    ],
    "instructions": [
      "Roast salmon at 200°C for 15 minutes.",
      "Slice fresh avocado and assemble over grain base."
    ]
  }
}
```

#### Update / Certify Recipe
- **Endpoint:** `PUT /api/recipes/:id`
- **Headers:** `Authorization: Bearer <JWT>`
- **Usage:** Used by Dietitians/Admins to update macros, modify ingredients, and transition `status` to `'published'` with `publishedAt: "2026-08-30T20:00:00.000Z"`.

---

### 5.3 Custom Ingredients Taxonomy Endpoints

- **`GET /api/ingredients`**: Retrieves custom and system ingredients.
- **`POST /api/ingredients`**: Submits a new custom ingredient to the pending verification queue.

---

### 5.4 HTTP Status Codes & Error Contract

| Status Code | Meaning | Context & Reason |
| :---: | :--- | :--- |
| **200 OK** | Success | Entity retrieved or updated successfully. |
| **201 Created** | Created | New recipe, ingredient, or calibration created. |
| **400 Bad Request** | Validation Error | Lifecycle invariant violated (e.g. fiber > carbs, amount $le 0$). |
| **401 Unauthorized** | Missing / Expired JWT | Request missing `Authorization: Bearer <token>`. |
| **403 Forbidden** | RBAC Policy Block | Standard patient attempting to publish public catalog recipe or cross-tenant query. |
| **404 Not Found** | Missing Entity | Requested recipe, ingredient, or client profile does not exist. |
| **500 Server Error** | Internal Failure | Unhandled database or CMS exception. |

---

## 6. Production Operations & Deployment Runbook

### 6.1 Environment Variable Configuration Matrix

#### Frontend Variables (Netlify)
| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_STRAPI_URL` | **Yes** | `https://cms.glycogourmet.com` | Public REST API base URL. |
| `VITE_USDA_API_KEY` | Optional | `DEMO_KEY` (or live USDA key) | FoodData Central API search key (`api.data.gov`). |
| `NODE_VERSION` | **Yes** | `22` | Node.js build image version. |

#### Backend Variables (Strapi CMS / Railway / Render)
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `HOST` | **Yes** | `0.0.0.0` | Server binding host address. |
| `PORT` | **Yes** | `1337` | Strapi port. |
| `APP_KEYS` | **Yes** | `keyA,keyB,keyC,keyD` | Cryptographic secrets for session cookies. |
| `API_TOKEN_SALT` | **Yes** | `[random-salt-string]` | Salt for admin API token hashes. |
| `ADMIN_JWT_SECRET` | **Yes** | `[random-jwt-secret]` | Secret for Strapi Admin Panel JWTs. |
| `JWT_SECRET` | **Yes** | `[random-jwt-secret]` | Secret for Users-Permissions JWT tokens. |
| `DATABASE_CLIENT` | **Yes** | `postgres` | Production database client dialect. |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/glycogourmet` | PostgreSQL connection string with SSL. |

---

### 6.2 First-Time Production Deployment Procedure

#### Phase A: Backend CMS Provisioning (Strapi + PostgreSQL)
1. **Provision Managed PostgreSQL 16+ Database:**
   - Deploy PostgreSQL on Railway, Render, Supabase, or AWS RDS.
2. **Deploy Strapi Backend (`server/`):**
   - Connect repository to backend host.
   - Set root directory: `server/`.
   - Build command: `npm install && npm run build`.
   - Start command: `npm run start`.
   - Populate all backend environment variables from Section 6.1.
3. **Execute Initial Database Seed:**
   ```bash
   VITE_STRAPI_URL="https://cms.glycogourmet.com"    STRAPI_API_TOKEN="[production-admin-api-token]"    node scripts/seedNewRecipes.js
   ```

#### Phase B: Frontend SPA Deployment (Netlify)
1. **Connect Repository to Netlify:**
   - Link `GlycoGourmet` repository on [Netlify App](https://app.netlify.com).
2. **Configure Build Settings:**
   - Base directory: (leave empty / root).
   - Build command: `npm run build`.
   - Publish directory: `dist`.
3. **Configure Environment Variables:**
   - Set `VITE_STRAPI_URL` and `NODE_VERSION=22`.
4. **Deploy & Apply Routing Fallbacks:**
   - Click **Deploy Site**. Netlify generates `dist/_redirects` (`/* /index.html 200`) ensuring client-side SPA routing.

---

### 6.3 HTTP Security Headers (`netlify.toml`)
- `X-Frame-Options: DENY`: Clickjacking prevention.
- `X-Content-Type-Options: nosniff`: MIME-type sniffing defense.
- `Content-Security-Policy`: Approved script/style/font/API origins (`api.data.gov`, `fonts.googleapis.com`, Strapi CMS).
- `Permissions-Policy`: Hardened sandbox disabling unused hardware APIs (`camera=(), microphone=(), geolocation=()`).

### 6.4 Asset Caching Strategy
- **Hashed Assets (`/assets/*`):** `Cache-Control: public, max-age=31536000, immutable` (1-year immutable cache).
- **HTML Entrypoint (`/index.html`):** `Cache-Control: public, max-age=0, must-revalidate` (Immediate cache revalidation on new deployments).

---

## 7. Verification, Rollback & Disaster Recovery Protocol

### 7.1 Post-Deployment Smoke Test Checklist
- [ ] **SPA Route Deep Linking:** Navigate to `/#/recipes/all`, `/#/my-recipes`, and `/#/meal-plans`; refresh browser to verify no 404s.
- [ ] **Security Headers:** Inspect DevTools Network tab for `X-Frame-Options`, `X-Content-Type-Options`, and CSP.
- [ ] **Metabolic Calculation Invariants:** Open recipe detail view; verify GL chromatic badge (Green/Amber/Rose) and serving stepper portion scaling.
- [ ] **Offline Seed Resilience:** Simulate offline in DevTools; verify local recipe cache loads without white-screen crash.

---

### 7.2 Rollback Protocol
1. **Netlify Instant Rollback:**
   - In Netlify dashboard $\rightarrow$ **Deploys** $\rightarrow$ select last known healthy deployment $\rightarrow$ **Publish deploy** ($< 5$ second instant rollback).
2. **Client-Side Cache Flushing:**
   - Hard refresh (`Ctrl + Shift + R` / `Cmd + Shift + R`) or console snippet:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   window.location.reload();
   ```

---

### 7.3 Database Backup & Restoration (PostgreSQL)

#### Automated Daily Snapshots:
Ensure managed provider automated daily backups are active with 30-day retention.

#### Manual Database Export:
```bash
pg_dump -U [user] -h [host] -d glycogourmet -F c -b -v -f "glycogourmet_backup_$(date +%Y%m%d).dump"
```

#### Manual Database Restoration:
```bash
pg_restore -U [user] -h [host] -d glycogourmet -v "glycogourmet_backup_[timestamp].dump"
```

---

## 8. Document Metadata & Attribution

- **Document Version:** `2.0.0`
- **Lead Systems Architect & Designer:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Backend Architecture:** Strapi v4/v5 Headless CMS, PostgreSQL 16+, Netlify Edge CDN
