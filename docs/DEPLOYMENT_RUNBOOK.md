# 🚀 GlycoGourmet — Production Operations & Deployment Runbook

> **Clinical Digital Health Platform Deployment & Disaster Recovery Directive**  
> *Target Architecture: React 19 SPA (Netlify CDN) + Strapi v4/v5 CMS (Render / Railway) + PostgreSQL*

---

## 1. Environment Configuration & Secrets Matrix

### 1.1 Client Presentation Tier (.env / Netlify Secrets)

| Variable Key | Description | Example / Fallback Value |
| :--- | :--- | :--- |
| VITE_STRAPI_URL | Headless CMS API Endpoint | https://api.glycogourmet.com |
| VITE_USDA_API_KEY | USDA FoodData Central REST Key | DEMO_KEY / Registered pi.data.gov Key |
| VITE_APP_ENV | Runtime Environment Flag | production / staging |

### 1.2 Backend CMS Tier (server/.env)

| Variable Key | Description | Production Directive |
| :--- | :--- | :--- |
| DATABASE_URL | PostgreSQL Connection URI | Dedicated Managed Instance |
| APP_KEYS | Strapi Application Security Keys | 4 Base64-encoded CSV keys |
| API_TOKEN_SALT | API Token Hash Salt | Unique 32-character secret |
| ADMIN_JWT_SECRET | Admin Panel JWT Salt | Unique 32-character secret |
| JWT_SECRET | Users & Permissions Token Salt | Unique 32-character secret |

---

## 2. Strapi Content-Types & Database Schema Manifest

Ensure the following 5 clinical content-types migrate and deploy cleanly on server bootstrap:

| Content-Type Identifier | Collection Table | Cardinality / Key Schema Constraints |
| :--- | :--- | :--- |
| **pi::client-profile** | client_profiles | dietitian (ManyToOne $\rightarrow$ user), patient (OneToOne $\rightarrow$ user), diabeticSubtype enum. |
| **pi::metabolic-target-calibration** | metabolic_target_calibrations | clientProfile (OneToOne $\rightarrow$ client-profile), glTargetDaily default 45. |
| **pi::prescribed-meal-plan** | prescribed_meal_plans | clientProfile (ManyToOne), dietitian (ManyToOne), scheduledSlots JSON, cumulativeDailyGL JSON. |
| **pi::smart-swap-rule** | smart_swap_rules | clientProfile (ManyToOne), sourceIngredient, 	argetIngredient, scope. |
| **pi::audit-record** | udit_records | 
ecipe (OneToOne), deltaGL, deltaNetCarbs, lagged boolean, status enum. |

---

## 3. RBAC Role Configuration & Clinical Permission Scopes

In the Strapi Admin Panel (**Settings $\rightarrow$ Users & Permissions Plugin $\rightarrow$ Roles**), verify the following endpoint access control matrix:

| Content Type / Action | Public | Authenticated (User) | Dietitian | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **pi::recipe** (ind, indOne) | ✅ | ✅ | ✅ | ✅ |
| **pi::recipe** (create, update) | ❌ | ✅ (Drafts only) | ✅ (Direct Publish) | ✅ |
| **pi::client-profile** (ind, indOne) | ❌ | ✅ (Self only) | ✅ (Tenant-isolated) | ✅ (All) |
| **pi::client-profile** (create, update) | ❌ | ❌ | ✅ | ✅ |
| **pi::metabolic-target-calibration** (CRUD) | ❌ | ✅ (Read-only) | ✅ | ✅ |
| **pi::prescribed-meal-plan** (CRUD) | ❌ | ✅ (Read-only) | ✅ | ✅ |
| **pi::smart-swap-rule** (CRUD) | ❌ | ❌ | ✅ | ✅ |
| **pi::audit-record** (Resolve / Gate) | ❌ | ❌ | ✅ | ✅ |

---

## 4. Staging & Production Smoke-Test Credential Registry

For staging smoke-testing and user verification:

`
# Administrator
Email: demo@glyco.com
Role: admin
Capabilities: Platform Governance, Catalog Curation, Org-wide Audit Queue

# Clinical Dietitian
Email: dietitian@glyco.com
Role: dietitian (Credential: RDN, Clinic: Glycemic Wellness Center)
Capabilities: Client Roster, 7-Day Plan Builder, Smart Swap Rules, Discrepancy Queue

# Patient / Caregiver
Email: patient@glyco.com
Role: user
Capabilities: Circadian Discovery, Personal Studio (Drafts), Cook Mode, Serving Stepper
`

---

## 5. Clinical Export & Interoperability Validation

Validate that export utilities function with zero external library overhead:

* **Weekly Grocery Manifest (generateGroceryManifest):** Aggregates quantities across 7 days $\times$ 6 occasions, scaled by serving multipliers and active swap rules, grouped into produce, proteins, dairy, and pantry.
* **Clinical Summary Report (generateClinicalSummaryReport):** Outputs daily GL/macro totals, flags OVER_BUDGET occurrences ({\text{day}} > GL_{\text{target}}$), and calculates adherence rate.
* **HL7 FHIR R4 Bundle (exportFHIRMetabolicTelemetry):** Produces valid JSON telemetry containing Observation resources mapped to LOINC 9843-4 (Carbohydrate / Glycemic Load) with UCUM {GL} units.

---

## 6. Rollback & Disaster Recovery Procedures

1. **Frontend Fast-Rollback (Netlify):**
   * Navigate to **Deploys $\rightarrow$ Deploy Details** and click **Publish deploy** on the last certified release hash.
2. **Database Schema Recovery:**
   * If database migrations fail or relations become corrupted:
     `sql
     DROP TABLE IF EXISTS prescribed_meal_plans, metabolic_target_calibrations, smart_swap_rules, client_profiles;
     `
   * Redeploy the previous backend container; the master 
ecipes, ingredients, and users tables will remain intact.
