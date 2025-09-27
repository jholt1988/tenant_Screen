# Criminal Background Screening Policy

## Inventory of Criminal Record Filters

The background-check integration evaluates criminal history through a combination of severity, offense category, and time since conviction:

- **Violent felonies** within the configurable lookback window (default: 10 years) add `recentViolentFelonyPoints` and automatically trigger an individualized review.
- **Non-violent felonies** within the felony lookback window (default: 7 years) add `recentFelonyPoints` and require individualized review.
- **Misdemeanors** within the misdemeanor lookback window (default: 3 years) add `recentMisdemeanorPoints` and require individualized review.
- **Records older than the applicable lookback period** do not add recent-offense risk, but contribute `staleRecordPoints` and are documented for context.
- **Reported histories without structured offense data** (e.g., legacy `type_of_crime` strings) are flagged for individualized review and assessed with `staleRecordPoints` until verified details are supplied.

These filters are implemented in `src/lib/screening.ts` and are configurable through `src/lib/screeningConfig.ts` and the advanced calculator UI.

## Alignment with 2016 HUD Criminal History Guidance

HUD's April 4, 2016 guidance emphasizes (1) avoiding blanket exclusions, (2) considering the nature and severity of convictions, and (3) evaluating the time that has elapsed since the offense. The integration translates these principles into explicit lookback periods and decision aids:

- **Lookback periods** are limited to 10 years for violent felonies, 7 years for other felonies, and 3 years for misdemeanors, consistent with HUD's directive to tailor policies to recency and severity rather than impose lifetime bans.
- **Individualized review** is triggered whenever a record falls within the applicable lookback period or when insufficient detail is provided. Reviewers are prompted to consider offense circumstances, evidence of rehabilitation, and mitigating information before issuing an adverse action.
- **Documented rationale** is captured through risk breakdowns (`breakdown.criminal`) in audit logs and API responses, ensuring reviewers can justify decisions and comply with HUD's case-by-case assessment expectations.

## Case-by-Case Review Procedure

1. **Collect structured record details** (severity, category, years since conviction, narrative description) via the calculator UI or API payload. Legacy string inputs still trigger review but require follow-up.
2. **System evaluation** assigns risk points per offense and flags whether individualized review is required. Violent or recent offenses automatically produce rationale entries describing the applicable lookback and mitigation requirements.
3. **Reviewer assessment** documents mitigating factors (rehabilitation, age at offense, nature of offense) directly in the "Summary / Context" field of the calculator. This text is stored with the audit entry for future reference.
4. **Decision logging** persists risk scores, decisions, and the criminal-review breakdown for transparency and compliance audits.

## Configuration Summary

| Setting | Default | Description |
| --- | --- | --- |
| `thresholds.criminal.violentFelonyLookbackYears` | 10 | Maximum age for violent felony convictions considered in scoring. |
| `thresholds.criminal.felonyLookbackYears` | 7 | Maximum age for non-violent felony convictions considered in scoring. |
| `thresholds.criminal.misdemeanorLookbackYears` | 3 | Maximum age for misdemeanor convictions considered in scoring. |
| `scoring.criminal.recentViolentFelonyPoints` | 4 | Risk points applied to violent felonies inside the lookback window. |
| `scoring.criminal.recentFelonyPoints` | 3 | Risk points for other felonies inside the lookback window. |
| `scoring.criminal.recentMisdemeanorPoints` | 2 | Risk points for misdemeanors inside the lookback window. |
| `scoring.criminal.staleRecordPoints` | 1 | Documentation-only points for offenses outside the lookback period or lacking detail. |
| `scoring.criminal.cleanRecordPoints` | 0 | Baseline risk when no criminal history is reported. |

Reviewers should revisit these defaults periodically to confirm continued alignment with HUD policy updates and local regulations.
