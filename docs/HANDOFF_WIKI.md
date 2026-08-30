# GlycoGourmet — Technical Architecture & Developer Handoff Wiki

**Document Version:** 2.0.0-PROD  
**Classification:** Clinical Systems Engineering / Enterprise Architecture  
**Author:** Principal Systems Architect & Lead Clinical UX Strategist  
**Last Updated:** August 30, 2026  

---

## Table of Contents
1. [System Overview & Technology Stack](#1-system-overview--technology-stack)
2. [Dual-Sided Architecture & Domain Models](#2-dual-sided-architecture--domain-models)
3. [Deterministic Mathematical Engines](#3-deterministic-mathematical-engines)
4. [Clinical Export & Interoperability Pipeline (HL7 FHIR R4)](#4-clinical-export--interoperability-pipeline-hl7-fhir-r4)
5. [Multi-Tenant RBAC & SaaS Tier Boundaries](#5-multi-tenant-rbac--saas-tier-boundaries)
6. [Mobile-First PWA, Offline Queuing & Kitchen Resilience](#6-mobile-first-pwa-offline-queuing--kitchen-resilience)
7. [Testing Strategy, Token Economy & QA Protocols](#7-testing-strategy-token-economy--qa-protocols)
8. [Production Deployment, Lifecycle Hooks & Runbooks](#8-production-deployment-lifecycle-hooks--runbooks)
9. [Roadmap Synthesis & Architectural North Star](#9-roadmap-synthesis--architectural-north-star)

---

## 1. System Overview & Technology Stack

GlycoGourmet is a clinical-grade dietary prescription, metabolic forecasting, and recipe management platform designed specifically for endocrinology clinics, diabetes care centers, and registered dietitians (RDNs/CDCESs). The platform bridges the gap between deterministic nutritional biochemistry and patient culinary execution.

```
+-----------------------------------------------------------------------------+
|                                CLIENT TIER                                  |
|  +--------------------------------+   +----------------------------------+  |
|  |  Dietitian Clinical Workspace  |   |    Patient Culinary Web App      |  |
|  |  (7-Day Plan Builder, Excursion|   |  (PWA, Ambient Cook Mode, Grocery|  |
|  |   Forecasting, Roster Audits)  |   |   Manifest, Pre-Meal Bolus Nudge)|  |
|  +--------------------------------+   +----------------------------------+  |
|                                    |                                        |
|  +-----------------------------------------------------------------------+  |
|  |  React 19 SPA | Tailwind CSS v4 (@theme) | Framer Motion | Recharts   |  |
|  |  Vite PWA (Workbox) | Screen Wake Lock API | Web Notifications API    |  |
|  +-----------------------------------------------------------------------+  |
+--------------------------------------|--------------------------------------+
                                       | HTTPS / WSS / REST
+--------------------------------------v--------------------------------------+
|                           HEADLESS CMS & API TIER                           |
|  +-----------------------------------------------------------------------+  |
|  |  Strapi v4/v5 Headless CMS (Node.js runtime)                          |  |
|  |  - Custom RBAC Middleware (Tenant Scoping & Ownership Verification)   |  |
|  |  - Lifecycle Safety Hooks (Draft Rejection, Discrepancy Audits)       |  |
|  +-----------------------------------------------------------------------+  |
|                                      |                                      |
|  +-----------------------------------v-----------------------------------+  |
|  |  PostgreSQL Database (Multi-Tenant Relational Schema)                 |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

### 1.1 Core Frontend Stack
* **Framework:** React 19 Single Page Application (SPA) structured with functional components, custom hooks, and React Router (`HashRouter` for standalone routing compatibility).
* **Styling & Design System:** Tailwind CSS v4 utilizing pure `@theme` design tokens conforming to the clinical **MagicPath Design Specification**.
* **Micro-Interactions & Animation:** Framer Motion with layout-aware physics, spring transitions, and strict `useReducedMotion()` fallback compliance (WCAG 2.1 AA).
* **Data Visualization:** Recharts for deterministic SVG rendering of 2-hour postprandial glycemic excursions, safe zone overlays, and hyperglycemic boundaries.
* **Offline Infrastructure:** `vite-plugin-pwa` with custom Workbox Service Worker (`src/sw.js`), local IndexedDB/LocalStorage mutation queuing (`syncQueue.ts`), and preattentive status indicators.

### 1.2 Core Backend & Storage Tier
* **CMS & API Gateway:** Strapi Headless CMS exposing RESTful JSON endpoints.
* **Relational Database:** PostgreSQL with strict foreign-key integrity, multi-tenant isolation schemas, and unique constraints.
* **Security & Authentication:** JWT token authentication with role-based permission scopes, approval gates, and multi-tenant middleware scoping.

### 1.3 Core Engineering Axiom: Deterministic Calculations Only
> [!IMPORTANT]
> **Zero Tolerance for Black-Box / Stochastic Models in Clinical Core:**  
> All nutritional aggregation, Glycemic Load rollups, postprandial glucose curve simulations, and ingredient substitutions **MUST BE 100% DETERMINISTIC**.  
> The use of machine learning, Large Language Models (LLMs), non-deterministic neural networks, or statistical approximations for metabolic math is strictly prohibited. Every output must be mathematically reproducible from USDA FoodData Central ground-truth datasets and peer-reviewed clinical literature (Brand-Miller et al.).

### 1.4 MagicPath Design Tokens & Color Palette
The platform adheres strictly to the MagicPath clinical palette configured in `src/index.css` via Tailwind v4 `@theme`:

| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Grain Ivory** | `#F6F4EE` | Global background canvas; warm, organic, glare-reducing |
| **Deep Pine** | `#1B3B22` | Primary brand tone; clinical authority, navigation rails, primary CTAs |
| **Deep Pine Variant**| `#2D5A34` | Hover & active state accents for primary controls |
| **Low GL Sage (Bg)** | `#D8E8CB` / `#E8F5E9` | Verified low-glycemic indicators, safe target adherence badges |
| **Low GL Sage (Text)**| `#386A20` / `#2E7D32` | High-contrast text for safe glycemic zones ($GL \le 10$) |
| **Moderate Amber (Bg)**| `#FDE8E1` / `#FFF3E0` | Moderate glycemic warnings, pending audit notifications |
| **Moderate Amber (Text)**| `#9E4D2A` / `#E65100` | High-contrast text for moderate glycemic zones ($11 \le GL \le 19$) |
| **High GL Rose (Bg)** | `#FCE8E8` / `#FFEBEE` | Severe glycemic spike alerts, allergen conflict indicators |
| **High GL Rose (Text)**| `#BA1A1A` / `#C62828` | High-contrast text for elevated glycemic impact ($GL \ge 20$) |

---

## 2. Dual-Sided Architecture & Domain Models

GlycoGourmet operates as a dual-sided ecosystem connecting healthcare providers with patients:

```
+-----------------------------------+        +-----------------------------------+
|    DIETITIAN CLINICAL WORKSPACE   |        |       PATIENT CULINARY APP        |
| - Patient Caseload Surveillance   |        | - Prescribed 7-Day Menu View      |
| - Metabolic Target Calibration    |        | - Ambient Cook Mode & Step Timers |
| - Excursion Kinetic Forecasting   | =====> | - Offline Grocery Manifest        |
| - Algorithmic Smart Swap Creation |        | - Pre-Meal Bolus Push Nudges      |
| - Clinic Standardization Library  |        | - Local Kitchen Substitutions     |
+-----------------------------------+        +-----------------------------------+
```

### 2.1 Object-Oriented UX (OOUX) Entity Multiplicity Matrix

| Entity 1 | Entity 2 | Relationship | Cardinality | Clinical Description |
| :--- | :--- | :--- | :--- | :--- |
| `Clinic` | `User` (Dietitian) | Has Many | $1 : N$ | A tenant organization manages multiple clinicians. |
| `Clinic` | `ClientProfile` | Has Many | $1 : N$ | A tenant organization scopes patient client profiles. |
| `User` (Dietitian) | `ClientProfile` | Has Many | $1 : N$ | A practitioner manages assigned patient profiles. |
| `ClientProfile` | `User` (Patient) | Associated | $1 : 1$ | Patient is the human subject of the clinical profile. |
| `ClientProfile` | `MetabolicTargetCalibration` | Has One | $1 : 1$ | Live metabolic targets (Daily GL budget, ISF, CIR). |
| `ClientProfile` | `PrescribedMealPlan` | Has Many | $1 : N$ | One active 7-day schedule; historical plans archived. |
| `PrescribedMealPlan`| `ScheduledSlot` | Has Many | $1 : 42$ | Up to 6 meal occasions across 7 calendar days. |
| `Recipe` | `Ingredient` | Composed Of | $N : M$ | Ingredients linked with thermal prep states. |
| `Ingredient` | `Ingredient` (Swap) | Substitutes | $1 : N$ | Lower-GI alternatives for clinical swaps. |
| `Recipe` | `AuditRecord` | Audited By | $1 : 0..1$ | Ground-truth verification record against USDA data. |
| `ClientProfile` | `SmartSwapRule` | Governed By | $1 : N$ | Practitioner-defined auto-substitution rules. |

### 2.2 TypeScript Domain Definitions (`src/types/domain.ts`)

```typescript
export type DiabeticSubtype = 'T1D' | 'T2D' | 'GDM' | 'Prediabetes' | 'InsulinResistance';
export type ClinicTier = 'INDEPENDENT' | 'CLINIC_PRO' | 'ENTERPRISE';
export type SharingScope = 'PRIVATE' | 'CLINIC_SHARED';
export type UserRole = 'user' | 'dietitian' | 'clinic_admin' | 'admin' | 'super_admin';

export interface MetabolicTargetCalibration {
  clientId: string;
  glTargetDaily: number;            // Daily GL Budget (e.g., 45 GL/day)
  bolusOffsetMinutes: number;        // Pre-meal bolus offset (e.g., 15-20 min)
  netCarbCapDaily?: number;          // Daily net carbohydrate ceiling in grams
  calorieBudgetDaily?: number;       // Target calorie budget
  glucoseUnit?: 'mg/dL' | 'mmol/L';
  insulinSensitivityFactor?: number; // ISF: 1 Unit insulin drops BG by X mg/dL
  carbToInsulinRatio?: number;       // CIR: 1 Unit insulin covers X grams carb
  targetPreMealGlucose?: number;     // Baseline target blood glucose (mg/dL)
  updatedAt: string;
  updatedByDietitianId: string;
}

export interface SmartSwapRule {
  id: string;
  clientId?: string;
  clinicId?: string;
  sourceIngredientId: string;
  targetIngredientId: string;
  sourceIngredientName?: string;
  targetIngredientName?: string;
  scope: 'all-plans' | string;
  sharingScope?: SharingScope;
  authorName?: string;
  deltaGL?: number;
  reason?: string;
  createdByDietitianId: string;
}

export interface MealPlanTemplate {
  id: string;
  clinicId: string;
  title: string;
  description?: string;
  authorDietitianId: string;
  authorName: string;
  targetSubtype?: DiabeticSubtype;
  sharingScope: SharingScope;
  avgDailyGL: number;
  scheduledSlots: {
    [day in DayOfWeek]?: Partial<Record<OccasionType, string>>;
  };
}
```

---

## 3. Deterministic Mathematical Engines

The core value proposition of GlycoGourmet is its mathematically rigorous nutritional calculations located in `src/services/metabolicEngine.ts` and `src/services/excursionEngine.ts`.

### 3.1 Net Carbohydrates & Thermal Preparation Multipliers

Net Carbohydrates represent the digestible glycemic carbohydrates available for intestinal absorption:

$$\text{Net Carbs (g)} = \max\left(0, \text{Total Carbohydrates (g)} - \text{Dietary Fiber (g)}\right)$$

Thermal and mechanical food processing alters the physical crystalline structure of amylose and amylopectin starches (starch gelatinization), significantly modifying the ingredient's effective Glycemic Index ($GI$):

$$GI_{\text{effective}} = \text{clamp}\left(0, 100, \text{round}\left(GI_{\text{raw}} \times M_{\text{prep}}\right)\right)$$

| Thermal / Mechanical Prep State | Multiplier ($M_{\text{prep}}$) | Physiological / Biochemical Mechanism |
| :--- | :---: | :--- |
| `raw` | $1.00$ | Native ungelatinized starch matrix; baseline enzymatic breakdown rate. |
| `steamed` | $1.05$ | Partial hydration; mild gelatinization of outer starch granules. |
| `sauteed` | $1.08$ | Dry heat in lipid medium; moderate starch swelling with lipid coating. |
| `boiled` | $1.15$ | Full hydrothermal swelling; disruption of crystalline amylose structure. |
| `mashed_processed` | $1.25$ | Mechanical shear completely lyses cell walls, maximizing amylase surface area. |
| `roasted` | $1.12$ | High dry-heat caramelization and partial dextrinization of starches. |
| `cooled` | $0.88$ | Amylose retrogradation forms Type-3 Resistant Starch ($RS_3$), reducing digestion. |

### 3.2 Carbohydrate-Weighted Composite Recipe GI & Glycemic Load

A recipe's composite Glycemic Index is computed as the carbohydrate-weighted average of its constituent ingredients:

$$GI_{\text{recipe}} = \frac{\sum_{i=1}^{n} \left(GI_{\text{effective}, i} \times \text{NetCarbs}_i\right)}{\sum_{i=1}^{n} \text{NetCarbs}_i}$$

The Glycemic Load ($GL$) per serving represents the real-world glycemic impact, scaled by the recipe's serving yield:

$$\text{NetCarbs}_{\text{serving}} = \frac{\sum_{i=1}^{n} \text{NetCarbs}_i}{\text{Servings}}$$

$$GL_{\text{serving}} = \text{round}\left(\frac{GI_{\text{recipe}} \times \text{NetCarbs}_{\text{serving}}}{100}\right)$$

### 3.3 Two-Hour Postprandial Glucose Excursion Modeling (`excursionEngine.ts`)

To forecast blood glucose dynamics without statistical approximations, GlycoGourmet implements a deterministic pharmacokinetic absorption curve sampled at 5-minute intervals ($t \in [0, 120]$ minutes):

$$\Delta BG(t) = \text{PeakRise} \times \left( \frac{t}{T_{\text{peak}}} \right) \times \exp\left( 1 - \frac{t}{T_{\text{peak}}} \right) - \text{BolusOffsetCorrection}(t)$$

Where:
* **Glycemic Impact Factor ($k_{\text{subtype}}$):** Evaluated from clinical insulin sensitivity ($k_{\text{T1D}} = 2.4$, $k_{\text{T2D}} = 2.0$, $k_{\text{GDM}} = 1.8$, $k_{\text{Prediabetes}} = 1.4$).
* **Peak Glucose Rise:** $\text{PeakRise} = GL_{\text{meal}} \times k_{\text{subtype}}$ (mg/dL).
* **Time-to-Peak ($T_{\text{peak}}$):** $T_{\text{peak}} = \text{clamp}(30, 60, 30 + \text{round}(GI_{\text{recipe}} \times 0.3))$ minutes.
* **Insulin Bolus Pharmacodynamics:** Calculated from patient's calibrated $\text{ISF}$ and $\text{CIR}$:

$$\text{RequiredBolus} = \frac{\text{NetCarbs}_{\text{meal}}}{\text{CIR}} \quad (\text{Units})$$

$$\text{BolusClearance}(t) = \text{RequiredBolus} \times \text{ISF} \times \left( \frac{\max(0, t - t_{\text{offset}})}{T_{\text{insulin\_peak}}} \right) \times \exp\left(1 - \frac{\max(0, t - t_{\text{offset}})}{T_{\text{insulin\_peak}}}\right)$$

---

## 4. Clinical Export & Interoperability Pipeline (HL7 FHIR R4)

GlycoGourmet includes a zero-dependency export pipeline (`src/utils/exportPipeline.js`) that produces interoperable data bundles for hospital EHRs and patient use.

```
                    +--------------------------------+
                    |    Prescribed 7-Day Schedule   |
                    +--------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +--------------------+     +-------------------+
|  7-Day Grocery   |     |    Clinical PDF    |     |  HL7 FHIR R4 JSON |
| Manifest Matrix  |     |   Summary Report   |     | Telemetry Bundle  |
+------------------+     +--------------------+     +-------------------+
```

### 4.1 Categorized Weekly Grocery Manifest
Aggregates all scheduled recipe ingredients across the 7-day calendar, normalizes units (grams, milliliters, whole items), and clusters items into supermarket categories:
1. `produce` (Fresh Vegetables, Fruits, Leafy Greens)
2. `proteins` (Poultry, Fish, Eggs, Tofu, Legumes)
3. `dairy` (Cheeses, Plant Milks, Yogurts)
4. `pantry` (Whole Grains, Flours, Canned Goods)
5. `spices` (Herbs, Oils, Vinegars, Seasonings)
6. `other` (Specialty items)

### 4.2 HL7 FHIR R4 Telemetry Specification
Enterprise-tier clinics export full patient prescriptions formatted as standard HL7 FHIR R4 JSON Bundles:
* `Bundle.type`: `"collection"`
* **Resource 1 (`Patient`):** Patient demographic and clinical identifier.
* **Resource 2 (`NutritionOrder`):** Prescribed dietary instructions, daily carbohydrate caps, and target GL limits.
* **Resource 3 (`CarePlan`):** 7-day scheduled meal matrix mapped by day and occasion.
* **Resource 4 (`Observation`):** Series of deterministic predicted postprandial glucose peaks categorized under LOINC Code `15074-8` (*Glucose [Mass/volume] in Blood*).

---

## 5. Multi-Tenant RBAC & SaaS Tier Boundaries

The platform supports a multi-tenant hierarchy designed for group practices, hospital networks, and independent clinicians.

```
                     +---------------------------+
                     |    Super Administrator    |
                     +---------------------------+
                                   |
                     +-------------v-------------+
                     |    Clinic Organization    |
                     |   (Tenant ID Partition)   |
                     +---------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
+--------v--------+                                 +--------v--------+
|  Clinic Admin   |                                 | Staff Dietitian |
| (Seat Manager)  |                                 | (Caseload Mgr)  |
+--------+--------+                                 +--------+--------+
         |                                                   |
         +-------------------------+-------------------------+
                                   |
                     +-------------v-------------+
                     |      Patient Clients      |
                     +---------------------------+
```

### 5.1 RBAC Permission Matrix

| Role | `canCreateDrafts` | `canPublishPublic` | `canManageClients` | `canManageClinic` | `canViewCrossRoster` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`user`** (Patient) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **`dietitian`** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **`clinic_admin`** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **`admin`** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **`super_admin`** | ✅ | ✅ | ✅ | ✅ | ✅ |

### 5.2 Subscription Tier Feature Gating

Feature gating is enforced via the `FeatureGate.jsx` component and `usePermissions.js` hook:

```
+-------------------+---------------------------------------------------------+
| SUBSCRIPTION TIER | INCLUDED CAPABILITIES & ENTITLEMENTS                    |
+-------------------+---------------------------------------------------------+
| INDEPENDENT       | Single practitioner seat, standard 7-day plan builder,  |
|                   | local recipe management, client roster up to 10 patients.|
+-------------------+---------------------------------------------------------+
| CLINIC_PRO        | Up to 5 practitioner seats, Predictive Excursion Curves |
|                   | (ISF/CIR kinetics), Clinic Library asset sharing.       |
+-------------------+---------------------------------------------------------+
| ENTERPRISE        | Unlimited seats, Bulk HL7 FHIR EHR export pipeline,     |
|                   | SSO / SAML integration, Cross-roster clinical audit log.|
+-------------------+---------------------------------------------------------+
```

---

## 6. Mobile-First PWA, Offline Queuing & Kitchen Resilience

### 6.1 Progressive Web App & Service Worker Caching (`src/sw.js`)
Configured using `vite-plugin-pwa` in `injectManifest` mode:
* **Precached Assets:** All production HTML, JS, CSS, WOFF2 typography, and branding images.
* **Math Engine Runtime Cache:** `StaleWhileRevalidate` strategy for calculation scripts (`maxAgeSeconds: 30 days`).
* **Clinical Records Cache:** `NetworkFirst` strategy for Strapi API endpoints (`/api/client-profiles`, `/api/prescribed-meal-plans`, `/api/recipes`) with a 3-second network timeout.

### 6.2 Offline Sync Queue (`src/utils/syncQueue.ts` & `useOfflineMutation.js`)
When network connectivity drops (e.g., in a grocery store or kitchen dead-zone), user write actions are intercepted:
1. `navigator.onLine` check fails.
2. Mutation payload is serialized and enqueued in `localStorage` under `glyco_sync_queue`.
3. Hook immediately returns an optimistic mock success response, updating the React UI with zero lag.
4. When `window.addEventListener('online')` fires, `flushQueue()` iterates through pending requests, pushes them to the backend, and clears the queue.

### 6.3 Ambient Cook Mode (`src/pages/AmbientCookMode.jsx`)
* **Screen Wake Lock API (`useWakeLock.js`):** Acquires `navigator.wakeLock.request('screen')` on mount to keep the tablet or mobile display illuminated while cooking with messy hands. Automatically re-requests the lock on `visibilitychange`.
* **Step Carousel:** High-contrast, large-format typography display showing one instruction at a time.
* **Contextual Step Timers (`StepTimer.jsx`):** Parses duration from instruction text, provides interactive countdown, triggers an audible Web Audio chime, and pulses in Amber upon completion ($00:00$).
* **Offline Kitchen Swaps:** Allows real-time ingredient substitution recalculating recipe glycemic load using cached metabolic engines.

### 6.4 Clinical Nudge Engine (`src/utils/notificationEngine.ts`)
* **Opt-In Interface (`NotificationOptIn.jsx`):** Permission request card for browser push notifications.
* **Bolus Timing Scheduler:** Calculates exact pre-meal dosing trigger ($t_{\text{trigger}} = t_{\text{meal}} - \text{bolusOffsetMinutes}$).
* **Notification Click Navigation (`src/sw.js`):** Intercepts notification click to focus the browser and route directly to the target recipe's Ambient Cook Mode.

---

## 7. Testing Strategy, Token Economy & QA Protocols

### 7.1 Token-Optimized QA Strategy
To optimize computational resources and LLM context tokens during UI/Routing development:
* **Bypassed Suites:** Vitest, Playwright, and Axe-core test suites are **intentionally bypassed** during pure styling, design token adjustments, layout refactoring, and static routing tasks.
* **Validation Standard:** Static type checking (`npx tsc --noEmit`) and production bundling (`npm run build`) are used as the primary acceptance gate for UI chunks.

### 7.2 Mandatory Testing Protocol for Mathematical Engines
> [!CAUTION]
> **Strict Clinical Testing Requirement:**  
> Any modification to the deterministic calculation engines (`metabolicEngine.ts`, `excursionEngine.ts`, `recommendationEngine.ts`) **REQUIRES 100% PASSING TEST SUITES VIA VITEST**.  
> Test files in `tests/unit/*.spec.ts` must execute and pass before submitting changes to the metabolic algorithms.

```bash
# Run unit test suites for clinical calculation engines
npm run test:unit
```

---

## 8. Production Deployment, Lifecycle Hooks & Runbooks

### 8.1 Environment Variables Configuration

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `VITE_STRAPI_URL` | Frontend | Fully qualified URL to Strapi API instance (e.g. `https://api.glycogourmet.com`). |
| `DATABASE_URL` | Backend | PostgreSQL connection string with SSL requirements. |
| `APP_KEYS` | Backend | Strapi cookie signing and session encryption keys. |
| `JWT_SECRET` | Backend | Secret string for clinical user JWT signing. |
| `ADMIN_JWT_SECRET`| Backend | Secret string for Strapi admin panel authentication. |

### 8.2 Strapi Clinical Safety Lifecycle Hooks (`server/src/api/recipe/content-types/recipe/lifecycles.js`)
* **Discrepancy Auto-Audit:** On recipe save, recalculates composite glycemic load against USDA ground-truth ingredients. If $|\Delta GL| \ge 1.0$ or $|\Delta NC| \ge 1.0\text{g}$, automatically creates an `AuditRecord` flagged for dietitian review.
* **Draft Quarantine:** Rejects any attempt to assign a recipe with `status: 'draft'` to an active patient `PrescribedMealPlan`.

---

## 9. Roadmap Synthesis & Architectural North Star

```
+-----------------------------------------------------------------------------+
|                     GLYCOGOURMET ROADMAP SUMMARY (PHASES 1-6)               |
+-----------------------------------------------------------------------------+
| [COMPLETED] Phase 1: Dual-Sided Clinical Platform Foundation                |
| [COMPLETED] Phase 2: Deterministic Metabolic Engine & Discrepancy Audits    |
| [COMPLETED] Phase 3: Pixel-Perfect MagicPath Alignment & Framer Motion UI   |
| [COMPLETED] Phase 4: Predictive Metabolic Analytics (Excursion Modeling)    |
| [COMPLETED] Phase 5: Multi-Tenant Clinic Administration & Feature Gating    |
| [COMPLETED] Phase 6: Mobile-First PWA, Offline Resilience & Ambient Cooking |
+-----------------------------------------------------------------------------+
```

### Architectural Next Steps for Future Engineering Cycles:
1. **Direct CGM Sensor Streaming (Dexcom / Abbott Libre Webhooks):** Ingest real-time CGM glucose curves to automatically calibrate a patient's personalized $k_{\text{subtype}}$ and glycemic response curve.
2. **Automated SMART-on-FHIR Launch:** Enable one-click launch of the Dietitian Workspace directly inside Epic Hyperspace and Cerner Millennium EHR workflows.
3. **Multi-Language Internationalization (i18n):** Localize nutrient tables and food taxonomy across EU/UK and North American dietary databases.

---
*End of Documentation Suite. GlycoGourmet is ready for enterprise clinical deployment.*
