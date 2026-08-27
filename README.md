# ?? GlycoGourmet

> **Dual-Sided Dietitian & Patient Glycemic Meal Planning Platform**  
> *Architected & Designed by [Fotis Pastrakis](https://fotisp.gr)*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Strapi CMS](https://img.shields.io/badge/Strapi_CMS-v4-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-Compliant-4CAF50?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## ?? Clinical Value Proposition & Key Features

**GlycoGourmet** is an open-source, clinical-grade digital health application built for individuals managing **Type 1 Diabetes, Type 2 Diabetes, Gestational Diabetes, Prediabetes, or Insulin Resistance**. Unlike conventional meal trackers that focus solely on total carbohydrates, GlycoGourmet centers on **Glycemic Load ($GL$)** and **Thermal Starch Kinetics ($M_{\text{prep}}$)** as the primary indicators for postprandial glucose stability:

$$\text{Glycemic Load (GL)} = \operatorname{round}\left(\frac{\text{Weighted GI} \times \text{Net Carbs}}{100}\right)$$

### Core Capabilities:
- **Deterministic Metabolic Calculation Engine**: Portion-scaled, carbohydrate-weighted GL and GI derivation directly from validated ingredients, handling thermal state multipliers automatically.
- **Recipe GI/GL & Macro Display**: Dynamic rendering of primary (GL, GI, Net Carbs, Fiber) and secondary (Calories, Protein, Fat) macronutrients across recipe details and catalog cards.
- **Serving Portion Scaling**: Discrete scaling multipliers (0.5x, 1x, 1.5x, 2x) automatically update nutrition profiles without modifying database states.
- **1-Click Smart Low-GI Swaps**: Automatically detects high-GI staples and pairs them with clinical low-GI alternatives, recalculating GL and macros instantly.
- **Meal Planning & Rollups**: 7-day calendar scheduler tracking daily GL adherence targets and calculating aggregate carbohydrate-weighted daily GL.
- **Dietitian Audit Workflow & Clinical Export**: Identifies discrepancies $> 1.0\text{g}$ between author inputs and USDA FoodData Central ground truth before public approval.

---

## ?? Security Architecture

GlycoGourmet implements strict backend-truth isolation to ensure patient data privacy and tenant safety:
- **JWT-Backed Auth Truth**: The frontend relies solely on `/api/users/me` JWT verification rather than insecure local storage fallbacks.
- **Role/Privilege Protection**: Registration and user-update API controllers strip sensitive fields (`roleType`, `isApproved`, `clientIds`, `licenseId`) to prevent client-side privilege escalation.
- **Dietitian Tenant Scoping**: Row-level database isolation via `is-dietitian-owner` policy and controller injection ensures dietitians can only access and modify their own clients' profiles and plans, verified by live E2E CI tests.

---

## ?? Architecture & Engineering Specifications

Comprehensive system specifications are maintained in the [`docs/`](docs/) directory:

- **[Information Architecture & Clinical HCI Specification](docs/Information_Architecture.md):** Detailed Object-Oriented UX (OOUX / ORCA) domain models, cognitive ergonomics analysis, 10 Nielsen Norman UX heuristic citations, and preattentive visual design system.
- **[Technical Architecture & Systems Engineering Directive](docs/Technical_Architecture.md):** Deterministic metabolic calculation engine math (LaTeX equations), TypeScript domain data contracts, Strapi CMS lifecycles, and security architecture.
- **[Production Operations & Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md):** Environment variable setup, first-time Netlify/Strapi provisioning, and disaster recovery procedures.
- **[Strapi API Reference](docs/API_REFERENCE.md):** Comprehensive Strapi REST endpoints, query filters, and JWT authentication payloads documentation.

---

## ??? Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + React Router v7 | Concurrent rendering, component transitions, declarative route gating |
| **Design System** | Tailwind CSS v4 (`@theme`) | Accessible deep green tokens (`#1B3B22` to `#386A20`), typography scale |
| **Icons & Typography** | Fraunces + Plus Jakarta Sans + Material Symbols | High-readability clinical typefaces and semantic iconography |
| **Backend CMS** | Strapi v4.25.4 REST API | Headless Content Management, JWT Authentication, Media Uploads |
| **External Services** | USDA FoodData Central REST API | Live nutrient data ingestion for custom ingredient creation |
| **Deterministic Math** | TypeScript Math Engine (`src/services/metabolicEngine.ts`) | 100% test-covered metabolic equations with zero-division protections |
| **Testing Suite** | Vitest + Playwright + Axe-core | Unit, integration, E2E user journeys, and WCAG 2.1 AA audits |
| **Deployment** | Netlify SPA | Fast CDN deployment with `_redirects` single-page routing |

---

## ?? Quality Assurance & Test Verification

### Frontend Testing (Local)
```bash
# Run deterministic unit and integration tests with coverage
npx vitest run

# Run end-to-end browser user journeys and WCAG 2.1 AA audits
npx playwright test
```

### Backend / CI Integration Testing (GitHub Actions)
The Strapi v4 backend depends on `better-sqlite3` native binaries, which may fail to build against Node 24 on some host systems (like Windows). 
- **CI Environment**: The definitive backend integration test runs seamlessly on **Node 20 Linux CI** (via GitHub Actions) or within Docker. 
- **Run the Suite**: Any push or pull request to tracked branches automatically boots the Strapi instance, seeds test data, and runs `tests/integration/TenantScopingIntegration.spec.js` asserting complete multi-tenant isolation.

---

## ??? Application Route Hierarchy

```
/#/
├─ /login                         Public login portal
├─ /register                      Public registration portal
├─ /onboarding                    Patient dietary preference setup
├─ /pending-approval              RBAC security intercept gate
├─ /                              Recommended meal catalog & Daily GL budget
├─ /recipes/all                   Full faceted recipe catalog (?occasion=&sort=&maxGL=)
├─ /recipe/:id                    Full viewport recipe detail with Smart Swaps
├─ /recipes/mine                  Personal recipe workspace & drafts
├─ /meal-plans                    7-day calendar scheduler & GL tracker
├─ /admin-editor/:id?             Clinical recipe authoring studio
├─ /admin                         Dietitian dashboard & user management
├─ /admin/audit-queue             Discrepancy review & USDA sync queue
└─ /settings                      Glucose unit, daily budget, and profile settings
```

---

## ?? Disclaimer

**GlycoGourmet is provided for informational and educational purposes only. It is not intended as medical advice, nor is it a substitute for professional clinical diagnosis or treatment.** 
The platform implements extensive logic to model glycemic impact based on public USDA FoodData Central data and established metabolic formulas, but it is not currently an FDA-cleared medical device, nor is it formally audited for complete HIPAA/FHIR compliance outside of its application-level tenant isolation logic. Always consult a licensed healthcare provider before making significant dietary changes.

---

## ?? License & Attribution

Designed and architected by **[Fotis Pastrakis](https://fotisp.gr)**. Released under the MIT License.
