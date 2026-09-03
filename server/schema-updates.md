# Strapi v4/v5 Database Schema Migration Specification: Phase 5 Multi-Tenant Infrastructure

## 1. Overview
To support multi-tenant clinic administration and hospital network deployments, GlycoGourmet partitions all clinical data by Tenant (`Clinic`). This document specifies the required Strapi collection schemas and relational migrations.

---

## 2. New Collection: `api::clinic` (`src/api/clinic/content-types/clinic/schema.json`)

```json
{
  "kind": "collectionType",
  "collectionName": "clinics",
  "info": {
    "singularName": "clinic",
    "pluralName": "clinics",
    "displayName": "Clinic",
    "description": "Tenant organization representing a clinical group practice, hospital department, or endocrinology network"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "tier": {
      "type": "enumeration",
      "enum": [
        "INDEPENDENT",
        "CLINIC_PRO",
        "ENTERPRISE"
      ],
      "default": "INDEPENDENT",
      "required": true
    },
    "activeSeats": {
      "type": "integer",
      "default": 1,
      "min": 1,
      "required": true
    },
    "dietitians": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "plugin::users-permissions.user",
      "mappedBy": "clinic"
    },
    "clients": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::client-profile.client-profile",
      "mappedBy": "clinic"
    },
    "prescribedPlans": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::prescribed-meal-plan.prescribed-meal-plan",
      "mappedBy": "clinic"
    },
    "smartSwapRules": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::smart-swap-rule.smart-swap-rule",
      "mappedBy": "clinic"
    }
  }
}
```

---

## 3. Schema Update: `plugin::users-permissions.user` (`src/extensions/users-permissions/content-types/user/schema.json`)

### New/Modified Attributes:
- **`roleType`**: Extended enumeration: `["user", "dietitian", "clinic_admin", "admin", "super_admin"]`
- **`clinic`**: Relational field mapping dietitian or clinic admin to their tenant.

```json
{
  "attributes": {
    "clinic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clinic.clinic",
      "inversedBy": "dietitians"
    }
  }
}
```

---

## 4. Schema Update: `api::client-profile` (`src/api/client-profile/content-types/client-profile/schema.json`)

### New Attribute:
- **`clinic`**: Relational field enforcing tenant boundary on client records.

```json
{
  "attributes": {
    "clinic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clinic.clinic",
      "inversedBy": "clients"
    }
  }
}
```

---

## 5. Schema Update: `api::prescribed-meal-plan` (`src/api/prescribed-meal-plan/content-types/prescribed-meal-plan/schema.json`)

```json
{
  "attributes": {
    "clinic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clinic.clinic",
      "inversedBy": "prescribedPlans"
    }
  }
}
```

---

## 6. Schema Update: `api::smart-swap-rule` (`src/api/smart-swap-rule/content-types/smart-swap-rule/schema.json`)

```json
{
  "attributes": {
    "clinic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::clinic.clinic",
      "inversedBy": "smartSwapRules"
    }
  }
}
```

---

## 7. Migration & Scoping Middleware Policy (Updated in Gap-Closure Chunk 1)

1. **Automatic Tenant Ingestion**: On `find` / `findOne` / `create` / `update` requests, Strapi policy middleware resolves `ctx.state.user.clinic.id` for tenant filtering.
2. **Strict Clinical PHI Boundary (`is-clinic-admin.js`)**:
   - `clinic_admin`: **Strictly blocked** from clinical endpoints (`client-profile`, `prescribed-meal-plan`, `metabolic-target-calibration`, `smart-swap-rule`) via `FORBIDDEN_CLINICAL_UIDS`. Yields `403 Forbidden`. `clinic_admin` has zero clinical telemetry access.
   - `dietitian`: Scoped to assigned clients via `is-dietitian-owner.js`: `where: { dietitian: ctx.state.user.id, clinic: ctx.state.user.clinic.id }`.
   - `super_admin`: Bypasses tenant filters.
3. **Non-Clinical Operational Scoping**:
   - For non-clinical collections (`api::intake-lead`, `api::audit-log-entry`, `api::consent-record`, `api::clinic`), `clinic_admin` is filtered strictly to their own tenant (`where: { clinic: ctx.state.user.clinic.id }`).

---

## 8. Gap-Closure Chunk 2: Trust & Governance Persistence Collections

- **`api::consent-record`**: Layered patient consent tracking (`grantor` rel user, `clinic` rel clinic, `purpose`, `scope` json, `version`, `status`, `grantedAt`, `expiresAt`, `revokedAt`, `metadata` json). Controller enforces consent scope allow-list (`intake_redirect`).
- **`api::audit-log-entry`**: Append-only operational audit log (`clinic` rel clinic, `actor` rel user, `actorId`, `actorRole`, `action`, `entityId`, `entityType`, `suggestedValue`, `finalValue`, `note`, `timestamp`). Update and delete handlers return `405 Method Not Allowed`.
- **`api::notification-preference`**: Split-channel notification preferences (`user` rel user, `category`, `enabled`, `quietHoursStart`, `quietHoursEnd`, `frequencyCap`).
- **`api::intake-lead`**: De-identified intake leads (`clinic` rel clinic, `referenceCode` unique, `referralSource`, `serviceTier`, `stage`, `stageReason`, `assignedDietitian`, `assignedDietitianName`).

---

## 9. Gap-Closure Chunk 3: Custom Ingredient Ownership Scoping

- **`api::ingredient` Ownership Attributes**:
  - `isUserAuthored` (`boolean`, default `false`)
  - `owner` (`relation`, `manyToOne` → `plugin::users-permissions.user`)
- **Scoping Invariant**: Controller enforces default-deny visibility on user-authored items (`isUserAuthored === true`). Non-owner queries on private custom ingredients yield `404 Not Found` (existence concealment).
