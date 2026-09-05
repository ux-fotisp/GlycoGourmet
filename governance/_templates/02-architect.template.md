# 02 — Architect Artifact

> **Change ID:** `<change-id>`  
> **Date:** `<YYYY-MM-DD>`  
> **Author (Agent):** `<agent-id>`  
> **Risk Owner (Human):** Fotis P  
> **Prerequisite:** `governance/<change-id>/01-define.md` approved

---

## 1. Components Touched

_Exact file paths, not descriptions. One row per file._

| File Path | Type (hook / component / policy / service / schema) | Nature of Change (new / modify / delete) |
|---|---|---|
| _e.g. `src/hooks/usePermissions.js`_ | hook | modify |
| _e.g. `server/src/policies/is-clinic-admin.js`_ | policy | modify |

---

## 2. Shadow-Mode Mechanism (Axiom A4)

_Every new control must run in observe-only mode before enforcement._

| Field | Value |
|---|---|
| **Shadow mechanism** | _Feature flag / `console.warn`-only policy / dry-run export / other_ |
| **Flag name (if applicable)** | _e.g. `SHADOW_RATE_LIMIT_EXPORT`_ |
| **Observable signal** | _What telemetry proves shadow mode is working? (log line, metric, Playwright assertion)_ |
| **Minimum soak period** | 3 days (per `min_shadow_days`) |
| **Promotion criteria** | _What evidence is needed to move from shadow → enforcing?_ |

---

## 3. Rollback Command (Axiom A5)

_One-command rollback. Must be documented before merge._

```bash
# Primary rollback
<e.g. git revert <commit-sha>>

# Alternative rollback (if feature-flagged)
<e.g. Set SHADOW_RATE_LIMIT_EXPORT=off in .env>
```

| Rollback Type | Command | Tested? |
|---|---|---|
| Git revert | `git revert <sha>` | ⬜ Yes / ⬜ No |
| Feature flag off | _env var or Strapi config toggle_ | ⬜ Yes / ⬜ No |
| Strapi policy toggle | _policy file swap_ | ⬜ Yes / ⬜ No |

---

## 4. WCAG 2.1 AA & Rules-of-Hooks Compliance

_Required for any change introducing new UI components._

### 4.1 Accessibility Checklist

| Check | Status | Notes |
|---|---|---|
| `role="dialog"` on modals | ⬜ Pass / ⬜ N/A | |
| Escape-to-close on overlays | ⬜ Pass / ⬜ N/A | |
| Focus trap on modal open | ⬜ Pass / ⬜ N/A | |
| Contrast ratio ≥ 4.5:1 (AA) | ⬜ Pass / ⬜ N/A | |
| Touch targets ≥ 48×48px | ⬜ Pass / ⬜ N/A | |
| `aria-label` / `aria-describedby` on interactive elements | ⬜ Pass / ⬜ N/A | |

### 4.2 React Hooks Compliance

| Check | Status | Notes |
|---|---|---|
| No conditional `useEffect` | ⬜ Pass / ⬜ N/A | |
| No conditional `useState` | ⬜ Pass / ⬜ N/A | |
| No hooks inside loops/callbacks | ⬜ Pass / ⬜ N/A | |
| Custom hooks follow `use*` naming | ⬜ Pass / ⬜ N/A | |

---

## 5. Secondary Lens Checks (if applicable)

_Only required if Define artifact marked `gg-bot-fraud` as applicable._

| Check | Status | Evidence |
|---|---|---|
| Rate-limit / throttle signal exists | ⬜ Pass / ⬜ N/A | |
| No PHI-adjacent field returned without auth | ⬜ Pass / ⬜ N/A | |
| Pagination prevents bulk exfiltration | ⬜ Pass / ⬜ N/A | |

---

## 6. Gate Status

| Gate | Status |
|---|---|
| All touched files enumerated with paths | ⬜ Pass / ⬜ Fail |
| Shadow-mode mechanism documented | ⬜ Pass / ⬜ Fail |
| Rollback command documented and viable | ⬜ Pass / ⬜ Fail |
| WCAG/Hooks compliance verified (or N/A) | ⬜ Pass / ⬜ Fail |
| Secondary lens checks passed (or N/A) | ⬜ Pass / ⬜ Fail |
| Ready for validate-worker | ⬜ Pass / ⬜ Fail |

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._

