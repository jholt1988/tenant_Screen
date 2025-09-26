export type EmploymentStatus = 'full-time' | 'part-time' | 'unemployed';
import type { ScreeningConfig } from './screeningConfig';
import { defaultScreeningConfig } from './screeningConfig';

export interface RentalHistory {
  evictions: number; // number of evictions
  late_payments: number; // number of late payments
}

export type CriminalSeverity = 'felony' | 'misdemeanor';
export type CriminalCategory = 'violent' | 'property' | 'drug' | 'other';

export interface CriminalRecord {
  severity: CriminalSeverity;
  category: CriminalCategory;
  years_since: number;
  description?: string | null;
}

export interface CriminalBackground {
  has_criminal_record: boolean;
  type_of_crime?: string | null;
  records?: CriminalRecord[] | null;
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

export interface CriminalRecordEvaluation {
  risk: number;
  requiresIndividualReview: boolean;
  consideredRecords: CriminalRecord[];
  disregardedRecords: CriminalRecord[];
  rationale: string[];
}

export interface RiskBreakdown {
  affordability: AffordabilityEvaluation;
  dtiHighApplied: boolean;
  creditPoints: number;
  rentalPoints: number;
  criminal: CriminalRecordEvaluation;
  employmentPoints: number;
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

function normalizeRecords(input?: CriminalRecord[] | null): CriminalRecord[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((rec) => ({
      severity: rec.severity,
      category: rec.category ?? 'other',
      years_since: rec.years_since,
      description: rec.description ?? null,
    }))
    .filter(
      (rec): rec is CriminalRecord =>
        (rec.severity === 'felony' || rec.severity === 'misdemeanor') &&
        (rec.category === 'violent' || rec.category === 'property' || rec.category === 'drug' || rec.category === 'other') &&
        typeof rec.years_since === 'number' &&
        Number.isFinite(rec.years_since) &&
        rec.years_since >= 0,
    );
}

export function evaluateCriminalRecord(
  criminal_background: CriminalBackground,
  config: ScreeningConfig = defaultScreeningConfig,
): CriminalRecordEvaluation {
  if (!criminal_background.has_criminal_record) {
    return {
      risk: config.scoring.criminal.cleanRecordPoints,
      requiresIndividualReview: false,
      consideredRecords: [],
      disregardedRecords: [],
      rationale: ['No criminal convictions reported.'],
    };
  }

  const thresholds = config.thresholds.criminal;
  const scoring = config.scoring.criminal;

  const normalized = normalizeRecords(criminal_background.records);
  const consideredRecords: CriminalRecord[] = [];
  const disregardedRecords: CriminalRecord[] = [];
  const rationale: string[] = [];
  let risk = 0;
  let requiresIndividualReview = false;

  if (!normalized.length && criminal_background.type_of_crime) {
    rationale.push(
      'Criminal history indicated but offense details missing. Flagged for individualized review to gather additional context.',
    );
    return {
      risk: scoring.staleRecordPoints,
      requiresIndividualReview: true,
      consideredRecords,
      disregardedRecords,
      rationale,
    };
  }

  normalized.forEach((record) => {
    const lookback =
      record.severity === 'felony'
        ? record.category === 'violent'
          ? thresholds.violentFelonyLookbackYears
          : thresholds.felonyLookbackYears
        : thresholds.misdemeanorLookbackYears;

    if (record.years_since <= lookback) {
      consideredRecords.push(record);
      requiresIndividualReview = true;
      if (record.severity === 'felony') {
        if (record.category === 'violent') {
          risk += scoring.recentViolentFelonyPoints;
          rationale.push(
            `Violent felony (${record.description ?? record.category}) within ${lookback} year lookback requires individualized assessment.`,
          );
        } else {
          risk += scoring.recentFelonyPoints;
          rationale.push(
            `Felony (${record.description ?? record.category}) within ${lookback} year lookback requires individualized assessment.`,
          );
        }
      } else {
        risk += scoring.recentMisdemeanorPoints;
        rationale.push(
          `Misdemeanor (${record.description ?? record.category}) within ${lookback} year lookback flagged for individualized assessment.`,
        );
      }
    } else {
      disregardedRecords.push(record);
      risk += scoring.staleRecordPoints;
      rationale.push(
        `Record (${record.description ?? record.category}) older than lookback window excluded from adverse action but documented for context.`,
      );
    }
  });

  if (!consideredRecords.length && !disregardedRecords.length) {
    rationale.push('Criminal history data provided could not be validated; defaulting to individualized review.');
    return {
      risk: scoring.staleRecordPoints,
      requiresIndividualReview: true,
      consideredRecords,
      disregardedRecords,
      rationale,
    };
  }

  return { risk, requiresIndividualReview, consideredRecords, disregardedRecords, rationale };
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

export function calculateRiskScore(
  tenant: TenantData,
  config: ScreeningConfig = defaultScreeningConfig,
): { total: number; breakdown: RiskBreakdown } {
  let total = 0;

  const affordability = evaluateAffordability(tenant.income, tenant.debt, tenant.monthly_rent, config);
  total += affordability.risk;

  const dtiHighApplied = affordability.dti > config.thresholds.dtiHigh;
  if (dtiHighApplied) total += config.scoring.dtiHigh;

  const creditPoints = evaluateCreditScore(tenant.credit_score, config);
  total += creditPoints;

  const rentalPoints = evaluateRentalHistory(tenant.rental_history, config);
  total += rentalPoints;

  const criminal = evaluateCriminalRecord(tenant.criminal_background, config);
  total += criminal.risk;

  const employmentPoints = evaluateEmploymentStatus(tenant.employment_status, config);
  total += employmentPoints;

  return {
    total,
    breakdown: {
      affordability,
      dtiHighApplied,
      creditPoints,
      rentalPoints,
      criminal,
      employmentPoints,
    },
  };
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
): { risk_score: number; decision: Decision; breakdown: RiskBreakdown } {
  const { total, breakdown } = calculateRiskScore(tenant, config);
  const decision = makeDecision(total, config);
  return { risk_score: total, decision, breakdown };
}
