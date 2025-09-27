# Applicant Notification Process vs. FCRA Adverse-Action Timeline

This matrix documents how the tenant screening workflow aligns with Fair Credit Reporting Act (FCRA) adverse-action obligations. The implementation combines automated notices produced by the scoring service with an operational dispute queue for reinvestigations.

## Timeline Overview

| Timeline Day | FCRA Expectation | Platform Support |
| --- | --- | --- |
| Day 0 | Pre-adverse action notice delivered with report details. | Screening calculator automatically surfaces a pre-adverse notice when an application is flagged, including data sources and dispute rights. |
| Day 0–5 | Applicant has a reasonable period (minimum five days) to dispute before adverse action finalization. | Waiting-period reminder appears in the calculator results and open disputes remain in the queue with verification due dates. |
| Day 5+ | Final adverse action notice issued if no corrections or disputes. | When a decision is "Denied," the API returns a full adverse action notice for delivery/documentation. |
| Within 30 days of dispute | Reinvestigation completed and results shared. | Dispute handling queue tracks verification steps, supporting documents, and completion status to ensure SLA compliance. |

## Process Mapping

| Current Process Step | Trigger | FCRA Requirement | Timing Commitment | System Coverage |
| --- | --- | --- | --- | --- |
| Automated pre-adverse action notice | Risk decision of "Flagged for Review" | Provide notice before adverse action, identify consumer reporting agencies, and explain rights to dispute. | Immediately upon screening completion. | API returns a structured notice with data sources, rights, contact information, and a five-day waiting period reminder displayed in the calculator UI. |
| Automated adverse action notice | Risk decision of "Denied" | Furnish final adverse action notice with reasons, data sources, and dispute instructions. | After waiting period or upon reinvestigation outcome. | API response includes an adverse action package surfaced in the UI for download/delivery and logged via the audit trail. |
| Waiting-period tracking | Open adverse workflow following pre-adverse notice | Provide reasonable time (customarily ≥5 days) before final action. | Five days by policy. | Calculator UI highlights the waiting period, and dispute queue items display verification due dates to prevent premature closure. |
| Dispute intake and verification | Applicant submits supporting documents | Begin reinvestigation promptly, document steps, and communicate updates. | Intake acknowledgment within 24 hours; verification steps tracked individually. | Dispute queue cards show step-by-step checklist with completion timestamps and responsible analyst. |
| Reinvestigation documentation | Evidence gathered during dispute | Maintain documentation supporting reinvestigation results and deliver findings within 30 days. | Within 30 days of dispute receipt. | Queue cards maintain a log of uploaded documents with received dates and summaries for audit readiness. |

## Operational Notes

- Audit exports now capture the notice type and waiting-period days alongside scoring inputs, preserving evidence that notifications were generated at the right time.
- Compliance contact information is embedded in each automated notice to simplify consumer communications and escalation tracking.
- Verification due dates in the dispute queue can be tuned to reflect stricter local ordinances while still satisfying FCRA's reasonable-period standard.
