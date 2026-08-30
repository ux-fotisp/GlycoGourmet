# GlycoGourmet Platform Roadmap

**Vision:** To establish GlycoGourmet as the definitive, deterministic clinical-grade dietary prescription and metabolic forecasting ecosystem for endocrinology practices and independent registered dietitians.

## Phase 3: Pixel-Perfect UI & MagicPath Alignment (CURRENT)
Bridges the gap between functional clinical architecture and a premium, frictionless B2B product experience, adhering strictly to the MagicPath design tokens.
* **Design System Unification:** Application-wide CSS grid/flexbox refactoring mapping to MagicPath spacing, typography, and border radii.
* **Fluid Clinical Micro-Interactions:** Framer Motion/React Spring integrations for 1-click Smart Swap transitions, dynamic daily GL budget gauge fills, and drag-and-drop mechanics in the 7-day meal plan canvas.
* **Granular Responsive Scaling:** Ensuring the dense 3-column (Recipe Detail) and interactive matrix (Plan Builder) layouts degrade gracefully into touch-optimized mobile viewports.

## Phase 4: Predictive Metabolic Analytics (Deterministic & Clinical)
Positions the platform as a high-value, closed-knowledge clinical tool. Completely avoids black-box AI in favor of rigorous, mathematically verifiable forecasting models.
* **Deterministic Glucose Excursion Modeling:** Calculates predicted 2-hour blood glucose curves using the meal's carbohydrate-weighted GI, the patient's Insulin Sensitivity Factor (ISF), Carbohydrate-to-Insulin Ratio (CIR), and prescribed bolus offset.
* **Algorithmic Adherence Insights:** Rule-based reporting cross-referencing historical adherence with dietary restrictions to automatically surface optimal Smart Swaps.
* **Clinical IP Shielding:** Predictive modeling operates purely as B2B clinical decision support, keeping logic proprietary to the dietitian tier.

## Phase 5: Multi-Tenant Clinic Administration (B2B SaaS)
Transforms the architecture from single-practitioner workspaces into a scalable, multi-tenant enterprise solution.
* **Extended RBAC Hierarchy:** `ClinicAdmin` and `SuperAdmin` roles to manage practitioner seats and cross-roster oversight.
* **SaaS Billing Infrastructure:** Tiered subscriptions separating independent RDN capabilities from hospital department features.
* **Practitioner Collaboration:** Secure sharing of custom Smart Swap rules, meal plan templates, and ingredient databases across a clinic's network.

## Phase 6: Mobile-First Execution & Offline Resilience
Ensures patients have uninterrupted access to dietary regimens at the point of action.
* **PWA Foundation:** Service worker implementation caching Active Plans, grocery manifests, and the offline deterministic engine.
* **Kitchen & Cart Resilience:** Offline execution of Ambient Cook Mode and Smart Swaps, syncing discrepancy logs back to the clinic upon reconnection.
* **Clinical Nudge Infrastructure:** Local push notifications tied to bolus timing offsets (e.g., a 15-minute pre-meal alert) and logging reminders.
