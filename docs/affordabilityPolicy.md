# Income Verification Policy Audit

This audit reviews the legacy "3× rent" income requirement and documents the updated tiered affordability framework implemented in the screening service.

## Baseline findings

Running `npm run audit:affordability` simulates existing applicant records using neighborhood as a proxy for protected classes. Under the strict 3× rent cutoff:

- Only 25% of applicants were approved, with three out of four Riverview households denied despite low debt burdens.
- Approval rates ranged from 0% to 50% depending on neighborhood, creating a 50 percentage point disparity across the sample.

## Tiered scoring approach

The revised affordability module awards partial credit when applicants fall slightly short of the 3× rent ratio but maintain manageable debt-to-income (DTI) levels, and provides an additional mitigation tier for exceptionally low DTI profiles. The new configuration also continues to apply DTI surcharges when debt ratios exceed 40%.

When re-running the simulation with the tiered policy:

- Approval rates increased to 100% across the sample, eliminating neighborhood-level denial disparities.
- The approval rate range shrank from 50 percentage points to 0, addressing the disparate impact observed under the hard cutoff.

## Policy updates

- **Affordability thresholds** now track both income-to-rent ratios and two DTI breakpoints (mitigation and exception) that allow qualified applicants to receive partial credit.
- **Scoring weights** assign higher risk for clear failures, modest risk for partial credit cases, and zero risk for applicants meeting or exceeding the 3× rent ratio.
- **Documentation and tooling** include a reusable `simulateAffordabilityPolicies` helper and CLI script for future audits.

Operational teams should use the tiered defaults unless a subsequent audit demonstrates that stricter settings improve fairness without reintroducing disparate denials.
