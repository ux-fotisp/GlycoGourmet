# 🩺 GlycoGourmet — Architecture & System Specifications Index

> **Clinical Digital Health Platform Architecture & Engineering Suite**  
> *Authored by Fotis Pastrakis (https://fotisp.gr)*

---

## 📚 Platform Documentation Index

### 1. [Information Architecture & Clinical HCI Specification](Information_Architecture.md)
* **Object-Oriented UX (OOUX / ORCA):** Complete domain model for Patient and Dietitian roles (PatientUser, DietitianUser, ClientProfile, PrescribedMealPlan, MetabolicTargetCalibration, SmartSwapRule, AuditRecord).
* **Cognitive Ergonomics & Heuristics:** Resolution of diabetic mental arithmetic burnout and caseload surveillance fatigue across all 10 Nielsen Norman heuristics.
* **Taxonomies & Preattentive Systems:** 6 circadian meal occasions, automated semantic tags, and WCAG 2.1 AA preattentive visual banding (Sage #1B3B22, Amber #5D4037, Soft Rose #B71C1C).

---

### 2. [Technical Architecture & Systems Engineering Directive](Technical_Architecture.md)
* **System Topology & Boundaries:** React 19 SPA $\longleftrightarrow$ Netlify CDN $\longleftrightarrow$ Strapi v4/v5 REST CMS $\longleftrightarrow$ USDA FoodData Central.
* **Deterministic Metabolic Engine:** Mathematical formulations for Net Carbs clamping, thermal starch gelatinization (.00\times - 1.25\times, 0.85\times$), carb-weighted composite GI with zero-division trap, and serving-scaled GL.
* **Clinical Export Pipeline:** Architecture for weekly grocery manifests, clinical chart summaries, and HL7 FHIR R4 JSON bundles.
* **Security & Database Lifecycles:** Strapi lifecycle safety guards rejecting draft recipes in clinical plans and discrepancy audit gates ($\vert{}\Delta\vert{} > 1.0\text{g}$).

---

### 3. [Production Operations & Deployment Runbook](DEPLOYMENT_RUNBOOK.md)
* Environment variables, database schema manifests, RBAC role permissions, smoke-test accounts, and disaster recovery procedures.
