# 🤝 Contributing to GlycoGourmet

> **Branching Strategy, Conventional Commits, and Pull Request Quality Gates**  
> *Authored & Maintained by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. Code of Conduct & Standards

GlycoGourmet is an open-source clinical platform built with rigorous engineering and accessibility standards. Contributors are expected to maintain respect, collaboration, and adherence to deterministic quality gates.

---

## 2. Git Branching Strategy

```
master (Production / Protected)
  ▲
  │ (Pull Request via CI Quality Gate)
  ├── feat/<feature-name>      (New clinical capabilities / UI components)
  ├── fix/<bug-name>           (Targeted bug fixes & security patches)
  ├── docs/<scope>             (Architectural documentation & updates)
  └── chore/<scope>            (Dependencies, maintenance & cleanup)
```

- **`master`**: Production-ready branch. Direct pushes are disabled; all merges require passing CI quality gates.
- Always branch off the latest `master`:
  ```bash
  git checkout master
  git pull origin master
  git checkout -b feat/my-clinical-feature
  ```

---

## 3. Conventional Commits Standard

All commits must strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional-scope>): <short-imperative-description>

[optional body explaining architectural/clinical context]
```

### Permitted Commit Types:
- **`feat`**: A new clinical feature or UI capability (e.g. `feat(engine): add 7-day adherence rollup calculation`).
- **`fix`**: A bug fix or security patch (e.g. `fix(auth): restore missing role relation in user schema`).
- **`docs`**: Documentation additions or updates (e.g. `docs: consolidate architecture documentation`).
- **`refactor`**: Code change that neither fixes a bug nor adds a feature (e.g. `refactor: standardize net carbs helper`).
- **`test`**: Adding or modifying test suites (e.g. `test: backfill tenant scoping unit tests`).
- **`chore`**: Maintenance, configuration, or dependency updates (e.g. `chore: update vite build target`).
- **`perf`**: Performance optimization (e.g. `perf: debounce filter slider URL sync`).
- **`security`**: Security hardening or invariant enforcement (e.g. `security: sanitize user update payload`).

---

## 4. Pre-Submission Quality Gate Checklist

Before opening a Pull Request, verify that all local quality gates pass:

```bash
# 1. Static Linting & Code Hygiene (Oxlint)
npm run lint

# 2. Strict TypeScript Compilation Check
npm run typecheck

# 3. Deterministic Unit & Invariant Test Suite (Vitest)
npm run test

# 4. Automated WCAG 2.1 AA Accessibility & Contrast Audits
npm run test:a11y

# 5. Multi-Browser End-to-End User Journeys (Playwright)
npm run test:e2e

# 6. Nutritional Ground Truth Invariant Validation
npm run validate-db

# 7. Combined Pre-Commit Gate
npm run precommit
```

### Pull Request Checklist:
- [ ] Code follows Sage & Grain design system tokens and 8px grid.
- [ ] New components include semantic test identifiers (`data-testid`) and accessible ARIA roles.
- [ ] Mathematical calculations include unit tests verifying boundary invariants (e.g. zero division, fiber inversion).
- [ ] No regression in passing test count ($281+$ passing tests).
- [ ] Commit messages conform to Conventional Commits.
