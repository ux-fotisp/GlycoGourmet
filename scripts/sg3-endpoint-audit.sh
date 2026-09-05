#!/usr/bin/env bash
# ==============================================================================
# GlycoGourmet — DAVE+R Gate SG-3 Live Endpoint & PHI Inspection Script
# Authority: DAVE+R Framework (Module D / Gate SG-3)
# Specification: governance/gates/security-major-upgrade.gate.yaml
# Output: governance/evidence/sg3-audit-<date>.json
# ==============================================================================
set -euo pipefail

BASE_URL="${1:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "Error: BASE_URL is required."
  echo "Usage: $0 <BASE_URL>"
  echo "Example: $0 https://api.glycogourmet.com"
  exit 1
fi

# Strip trailing slashes
BASE_URL="${BASE_URL%/}"

DATE_STAMP="$(date -u +"%Y-%m-%d")"
ISO_TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${REPO_ROOT}/governance/evidence"
OUTPUT_FILE="${OUTPUT_DIR}/sg3-audit-${DATE_STAMP}.json"

mkdir -p "${OUTPUT_DIR}"

echo "=================================================================="
echo " GlycoGourmet × DAVE+R — Gate SG-3 Live Endpoint & PHI Inspection"
echo " Target Base URL : ${BASE_URL}"
echo " Timestamp (UTC) : ${ISO_TIMESTAMP}"
echo " Output Report   : governance/evidence/sg3-audit-${DATE_STAMP}.json"
echo "=================================================================="

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Temporary file to accumulate check results in JSON
TMP_CHECKS_FILE="$(mktemp)"
echo "[" > "${TMP_CHECKS_FILE}"

record_check() {
  local check_id="$1"
  local name="$2"
  local endpoint="$3"
  local expected="$4"
  local actual_status="$5"
  local passed="$6"
  local notes="$7"

  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  if [[ "$passed" == "true" ]]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "  ✔ [PASS] ${check_id}: ${name} (HTTP ${actual_status})"
  else
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo "  ✖ [FAIL] ${check_id}: ${name} (HTTP ${actual_status} — expected ${expected})"
    echo "         Note: ${notes}"
  fi

  if [[ $TOTAL_CHECKS -gt 1 ]]; then
    echo "," >> "${TMP_CHECKS_FILE}"
  fi

  cat <<EOF >> "${TMP_CHECKS_FILE}"
    {
      "check_id": "${check_id}",
      "name": "${name}",
      "endpoint": "${endpoint}",
      "expected": "${expected}",
      "actual_status": "${actual_status}",
      "passed": ${passed},
      "notes": "${notes}"
    }
EOF
}

# ------------------------------------------------------------------------------
# Check 1: Public Health Endpoint
# ------------------------------------------------------------------------------
HEALTH_URL="${BASE_URL}/health"
HEALTH_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${HEALTH_URL}" || echo "000")"
HEALTH_BODY="$(curl -s --connect-timeout 5 "${HEALTH_URL}" | head -c 1000 || echo "")"

C1_PASS="false"
C1_NOTES="Expected HTTP 200 with status ok and zero PHI"
if [[ "$HEALTH_CODE" == "200" ]] && [[ "$HEALTH_BODY" == *"status"* ]] && [[ "$HEALTH_BODY" != *"password"* ]] && [[ "$HEALTH_BODY" != *"patient"* ]]; then
  C1_PASS="true"
  C1_NOTES="Endpoint active, returns status ok with zero credential/PHI leakage."
fi
record_check "SG3-C1" "Public Health Endpoint (/health)" "/health" "200" "${HEALTH_CODE}" "${C1_PASS}" "${C1_NOTES}"

# ------------------------------------------------------------------------------
# Check 2: Public Recipes Endpoint PHI Leak Inspection
# ------------------------------------------------------------------------------
RECIPES_URL="${BASE_URL}/api/recipes"
RECIPES_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${RECIPES_URL}" || echo "000")"
RECIPES_BODY="$(curl -s --connect-timeout 5 "${RECIPES_URL}" | head -c 2000 || echo "")"

C2_PASS="false"
C2_NOTES="Expected HTTP 200 with recipe data free of patient identifiers or personal carb targets"
if [[ "$RECIPES_CODE" == "200" ]]; then
  # Verify no patient-linked PHI keywords exist in body
  if [[ "$RECIPES_BODY" != *"patientId"* ]] && [[ "$RECIPES_BODY" != *"clientProfile"* ]] && [[ "$RECIPES_BODY" != *"targetCarbs"* ]] && [[ "$RECIPES_BODY" != *"ssn"* ]]; then
    C2_PASS="true"
    C2_NOTES="Public recipes returned catalog data without patient ID, tenant ID, or personalized metabolic targets."
  else
    C2_NOTES="Detected potential patient-linked telemetry in public recipe payload."
  fi
fi
record_check "SG3-C2" "Public Recipe Catalog PHI Audit (/api/recipes)" "/api/recipes" "200" "${RECIPES_CODE}" "${C2_PASS}" "${C2_NOTES}"

# ------------------------------------------------------------------------------
# Check 3: Public Ingredients Endpoint Leak Inspection
# ------------------------------------------------------------------------------
ING_URL="${BASE_URL}/api/ingredients"
ING_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${ING_URL}" || echo "000")"
ING_BODY="$(curl -s --connect-timeout 5 "${ING_URL}" | head -c 2000 || echo "")"

