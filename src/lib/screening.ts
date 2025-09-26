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

export type ContributionSeverity = 'positive' | 'neutral' | 'warning' | 'critical';

export interface RiskFactorContribution {
  factor:
    | 'affordability'
    | 'dti-penalty'
    | 'credit'
    | 'rental-eviction'
    | 'rental-late-payments'
    | 'criminal'
    | 'employment';
  label: string;
  points: number;
  severity: ContributionSeverity;
  dataSource: string;
  recommendedAction?: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface AdverseActionExplanation {
  factor: RiskFactorContribution['factor'];
  reason: string;
  dataSource: string;
  recommendedAction: string;
  points: number;
}

export interface RiskProfile {
  risk_score: number;
  contributions: RiskFactorContribution[];
  adverseActions: AdverseActionExplanation[];
  affordability: AffordabilityEvaluation;
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


export type CreditTier = 'excellent' | 'good' | 'poor';

export function determineCreditTier(
  credit_score: number,
  config: ScreeningConfig = defaultScreeningConfig,
): CreditTier {
  const { excellentMin, goodMin } = config.thresholds.credit;
  if (credit_score >= excellentMin) return 'excellent';
  if (credit_score >= goodMin) return 'good';
  return 'poor';

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


function formatNumber(value: number, digits = 2): number | string {
  if (!Number.isFinite(value)) return '∞';
  return Number(value.toFixed(digits));
}

export function calculateRiskProfile(
  tenant: TenantData,
  config: ScreeningConfig = defaultScreeningConfig,
): RiskProfile {
  const contributions: RiskFactorContribution[] = [];

  const affordability = evaluateAffordability(tenant.income, tenant.debt, tenant.monthly_rent, config);
  const affordabilityLabels: Record<AffordabilityTier, { label: string; severity: ContributionSeverity; action?: string }> = {
    'meets-rule': {
      label: 'Meets 3× rent affordability rule',
      severity: 'positive',
    },
    'partial-credit': {
      label: 'Income supports rent with supplemental documentation',
      severity: 'warning',
      action: 'Provide bank statements or co-signer information to support affordability.',
    },
    'dti-exception': {
      label: 'High rent burden offset by manageable debt-to-income ratio',
      severity: 'warning',
      action: 'Share additional proof of consistent payments or reduce revolving debt.',
    },
    fail: {
      label: 'Does not meet income-to-rent or debt-to-income rules',
      severity: 'critical',
      action: 'Increase stated income, add a guarantor, or seek a lower rent obligation.',
    },
  };

  const affordabilityMeta = affordabilityLabels[affordability.tier];
  contributions.push({
    factor: 'affordability',
    label: affordabilityMeta.label,
    points: affordability.risk,
    severity: affordabilityMeta.severity,
    dataSource: 'Applicant-stated income, rent obligation, and liabilities',
    recommendedAction: affordabilityMeta.action,
    details: {
      incomeToRentRatio: formatNumber(affordability.ratio),
      debtToIncomeRatio: formatNumber(affordability.dti),
    },
  });

  if (affordability.dti > config.thresholds.dtiHigh) {
    contributions.push({
      factor: 'dti-penalty',
      label: 'Debt-to-income ratio exceeds maximum threshold',
      points: config.scoring.dtiHigh,
      severity: 'critical',
      dataSource: 'Credit bureau debt obligations & stated income',
      recommendedAction: `Reduce outstanding debt or document income that lowers DTI below ${formatNumber(
        config.thresholds.dtiHigh,
      )}.`,
      details: {
        applicantDti: formatNumber(affordability.dti),
        allowedMaximum: formatNumber(config.thresholds.dtiHigh),
      },
    });
  }

  const creditPoints = evaluateCreditScore(tenant.credit_score, config);
  const creditTier = determineCreditTier(tenant.credit_score, config);
  const creditMeta: Record<CreditTier, { label: string; severity: ContributionSeverity; action?: string }> = {
    excellent: {
      label: 'Excellent credit history',
      severity: 'positive',
    },
    good: {
      label: 'Good credit history with minor risk signals',
      severity: 'warning',
      action: 'Monitor revolving balances and ensure on-time payments to improve credit tier.',
    },
    poor: {
      label: 'Credit history indicates elevated risk',
      severity: 'critical',
      action: 'Address delinquencies, dispute inaccuracies, and build six months of on-time payments.',
    },
  };
  const creditMetaInfo = creditMeta[creditTier];
  contributions.push({
    factor: 'credit',
    label: creditMetaInfo.label,
    points: creditPoints,
    severity: creditMetaInfo.severity,
    dataSource: 'Credit bureau report (FICO/VantageScore)',
    recommendedAction: creditMetaInfo.action,
    details: {
      creditScore: tenant.credit_score,
      tier: creditTier,
    },
  });

  const rental = tenant.rental_history;
  if (rental.evictions > 0) {
    contributions.push({
      factor: 'rental-eviction',
      label: 'Prior eviction reported',
      points: config.scoring.rental.evictionPoints,
      severity: 'critical',
      dataSource: 'Rental court records & landlord references',
      recommendedAction: 'Provide context, proof of resolution, or references from subsequent landlords.',
      details: {
        evictions: rental.evictions,
      },
    });
  } else {
    contributions.push({
      factor: 'rental-eviction',
      label: 'No eviction history reported',
      points: 0,
      severity: 'positive',
      dataSource: 'Rental court records & landlord references',
      details: {
        evictions: rental.evictions,
      },
    });
  }

  if (rental.late_payments > config.scoring.rental.latePaymentsThreshold) {
    contributions.push({
      factor: 'rental-late-payments',
      label: 'Late rental payments exceed tolerance',
      points: config.scoring.rental.latePaymentsPoints,
      severity: 'warning',
      dataSource: 'Landlord reference checks & rental payment history',
      recommendedAction: 'Show proof of recent on-time payments or explain historical anomalies.',
      details: {
        latePayments: rental.late_payments,
        threshold: config.scoring.rental.latePaymentsThreshold,
      },
    });
  } else {
    contributions.push({
      factor: 'rental-late-payments',
      label: 'Rental payment history within tolerance',
      points: 0,
      severity: 'positive',
      dataSource: 'Landlord reference checks & rental payment history',
      details: {
        latePayments: rental.late_payments,
        threshold: config.scoring.rental.latePaymentsThreshold,
      },
    });
  }

  if (tenant.criminal_background.has_criminal_record) {
    contributions.push({
      factor: 'criminal',
      label: 'Criminal record identified',
      points: evaluateCriminalRecord(tenant.criminal_background, config),
      severity: 'warning',
      dataSource: 'Public records & criminal databases',
      recommendedAction: 'Submit rehabilitation documents or expungement records for consideration.',
      details: {
        typeOfCrime: tenant.criminal_background.type_of_crime ?? null,
      },
    });
  } else {
    contributions.push({
      factor: 'criminal',
      label: 'No criminal record found',
      points: 0,
      severity: 'positive',
      dataSource: 'Public records & criminal databases',
      details: {
        typeOfCrime: null,
      },
    });
  }

  const employmentPoints = evaluateEmploymentStatus(tenant.employment_status, config);
  const employmentMeta: Record<EmploymentStatus, { label: string; severity: ContributionSeverity; action?: string }> = {
    'full-time': {
      label: 'Verified full-time employment',
      severity: 'positive',
    },
    'part-time': {
      label: 'Part-time employment may require extra review',
      severity: 'warning',
      action: 'Provide pay stubs or additional income sources to document stability.',
    },
    unemployed: {
      label: 'Unemployment increases risk',
      severity: 'critical',
      action: 'Document alternative income, savings, or a guarantor to mitigate risk.',
    },
  };
  const employmentMetaInfo = employmentMeta[tenant.employment_status];
  contributions.push({
    factor: 'employment',
    label: employmentMetaInfo.label,
    points: employmentPoints,
    severity: employmentMetaInfo.severity,
    dataSource: 'Employment verification & income documentation',
    recommendedAction: employmentMetaInfo.action,
    details: {
      status: tenant.employment_status,
    },
  });

  const risk_score = contributions.reduce((sum, contribution) => sum + contribution.points, 0);

  const adverseActions: AdverseActionExplanation[] = contributions
    .filter((contribution) => contribution.points > 0)
    .map((contribution) => ({
      factor: contribution.factor,
      reason: contribution.label,
      dataSource: contribution.dataSource,
      recommendedAction:
        contribution.recommendedAction ?? 'Contact the property manager for guidance on mitigating this finding.',
      points: contribution.points,
    }));

  return {
    risk_score,
    contributions,
    adverseActions,
    affordability,
  };
}

export function calculateRiskScore(tenant: TenantData, config: ScreeningConfig = defaultScreeningConfig): number {
  return calculateRiskProfile(tenant, config).risk_score;
==
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

export interface TenantScreeningResult {
  risk_score: number;
  decision: Decision;
  breakdown: RiskFactorContribution[];
  adverse_actions: AdverseActionExplanation[];
  affordability: AffordabilityEvaluation;
}

export function tenantScreeningAlgorithm(
  tenant: TenantData,
  config: ScreeningConfig = defaultScreeningConfig,

): TenantScreeningResult {
  const profile = calculateRiskProfile(tenant, config);
  const decision = makeDecision(profile.risk_score, config);
  return {
    risk_score: profile.risk_score,
    decision,
    breakdown: profile.contributions,
    adverse_actions: profile.adverseActions,
    affordability: profile.affordability,
  };

): 
}
