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

## 7. Migration & Scoping Middleware Policy

1. **Automatic Tenant Ingestion**: On `find` / `findOne` / `create` / `update` requests for clinical endpoints (`/api/client-profiles`, `/api/prescribed-meal-plans`, `/api/smart-swap-rules`), Strapi policy middleware checks `ctx.state.user.clinic.id`.
2. **Cross-Roster Scoping**:
   - `dietitian`: Filter `where: { dietitian: ctx.state.user.id, clinic: ctx.state.user.clinic.id }`
   - `clinic_admin`: Filter `where: { clinic: ctx.state.user.clinic.id }`
   - `super_admin`: Bypass tenant filter.
