# 🛡️ GlycoGourmet × DAVE+R — Governance & Delivery Adapter

> **Change Lifecycle for RBAC, Tenancy, PHI Boundaries, and Clinical Export Pipelines**  
> *Adapter ID: `gg-governance-delivery` · Authored & Maintained by [Fotis Pastrakis](https://fotisp.gr)*

---

## 0. Non-Negotiable Axioms

These five axioms are load-bearing. No worker, gate, or shortcut may violate them:

| # | Axiom | Enforcement |
|---|---|---|
| **A1** | **Gates are data, not code.** Every check is a declarative pass/fail assertion, never an ad-hoc judgment call. If a gate can't be checked mechanically, it isn't a gate yet — it's a TODO. | Worker artifacts use structured pass/fail tables. |
| **A2** | **Evidence over assertion (anti-fabrication rule).** A worker may never claim a metric, coverage number, or CI status it did not actually observe. | Validate-worker must cite real CI run IDs. |
| **A3** | **A named human owns the risk.** Every Execute-stage change lists a human owner who can be paged if it misfires. The agent proposes; the human is accountable. | Default owner: **Fotis P** |
| **A4** | **Shadow before enforce.** Any new security/governance control runs in observe-only/shadow mode for a minimum soak period before it can block real traffic. | `min_shadow_days: 3` |
| **A5** | **Reversibility is mandatory.** Every change must have a documented, one-command rollback before it is allowed to merge. | `git revert`, feature-flag off, or Strapi policy toggle. |

---

## 1. Adapter Definition

```yaml
id: gg-governance-delivery
name: GlycoGourmet Governance & Delivery Adapter
purpose: >
  Change to RBAC, tenancy, PHI boundaries, or the clinical export pipeline is
  reviewed, evidenced, reversible, and owned — without breaking the Vitest
  suite or the certified CI runs.
planes: [ci-cd, application, identity, data, edge-api]
telemetry_systems: [github_actions, vitest, playwright]
min_shadow_days: 3
secondary_lens: gg-bot-fraud
```

### 1.1 Control Plane → Artifact Mapping

| DAVE+R Plane | GlycoGourmet Artifact(s) | Key File(s) |
|---|---|---|
| **identity** | RBAC state machine (ClinicAdmin, Dietitian, Patient, SuperAdmin), `usePermissions.js`, `/pending-approval` redirect gate | `src/hooks/usePermissions.js`, `src/routes/ProtectedRoute.jsx`, `backend_dev.md` §5 |
| **data** | PHI boundary (PHIBoundaryBanner.jsx), tenant-scoped Strapi schemas, FHIR/LOINC export invariants | `src/components/clinic-admin/PHIBoundaryBanner.jsx`, `src/utils/exportPipeline.js` |
| **application** | Net-carb clamping invariant, GI/GL composite invariant, serving-multiplier scaling | `server/src/services/metabolicEngine.js`, `agentic.md` §3 |
| **edge-api** | Public Strapi REST endpoints, recipe catalog, export pipeline | `backend_dev.md` §6, `server/src/api/` |
| **ci-cd** | GitHub Actions (production + integration pipelines), oxlint, tsc --noEmit, Vitest, Playwright | `.github/workflows/`, `ci_cd.md` |

---

## 2. Workers (DAVE+R Stages)

Each worker is a distinct Antigravity sub-agent invocation. They run **in sequence**; a worker cannot start until the prior stage's artifact is committed to the repo.

### Worker 1 — `define-worker` (Stage: Define)

**Task:** Given a proposed change, produce a Define artifact.

**Inputs:** Change description (e.g., "add rate limiting to the FHIR export endpoint").

**Outputs:** `governance/<change-id>/01-define.md` containing:
- Problem statement grounded in `SECURITY.md`'s stated clinical data scope and tenant isolation model
- Blast radius: which RBAC roles, which Strapi content types, which existing invariant tests could be affected
- Explicit non-goals (what this change must NOT touch)

**Template:** `governance/_templates/01-define.template.md`

---

### Worker 2 — `architect-worker` (Stage: Architect)

**Task:** Design the control against the mapped planes.

**Inputs:** Approved Define artifact.

**Outputs:** `governance/<change-id>/02-architect.md` containing:
- Exact hook/component/policy touched (file paths, not descriptions)
- Shadow-mode mechanism (feature flag, `console.warn`-only policy, dry-run export) satisfying **Axiom A4**
- Rollback command satisfying **Axiom A5**
- WCAG 2.1 AA and Rules-of-Hooks compliance check for any new UI (Escape-to-close, `role="dialog"`, no conditional `useEffect`)

**Template:** `governance/_templates/02-architect.template.md`

---

### Worker 3 — `validate-worker` (Stage: Validate)

**Task:** Prove the design against evidence, not assumption.

**Inputs:** Approved Architect artifact.

**Outputs:** `governance/<change-id>/03-validate.md` containing:
- Latest GitHub Actions run for the target branch — **real run ID cited** (Axiom A2)
- Vitest suite pass count — **re-verified, never assumed** (Axiom A2)
- For metabolic-math-adjacent changes: floating-point tolerance via `toBeLessThanOrEqual(1)`, never `toBeCloseTo`
- For E2E: text/role-based Playwright locators only (`page.locator('text=...')` / `.locator('visible=true')`), never brittle DOM paths

**Template:** `governance/_templates/03-validate.template.md`

---

### Worker 4 — `execute-worker` (Stage: Execute)

**Task:** Implement on a feature branch, never `main`.

**Inputs:** Approved Validate artifact.

**Outputs:** An open PR containing:
- Branch: `feat/gov-<change-id>` or `fix/gov-<change-id>`
- Conventional Commit messages (`feat:`, `fix:`, `chore:`)
- Control shipped in shadow mode first, per the Architect artifact
- Named human owner (default: **Fotis P**) in PR description
- References to Define/Architect/Validate artifacts

**No template** — output is a Git branch + PR, not a markdown file.

---

### Worker 5 — `refine-worker` (Stage: Refine)

**Task:** After the soak period (`min_shadow_days: 3` minimum), re-validate with fresh evidence.

**Inputs:** Merged PR in shadow mode + soak period elapsed.

**Outputs:** `governance/<change-id>/04-refine.md` containing:
- Shadow-mode telemetry: did the control fire any false positives?
- Promotion decision: **promote** (shadow → enforcing), **hold** (extend soak), or **rollback** (revert)
- If promoted: append entry to `changelog.md` following its existing semantic-versioning convention

**Decision loop:** If evidence is not clean, loop back to `architect-worker`.

**Template:** `governance/_templates/04-refine.template.md`

---

## 3. Secondary Lens — `gg-bot-fraud` (Module C, Scoped)

Applies **only** to public, unauthenticated Strapi/export endpoints (not admin-only RBAC surfaces).

Any worker touching these endpoints must additionally verify:

| Check | Pass Criteria |
|---|---|
| **Rate-limit signal** | A throttle mechanism exists before public exposure of any new export or catalog endpoint. |
| **PHI leak prevention** | No PHI-adjacent field (carb targets, GL values tied to a patient ID) is returned from an endpoint reachable without authentication. |
| **Scraping resilience** | Pagination and response shaping don't allow bulk exfiltration of the full recipe/clinical catalog in one call. |

---

## 4. Antigravity Session Bootstrap

Copy-paste the following as the first message when invoking an Antigravity agent for a governance change:

```text
You are running the DAVE+R Governance & Delivery cycle (adapter: gg-governance-delivery)
for the GlycoGourmet repository (ux-fotisp/GlycoGourmet).

Ground every claim in real repo state — read agentic.md, ci_cd.md, backend_dev.md §5,
SECURITY.md, and testing.md before proposing anything. Never state a test count, CI run
ID, or coverage number you have not just observed.

Execute stages in order: define-worker → architect-worker → validate-worker →
execute-worker → refine-worker. Do not skip a stage or merge to main without an
explicit human confirmation. Every control ships in shadow mode first and must have a
one-command rollback documented before merge.

Target change: <describe the specific RBAC/PHI/export/API change here>
```

---

## 5. Exclusions

The following DAVE+R modules were **deliberately excluded** from this adapter:

| Module | Reason |
|---|---|
| **Module A (Edge/WAF)** | GlycoGourmet has no edge WAF or cloud IAM layer (Netlify + Docker Compose only). Re-introduce when a CDN-level WAF enters the stack. |
| **Module B (Cloud Posture)** | No multi-cloud posture tool. Re-introduce when cloud IAM (AWS IAM, GCP IAM) is adopted. |
| **Full DAVE+R MCP Server** | Antigravity + GitHub connector already cover file, PR, and CI introspection; the MCP server would duplicate tooling without new capability at this stage. |

---

## 6. Document Metadata & Attribution

- **Document Version:** `1.0.0`
- **Adapter Lineage:** DAVE+R Core Lifecycle → Module D (Governance & Delivery) primary, Module C (Bot & Fraud) secondary lens
- **Inherits From:** `agentic.md` (QA-DIRECTIVE-2026), `ci_cd.md`, `backend_dev.md` §5, `SECURITY.md`, `testing.md`
- **Lead Architect & Risk Owner:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._

