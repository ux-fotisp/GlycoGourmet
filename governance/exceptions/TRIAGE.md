# 🚨 DAVE+R Governance Exception & Triage Protocol

> **Specification Authority:** DAVE+R Governance Framework (Module D / Gate Set EXC)  
> **Repository:** `ux-fotisp/GlycoGourmet`  
> **Author:** Fotis Pastrakis  
> **Schema Reference:** [`governance/exceptions/exception.schema.yaml`](./exception.schema.yaml)  
> **Active Register:** [`governance/exceptions/exception-register.yaml`](./exception-register.yaml)  

---

## 1. Core Principles & Human Ownership

Exceptions are declarative, time-bounded data records that permit temporary deviation from mechanical governance gates without weakening or corrupting the gate definitions themselves (**Axiom A1: Gates are data, not code**).

> [!IMPORTANT]
> **Non-Negotiable Agent Boundary:**  
> **“An agent may identify, draft, or validate an exception. It may not approve, renew, extend, or close an exception on behalf of a human.”**

Every exception:
1. **Must expire:** Maximum permissible lifespan is **30 days** from `created_at`. No exception may remain indefinitely active.
2. **Must be accountable:** A named human risk owner and an explicit human approver are mandatory for activation.
3. **Must be reversible:** Containment and rollback commands must be concrete, executable actions. Vague phrases such as *"accepted risk"*, *"temporary"*, *"TBD"*, or blank rollback fields are strictly rejected by CI.
4. **Cannot bypass core safeguards:** No exception may permanently waive Protected Health Information (PHI) walls (`SG-2`, `SG-3`), tenant isolation (`is-dietitian-owner.js`), RBAC invariants (`SG-1`), FHIR/LOINC metabolic calculation limits (`SG-4`), or release co-signing (`SG-7`).

---

## 2. Triage Decision Matrix

| Triage Track | Trigger Condition | Pre-Deployment Requirements | Post-Containment Requirements | Retrospective SLA | Maximum Lifespan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Planned** | Standard features, schema migrations, architectural refactors, scheduled dependency updates. | **Full 5-stage DAVE+R cycle** (`01-define` through `04-refine`). No exception normally required unless temporarily decoupling a sub-gate during multi-phase rollout. | Standard soak period (`min_shadow_days: 3`), promotion decision in `04-refine.md`, changelog entry. | None (built into Refine stage). | ≤ 30 days |
| **Expedited** | Time-sensitive but bounded defect fixes, staging blockers, edge proxy configuration failures. | Named human owner, observed evidence, blast radius, Validate-stage test evidence, executable rollback, and **explicit human approval**. | Complete Architect and Refine artifacts in the change folder; document retrospective findings. | **≤ 7 days** from activation. | ≤ 30 days |
| **Emergency** | Active exploitation, credible PHI exposure, data-loss risk, or complete production outage. | **Immediate containment permitted.** Agent may propose containment command, but named human operator must authorize execution. | Create register entry ASAP, conduct full root-cause analysis, and execute durable fix. | **≤ 24 hours** from activation. | ≤ 7 days (recommended), max 30 days. |

---

## 3. Detailed Track Specifications & Examples

### 3.1 Planned Track
- **Lifecycle Cadence:** Full sequential execution across all five workers:  
  `define-worker` → `architect-worker` → `validate-worker` → `execute-worker` → `refine-worker`.
- **When an Exception is Required:** Only when a planned change deliberately alters a baseline check (e.g., expanding the RBAC enum in `usePermissions.js`) before downstream controllers are fully updated across multiple PRs.
- **Example Scenario:** Introducing the `ClinicBillingAdmin` role (`ROADMAP.md` §5.1):
  - Gate `SG-1` detects an unexpected role identifier outside `[user, dietitian, clinic_admin, admin, super_admin]`.
  - A planned exception (`EXC-2026-001`) documents the planned expansion, links to `governance/2026-10-billing-admin/`, sets a 30-day expiry, and records the human owner (**Fotis P**).
  - Gate `SG-1` passes with warning; downstream PRs complete the full rollout.

