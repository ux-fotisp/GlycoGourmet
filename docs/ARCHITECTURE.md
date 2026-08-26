# 🩺 GlycoGourmet — Architecture & System Specifications Index

> **Clinical Digital Health Platform Architecture & Specification Suite**  
> *Authored by [Fotis Pastrakis](https://fotisp.gr)*

The architectural documentation for **GlycoGourmet** is organized into two dedicated specifications:

---

## 📚 Platform Documentation Suite

### 1. [Information Architecture & Clinical HCI Specification](Information_Architecture.md)
* **Object-Oriented UX (OOUX / ORCA):** Complete domain model (`Recipe`, `Ingredient`, `MealPlan`, `User`, `AuditRecord`), multiplicity diagrams, and persona-specific CTA matrices.
* **Cognitive Ergonomics & Heuristics:** Analysis of all 10 Nielsen Norman UX heuristics and the action-oriented triad.
* **Taxonomies & Preattentive Systems:** 6-occasion meal segmentation, automated semantic tag generation, and WCAG 2.1 AA preattentive chromatic spectrum.

👉 **Read full document:** [`docs/Information_Architecture.md`](Information_Architecture.md)

---

### 2. [Technical Architecture & Systems Engineering Directive](Technical_Architecture.md)
* **System Topology & Data Flow:** React 19 Frontend $\longleftrightarrow$ React Router v7 $\longleftrightarrow$ Strapi v4/v5 CMS $\longleftrightarrow$ PostgreSQL $\longleftrightarrow$ USDA FoodData Central.
* **Deterministic Metabolic Math Engine:** LaTeX mathematical formulation of Net Carbs clamping, thermal starch multipliers ($1.00\times - 1.25\times, 0.85\times$), composite GI, and physical GL bounds.
* **TypeScript Contracts & Lifecycles:** Complete domain data interfaces, state management patterns, RBAC state machines, and backend database lifecycle guards.
* **Infrastructure & Security:** Netlify SPA routing, CSP headers, and asset cache immutability.

👉 **Read full document:** [`docs/Technical_Architecture.md`](Technical_Architecture.md)

---

## 🚀 Operations & Quality Assurance Guides
* **[Production Deployment Runbook](DEPLOYMENT_RUNBOOK.md):** Environment variable setup, first-time deployment steps, and disaster recovery procedures.
* **[Agentic QA Guidelines](AGENTIC_QA_GUIDELINES.md):** Autonomous test triage directives and coverage invariants.
