# Service Level Agreement (SLA)

**Last Updated:** October 4, 2026

This Service Level Agreement ("SLA") is incorporated into the Terms of Service and applies to paid subscription tiers for Clinical Users (e.g., Clinics and Dietitians). It defines the technical performance guarantees, uptime metrics, and financial remedies associated with the GlycoGourmet Platform.

## 1. Service Tier Definitions
The Platform architecture is divided into two operational tiers to reflect clinical criticality:
**1.1 Core Services:** The Strapi API Gateway and PostgreSQL cluster handling the deterministic metabolic calculation engine, user authentication, the 7-Day Meal Scheduler, and access to the `ClientProfile` roster.
**1.2 Secondary Services:** Background pipelines and administrative queues, including the Draft Audit Queue, the custom ingredient authoring drawer, and automated USDA FoodData Central database synchronizations.

## 2. Target Uptime Commitments
**2.1 Core Services Uptime:** GlycoGourmet guarantees a Monthly Uptime Percentage of **99.9%** for all Core Services.
**2.2 Secondary Services Uptime:** GlycoGourmet guarantees a Monthly Uptime Percentage of **99.0%** for Secondary Services.
**2.3 Calculation:** Uptime is calculated as: `[(Total Minutes in Month - Downtime Minutes) / Total Minutes in Month] * 100`.

## 3. Downtime Definitions & Exclusions
"Downtime" refers to a state where the backend Strapi API Gateway returns HTTP 5xx errors for more than five (5) consecutive minutes. Downtime **strictly excludes** the following scenarios:

*   **PWA Offline Grace Degradation:** Inability to sync data due to the User's local device connectivity, browser cache wipes, or the Progressive Web App (PWA) operating in offline SQLite mode.
*   **Third-Party Infrastructure Outages:** Failures, latency, or unresponsiveness originating from external dependencies, including but not limited to the USDA FoodData Central REST API, continuous glucose monitor (CGM) telemetry webhooks (e.g., Dexcom/Libre), or the Netlify Edge CDN infrastructure.
*   **Scheduled Maintenance:** Planned downtime where Clinical Users are notified at least forty-eight (48) hours in advance. Scheduled Maintenance will not exceed four (4) hours per calendar month and will occur outside standard operational hours (defined as 00:00 - 04:00 UTC).
*   **Force Majeure:** Outages caused by events beyond our reasonable control, including natural disasters, regional ISP blackouts, or distributed denial-of-service (DDoS) attacks.

## 4. Service Credits
If the Platform fails to meet the Target Uptime Commitments in a given billing month, the affected Clinical User is eligible to request a Service Credit, calculated as a percentage of the monthly subscription fee:

*   **99.0% to < 99.9% (Core Services):** 10% Service Credit
*   **95.0% to < 99.0% (Core Services):** 20% Service Credit
*   **< 95.0% (Core Services):** 30% Service Credit

## 5. Claim Procedure
To receive a Service Credit, the Clinical User must submit a support ticket via the Admin Control Center within fifteen (15) days of the incident. The request must include the dates, times, and a description of the experienced Downtime. Service Credits will be applied exclusively against future subscription invoices and cannot be exchanged for cash refunds.

## 6. Sole and Exclusive Remedy
**LEGAL LIMITATION:** The issuance of Service Credits constitutes the Clinical User's **sole and exclusive remedy** for any performance failures, Downtime, or unavailability of the GlycoGourmet Platform. Under no circumstances may a User invoke the Terms of Service to seek financial compensation, clinical revenue loss recovery, or tort damages resulting from system unavailability.
