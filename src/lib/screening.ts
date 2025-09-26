export type EmploymentStatus = 'full-time' | 'part-time' | 'unemployed';
import type { ScreeningConfig } from './screeningConfig';
import { defaultScreeningConfig } from './screeningConfig';

export type EvictionOutcome = 'filed' | 'dismissed' | 'settled' | 'judgment';

export interface EvictionFiling {
  filed_at: string; // ISO date the filing occurred
  outcome: EvictionOutcome;
}

export interface RentalHistory {
  evictions: number; // number of eviction judgments on record
  late_payments: number; // number of late payments
  eviction_filings?: EvictionFiling[]; // optional detailed history of filings
}

export interface CriminalBackground {
  has_criminal_record: boolean;
  type_of_crime?: string | null;
}

export interface TenantData {
  income: number; // annual income in dollars
  monthly_rent: number; // monthly rent obligation in dollars
  debt: number; // total outstanding debt
  credit_score: number; // typically 300-850
  rental_history: RentalHistory;
  criminal_background: CriminalBackground;
  employment_status: EmploymentStatus;
}

export type AffordabilityTier = 'meets-rule' | 'partial-credit' | 'dti-exception' | 'fail';

export interface AffordabilityEvaluation {
  ratio: number;
  dti: number;
  tier: AffordabilityTier;
  risk: number;
}

export function calculateDti(income: number, debt: number): number {
  if (income <= 0) return Infinity;
  return debt / income;
}

export function evaluateAffordability(
  income: number,
  debt: number,
  monthly_rent: number,
  config: ScreeningConfig = defaultScreeningConfig,
): AffordabilityEvaluation {
  const monthlyIncome = income / 12;
  const ratio = monthly_rent > 0 ? monthlyIncome / monthly_rent : Infinity;
  const dti = calculateDti(income, debt);

  const thresholds = config.thresholds.affordability;
  const scoring = config.scoring.affordability;

  if (!Number.isFinite(ratio) || ratio === Infinity) {
    return { ratio: Infinity, dti, tier: 'meets-rule', risk: scoring.meetsRule };
  }

  if (ratio >= thresholds.rentRule) {
    return { ratio, dti, tier: 'meets-rule', risk: scoring.meetsRule };
  }

  if (ratio >= thresholds.partialCreditRatio && dti <= thresholds.dtiMitigation) {
    return { ratio, dti, tier: 'partial-credit', risk: scoring.partialCredit };
  }

  if (dti <= thresholds.dtiException) {
    return { ratio, dti, tier: 'dti-exception', risk: scoring.dtiException };
  }

  return { ratio, dti, tier: 'fail', risk: scoring.fail };
}

export function evaluateCreditScore(credit_score: number, config?: ScreeningConfig): number {
  if (config) {
    const { excellentMin, goodMin } = config.thresholds.credit;
    if (credit_score >= excellentMin) return config.scoring.credit.excellent;
    if (credit_score >= goodMin) return config.scoring.credit.good;
    return config.scoring.credit.poor;
  }
  // default behavior for backward compatibility
  if (credit_score >= 750) return 0; // Low risk
  if (credit_score >= 650) return 1; // Medium risk
  return 2; // High risk
}

function yearsSince(dateStr: string, reference: Date): number | null {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = reference.getTime() - parsed.getTime();
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

function outcomeBasePoints(outcome: EvictionOutcome, config: ScreeningConfig): number {
  const { evictionOutcomePoints, evictionPoints } = config.scoring.rental;
  if (!evictionOutcomePoints) return evictionPoints;
  switch (outcome) {
    case 'dismissed':
      return evictionOutcomePoints.dismissed;
    case 'settled':
      return evictionOutcomePoints.settled;
    case 'judgment':
      return evictionOutcomePoints.judgment;
    default:
      return evictionOutcomePoints.filing;
  }
}

export function evaluateRentalHistory(rental_history: RentalHistory, config?: ScreeningConfig): number {
  let risk_score = 0;
  if (config) {
    const rentalScoring = config.scoring.rental;
    const filings = rental_history.eviction_filings;

    if (filings && filings.length > 0 && rentalScoring.evictionOutcomePoints) {
      const lookback = config.thresholds.rental?.evictionLookbackYears ?? Infinity;
      const floor = rentalScoring.evictionTimeDecayFloor ?? 0;
      const now = new Date();

      for (const filing of filings) {
        const base = outcomeBasePoints(filing.outcome, config);
        let multiplier = 1;

        if (Number.isFinite(lookback) && lookback > 0) {
          const years = yearsSince(filing.filed_at, now);
          if (years === null) {
            multiplier = 1;
          } else if (years >= lookback) {
            multiplier = 0;
          } else {
            const decay = 1 - years / lookback;
            multiplier = Math.max(floor, decay);
          }
        }

        risk_score += base * multiplier;
      }
    } else if (rental_history.evictions > 0) {
      risk_score += rentalScoring.evictionPoints * rental_history.evictions;
    }

    if (rental_history.late_payments > rentalScoring.latePaymentsThreshold) {
      risk_score += rentalScoring.latePaymentsPoints;
    }
    return risk_score;
  }
  // default behavior
  if (rental_history.evictions > 0) risk_score += 3; // Red flag
  if (rental_history.late_payments > 3) risk_score += 2; // Instability
  return risk_score;
}

export function evaluateCriminalRecord(criminal_background: CriminalBackground, config?: ScreeningConfig): number {
  if (config) return criminal_background.has_criminal_record ? config.scoring.criminal.hasRecordPoints : 0;
  return criminal_background.has_criminal_record ? 3 : 0;
}

export function evaluateEmploymentStatus(status: EmploymentStatus, config?: ScreeningConfig): number {
  if (config) {
    if (status === 'full-time') return config.scoring.employment.fullTime;
    if (status === 'part-time') return config.scoring.employment.partTime;
    return config.scoring.employment.unemployed;
  }
  if (status === 'full-time') return 0; // Low risk
  if (status === 'part-time') return 1; // Medium risk
  return 2; // High risk (unemployed)
}

export function calculateRiskScore(tenant: TenantData, config: ScreeningConfig = defaultScreeningConfig): number {
  let risk_score = 0;

  const affordability = evaluateAffordability(tenant.income, tenant.debt, tenant.monthly_rent, config);
  risk_score += affordability.risk;

  if (affordability.dti > config.thresholds.dtiHigh) risk_score += config.scoring.dtiHigh;

  risk_score += evaluateCreditScore(tenant.credit_score, config);
  risk_score += evaluateRentalHistory(tenant.rental_history, config);
  risk_score += evaluateCriminalRecord(tenant.criminal_background, config);
  risk_score += evaluateEmploymentStatus(tenant.employment_status, config);

  return risk_score;
}

export type Decision = 'Approved' | 'Flagged for Review' | 'Denied';

export function makeDecision(risk_score: number, config: ScreeningConfig = defaultScreeningConfig): Decision {
  if (risk_score <= config.decision.approvedMax) return 'Approved';
  if (risk_score <= config.decision.flaggedMax) return 'Flagged for Review';
  return 'Denied';
}

export function tenantScreeningAlgorithm(
  tenant: TenantData,
  config: ScreeningConfig = defaultScreeningConfig,
): { risk_score: number; decision: Decision } {
  const risk_score = calculateRiskScore(tenant, config);
  const decision = makeDecision(risk_score, config);
  return { risk_score, decision };
}
