# QuickLease Tenant Score Fairness Audit

This report quantifies the effect of credit weighting and newly captured qualitative features (landlord references, rental payment records) on applicant outcomes segmented by protected-class proxy groups and compares mitigation options.

## Data Set

Historical sample consists of 24 QuickLease applicants with proxy indicators for community type (HighOpportunityZip, LegacyRedlinedZip, ImmigrantCommunity), recorded credit scores, rental history, landlord reference sentiment, rental payment reliability, and utility payment reliability.

Current scoring weights, including the credit component, are defined in `src/lib/screeningConfig.ts`.

## Baseline – Current Weights

Production QuickLease qualitative and credit scoring defaults.

| Proxy Group | Applicants | Approval Rate | Flagged Rate | Denial Rate | Avg Risk Score | Avg Credit Penalty | Disparate Impact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HighOpportunityZip | 8 | 75.0% | 12.5% | 12.5% | 1.94 | 0.38 | 1.00 |
| ImmigrantCommunity | 8 | 12.5% | 62.5% | 25.0% | 5.81 | 1.88 | 0.17 |
| LegacyRedlinedZip | 8 | 12.5% | 12.5% | 75.0% | 11.88 | 1.75 | 0.17 |

Overall approval rate: 33.3%

**Adverse impact alerts (approval rate < 80% of reference group):**
- ImmigrantCommunity: approval rate 12.5% (disparate impact ratio 0.17).
- LegacyRedlinedZip: approval rate 12.5% (disparate impact ratio 0.17).

## Reduced Credit Weighting (50% penalty)

Halves the credit penalties to lessen their contribution to the total risk score.

| Proxy Group | Applicants | Approval Rate | Flagged Rate | Denial Rate | Avg Risk Score | Avg Credit Penalty | Disparate Impact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HighOpportunityZip | 8 | 75.0% | 25.0% | 0.0% | 1.75 | 0.19 | 1.00 |
| ImmigrantCommunity | 8 | 25.0% | 50.0% | 25.0% | 4.88 | 0.94 | 0.33 |
| LegacyRedlinedZip | 8 | 12.5% | 12.5% | 75.0% | 11.00 | 0.88 | 0.17 |

Overall approval rate: 37.5%

**Adverse impact alerts (approval rate < 80% of reference group):**
- ImmigrantCommunity: approval rate 25.0% (disparate impact ratio 0.33).
- LegacyRedlinedZip: approval rate 12.5% (disparate impact ratio 0.17).

## Qualitative Pilot (landlord + payments)

Softens penalties for verified landlord praise and emphasizes consistent payment histories collected from alternative data sources.

| Proxy Group | Applicants | Approval Rate | Flagged Rate | Denial Rate | Avg Risk Score | Avg Credit Penalty | Disparate Impact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HighOpportunityZip | 8 | 75.0% | 25.0% | 0.0% | 1.69 | 0.38 | 1.00 |
| ImmigrantCommunity | 8 | 12.5% | 62.5% | 25.0% | 5.28 | 1.88 | 0.17 |
| LegacyRedlinedZip | 8 | 12.5% | 12.5% | 75.0% | 11.00 | 1.75 | 0.17 |

Overall approval rate: 33.3%

**Adverse impact alerts (approval rate < 80% of reference group):**
- ImmigrantCommunity: approval rate 12.5% (disparate impact ratio 0.17).
- LegacyRedlinedZip: approval rate 12.5% (disparate impact ratio 0.17).

## Credit + Utility Payment Adjustment

Moderate credit penalties while granting offsets for strong payment histories and mild surcharges for low reliability.

| Proxy Group | Applicants | Approval Rate | Flagged Rate | Denial Rate | Avg Risk Score | Avg Credit Penalty | Disparate Impact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HighOpportunityZip | 8 | 87.5% | 12.5% | 0.0% | 0.94 | 0.19 | 1.00 |
| ImmigrantCommunity | 8 | 50.0% | 25.0% | 25.0% | 3.72 | 1.16 | 0.57 |
| LegacyRedlinedZip | 8 | 12.5% | 12.5% | 75.0% | 10.38 | 1.06 | 0.14 |

Overall approval rate: 50.0%

**Adverse impact alerts (approval rate < 80% of reference group):**
- ImmigrantCommunity: approval rate 50.0% (disparate impact ratio 0.57).
- LegacyRedlinedZip: approval rate 12.5% (disparate impact ratio 0.14).

## Comparative Insights

- Baseline weights show the strongest disparate impact, with approval ratios for LegacyRedlinedZip and ImmigrantCommunity groups falling below the 0.80 threshold (0.17 and 0.17 respectively).
- Reduced Credit Weighting (50% penalty) lifts overall approval to 37.5% and improves disparate impact ratios for ImmigrantCommunity applicants to 0.33.
- Qualitative Pilot (landlord + payments) lifts overall approval to 33.3% and improves disparate impact ratios for ImmigrantCommunity applicants to 0.17.
- Credit + Utility Payment Adjustment lifts overall approval to 50.0% and improves disparate impact ratios for ImmigrantCommunity applicants to 0.57.
- The strongest relief for LegacyRedlinedZip applicants comes from Reduced Credit Weighting (50% penalty), which raises the disparate impact ratio to 0.17 while keeping average risk below 11.00.

## Recommendations

- Adopt the qualitative pilot configuration in a controlled rollout to validate that incorporating landlord feedback and payment histories sustains fairness gains.
- Maintain reduced credit weighting where permissible while monitoring risk trends in the LegacyRedlinedZip cohort.
- Continue monitoring approval ratios quarterly and flag any proxy group that drops below a 0.80 disparate impact ratio.

_Report generated by scripts/fairnessAnalysis.ts._
