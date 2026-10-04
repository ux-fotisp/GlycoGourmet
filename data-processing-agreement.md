# Data Processing Agreement (DPA)

**Last Updated:** October 4, 2026

This Data Processing Agreement ("DPA") is an addendum to the Terms of Service between GlycoGourmet ("Data Processor", "we", "us") and the Clinical User or Organization ("Data Controller", "Clinic", "Dietitian", "you"). This DPA governs the processing of personal data, including Protected Health Information (PHI) and Special Categories of Data, on behalf of the Data Controller.

## 1. Roles and Scope of Processing
**1.1 Regulatory Roles.** For the purposes of the General Data Protection Regulation (GDPR) and applicable health data regulations (e.g., HIPAA), the Clinic/Dietitian is the Data Controller (or Covered Entity) and GlycoGourmet is the Data Processor (or Business Associate).
**1.2 Scope of Data.** This agreement applies to the processing of `ClientProfile` data, including names, contact information, diabetic subtypes, `MetabolicTargetCalibration` parameters (ISF, CIR, daily GL targets), 7-day `PrescribedMealPlan` records, and layered `consent-record` data.
**1.3 Special Categories of Data.** We explicitly acknowledge that the Platform processes health data (Art. 9 GDPR). Such processing is conducted solely on the documented instructions of the Data Controller and relies on the Explicit Consent gathered by the Data Controller from the data subject.

## 2. Processor Obligations & Tenant Isolation
**2.1 Strict Purpose Limitation.** GlycoGourmet shall process personal data solely for the purpose of providing the Platform's core functionalities (metabolic calculations, meal scheduling, audit logging) and strictly in accordance with the Data Controller’s instructions.
**2.2 Row-Level Tenant Boundary Isolation.** We enforce cryptographic and programmatic tenant isolation. Cross-tenant data leakage is structurally prohibited by our backend policies (e.g., `is-dietitian-owner.js` and `is-clinic-admin.js`). Clinicians can only access patient records explicitly assigned to their organizational tenant.
**2.3 Confidentiality.** All GlycoGourmet personnel engaged in processing personal data are bound by strict, documented obligations of confidentiality.

## 3. Sub-Processors & Data Flow
**3.1 Authorized Sub-Processors.** The Data Controller authorizes GlycoGourmet to engage third-party sub-processors (e.g., cloud hosting providers, authentication services) required to deliver the Platform. A current list of sub-processors is available upon request. We will notify the Data Controller 30 days prior to adding or replacing a sub-processor, providing the right to object.
**3.2 API Payload Sanitization (USDA FoodData Central).** GlycoGourmet integrates with external nutritional databases. We guarantee that all outgoing requests to third-party APIs (e.g., USDA) contain strictly de-identified, raw nutritional strings (e.g., "Almond Flour"). No user identifiers, UUIDs, or Protected Health Information are ever transmitted to these external nutritional engines.

## 4. Technical and Organizational Measures (TOMs)
GlycoGourmet implements and maintains clinical-grade security measures, including:
*   **Encryption:** Data is encrypted at rest (e.g., AES-256) and in transit (TLS 1.2+).
*   **Stateless Authentication:** System access is governed by stateless JWT tokens with server-side privilege sanitization.
*   **Immutable Audit Logging:** Administrative mutations (e.g., patient reassignment, clinical calibration changes) are recorded in an append-only `api::audit-log-entry` system to satisfy clinical compliance audits.

## 5. Data Subject Rights & Consent Management
**5.1 Assistance.** We will assist the Data Controller through appropriate technical and organizational measures in fulfilling their obligations to respond to data subject requests (Right to Access, Rectification, Erasure, Data Portability).
**5.2 Layered Consent.** The Platform provides API infrastructure (`consent-record`) enabling data subjects to grant, manage, and revoke data-sharing permissions between their account and specific Clinics/Dietitians dynamically.

## 6. Personal Data Breach Notification
In the event of a confirmed Personal Data Breach affecting the Data Controller's data, GlycoGourmet will notify the Data Controller without undue delay, and in no event later than forty-eight (48) hours after becoming aware of the breach. The notification will include the nature of the breach, the scope of affected records, and the mitigation measures taken.

## 7. Data Return and Deletion
Upon termination of the Terms of Service, or upon explicit request by the Data Controller or data subject (Right to be Forgotten), GlycoGourmet will permanently perform a hard deletion of all associated personal data and PHI within thirty (30) days, retaining only fully anonymized, aggregated statistical data (e.g., for system metabolic engine tuning) that cannot be re-identified.
