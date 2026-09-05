# GOVERNANCE - Next Steps
_Prioritized backlog resulting from comparing the docs-only governance layer against the
upstream DAVE+R engine (DtheRock/DAVE-R) and its `evidence.md` / `gates/*.yaml` / `THREAT-MODEL.md`._

## Fidelity gaps to close (priority order)

1. **Typed evidence schema everywhere.** `testing.gate.yaml` and
   `security-major-upgrade.gate.yaml` now define `provenance` + `observed_at` +
   `source_url` fields. Retrofit the same schema into
   `01-define.template.md` through `04-refine.template.md` so every future cycle
   inherits it, not just the two new workers.

2. **[COMPLETED] Add a real integrity gate.** The folder-completeness check (`INT-1`), machine-readable evidence ledger parsing (`INT-2`), required provenance fields (`INT-3`), anti-future/anti-backdating timestamp ordering (`INT-4`), Git SHA repository verification (`INT-5`), change-id existence (`INT-6`), external check durable artifact requirements (`INT-7`), legacy-unverifiable exception isolation (`INT-8`), and truthful mechanical language scoping (`INT-9`) are now automated in [`scripts/governance-gates.js`](../scripts/governance-gates.js) and enforced via [`.github/workflows/governance-gates.yml`](../.github/workflows/governance-gates.yml).

3. **[COMPLETED] Exception register + triage tiers.** Implemented via [`governance/exceptions/exception-register.yaml`](./exceptions/exception-register.yaml), machine-readable schema [`governance/exceptions/exception.schema.yaml`](./exceptions/exception.schema.yaml), and operational protocol [`governance/exceptions/TRIAGE.md`](./exceptions/TRIAGE.md). Provides typed exception structures for `planned`, `expedited`, and `emergency` triage tracks with mandatory expiry (≤ 30 days), named human accountability, non-placeholder containment commands, and retrospective SLAs. Mechanically enforced in CI by [`scripts/governance-gates.js`](../scripts/governance-gates.js) via gates `EXC-1` through `EXC-7`.

## Remaining Non-Finished DAVE+R Work (Priority Order)

1. **Backend provider selection and real Strapi deployment:** Decide hosting provider (Render, Railway, Fly.io, Strapi Cloud, or VPS), provision PostgreSQL, configure production JWT secrets, and bind DNS.
2. **Live endpoint & PHI audit (SG-3):** Inspect live responses to guarantee zero unsanitized health data or patient identifier leakage across unauthenticated routes.
3. **Rollback dry-run (SG-6):** Document and dry-run verify one-command rollback before production release.
4. **Named human release sign-off (SG-7):** Obtain Fotis P's documented co-signature on the release PR before merging to master.
5. **Human assignment of the exception-register owner:** Assign Fotis P or designated human owner to `register_owner` and review open draft exceptions.

4. **[COMPLETED] Wire gates into actual CI**, not just markdown read by a human+agent. Automated via [`.github/workflows/governance-gates.yml`](../.github/workflows/governance-gates.yml) running [`scripts/governance-gates.js`](../scripts/governance-gates.js). Mechanically evaluates gates `TO-2`, `TO-3`, `TO-6`, `INT-1`, `SG-1`, and `SG-2` on pull requests touching `src/**`, `tests/**`, `governance/**`, or `backend_dev.md`, blocks on failure, and automatically posts diagnostic PR comments quoting the exact gate YAML descriptions.

5. **[COMPLETED] Pilot on one real change.** Addressed via the **Login Network Error Investigation & Staging Fix** ([`governance/2026-09-login-fix/`](./2026-09-login-fix/)), executed across the full DAVE+R cycle:
   - [`01-define.md`](./2026-09-login-fix/01-define.md): Problem statement, blast radius (`AuthContext.jsx`, `netlify.toml`, `.env.example`), and explicit non-goals (zero RBAC/PHI modification).
   - [`02-architect.md`](./2026-09-login-fix/02-architect.md): Architecture of the two fix mechanisms (relative fetch routed through `STRAPI_URL`; edge proxy `/api/*` rewrite added) and documentation of the open infrastructure gap (unprovisioned backend).
   - [`03-validate.md`](./2026-09-login-fix/03-validate.md): Live curl observations, typed evidence schema, DNS resolution failure proof, and 690-test Vitest verification.
   - [`04-refine.md`](./2026-09-login-fix/04-refine.md): Honest Refine-stage outcome (`HOLD — cannot promote to enforcing/resolved until a real backend exists`, conforming to Axioms 2 & 4).
   
   **Next Pilot Candidate:** The original suggestion from `ROADMAP.md` Section 5.1 — the **Extended RBAC Hierarchy** (`ClinicBillingAdmin` role) — is now the NEXT pilot candidate to exercise `identity` and `data` planes under enforcing conditions.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
