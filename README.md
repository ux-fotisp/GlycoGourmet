# 🌿 GlycoGourmet

> **Clinical-Grade Metabolic Health & Glycemic Load Recipe Management Platform**  
> *Architected & Designed by [Fotis Pastrakis](https://fotisp.gr)*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Strapi CMS](https://img.shields.io/badge/Strapi_CMS-v4%2Fv5-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-Compliant-4CAF50?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🎯 Clinical Overview

**GlycoGourmet** is an open-source clinical digital health platform engineered for individuals managing **Type 1 Diabetes, Type 2 Diabetes, Gestational Diabetes, Prediabetes, or Severe Insulin Resistance**. Rather than relying solely on total carbohydrate counts, GlycoGourmet centers on **Glycemic Load ($GL$)**, **Composite Glycemic Index ($GI$)**, and **Thermal Starch Kinetics ($M_{\text{prep}}$)** to empower proactive glycemic stability.

---

## 📚 Platform Documentation Suite (12 Canonical Manuals)

The complete architectural, clinical, and engineering specifications are organized into canonical manuals across the repository:

| Document | Focus & Technical Scope |
| :--- | :--- |
| 📋 **[information_architecture.md](information_architecture.md)** | Object-Oriented UX (OOUX / ORCA) domain models, persona taxonomies (Patient, Dietitian, Admin), 6-occasion circadian meal segmentation, and system schemas. |
| 🧠 **[UX.md](UX.md)** | Cognitive ergonomics, Nielsen Norman Group 10 UX Heuristics, 3 persona customer journeys, and 4 interactive userflows. |
| 🎨 **[design.md](design.md)** | Sage & Grain Design DNA, color token specifications, typography scales, 8px grid system, and WCAG 2.1 AA/AAA contrast matrix. |
| ⚛️ **[frontend_dev.md](frontend_dev.md)** | React 19 SPA architecture, Tailwind CSS v4 `@theme` configuration, deterministic metabolic math engine, and dynamic GI/GL resolution pipelines. |
| 🛡️ **[backend_dev.md](backend_dev.md)** | Headless Strapi CMS (v4/v5), PostgreSQL schemas, lifecycle invariant validation guards, RBAC policies, and production operations runbook. |
| 🧪 **[testing.md](testing.md)** | Comprehensive test pyramid, full test inventory table, 281-test passing Vitest summary, fuzzing vectors, and CI/CD validation gates. |
| 🤖 **[agentic.md](agentic.md)** | Autonomous QA directives (QA-DIRECTIVE-2026), self-healing selector protocols, synthetic data fuzzing, and Antigravity agent orchestration. |
| 🚀 **[ci_cd.md](ci_cd.md)** | GitHub Actions production & integration pipelines, certified live CI runs (33079017457 & 33079705050), and verification gates. |
| 📜 **[changelog.md](changelog.md)** | Semantic versioning history, release milestones (`v1.0.0` to `v2.0.0`), and complete Git commit trajectory. |
| 🔒 **[SECURITY.md](SECURITY.md)** | Vulnerability disclosure policy, clinical data scope, tenant isolation, and security contact. |
| 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** | Git branching strategy, Conventional Commits standard, and pre-submission quality gate checklist. |
| 📁 **[server/README.md](server/README.md)** | Backend quickstart pointer directing Strapi contributors to `backend_dev.md`. |

---

## ⚙️ Environment Variables Specification (`.env.example`)

| Environment Variable | Required | Default / Example Value | Description & Clinical Security Scope |
| :--- | :---: | :--- | :--- |
| **`VITE_SNAPPI_API_BASE`** | Yes | `https://instance.snappi.io/api/v1` | Public API gateway endpoint for Strapi/Snappi CMS instance. |
| **`VITE_SNAPPI_READ_TOKEN`**| Yes | `your-read-only-api-key` | Public read-only API key for fetching published master recipes and USDA ingredients. |
| **`VITE_STRAPI_API_URL`** | Optional | `http://localhost:1337` | Local or staging Strapi backend API base URL. |
| **`VITE_ENABLE_DEMO_AUTH`** | Optional | `false` (`true` in dev) | Enables mock authentication fallback for local offline development. |
| **`VITE_USDA_API_KEY`** | Optional | `DEMO_KEY` | USDA FoodData Central API token for live custom ingredient lookups. |

> ⚠️ **Security Note:** User JWTs for write and publish operations are dynamically injected via `AuthContext` and stored in secure browser memory. **Never store user write tokens in `.env` files.**

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher (Node.js 22 LTS recommended)
- **Package Manager**: `npm`

### 2. Installation & Startup
```bash
# Clone the repository
git clone https://github.com/fotispastrakis/GlycoGourmet.git
cd GlycoGourmet

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & CI Quality Gates

```bash
# Run pre-commit static analysis and TypeScript check
npm run precommit

# Run deterministic unit and integration test suite
npm run test

# Run Playwright E2E browser user journeys
npm run test:e2e

# Run automated WCAG 2.1 AA accessibility audit
npm run test:a11y

# Run database nutritional ground truth verification
npm run validate-db
```

---

## 📜 License & Attribution

Designed and architected by **[Fotis Pastrakis](https://fotisp.gr)**. Released under the MIT License.
