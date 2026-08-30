# 🔒 GlycoGourmet — Security Policy & Clinical Data Governance

> **Vulnerability Disclosure Process, Clinical Data Scope, and Security Invariants**  
> *Authored & Maintained by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. Security Philosophy & Clinical Invariant Protection

GlycoGourmet is a clinical digital health platform managing sensitive dietary data and personalized metabolic calibrations for individuals with **Type 1 Diabetes, Type 2 Diabetes, Gestational Diabetes, and Insulin Resistance**.

Security vulnerabilities that compromise mathematical calculations, tenant boundaries, or clinical authorizations present direct patient health risks. We prioritize absolute data integrity, strict multi-tenant isolation, and defensive server-side authorization gates.

---

## 2. Scope of Security Governance

The following core components fall under our high-priority security governance:

| Component / Layer | Security Focus & Invariant Boundaries |
| :--- | :--- |
| **Tenant Boundary Isolation** | Multi-tenant row-level access control (`is-dietitian-owner.js`) preventing cross-clinician client data leakage. |
| **Privilege Escalation Defense** | Server-side sanitization of `roleType`, `isApproved`, and `clientIds` in registration and profile updates. |
| **Nutritional Calculation Integrity** | Invariant guards preventing negative net carbs, mathematical overflow ($GL > 100$), or unverified draft injection. |
| **Authentication & Token Handling** | Stateless JWT authentication via `/api/users/me`; rejection of unvalidated client-side identity assertions. |
| **USDA Integration Trust** | Cryptographic verification and schema validation of third-party USDA FoodData Central payloads. |

---

## 3. Reporting a Vulnerability & Disclosure Process

We welcome responsible security research and vulnerability reports from the community.

### 3.1 Contact Information
Please submit vulnerability reports directly to:
- **Lead Architect:** Fotis Pastrakis
- **Primary Security Email:** `security@glycogourmet.com`
- **Alternative Contact:** `contact@fotisp.gr`
- **PGP Key:** Available upon request

### 3.2 Response Service Level Agreements (SLAs)
1. **Initial Acknowledgment:** Within **24 hours** of receipt.
2. **Triage & Impact Assessment:** Within **48 hours** of receipt.
3. **Patch Development & Testing:** Within **5 business days** for high-severity issues.
4. **Public Disclosure:** Coordinated after a validated patch has been deployed to production.

---

## 4. Security Invariants for Contributors

All contributions must preserve these security invariants:
- ❌ **No Plaintext Secrets in Code:** Never commit API keys, JWT secrets, or production database passwords.
- ❌ **No Client-Side Authorization Decisions:** UI component visibility must always be paired with backend policy validation.
- ❌ **No Dynamic SQL / Unsanitized Queries:** Always utilize Strapi `entityService` or parameterized Knex queries.
