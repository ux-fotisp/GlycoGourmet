# 🥗 GlycoGourmet

> **Medical-Grade Blood Sugar & Metabolic Recipe Management Platform**  
> *Architected & Designed by [Fotis Pastrakis](https://fotisp.gr)*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Strapi CMS](https://img.shields.io/badge/Strapi_CMS-v4%2Fv5-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-Compliant-4CAF50?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🌟 Clinical Value Proposition & Key Features

**GlycoGourmet** is an open-source, medical-grade digital health application built for individuals managing **Type 1 Diabetes, Type 2 Diabetes, Prediabetes, or Insulin Resistance**. Unlike traditional meal trackers that only look at total carbohydrates, GlycoGourmet centers on **Glycemic Load (GL)** as the primary clinical indicator for postprandial blood glucose regulation:

$$\text{Glycemic Load (GL)} = \text{Math.round}\left(\frac{\text{Weighted GI} \times \text{Net Carbs}}{100}\right)$$

### Key Architectural & HCI Highlights:

- **📊 Preattentive GL Progress Gauge**: Features a dynamic chromatic meter (`h-3 rounded-full bg-surface-container-high overflow-hidden`) that instantly communicates glucose spike risk:
  - **Sage Green ($\le 10$)**: Gentle Impact
  - **Amber/Copper ($11 - 19$)**: Moderate Impact
  - **Soft Rose ($\ge 20$)**: High Spike Risk
- **🍽️ Discrete Portion Stepper (Zero Mental Math)**: 48px touch pills (`[ 0.5x ]`, `[ 1x ]`, `[ 1.5x ]`, `[ 2x ]`) allow patients and dietitians to scale portion sizes with a single tap, dynamically recalculating GL and macros without page reloads or layout shifts.
- **⚡ Non-Blocking Authoring Canvas**: Features a right slide-over drawer (`CustomIngredientDrawer`) that allows inline registration of custom ingredients from USDA FoodData Central without losing editor context.
- **🛡️ Strapi Role-Based Access Control (RBAC)**: A security matrix (`isApproved` flag, `usePermissions` hook) that enforces account approval and clinical publishing rights across **Pending Audit**, **User**, **Dietitian**, and **Admin** tiers.
- **🍳 Ambient Cook Mode**: Large-format, high-contrast cooking mode with step-by-step timers and hands-free traversal designed for kitchen safety.

---

## 🛠️ Technology Stack & System Architecture

| Layer | Component / Technology | Operational Purpose |
|---|---|---|
| **Frontend UI** | React 19 + React Router v7 | Concurrent rendering, component transitions, declarative route gating |
| **Styling & Design** | Tailwind CSS v4 + "Sage & Grain" System | Custom CSS tokens, accessible high-contrast palettes, responsive layouts |
| **Backend CMS** | Strapi v4 / v5 REST API | Headless Content Management, JWT Authentication, Media Uploads |
| **Database / Seeding** | PostgreSQL / SQLite + Local JSON Seed | Relational data persistence with offline JSON fallback layer |
| **External APIs** | USDA FoodData Central API | Live searching & nutrient data ingestion for custom ingredients |
| **Testing Suite** | Vitest + React Testing Library + JSDOM | Comprehensive unit & integration testing (100% pass rate across 159 tests) |
| **Deployment / CI** | Netlify + GitHub Actions | Automated SPA deployment (`netlify.toml` / `public/_redirects`) |

---

## 💻 Local Development Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ux-fotisp/GlycoGourmet.git
   cd GlycoGourmet
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your local `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` in your browser.

5. **Run Test Suite**:
   ```bash
   npm test
   ```

6. **Execute Production Build Pass**:
   ```bash
   npm run build
   ```

---

## 🔑 Environment Variable Reference Table

| Variable | Required | Default Value | Description |
|---|---|---|---|
| `VITE_STRAPI_API_URL` | Optional | `http://localhost:1337/api` | Base URL for Strapi CMS REST endpoints |
| `VITE_STRAPI_TOKEN` | Optional | `""` | Public read-only API bearer token for Strapi |
| `VITE_USDA_API_KEY` | Optional | `DEMO_KEY` | API Key for USDA FoodData Central search |
| `VITE_SNAPPI_API_BASE` | Optional | `""` | Fallback legacy Snappi REST endpoint |

*(Note: If environment variables are omitted, GlycoGourmet automatically uses built-in offline JSON dataset seeds).*

---

## 🚀 Deployment & CI/CD Pipeline

GlycoGourmet is configured for zero-downtime deployment on **Netlify**:

- **SPA Rewrites**: `public/_redirects` specifies `/* /index.html 200` to handle client-side React Router navigation without 404 errors.
- **Build Configuration**: `netlify.toml` defines command `npm run build` and publish directory `dist`.
- **Automated Builds**: Every commit pushed to the main branch triggers automated Vitest test suite runs and production bundler passes.

---

## 👨‍💻 Creator & Clinical Rationale

**GlycoGourmet** was architected and built by **[Fotis Pastrakis](https://fotisp.gr)** (Lead UX Designer & Web Engineer).

> *"Managing glycemic response requires converting complex nutrition data into immediate visual feedback. GlycoGourmet bridges clinical diabetes management and human-computer interaction to make low-GI eating intuitive, reliable, and enjoyable."*  
> — **Fotis Pastrakis** ([fotisp.gr](https://fotisp.gr))

---

## 📄 License & Copyright

Created by [Fotis Pastrakis](https://fotisp.gr). Released under the MIT License.
