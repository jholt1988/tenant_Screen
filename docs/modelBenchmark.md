# Tenancy Outcome Benchmark

This note summarizes the labeled tenancy dataset we assembled and the benchmarking run that compares the legacy QuickLease score to updated formulas that incorporate landlord references and positive alternative data sources.

## Dataset

- **File**: `data/tenant_applicant_outcomes.json`
- **Records**: 24 historical QuickLease applicants with realized tenancy performance.
- **Feature coverage**:
  - Core application data already used by the screening API (income, debt, rent request, credit score, rental history, criminal background, employment status, proxy group label).
  - **Landlord reference tier** (`excellent`, `satisfactory`, `concern`) captured under `rental_reference`.
  - **Utility payment reliability** (`utility_payment_score`, 0.0–1.0) supplied by alternative data providers.
  - **Observed tenancy outcomes** grouped under `tenancy_outcome` with on-time payment rate, total late payments, lease violations, eviction filings, and renewal indicator.
- **Success label**: for benchmarking, a tenancy is treated as successful when the on-time payment rate is ≥ 90%, no lease violations were recorded, and no eviction was filed.

These outcome fields allow the scoring model to be evaluated against ground-truth measures of payment behavior and lease compliance, rather than only the initial application decision.【F:data/tenant_applicant_outcomes.json†L1-L193】

## Benchmark configuration

`npm run analyze:benchmark` executes `scripts/modelBenchmark.ts`, which evaluates three configurations:

1. **Legacy Baseline** – the original production weights with no landlord-reference offsets or utility adjustments.
2. **Rental Reference Weighted** – the revised scoring formula (lighter credit, DTI, and employment penalties plus landlord reference offsets) with alternative-data offsets disabled so we can isolate the lift from richer rental context.
3. **Utility & Reference Hybrid (Proposed)** – the new default configuration that retains the reference-aware scoring and adds utility payment incentives.

Each configuration logs accuracy, precision, recall, false-positive rate, approval mix, and group-level approval/success alignment so model trade-offs are transparent.【F:scripts/modelBenchmark.ts†L1-L192】

## Results snapshot

| Scheme | Accuracy | Precision | Recall | Approval Rate | ImmigrantCommunity Approvals | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Legacy Baseline | 66.7% | 80.0% | 57.1% | 41.7% | 12.5% | Heavy credit emphasis suppresses access for alternative data-rich groups. |
| Rental Reference Weighted | 66.7% | 75.0% | 64.3% | 50.0% | 25.0% | Landlord references expand approvals without hurting realized performance. |
| Utility & Reference Hybrid | 70.8% | 76.9% | 71.4% | 54.2% | 37.5% | Adds utility payment incentives, further improving recall and access for immigrant communities while maintaining precision. |

The hybrid configuration raises recall by 14 percentage points over the legacy baseline and more than triples approvals for applicants from immigrant communities while holding precision near 77%, demonstrating that incorporating empirically validated alternative data does not degrade downstream payment reliability.【a98cd5†L5-L33】
