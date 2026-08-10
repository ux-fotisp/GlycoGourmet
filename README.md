# 🥗 GlycoGourmet — Low-GI & Glycemic Load Nutrition Platform

> **Created by [Fotis Pastrakis](https://fotisp.gr)**  
> *A dedicated personal health project designed and engineered for managing diabetes nutrition, tracking real-world postprandial glucose impact, and discovering gourmet low-glycemic recipes.*

---

## 🌟 About GlycoGourmet

**GlycoGourmet** is a production-grade, headless CMS-driven web application tailored for individuals managing **Type 1 & Type 2 Diabetes, pre-diabetes, or insulin resistance**. 

While standard nutrition tools focus solely on total carbohydrates or static Glycemic Index (GI), GlycoGourmet elevates **Glycemic Load (GL)**—which factors in actual portion sizes—as the gold standard metric for estimating postprandial blood glucose spikes:

$$\text{Glycemic Load (GL)} = \text{Math.round}\left(\frac{\text{Weighted GI} \times \text{Net Carbs}}{100}\right)$$

---

## 🚀 Key Features

* **⚡ Unified Glycemic Load Calculation Engine**: Calculates real-time GI and GL metrics scaled by portion sizes, prep-state multipliers (e.g. raw vs. roasted vs. cooled starches), and ingredient ratios.
* **📊 Visual Categorization & Color-Coding**:
  * **Low GL ($\le 10$)**: Sage Green Accent (`text-primary-fixed-dim`) — Minimal blood sugar impact.
  * **Medium GL ($11 - 19$)**: Warm Copper Accent (`text-tertiary`) — Moderate, steady release.
  * **High GL ($\ge 20$)**: High Warning Accent (`text-error`) — Rapid glucose spike risk.
* **📅 Weekly Glycemic Meal Planner**: Interactive 7-day schedule featuring recipe GL badges and **Daily Total Glycemic Load aggregate progress bars** against an 80 GL target ceiling.
* **🍳 Hands-Free Cook Mode**: High-contrast, large-format step-by-step cooking interface with a persistent top bar displaying recipe GL, preparation time, and portion size.
* **🔄 Real-Time Portion & Substitution Scaling**: Dynamically recalculates GI, GL, macros, and micro-nutrients when adjusting serving size multipliers ($1\times, 2\times, 4\times$) or swapping high-GI ingredients for healthier alternatives.
* **🌐 Snappi Headless CMS Architecture**: Centralized REST API client with SWR-style caching, JWT authorization, multi-part media uploads, and offline JSON fallback data.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + React Router v7 |
| **Build Tool & HMR** | Vite 8 |
| **Styling & Design** | Tailwind CSS v4 + Custom "Sage & Grain" Design System |
| **Headless CMS** | Snappi CMS REST API (`/api/v1/recipes`, `/api/v1/ingredients`) |
| **Testing** | Vitest + React Testing Library + JSDOM |
| **Accessibility** | WCAG 2.1 AA Compliant (High Contrast, Screen Reader Friendly) |
| **Deployment** | Netlify Continuous Deployment (`netlify.toml` + `public/_redirects`) |

---

## 👨‍💻 Creator & Motivation

**GlycoGourmet** was conceived, designed, and built by **[Fotis Pastrakis](https://fotisp.gr)**.

> *"Living with diabetes requires constant vigilance around every meal. GlycoGourmet was created as a personal tool to transform complex glycemic nutrition into clear, actionable, real-time insights—allowing me to enjoy gourmet food while keeping my blood glucose stable."*  
> — **Fotis Pastrakis** ([fotisp.gr](https://fotisp.gr))

---

## 💻 Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ux-fotisp/GlycoGourmet.git
   cd GlycoGourmet
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional):
   Create a `.env` file from `.env.example`:
   ```env
   VITE_SNAPPI_API_BASE=https://your-snappi-instance.com/api/v1
   VITE_SNAPPI_READ_TOKEN=your_read_only_api_key
   ```
   *(If unconfigured, GlycoGourmet seamlessly defaults to offline system JSON datasets).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Run Test Suite**:
   ```bash
   npm test
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Created by [Fotis Pastrakis](https://fotisp.gr). All rights reserved.
