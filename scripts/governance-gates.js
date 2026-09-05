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
import YAML from 'yaml';

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

function recordPass(gateId, description, details, meta = {}) {
  results.passed.push({
    gateId,
    status: 'PASS',
    description,
    details: details || null,
    affectedExceptionId: meta.affectedExceptionId || null,
    evidencePath: meta.evidencePath || null,
    timestamp: new Date().toISOString()
  });
  console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${gateId}: ${description}`);
  if (details) console.log(`         \x1b[90m${details}\x1b[0m`);
}

function recordWarn(gateId, description, warning, meta = {}) {
  results.warnings.push({
    gateId,
    status: 'WARN',
    description,
    warning: warning || null,
    affectedExceptionId: meta.affectedExceptionId || null,
    evidencePath: meta.evidencePath || null,
    timestamp: new Date().toISOString()
  });
  console.log(`  \x1b[33m▲ [WARN]\x1b[0m ${gateId}: ${description}`);
  console.log(`         \x1b[33m${warning}\x1b[0m`);
}

function recordFail(gateId, description, error, meta = {}) {
  results.failures.push({
    gateId,
    status: 'FAIL',
    description,
    error: error || null,
    affectedExceptionId: meta.affectedExceptionId || null,
    evidencePath: meta.evidencePath || null,
    timestamp: new Date().toISOString()
  });
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
  const reservedDirs = new Set(['_templates', 'gates', 'workers', 'exceptions', 'node_modules', '.git']);
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
// 7. EXC-1: YAML register and schema parse successfully
// -----------------------------------------------------------------------------
const exc1Id = 'EXC-1';
const exc1Desc = 'YAML register and schema parse successfully without syntax or decoding errors.';
const registerPath = path.join(ROOT_DIR, 'governance', 'exceptions', 'exception-register.yaml');
const schemaPath = path.join(ROOT_DIR, 'governance', 'exceptions', 'exception.schema.yaml');
const relRegisterPath = path.relative(ROOT_DIR, registerPath);
const relSchemaPath = path.relative(ROOT_DIR, schemaPath);

let parsedRegister = null;
let parsedSchema = null;
let registerParseError = null;

try {
  if (!fs.existsSync(registerPath)) {
    throw new Error(`File not found: ${relRegisterPath}`);
  }
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`File not found: ${relSchemaPath}`);
  }

  const registerContent = fs.readFileSync(registerPath, 'utf8');
  parsedRegister = YAML.parse(registerContent);

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  parsedSchema = YAML.parse(schemaContent);

  recordPass(exc1Id, exc1Desc, `Successfully parsed ${relRegisterPath} and ${relSchemaPath}.`, {
    evidencePath: relRegisterPath
  });
} catch (err) {
  registerParseError = err.message;
  recordFail(exc1Id, exc1Desc, `YAML parsing error: ${err.message}`, {
    evidencePath: relRegisterPath
  });
}

const exceptionsList = (parsedRegister && Array.isArray(parsedRegister.exceptions)) ? parsedRegister.exceptions : [];

// -----------------------------------------------------------------------------
// 8. EXC-2: Every active exception validates against required fields
// -----------------------------------------------------------------------------
const exc2Id = 'EXC-2';
const exc2Desc = 'Every active exception validates against the required fields and has non-placeholder rollback.';
if (registerParseError) {
  recordFail(exc2Id, exc2Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  let exc2Failures = [];
  const activeExceptions = exceptionsList.filter((e) => e && (e.status === 'active' || e.status === 'approved'));

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    // If active or approved, check all mandatory fields
    if (exc.status === 'active' || exc.status === 'approved') {
      const missingFields = [];
      const requiredActive = [
        'id', 'status', 'track', 'created_at', 'requested_by',
        'human_owner', 'approver', 'affected_gate_ids', 'reason',
        'blast_radius', 'containment_or_rollback', 'expires_at'
      ];
      for (const field of requiredActive) {
        if (!exc[field] || (Array.isArray(exc[field]) && exc[field].length === 0)) {
          missingFields.push(field);
        }
      }

      // Check agent keywords on human_owner and approver
      if (exc.human_owner && /pending|agent|bot|ai/i.test(exc.human_owner)) {
        missingFields.push('human_owner (must be named human, not pending or agent)');
      }
      if (exc.approver && /pending|agent|bot|ai/i.test(exc.approver)) {
        missingFields.push('approver (must be named human, not pending or agent)');
      }

      // Check track-specific fields for expedited and emergency
      if (['expedited', 'emergency'].includes(exc.track)) {
        if (!exc.compensating_controls) missingFields.push('compensating_controls');
        if (!exc.retrospective_due_at) missingFields.push('retrospective_due_at');
      }

      // Check containment_or_rollback validity
      if (exc.containment_or_rollback) {
        const cLower = String(exc.containment_or_rollback).trim().toLowerCase();
        if (['accepted risk', 'temporary', 'tbd', 'accepted_risk'].includes(cLower) || cLower.length < 10) {
          missingFields.push(`containment_or_rollback (invalid placeholder: '${exc.containment_or_rollback}')`);
        }
      }

      if (missingFields.length > 0) {
        exc2Failures.push({
          id: excId,
          reason: `Missing or invalid required fields for ${exc.status} exception: ${missingFields.join(', ')}`
        });
      }
    }

    // If closed, requires closure_evidence
    if (exc.status === 'closed' && (!exc.closure_evidence || String(exc.closure_evidence).trim().length < 5)) {
      exc2Failures.push({
        id: excId,
        reason: "Status is 'closed' but closure_evidence is missing or insufficient"
      });
    }
  }

  if (exc2Failures.length === 0) {
    recordPass(
      exc2Id,
      exc2Desc,
      `Validated ${exceptionsList.length} exception(s) (${activeExceptions.length} active/approved). All required fields and rollback actions are intact.`,
      { evidencePath: relRegisterPath }
    );
  } else {
    const errorMsg = exc2Failures.map((f) => `Exception ${f.id}: ${f.reason}`).join('\n           ');
    recordFail(exc2Id, exc2Desc, `Active exception schema validation error(s):\n           ${errorMsg}`, {
      affectedExceptionId: exc2Failures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
}

// -----------------------------------------------------------------------------
// 9. EXC-3: Any exception with expires_at in the past fails CI if status is active or approved
// -----------------------------------------------------------------------------
const exc3Id = 'EXC-3';
const exc3Desc = 'Any exception with expires_at in the past fails CI if status is active or approved.';
if (registerParseError) {
  recordFail(exc3Id, exc3Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  const now = Date.now();
  let expiredFailures = [];

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    if (exc.status === 'active' || exc.status === 'approved') {
      if (!exc.expires_at) {
        expiredFailures.push({ id: excId, reason: 'Missing mandatory expires_at timestamp' });
        continue;
      }
      const expiresTime = new Date(exc.expires_at).getTime();
      if (isNaN(expiresTime)) {
        expiredFailures.push({ id: excId, reason: `Invalid expires_at date format: '${exc.expires_at}'` });
      } else if (expiresTime < now) {
        expiredFailures.push({
          id: excId,
          reason: `Exception ${excId} has status '${exc.status}' but expired at ${exc.expires_at} (current time: ${new Date(now).toISOString()}). Expired exceptions cannot remain active.`
        });
      }
    }
  }

  if (expiredFailures.length === 0) {
    recordPass(exc3Id, exc3Desc, 'Zero active or approved exceptions are expired.', {
      evidencePath: relRegisterPath
    });
  } else {
    const errorMsg = expiredFailures.map((f) => f.reason).join('\n           ');
    recordFail(exc3Id, exc3Desc, `Expired exception(s) detected with active/approved status:\n           ${errorMsg}`, {
      affectedExceptionId: expiredFailures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
}

// -----------------------------------------------------------------------------
// 10. EXC-4: Expedited/emergency exceptions retrospective deadline check
// -----------------------------------------------------------------------------
const exc4Id = 'EXC-4';
const exc4Desc = 'Any expedited or emergency active exception missing retrospective_due_at or with an overdue retrospective fails CI.';
if (registerParseError) {
  recordFail(exc4Id, exc4Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  const now = Date.now();
  let retroFailures = [];

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    if (exc.status === 'active' && ['expedited', 'emergency'].includes(exc.track)) {
      if (!exc.retrospective_due_at) {
        retroFailures.push({ id: excId, reason: `Track is '${exc.track}' but retrospective_due_at is missing.` });
      } else {
        const retroTime = new Date(exc.retrospective_due_at).getTime();
        if (isNaN(retroTime)) {
          retroFailures.push({ id: excId, reason: `Invalid retrospective_due_at date format: '${exc.retrospective_due_at}'` });
        } else if (retroTime < now) {
          retroFailures.push({
            id: excId,
            reason: `Retrospective for ${exc.track} exception ${excId} was due at ${exc.retrospective_due_at} and is now overdue.`
          });
        }
      }
    }
  }

  if (retroFailures.length === 0) {
    recordPass(exc4Id, exc4Desc, 'All expedited/emergency active exceptions have valid, non-overdue retrospective deadlines.', {
      evidencePath: relRegisterPath
    });
  } else {
    const errorMsg = retroFailures.map((f) => f.reason).join('\n           ');
    recordFail(exc4Id, exc4Desc, `Retrospective deadline violation(s):\n           ${errorMsg}`, {
      affectedExceptionId: retroFailures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
}

// -----------------------------------------------------------------------------
// 11. EXC-5: Clinical/security gates must have a named human approver
// -----------------------------------------------------------------------------
const exc5Id = 'EXC-5';
const exc5Desc = 'Exceptions affecting clinical/security gates (SG-1, SG-2, SG-3, SG-4, SG-6, SG-7) must have a named human approver.';
if (registerParseError) {
  recordFail(exc5Id, exc5Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  const protectedGates = new Set(['SG-1', 'SG-2', 'SG-3', 'SG-4', 'SG-6', 'SG-7']);
  let approvalFailures = [];

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    if (exc.status === 'active' || exc.status === 'approved') {
      const affected = Array.isArray(exc.affected_gate_ids) ? exc.affected_gate_ids : [];
      const touchesProtectedGate = affected.some((g) => protectedGates.has(g));

      if (touchesProtectedGate) {
        if (!exc.approver || typeof exc.approver !== 'string' || exc.approver.trim().length === 0) {
          approvalFailures.push({ id: excId, reason: `Affects protected gate(s) [${affected.join(', ')}] but lacks an approver.` });
        } else if (/pending|agent|bot|ai/i.test(exc.approver)) {
          approvalFailures.push({
            id: excId,
            reason: `Affects protected gate(s) [${affected.join(', ')}] but approver is non-human or pending ('${exc.approver}'). Named human approver required.`
          });
        }
      }
    }
  }

  if (approvalFailures.length === 0) {
    recordPass(exc5Id, exc5Desc, 'All exceptions touching clinical/security gates have verified named human approvers.', {
      evidencePath: relRegisterPath
    });
  } else {
    const errorMsg = approvalFailures.map((f) => f.reason).join('\n           ');
    recordFail(exc5Id, exc5Desc, `Human approval gate violation(s):\n           ${errorMsg}`, {
      affectedExceptionId: approvalFailures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
}

// -----------------------------------------------------------------------------
// 12. EXC-6: Maximum 30-day duration check
// -----------------------------------------------------------------------------
const exc6Id = 'EXC-6';
const exc6Desc = 'No exception may exceed the 30-day maximum duration without an explicit human renewal.';
if (registerParseError) {
  recordFail(exc6Id, exc6Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  const MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000 + 60000; // 30 days + 1 min grace
  let durationFailures = [];

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    if (exc.created_at && exc.expires_at) {
      const start = new Date(exc.created_at).getTime();
      const end = new Date(exc.expires_at).getTime();

      if (!isNaN(start) && !isNaN(end)) {
        const duration = end - start;
        if (duration > MAX_DURATION_MS) {
          const days = (duration / (24 * 60 * 60 * 1000)).toFixed(1);
          durationFailures.push({
            id: excId,
            reason: `Duration between created_at (${exc.created_at}) and expires_at (${exc.expires_at}) is ${days} days, exceeding the 30-day limit.`
          });
        }
      }
    }
  }

  if (durationFailures.length === 0) {
    recordPass(exc6Id, exc6Desc, 'All exceptions conform to the maximum 30-day duration limit.', {
      evidencePath: relRegisterPath
    });
  } else {
    const errorMsg = durationFailures.map((f) => f.reason).join('\n           ');
    recordFail(exc6Id, exc6Desc, `Exception duration limit exceeded:\n           ${errorMsg}`, {
      affectedExceptionId: durationFailures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
}

// -----------------------------------------------------------------------------
// 13. EXC-7: Referenced governance change folders must exist
// -----------------------------------------------------------------------------
const exc7Id = 'EXC-7';
const exc7Desc = 'Exceptions referencing a change_id must point to an existing governance/<change-id>/ folder.';
if (registerParseError) {
  recordFail(exc7Id, exc7Desc, `Blocked by EXC-1 failure: ${registerParseError}`);
} else {
  let refFailures = [];

  for (const exc of exceptionsList) {
    if (!exc || typeof exc !== 'object') continue;
    const excId = exc.id || 'UNKNOWN';

    if (exc.change_id && typeof exc.change_id === 'string' && exc.change_id.trim().length > 0) {
      const changeFolderPath = path.join(ROOT_DIR, 'governance', exc.change_id.trim());
      if (!fs.existsSync(changeFolderPath) || !fs.statSync(changeFolderPath).isDirectory()) {
        refFailures.push({
          id: excId,
          reason: `Referenced change_id folder does not exist: governance/${exc.change_id.trim()}`
        });
      }
    }
  }

  if (refFailures.length === 0) {
    recordPass(exc7Id, exc7Desc, 'All change_id references point to existing governance folders.', {
      evidencePath: relRegisterPath
    });
  } else {
    const errorMsg = refFailures.map((f) => f.reason).join('\n           ');
    recordFail(exc7Id, exc7Desc, `Invalid change_id reference(s) detected:\n           ${errorMsg}`, {
      affectedExceptionId: refFailures.map((f) => f.id).join(', '),
      evidencePath: relRegisterPath
    });
  }
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
function writeReport() {
  const reportPath = path.join(ROOT_DIR, 'governance-gate-report.json');
  try {
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
  } catch (writeErr) {
    console.error('Failed to write governance-gate-report.json:', writeErr);
  }
}

process.on('uncaughtException', (err) => {
  recordFail('RUNTIME-ERR', 'Unhandled exception during gate verification', err.message);
  writeReport();
  process.exit(1);
});

console.log('\n================================================================');
console.log(
  ` Summary: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failures.length} failures`
);
console.log('================================================================\n');

writeReport();

if (results.failures.length > 0) {
  console.error(`\x1b[31m✖ Governance gate verification FAILED (${results.failures.length} failure(s)).\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✔ All mechanical governance gates PASSED.\x1b[0m\n`);
  process.exit(0);
}
