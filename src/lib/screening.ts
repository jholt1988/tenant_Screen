export type EmploymentStatus = 'full-time' | 'part-time' | 'unemployed';
import type { ScreeningConfig } from './screeningConfig';
import { defaultScreeningConfig } from './screeningConfig';

export type RentalReference = 'excellent' | 'satisfactory' | 'concern';

export interface RentalHistory {
  evictions: number; // number of evictions
  late_payments: number; // number of late payments
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
  rental_reference?: RentalReference;
  utility_payment_score?: number; // alternative data derived from utility payment history (0-1)
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

export function evaluateRentalHistory(
  rental_history: RentalHistory,
  config?: ScreeningConfig,
  rental_reference?: RentalReference,
): number {
  let risk_score = 0;
  if (config) {
    if (rental_history.evictions > 0) risk_score += config.scoring.rental.evictionPoints;
    if (rental_history.late_payments > config.scoring.rental.latePaymentsThreshold) {
      risk_score += config.scoring.rental.latePaymentsPoints;
    }
    if (rental_reference) {
      if (rental_reference === 'excellent') {
        risk_score += config.scoring.rental.excellentReferenceOffset;
      } else if (rental_reference === 'satisfactory') {
        risk_score += config.scoring.rental.satisfactoryReferenceOffset;
      } else if (rental_reference === 'concern') {
        risk_score += config.scoring.rental.concernReferencePoints;
      }
    }
    return risk_score;
  }
  // default behavior
  if (rental_history.evictions > 0) risk_score += 3; // Red flag
  if (rental_history.late_payments > 3) risk_score += 2; // Instability
  if (rental_reference) {
    if (rental_reference === 'excellent') risk_score -= 1;
    else if (rental_reference === 'concern') risk_score += 2;
  }
  return risk_score;
}

export function evaluateAlternativeData(tenant: TenantData, config: ScreeningConfig): number {
  const thresholds = config.thresholds.alternativeData;
  const scoring = config.scoring.alternativeData;
  if (!thresholds || !scoring) return 0;

  const utilityScore = tenant.utility_payment_score;
  if (utilityScore == null) return 0;

  const { strong, moderate, weak } = thresholds.utility;
  if (utilityScore >= strong) return scoring.utilityStrongOffset;
  if (utilityScore >= moderate) return scoring.utilityModerateOffset;
  if (utilityScore <= weak) return scoring.utilityWeakPoints;
  return 0;
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
  risk_score += evaluateRentalHistory(tenant.rental_history, config, tenant.rental_reference);
  risk_score += evaluateCriminalRecord(tenant.criminal_background, config);
  risk_score += evaluateEmploymentStatus(tenant.employment_status, config);
  risk_score += evaluateAlternativeData(tenant, config);

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
