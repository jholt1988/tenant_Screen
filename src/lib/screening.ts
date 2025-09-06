export type EmploymentStatus = 'full-time' | 'part-time' | 'unemployed';
import type { ScreeningConfig } from './screeningConfig';
import { defaultScreeningConfig } from './screeningConfig';

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
  debt: number; // total outstanding debt
  credit_score: number; // typically 300-850
  rental_history: RentalHistory;
  criminal_background: CriminalBackground;
  employment_status: EmploymentStatus;
}

export function calculateDti(income: number, debt: number): number {
  if (income <= 0) return Infinity;
  return debt / income;
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

export function evaluateRentalHistory(rental_history: RentalHistory, config?: ScreeningConfig): number {
  let risk_score = 0;
  if (config) {
    if (rental_history.evictions > 0) risk_score += config.scoring.rental.evictionPoints;
    if (rental_history.late_payments > config.scoring.rental.latePaymentsThreshold) {
      risk_score += config.scoring.rental.latePaymentsPoints;
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

  const dti = calculateDti(tenant.income, tenant.debt);
  if (dti > config.thresholds.dtiHigh) risk_score += config.scoring.dtiHigh;

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