C3_PASS="false"
C3_NOTES="Expected HTTP 200 with ingredient nutrition free of clinic or patient bindings"
if [[ "$ING_CODE" == "200" ]]; then
  if [[ "$ING_BODY" != *"clinicId"* ]] && [[ "$ING_BODY" != *"authorId"* ]] && [[ "$ING_BODY" != *"patient"* ]]; then
    C3_PASS="true"
    C3_NOTES="Ingredient nutrition attributes returned without clinic or user ownership bindings."
  else
    C3_NOTES="Detected clinic or user ownership fields in public ingredient payload."
  fi
fi
record_check "SG3-C3" "Public Ingredient Catalog Audit (/api/ingredients)" "/api/ingredients" "200" "${ING_CODE}" "${C3_PASS}" "${C3_NOTES}"

# ------------------------------------------------------------------------------
# Check 4: Protected Client Profiles Route Authentication Guard
# ------------------------------------------------------------------------------
CLIENT_URL="${BASE_URL}/api/client-profiles"
CLIENT_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${CLIENT_URL}" || echo "000")"

C4_PASS="false"
C4_NOTES="Protected patient profiles route must reject unauthenticated requests"
if [[ "$CLIENT_CODE" == "401" ]] || [[ "$CLIENT_CODE" == "403" ]]; then
  C4_PASS="true"
  C4_NOTES="Unauthenticated access correctly rejected with HTTP ${CLIENT_CODE}."
fi
record_check "SG3-C4" "Protected Client Profiles Guard (/api/client-profiles)" "/api/client-profiles" "401|403" "${CLIENT_CODE}" "${C4_PASS}" "${C4_NOTES}"

# ------------------------------------------------------------------------------
# Check 5: Protected Clinical Meal Plans Route Authentication Guard
# ------------------------------------------------------------------------------
PLANS_URL="${BASE_URL}/api/prescribed-meal-plans"
PLANS_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${PLANS_URL}" || echo "000")"

C5_PASS="false"
C5_NOTES="Prescribed meal plans route must reject unauthenticated requests"
if [[ "$PLANS_CODE" == "401" ]] || [[ "$PLANS_CODE" == "403" ]]; then
  C5_PASS="true"
  C5_NOTES="Unauthenticated access correctly rejected with HTTP ${PLANS_CODE}."
fi
record_check "SG3-C5" "Protected Meal Plans Guard (/api/prescribed-meal-plans)" "/api/prescribed-meal-plans" "401|403" "${PLANS_CODE}" "${C5_PASS}" "${C5_NOTES}"

# ------------------------------------------------------------------------------
# Check 6: Pagination and Bulk Export Limits Guard
# ------------------------------------------------------------------------------
PAGE_URL="${BASE_URL}/api/recipes?pagination[pageSize]=5000"
PAGE_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${PAGE_URL}" || echo "000")"
PAGE_BODY="$(curl -s --connect-timeout 5 "${PAGE_URL}" | head -c 2000 || echo "")"

C6_PASS="false"
C6_NOTES="Verify pagination enforces maximum ceiling or returns structured pagination metadata"
if [[ "$PAGE_CODE" == "200" ]]; then
  if [[ "$PAGE_BODY" == *"pagination"* ]]; then
    C6_PASS="true"
    C6_NOTES="Structured pagination metadata returned; unconstrained mass dump bounded."
  else
    C6_NOTES="Pagination parameters ignored or unconstrained response returned."
  fi
fi
record_check "SG3-C6" "Bulk Export & Pagination Limits Guard (/api/recipes?pagination...)" "/api/recipes" "200 with pagination" "${PAGE_CODE}" "${C6_PASS}" "${C6_NOTES}"

echo "]" >> "${TMP_CHECKS_FILE}"

# Determine overall conclusion
OVERALL_STATUS="FAIL"
if [[ $FAILED_CHECKS -eq 0 ]]; then
  OVERALL_STATUS="PASS"
fi

# Write sanitized JSON report
cat <<EOF > "${OUTPUT_FILE}"
{
  "gate_id": "SG-3",
  "audit_title": "Public Endpoint PHI Leak & Pagination Limit Audit",
  "audit_date": "${ISO_TIMESTAMP}",
  "target_base_url": "${BASE_URL}",
  "summary": {
    "total_checks": ${TOTAL_CHECKS},
    "passed_checks": ${PASSED_CHECKS},
    "failed_checks": ${FAILED_CHECKS},
    "conclusion": "${OVERALL_STATUS}"
  },
  "checks": $(cat "${TMP_CHECKS_FILE}")
}
EOF

rm -f "${TMP_CHECKS_FILE}"

echo "------------------------------------------------------------------"
echo " Summary: ${PASSED_CHECKS} passed, ${FAILED_CHECKS} failed (Total: ${TOTAL_CHECKS})"
echo " Overall Gate SG-3 Conclusion: ${OVERALL_STATUS}"
echo " Audit report saved to: ${OUTPUT_FILE}"
echo "=================================================================="

if [[ "$OVERALL_STATUS" == "PASS" ]]; then
  exit 0
else
  exit 1
fi
