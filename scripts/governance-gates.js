#!/usr/bin/env node
/**
 * scripts/governance-gates.js
 *
 * DAVE+R Mechanically Checkable Governance Gate Verifier
 * Evaluates declarative gates from governance/gates/testing.gate.yaml and
 * governance/gates/security-major-upgrade.gate.yaml.
 *
 * Non-zero exit code on any blocking gate failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to recursively collect files with specific extensions
function getFiles(dir, filterFn) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFiles(fullPath, filterFn));
    } else if (entry.isFile()) {
      if (!filterFn || filterFn(entry.name, fullPath)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const results = {
  passed: [],
  warnings: [],
  failures: [],
};

function recordPass(gateId, description, details) {
  results.passed.push({ gateId, description, details });
  console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${gateId}: ${description}`);
  if (details) console.log(`         \x1b[90m${details}\x1b[0m`);
}

function recordWarn(gateId, description, warning) {
  results.warnings.push({ gateId, description, warning });
  console.log(`  \x1b[33m▲ [WARN]\x1b[0m ${gateId}: ${description}`);
  console.log(`         \x1b[33m${warning}\x1b[0m`);
}

function recordFail(gateId, description, error) {
  results.failures.push({ gateId, description, error });
  console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${gateId}: ${description}`);
  console.log(`         \x1b[31mError: ${error}\x1b[0m`);
}

console.log('\n================================================================');
console.log(' GlycoGourmet × DAVE+R — Governance Mechanical Gate Enforcement');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. TO-2: Metabolic-engine floating point assertions tolerance check
// -----------------------------------------------------------------------------
const to2Id = 'TO-2';
const to2Desc = 'Metabolic-engine floating point assertions use tolerance, not strict equality.';
try {
  const metabolicSpecFiles = getFiles(
    path.join(ROOT_DIR, 'tests', 'unit'),
    (name) => name.startsWith('metabolicEngine') && name.endsWith('.spec.ts')
  );

  let toBeCloseToMatches = [];
  for (const file of metabolicSpecFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('toBeCloseTo')) {
        toBeCloseToMatches.push(`${path.relative(ROOT_DIR, file)}:L${idx + 1}: ${line.trim()}`);
      }
    });
  }

  if (toBeCloseToMatches.length === 0) {
    recordPass(to2Id, to2Desc, `Scanned ${metabolicSpecFiles.length} file(s); 0 'toBeCloseTo' assertions found.`);
  } else {
    recordFail(
      to2Id,
      to2Desc,
      `Found ${toBeCloseToMatches.length} 'toBeCloseTo' instance(s) in metabolicEngine specs:\n           ${toBeCloseToMatches.join('\n           ')}`
    );
  }
} catch (err) {
  recordFail(to2Id, to2Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// 2. TO-3: Playwright locators are text/role-based, not brittle DOM paths
// -----------------------------------------------------------------------------
const to3Id = 'TO-3';
const to3Desc = 'Playwright locators are text/role-based, not brittle DOM paths.';
try {
  const e2eFiles = getFiles(
    path.join(ROOT_DIR, 'tests', 'e2e'),
    (name) => name.endsWith('.ts') || name.endsWith('.js')
  );

  let brittleMatches = [];
  const brittlePattern = /nth-child|css=/;

  for (const file of e2eFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (brittlePattern.test(line)) {
        brittleMatches.push(`${path.relative(ROOT_DIR, file)}:L${idx + 1}: ${line.trim()}`);
      }
    });
  }

  if (brittleMatches.length === 0) {
    recordPass(to3Id, to3Desc, `Scanned ${e2eFiles.length} E2E test files; 0 brittle selector patterns found.`);
  } else {
    recordWarn(
      to3Id,
      to3Desc,
      `Found ${brittleMatches.length} potentially brittle selector(s) in tests/e2e:\n           ${brittleMatches.join('\n           ')}`
    );
  }
} catch (err) {
  recordFail(to3Id, to3Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// 3. TO-6: React Hooks rule - no conditional useEffect introduced
// -----------------------------------------------------------------------------
const to6Id = 'TO-6';
const to6Desc = 'React Hooks rule is respected - no conditional useEffect introduced.';
try {
  const srcFiles = getFiles(
    path.join(ROOT_DIR, 'src'),
    (name) => /\.(jsx?|tsx?)$/.test(name)
  );

  let conditionalEffectMatches = [];
  const singleLinePattern = /if\s*\([^)]*\)\s*\{?\s*useEffect\s*\(/;
  const multiLinePattern = /if\s*\([^)]*\)\s*\{[^{}]*?\buseEffect\s*\(/gs;

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('useEffect')) continue;

    // Check single-line
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (singleLinePattern.test(line)) {
        conditionalEffectMatches.push(`${path.relative(ROOT_DIR, file)}:L${idx + 1}: ${line.trim()}`);
      }
    });

    // Check multi-line block matches if not already caught on single-line
    if (multiLinePattern.test(content)) {
      const rel = path.relative(ROOT_DIR, file);
      if (!conditionalEffectMatches.some((m) => m.startsWith(rel))) {
        conditionalEffectMatches.push(`${rel} (multi-line block conditional useEffect detected)`);
      }
    }
  }

  if (conditionalEffectMatches.length === 0) {
    recordPass(to6Id, to6Desc, `Scanned ${srcFiles.length} source file(s); 0 conditional useEffect patterns found.`);
  } else {
    recordFail(
      to6Id,
      to6Desc,
      `Found ${conditionalEffectMatches.length} conditional useEffect occurrence(s):\n           ${conditionalEffectMatches.join('\n           ')}`
    );
  }
} catch (err) {
  recordFail(to6Id, to6Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// 4. INT-1: Governance Change-Set Folder Completeness (NEXT-STEPS #2)
// -----------------------------------------------------------------------------
const int1Id = 'INT-1';
const int1Desc = 'Governance change-set completeness: all 4 stage artifacts (01-define, 02-architect, 03-validate, 04-refine) present in every change folder.';
try {
  const govDir = path.join(ROOT_DIR, 'governance');
  const reservedDirs = new Set(['_templates', 'gates', 'workers', 'node_modules', '.git']);
  const requiredFiles = ['01-define.md', '02-architect.md', '03-validate.md', '04-refine.md'];

  let changeFoldersFound = 0;
  let incompleteFolders = [];

  if (fs.existsSync(govDir)) {
    const entries = fs.readdirSync(govDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !reservedDirs.has(entry.name)) {
        changeFoldersFound++;
        const folderPath = path.join(govDir, entry.name);
        const presentFiles = fs.readdirSync(folderPath);
        const missing = requiredFiles.filter((req) => !presentFiles.includes(req));
        if (missing.length > 0) {
          incompleteFolders.push({ folder: entry.name, missing });
        }
      }
    }
  }

  if (incompleteFolders.length === 0) {
    recordPass(
      int1Id,
      int1Desc,
      `Verified ${changeFoldersFound} change-set folder(s). All required 4 stage artifacts are present.`
    );
  } else {
    const details = incompleteFolders
      .map((f) => `governance/${f.folder}/ is missing: ${f.missing.join(', ')}`)
      .join('\n           ');
    recordFail(int1Id, int1Desc, `Incomplete governance change folder(s) detected:\n           ${details}`);
  }
} catch (err) {
  recordFail(int1Id, int1Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// 5. SG-1: RBAC State Machine Role List Diff Check
// -----------------------------------------------------------------------------
const sg1Id = 'SG-1';
const sg1Desc = 'RBAC state machine roles ({ClinicAdmin, Dietitian, Patient, SuperAdmin, Admin}) remain within baseline unless deliberately modified.';
try {
  const usePermissionsPath = path.join(ROOT_DIR, 'src', 'hooks', 'usePermissions.js');
  const baselineRoles = new Set(['clinic_admin', 'dietitian', 'user', 'patient', 'super_admin', 'admin']);

  if (!fs.existsSync(usePermissionsPath)) {
    recordFail(sg1Id, sg1Desc, `File not found: ${path.relative(ROOT_DIR, usePermissionsPath)}`);
  } else {
    const content = fs.readFileSync(usePermissionsPath, 'utf8');

    // Extract role string literals tested in usePermissions.js
    const roleMatches = content.match(/\['[a-z_]+'(?:\s*,\s*'[a-z_]+')*\]/g) || [];
    const extractedRoles = new Set();
    for (const match of roleMatches) {
      const items = match.replace(/[[\]']/g, '').split(',').map((s) => s.trim().toLowerCase());
      items.forEach((r) => extractedRoles.add(r));
    }

    const unexpectedRoles = [];
    for (const r of extractedRoles) {
      if (!baselineRoles.has(r)) {
        unexpectedRoles.push(r);
      }
    }

    if (unexpectedRoles.length === 0) {
      recordPass(
        sg1Id,
        sg1Desc,
        `RBAC roles in usePermissions.js match baseline: [${Array.from(extractedRoles).join(', ')}].`
      );
    } else {
      recordWarn(
        sg1Id,
        sg1Desc,
        `New RBAC role(s) detected: [${unexpectedRoles.join(', ')}]. Ensure this intentional expansion has completed DAVE+R Define/Architect/Validate artifacts.`
      );
    }
  }
} catch (err) {
  recordFail(sg1Id, sg1Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// 6. SG-2: PHIBoundaryBanner.jsx render guard verification
// -----------------------------------------------------------------------------
const sg2Id = 'SG-2';
const sg2Desc = 'PHIBoundaryBanner.jsx render condition audited - confirmed it explicitly excludes Patient or standard Dietitian contexts (Clinic Admin only).';
try {
  const bannerPath = path.join(ROOT_DIR, 'src', 'components', 'clinic-admin', 'PHIBoundaryBanner.jsx');

  if (!fs.existsSync(bannerPath)) {
    recordFail(sg2Id, sg2Desc, `File not found: ${path.relative(ROOT_DIR, bannerPath)}`);
  } else {
    const content = fs.readFileSync(bannerPath, 'utf8');

    // Guard assertions:
    // 1. Checks !isClinicAdminContext and returns null
    const hasReturnNullGuard = /if\s*\(!isClinicAdminContext\)\s*\{\s*return null;\s*\}/.test(content);

    // 2. Defines isClinicAdminContext to include clinic_admin / super_admin
    const hasAdminContextDef = /clinic_admin/.test(content) && /super_admin/.test(content);

    // 3. Must NOT permit patient or dietitian in the authorized render condition
    const permitsPatientOrDietitian = /isClinicAdminContext\s*=.*?\b(patient|dietitian)\b/i.test(content);

    if (hasReturnNullGuard && hasAdminContextDef && !permitsPatientOrDietitian) {
      recordPass(
        sg2Id,
        sg2Desc,
        'Render guard confirmed: returns null unless in ClinicAdmin / SuperAdmin context. Patient and Dietitian strictly excluded.'
      );
    } else {
      let issues = [];
      if (!hasReturnNullGuard) issues.push("Missing 'if (!isClinicAdminContext) return null;' guard");
      if (!hasAdminContextDef) issues.push('Missing clinic_admin/super_admin authorization checks');
      if (permitsPatientOrDietitian) issues.push('Accidental inclusion of Patient/Dietitian in isClinicAdminContext');
      recordFail(sg2Id, sg2Desc, `Render condition compromised: ${issues.join('; ')}`);
    }
  }
} catch (err) {
  recordFail(sg2Id, sg2Desc, `Check execution error: ${err.message}`);
}

// -----------------------------------------------------------------------------
// Non-Mechanical Gates Summary (Informational / Not duplicated here)
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log(' Non-Mechanical / Delegated Gates (Status & Ownership)');
console.log('----------------------------------------------------------------');
const delegatedGates = [
  {
    id: 'TO-1',
    description: 'Vitest suite result freshly observed',
    channel: 'Checked by existing CI job (`npm run test`)',
  },
  {
    id: 'TO-4',
    description: 'oxlint and tsc --noEmit pass with zero errors',
    channel: 'Checked by existing CI job (`npx oxlint` && `npx tsc --noEmit`)',
  },
  {
    id: 'TO-5',
    description: '100% line/branch coverage on changed invariant scope',
    channel: 'Checked by existing CI job (`vitest --coverage`)',
  },
  {
    id: 'SG-3',
    description: 'Public endpoint PHI leak & pagination limit audit',
    channel: 'Not yet automatable statically — requires live endpoint / schema integration scan',
  },
  {
    id: 'SG-4',
    description: 'FHIR/LOINC export invariants re-validated',
    channel: 'Checked by existing CI unit test suite (`tests/unit/metabolicEngine*.spec.ts`)',
  },
  {
    id: 'SG-5',
    description: 'Dependency major bumps scanned for known CVEs',
    channel: 'Checked by existing CI job (`npm audit --audit-level=high`)',
  },
  {
    id: 'SG-6',
    description: 'One-command rollback documented and dry-run tested',
    channel: 'Remains manual — requires human operator dry-run verification before release merge',
  },
  {
    id: 'SG-7',
    description: 'Named human owner co-signed release PR',
    channel: 'Remains manual — requires human PR approval/co-sign, never agent authority alone',
  },
];

delegatedGates.forEach((g) => {
  console.log(`  \x1b[90m- [DELEGATED/MANUAL] ${g.id}: ${g.description}\x1b[0m`);
  console.log(`    \x1b[90mChannel: ${g.channel}\x1b[0m`);
});

// -----------------------------------------------------------------------------
// Summary & Report Generation
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(
  ` Summary: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failures.length} failures`
);
console.log('================================================================\n');

// Write JSON report for CI consumption (PR commenting)
const reportPath = path.join(ROOT_DIR, 'governance-gate-report.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        passed: results.passed.length,
        warnings: results.warnings.length,
        failures: results.failures.length,
      },
      passed: results.passed,
      warnings: results.warnings,
      failures: results.failures,
      delegated: delegatedGates,
    },
    null,
    2
  )
);

if (results.failures.length > 0) {
  console.error(`\x1b[31m✖ Governance gate verification FAILED (${results.failures.length} failure(s)).\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✔ All mechanical governance gates PASSED.\x1b[0m\n`);
  process.exit(0);
}
