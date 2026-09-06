# 📋 DAVE+R Risk Acceptance: Render Synthetic-Demo Deployment

> **Specification Authority:** DAVE+R Governance Framework (Module D: Governance & Delivery)  
> **Repository:** `ux-fotisp/GlycoGourmet`  
> **Status:** **PROPOSED (INACTIVE)**  
> **Lifecycle State:** Draft / Unapproved — Zero gate exemptions active  
> **Exception Register Linkage:** None (strictly omitted from [`governance/exceptions/exception-register.yaml`](./exceptions/exception-register.yaml) until human approval)  
> **Human Risk Owner (Required):** Pending human assignment (Fotis P review required)  
> **Human Approver (Required):** Pending human assignment (Fotis P co-signature required)  
> **Proposed Lifespan / Expiry:** Maximum **30 days** from the future date of live deployment (inactive until deployment occurs)  

---

## 1. Context & Purpose

This document articulates the proposed risk acceptance and operational boundary conditions for deploying a **public synthetic-data-only demonstration environment** on Render's Free Tier infrastructure.

Mechanical governance gates (`TO-2`, `TO-3`, `TO-6`, `INT-1` through `INT-9`, `SG-1`, `SG-2`, and `EXC-1` through `EXC-7`) remain fully enforcing. Live verification gates (`SG-3`, `SG-6`, and `SG-7`) remain manual or blocked pending live deployment and human sign-off.

---

## 2. Documented Operational Risks

The deployment of GlycoGourmet's backend onto Render Free Tier introduces the following documented risks:

1. **Public Demonstration Exposure:**
   - The API will be accessible from the public internet to facilitate demonstration of authentication, recipe management, and metabolic calculations.
   - *Mitigation:* Strict synthetic-data-only rule. No real PHI, no patient health records, and no real clinical credentials will ever be introduced.
2. **Cold Starts & Request Latency:**
   - Render Free Tier containers spin down after 15 minutes of inactivity, resulting in a 50–60 second latency on initial awakening.
   - *Mitigation:* Documented in user-facing UI notice (*“The demo backend may take up to about one minute to wake after inactivity. Please wait before retrying.”*).
3. **Temporary & Disposable Database:**
   - Render Free Tier PostgreSQL databases automatically expire and are wiped after **30 days**.
   - *Mitigation:* The environment is explicitly declared ephemeral. Database seeding (`server/seed.js`) is automated and deterministic, allowing instant reconstruction of mock data upon re-provisioning.
4. **Absence of Automated Backups:**
   - Free tier databases provide no point-in-time recovery or automated snapshots.
   - *Mitigation:* Accepted risk for demonstration tier. No persistent clinical state is stored.
5. **Ephemeral Media Storage:**
   - Container restarts discard files written to local disk (`public/uploads`).
   - *Mitigation:* Catalog recipes use external CDN image URLs (`https://images.unsplash.com`). User-created demo uploads are acknowledged as transient.
6. **Demo Credential Exposure & Rotation:**
   - Demonstration passwords may be shared with evaluators.
   - *Mitigation:* Gated by `server/seed.js` under `PUBLIC_DEPLOYMENT=true`. Static defaults (`Password123!`) are strictly prohibited; credentials must be set via `SEED_PASSWORD` in Render or randomized per role.

---

## 3. Mandatory Human Sign-Off Requirement

In accordance with DAVE+R Axiom 3 (*Named Human Owns Risk*) and Gate `SG-7`:

> [!IMPORTANT]
> **No Automated Approval:**  
> An AI agent may draft and document this risk acceptance, but **MAY NOT approve, activate, or co-sign this document on behalf of a human**.  
> Activation requires Fotis P's explicit review, named assignment as Risk Owner and Approver, and manual creation of an entry in `governance/exceptions/exception-register.yaml` if an exception to any gate is ever sought.

---

## 4. Proposed Containment & Rollback Plan (Axiom 5)

Should unexpected behavior, data leakage concerns, or platform abuse occur:

1. **One-Click Web Service Suspension:**
   - In Render Dashboard → `glycogourmet-demo-api` → **Settings** → **Suspend Web Service**. Halts container immediately.
2. **Proxy Disconnection:**
   - In Netlify configuration, revert `/api/*` edge proxy rewrite to break upstream routing.
3. **Database Destruction & Credential Revocation:**
   - In Render Dashboard → Delete `glycogourmet-demo-postgres`. Immediately revokes all active JWTs and invalidates all demo passwords.
4. **Git Reversibility:**
   - Revert infrastructure configuration commits via `git revert <commit-sha>`.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
