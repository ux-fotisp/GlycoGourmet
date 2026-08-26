# 🥗 GlycoGourmet

> **Clinical-Grade Metabolic Health & Glycemic Load Recipe Management Platform**  
> *Architected & Designed by [Fotis Pastrakis](https://fotisp.gr)*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Strapi CMS](https://img.shields.io/badge/Strapi_CMS-v4%2Fv5-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-Compliant-4CAF50?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🩺 Clinical Value Proposition & Key Features

**GlycoGourmet** is an open-source, clinical-grade digital health application built for individuals managing **Type 1 Diabetes, Type 2 Diabetes, Gestational Diabetes, Prediabetes, or Insulin Resistance**. Unlike conventional meal trackers that focus solely on total carbohydrates, GlycoGourmet centers on **Glycemic Load ($GL$)** and **Thermal Starch Kinetics ($M_{\text{prep}}$)** as the primary indicators for postprandial glucose stability:

$$\text{Glycemic Load (GL)} = \operatorname{round}\left(\frac{\text{Weighted GI} \times \text{Net Carbs}}{100}\right)$$

### Key Architectural & Clinical Capabilities:

- **📊 Preattentive GL Progress Gauge**: Features a dynamic chromatic meter that instantly communicates glucose spike risk:
  - **Deep Pine / Sage ($\le 10$)**: Gentle Impact
  - **Amber / Copper ($11 - 19$)**: Moderate Impact
  - **Soft Rose / Ruby ($\ge 20$)**: High Spike Risk
- **🔄 1-Click Smart Low-GI Swaps**: Automatically detects high-GI staples and pairs them with clinical low-GI alternatives (e.g. *Jasmine Rice* $\rightarrow$ *Cauliflower Pearls*, *Mashed Potatoes* $\rightarrow$ *Pureed Cauliflower & Roasted Garlic*), reducing recipe GL by up to 92%.
- **⚖️ Discrete Serving Stepper (Zero Mental Math)**: $48\text{px}$ touch pills (`[ 0.5x ]`, `[ 1x ]`, `[ 1.5x ]`, `[ 2x ]`) allow patients and dietitians to scale portion sizes with a single tap, dynamically recalculating GL and macros without page reloads or layout shifts.
- **🛡️ Strapi Role-Based Access Control (RBAC)**: Enforces clinical publishing rights across **Pending Audit**, **Patient**, **Dietitian**, and **Admin** tiers with backend lifecycle invariant validation.
- **🔍 Dietitian Audit Queue**: Automatically identifies discrepancies $> 1.0\text{g}$ between author inputs and USDA FoodData Central ground truth before public approval.
- **🍳 Ambient Cook Mode**: High-contrast, large-format cooking companion with step-by-step timers and hands-free traversal designed for kitchen safety.

---

## 📚 Architecture & Engineering Specifications

Comprehensive system specifications are maintained in the [`docs/`](docs/) directory:

- **[Information Architecture & Clinical HCI Specification](docs/Information_Architecture.md):** Detailed Object-Oriented UX (OOUX / ORCA) domain models, cognitive ergonomics analysis, 10 Nielsen Norman UX heuristic citations, and preattentive visual design system.
- **[Technical Architecture & Systems Engineering Directive](docs/Technical_Architecture.md):** Deterministic metabolic calculation engine math (LaTeX equations), TypeScript domain data contracts, Strapi CMS lifecycles, and security architecture.
- **[Production Operations & Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md):** Environment variable setup, first-time Netlify/Strapi provisioning, and disaster recovery procedures.
- **[Agentic QA Guidelines](docs/AGENTIC_QA_GUIDELINES.md):** Autonomous test triage directives and 100% coverage invariants.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + React Router v7 | Concurrent rendering, component transitions, declarative route gating |
| **Design System** | Tailwind CSS v4 (`@theme`) | Accessible deep green tokens (`#1B3B22` to `#386A20`), typography scale |
| **Icons & Typography** | Fraunces + Plus Jakarta Sans + Material Symbols | High-readability clinical typefaces and semantic iconography |
| **Backend CMS** | Strapi v4 / v5 REST API | Headless Content Management, JWT Authentication, Media Uploads |
| **External Services** | USDA FoodData Central REST API | Live nutrient data ingestion for custom ingredient creation |
| **Deterministic Math** | TypeScript Math Engine (`src/services/metabolicEngine.ts`) | 100% test-covered metabolic equations with zero-division protections |
| **Testing Suite** | Vitest + Playwright + Axe-core | Unit, integration, E2E user journeys, and WCAG 2.1 AA audits |
| **Deployment** | Netlify SPA | Fast CDN deployment with `_redirects` single-page routing |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Node.js 22 LTS recommended)
- **Package Manager**: `npm`

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/fotispastrakis/GlycoGourmet.git
cd GlycoGourmet
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Strapi Headless CMS URL
VITE_STRAPI_URL=http://localhost:1337

# USDA FoodData Central API Key (Optional for live custom ingredient search)
VITE_USDA_API_KEY=DEMO_KEY
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Quality Assurance & Test Verification

```bash
# Run deterministic unit and integration tests with coverage
npm run test:unit

# Run end-to-end browser user journeys and WCAG 2.1 AA audits
npx playwright test

# Run static analysis and linting
npx oxlint src/

# Run TypeScript compilation check
npx tsc --noEmit
```

---

## 📦 Production Build & Netlify Deployment

To build the client application for production:
```bash
npm run build
```
The output is generated in `dist/` with the required Netlify SPA rewrite file (`dist/_redirects`).

---

## 🗺️ Application Route Hierarchy

```
/#/
├── /login                         Public login portal
├── /register                      Public registration portal
├── /onboarding                    Patient dietary preference setup
├── /pending-approval              RBAC security intercept gate
├── /                              Recommended meal catalog & Daily GL budget
├── /recipes/all                   Full faceted recipe catalog (?occasion=&sort=&maxGL=)
├── /recipe/:id                    Full viewport recipe detail with Smart Swaps
├── /recipes/mine                  Personal recipe workspace & drafts
├── /meal-plans                    7-day calendar scheduler & GL tracker
├── /admin-editor/:id?             Clinical recipe authoring studio
├── /admin                         Dietitian dashboard & user management
├── /admin/audit-queue             Discrepancy review & USDA sync queue
└── /settings                      Glucose unit, daily budget, and profile settings
```

---

## 📄 License & Attribution

Designed and architected by **[Fotis Pastrakis](https://fotisp.gr)**. Released under the MIT License.
