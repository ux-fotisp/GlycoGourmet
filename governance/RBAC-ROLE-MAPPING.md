# GlycoGourmet — Canonical RBAC Role Mapping Specification

> **Specification Authority:** DAVE+R Governance Framework (Module D / Gate SG-1)  
> **Last Audited:** 2026-09-05  
> **Owner (Human):** Fotis P  
> **Target Files:** [`src/hooks/usePermissions.js`](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/src/hooks/usePermissions.js), [`server/src/extensions/users-permissions/content-types/user/schema.json`](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/src/extensions/users-permissions/content-types/user/schema.json), [`backend_dev.md` §5](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/backend_dev.md#L398-L505), [`ROADMAP.md` §5.1](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/ROADMAP.md#L20-L24)

---

## 1. Executive Summary

This document establishes the authoritative mapping between **Canonical Product Roles** (as described in product documentation, clinical UX specifications, and roadmaps) and **Implementation Identifiers** (persisted in Strapi schemas, evaluated by client-side hooks, and enforced by backend lifecycle guards).

The baseline set of roles under Gate `SG-1` contains five recognized identities:
- **Product Roles:** `Patient`, `Dietitian`, `ClinicAdmin`, `SuperAdmin`
- **Platform / Compatibility Role:** `Admin`

---

## 2. Canonical Role Matrix

| Canonical Product Role | Exact Implementation Identifier(s) | Clinical Scope & Authority | Tenant Boundary | Lifecycle Status | Primary Evidence Source |
|---|---|---|---|---|---|
| **Patient** | `user` *(primary)*, `patient` *(alias)* | Self-management of nutrition plans, private recipe draft authoring, glycemic tracking. **Zero access** to other patients' records or clinic operations. Gated by `RedirectNudgeCard` allow-list. | Scoped to individual user account (`authorId`). In Greek dietetic practice, affiliated with a single clinic via `ClientProfile`. | **Current** | [`schema.json` L70](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/src/extensions/users-permissions/content-types/user/schema.json#L70), [`usePermissions.js` L71](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/src/hooks/usePermissions.js#L71), [`ROADMAP.md` L35](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/ROADMAP.md#L35) |
| **Dietitian** | `dietitian` | Full clinical management: client consultation, meal plan prescription, calibrated metabolic target setting, smart-swap rule creation. Carries professional credentials (`licenseId`, `credential`, `clinicName`). | Row-level tenant isolation enforced by `is-dietitian-owner.js` and `client-profile` controller: can only access assigned patients. | **Current** | [`backend_dev.md` §5.3](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/backend_dev.md#L450-L474), [`usePermissions.js` L75](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/src/hooks/usePermissions.js#L75), [`schema.json` L71](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/src/extensions/users-permissions/content-types/user/schema.json#L71) |
| **ClinicAdmin** | `clinic_admin` | Operational administration: clinic intake pipeline management, lead triage, service routing, dietitian assignment. **Strictly blocked from Protected Health Information (PHI)** and clinical telemetry. | Scoped strictly to affiliated `clinicId`. Cannot view cross-clinic rosters. Cannot access clinical content types (enforced by `is-clinic-admin.js`). | **Current** | [`PHIBoundaryBanner.jsx` L14-27](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/src/components/clinic-admin/PHIBoundaryBanner.jsx#L14-L27), [`is-clinic-admin.js` L481-500](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/backend_dev.md#L481-L500), [`ROADMAP.md` §5.1](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/ROADMAP.md#L21) |
| **SuperAdmin** | `super_admin` | Global platform administration: tenant provisioning, clinic tier upgrades (`INDEPENDENT`, `CLINIC_PRO`, `ENTERPRISE`), system audits, cross-roster oversight. | Global / Multi-tenant bypass: can view across clinics for maintenance and governance. | **Current** | [`usePermissions.js` L88-96](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/src/hooks/usePermissions.js#L88-L96), [`schema.json` L74](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/src/extensions/users-permissions/content-types/user/schema.json#L74) |
| **Admin** | `admin` | Legacy platform administrator: user approval workflows (`isApproved: true`), account review, global recipe publishing. Retained for backwards compatibility across tests and legacy Strapi controllers. | Global platform scope; unconstrained by single clinic tenant boundaries. | **Legacy & Compatibility** | [`strapi-server.js` L432](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/backend_dev.md#L432), [`seed.js` L82-90](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/seed.js#L82-L90), [`schema.json` L73](file:///c:/Users/fotis/.gemini/antigravity/brain/GlycoGourmet/server/src/extensions/users-permissions/content-types/user/schema.json#L73) |

---

## 3. Analysis of Implementation Identifiers

### 3.1 Mapping of `user` → `Patient`
- **Origin:** Strapi's default `plugin::users-permissions` assigns `user` as the primary collection entity.
- **Enforcement:** In `server/src/extensions/users-permissions/strapi-server.js` (lines 64–71), registration explicitly sets:
  ```javascript
  plugin.controllers.auth.register = async (ctx) => {
    if (ctx.request.body) {
      ctx.request.body.roleType = 'user';
    }
    await originalRegister(ctx);
  };
  ```
- **Clinical Alignment:** In clinical workflows, a registered `user` is an individual receiving dietary guidance or self-authoring recipes (i.e. the **Patient**). `ROADMAP.md` (line 35) explicitly allows `['user', 'patient']` for patient-facing interactions such as `RedirectNudgeCard`.

### 3.2 Role of `admin` (Legacy Platform Administrator)
- In the initial single-tenant architecture, `admin` served as the monolithic administrative role.
- With the Phase 5 Multi-Tenant architecture, operational duties split into `clinic_admin` (scoped, non-clinical) and `super_admin` (global platform owner).
- `admin` remains active in `server/seed.js`, integration test fixtures, and fallback permission checks (`canManageUsers`). It is maintained for backwards compatibility and must not be removed without a dedicated DAVE+R deprecation cycle.

---

## 4. Gate SG-1 Enforcement Policy

Gate `SG-1` asserts that:
1. The five baseline identifiers `['user', 'dietitian', 'clinic_admin', 'admin', 'super_admin']` (and their canonical aliases `{Patient, Dietitian, ClinicAdmin, SuperAdmin, Admin}`) remain stable.
2. Any introduction of a new role (e.g. `ClinicBillingAdmin` planned in `ROADMAP.md` §5.1) triggers an intentional warning requiring dedicated `Define`, `Architect`, and `Validate` governance artifacts.
3. No role may be removed silently to pass CI without an audit trail.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