### 3.2 Expedited Track
- **Lifecycle Cadence:** Accelerated deployment with deferred non-critical artifacts.
- **Minimum Enforceable Pre-Deploy Gate:**
  1. Named human owner assigned.
  2. Observed empirical evidence documented (`provenance: observed`).
  3. Blast radius explicitly bounded.
  4. Unit/integration tests verify no regression on untouched components.
  5. One-command rollback documented.
  6. Explicit human co-signature on PR.
- **Deferred Artifacts:** Complete `02-architect.md` and `04-refine.md` may be finalized post-deployment, provided `exception-register.yaml` logs the justification and sets `retrospective_due_at`.
- **Example Scenario:** Correcting a broken Netlify SPA catch-all redirect intercepting `/api/*` requests:
  - Staging users cannot log in due to HTML response returned on API endpoint.
  - Expedited exception (`EXC-2026-002`) logs the redirect fix, verifies 690 Vitest tests pass locally, specifies rollback (`git revert <sha>`), and schedules retrospective within 7 days.
  - Fix deploys immediately under human sign-off; architectural documentation updated next day.

### 3.3 Emergency Track
- **Lifecycle Cadence:** Immediate mitigation preceding comprehensive documentation.
- **Rules of Engagement:**
  - **Containment First:** If patient health data is leaking or clinical math is corrupted, containment takes precedence over gate bureaucracy.
  - **Agent Authority Limits:** An automated agent may diagnose the leak and output the exact containment CLI command (e.g., `netlify env:set DISABLE_ENDPOINT=true`), but **cannot execute production containment without human authorization**.
  - **Mandatory Register Logging:** Within 2 hours of containment, an `emergency` exception entry must be committed to `exception-register.yaml`.
  - **Strict 24-Hour Retrospective:** Post-incident review, artifact backfill, and permanent remediation must be delivered within 24 hours.
- **Example Scenario:** A public endpoint inadvertently returns tenant-scoped patient glycemic metrics:
  - Immediate operational action: Disable route or deploy WAF blocking rule.
  - Exception logged: `affected_gate_ids: ['SG-3']`, `track: emergency`, `compensating_controls: "Route 503 responder active"`, `retrospective_due_at: <now + 24h>`.
  - Durable resolution deployed, verified clean, and exception transitioned to `status: closed` with `closure_evidence`.

---

## 4. Lifecycle State Machine for Exceptions

```text
               +-------------+
               |  proposed   |  (Drafted by human or agent; zero CI bypass)
               +------+------+
                      |
                      | [Human Approver Sign-off]
                      v
               +-------------+
               |  approved   |  (Ready for deployment; gates aware)
               +------+------+
                      |
                      | [Deployed / CI Enforcing Window Opens]
                      v
               +-------------+
        +----->|   active    |  (Temporarily exempts listed gate IDs)
        |      +------+------+
        |             |
        |             |-- [expires_at < current_time] -----------> +-----------+
        |             |                                            |  expired  | (Fails CI)
        |             |-- [retrospective_due_at passed (emerg/exp)] |           |
        |             |                                            +-----------+
        |             |-- [Permanent Fix Verified & Rolled Back] -> +-----------+
        |                                                          |  closed   | (Requires closure_evidence)
        |                                                          +-----------+
        +-- [Human Renewal (New Entry)]
```

---

## 5. Machine Enforcement (Gate Set EXC)

The exception register is mechanically validated by [`scripts/governance-gates.js`](../../scripts/governance-gates.js) during every CI run:

- **EXC-1:** `exception-register.yaml` and `exception.schema.yaml` parse as valid YAML without syntax errors.
- **EXC-2:** Active exceptions validate all mandatory schema fields; placeholder containment commands are rejected.
- **EXC-3:** Any exception where `expires_at < current_time` with status `active` or `approved` immediately terminates CI with exit code 1.
- **EXC-4:** Any expedited or emergency active exception with a passed `retrospective_due_at` terminates CI.
- **EXC-5:** Any exception touching clinical or security gates (`SG-1` through `SG-4`, `SG-6`, `SG-7`) lacking a verified human approver terminates CI.
- **EXC-6:** Any exception exceeding the 30-day maximum duration terminates CI.
- **EXC-7:** Any exception referencing a non-existent `change_id` directory under `governance/` terminates CI.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
