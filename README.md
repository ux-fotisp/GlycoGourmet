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

## 📚 Platform Documentation Suite

The complete architectural, clinical, and engineering specifications are organized into the `docs/` directory:

| Specification | Focus & Technical Scope |
| :--- | :--- |
| 📋 **[information_architecture.md](docs/information_architecture.md)** | Object-Oriented UX (OOUX / ORCA) domain models, persona taxonomies (Patient, Dietitian, Admin), 6-occasion circadian meal segmentation, and system schemas. |
| 🧠 **[UX.md](docs/UX.md)** | Cognitive ergonomics, Nielsen Norman Group 10 UX Heuristics, end-to-end persona customer journeys, and interactive userflows. |
| 🎨 **[design.md](docs/design.md)** | Sage & Grain Design DNA, color token specifications, typography scales, 8px grid system, and WCAG 2.1 AA contrast certification matrix. |
| ⚛️ **[frontend_dev.md](docs/frontend_dev.md)** | React 19 SPA architecture, Tailwind CSS v4 `@theme` configuration, deterministic metabolic math engine, and dynamic GI/GL resolution pipelines. |
| 🛡️ **[backend_dev.md](docs/backend_dev.md)** | Headless Strapi CMS (v4/v5), PostgreSQL schemas, lifecycle invariant validation guards, RBAC policies, and production operations runbook. |
| 🧪 **[testing.md](docs/testing.md)** | Comprehensive test pyramid, full 60-test core inventory table, 243-test passing Vitest summary, fuzzing vectors, and CI/CD validation gates. |
| 🤖 **[agentic.md](docs/agentic.md)** | Autonomous QA directives (QA-DIRECTIVE-2026), self-healing selector protocols, synthetic data fuzzing, and Antigravity agent orchestration. |
| 📜 **[changelog.md](docs/changelog.md)** | Semantic versioning history, release milestones (`v1.0.0` to `v2.0.0`), and complete Git commit trajectory. |

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
```

---

## 📜 License & Attribution

Designed and architected by **[Fotis Pastrakis](https://fotisp.gr)**. Released under the MIT License.
