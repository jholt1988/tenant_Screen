import { NextRequest } from 'next/server';
import {
  tenantScreeningAlgorithm,
  type TenantData,
  type EmploymentStatus,
} from '@/lib/screening';
import { logAudit, getAudits } from '@/lib/audit';
import { defaultScreeningConfig, type ScreeningConfig } from '@/lib/screeningConfig';
import { getJurisdictionPolicy } from '@/lib/jurisdictions';
import { randomUUID } from 'crypto';

function toNumber(val: unknown): number | undefined {
  const n = typeof val === 'string' ? Number(val) : (val as number);
  return Number.isFinite(n) ? n : undefined;
}

function validateTenantPayload(payload: any): { ok: true; data: TenantData } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const income = toNumber(payload?.income);
  const monthly_rent = toNumber(payload?.monthly_rent);
  const debt = toNumber(payload?.debt);
  const credit_score = toNumber(payload?.credit_score);

  if (income === undefined || income < 0) errors.push('income must be a non-negative number');
  if (monthly_rent === undefined || monthly_rent < 0) errors.push('monthly_rent must be a non-negative number');
  if (debt === undefined || debt < 0) errors.push('debt must be a non-negative number');
  if (credit_score === undefined || credit_score < 300 || credit_score > 850) errors.push('credit_score must be a number between 300 and 850');

  const rental_history = payload?.rental_history ?? {};
  const evictions = toNumber(rental_history?.evictions);
  const late_payments = toNumber(rental_history?.late_payments);
  if (evictions === undefined || evictions < 0) errors.push('rental_history.evictions must be a non-negative number');
  if (late_payments === undefined || late_payments < 0) errors.push('rental_history.late_payments must be a non-negative number');

  const criminal_background = payload?.criminal_background ?? {};
  const has_criminal_record = Boolean(criminal_background?.has_criminal_record);
  const type_of_crimeRaw = criminal_background?.type_of_crime;
  const type_of_crime = typeof type_of_crimeRaw === 'string' ? type_of_crimeRaw : null;

  const employment_status = payload?.employment_status as EmploymentStatus;
  const allowedEmployment: EmploymentStatus[] = ['full-time', 'part-time', 'unemployed'];
  if (!allowedEmployment.includes(employment_status)) {
    errors.push(`employment_status must be one of: ${allowedEmployment.join(', ')}`);
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      income: income!,
      monthly_rent: monthly_rent!,
      debt: debt!,
      credit_score: credit_score!,
      rental_history: { evictions: evictions!, late_payments: late_payments! },
      criminal_background: { has_criminal_record, type_of_crime },
      employment_status,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = validateTenantPayload(payload);
    if (!validation.ok) {
      return Response.json({ errors: validation.errors }, { status: 400 });
    }
    const config = validateAndMergeConfig(payload?.config);
    if (config.errors.length) {
      return Response.json({ errors: config.errors }, { status: 400 });
    }

    const jurisdiction = typeof payload?.jurisdiction === 'string' ? payload.jurisdiction : undefined;
    const policy = jurisdiction ? getJurisdictionPolicy(jurisdiction) : undefined;
    if (jurisdiction && !policy) {
      return Response.json({ errors: [`Unknown jurisdiction policy: ${jurisdiction}`] }, { status: 400 });
    }

    const result = tenantScreeningAlgorithm(validation.data, config.value, { policy });
    const { risk_score, decision } = result;

    // Audit the evaluation in-memory
    logAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      input: validation.data,
      risk_score,
      decision,
      compliance: result.compliance,
    });

    return Response.json({ risk_score, decision, compliance: result.compliance });
  } catch (e) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

export async function GET() {
  // Return recent evaluations (in-memory; resets on server restart/deploy)
  return Response.json({ audits: getAudits() });
}

function isFiniteNumber(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

type PartialConfig = Partial<{
  thresholds: Partial<{
    dtiHigh: number;
    affordability: Partial<{
      rentRule: number;
      partialCreditRatio: number;
      dtiMitigation: number;
      dtiException: number;
    }>;
    credit: Partial<{ excellentMin: number; goodMin: number }>;
  }>;
  scoring: Partial<{
    dtiHigh: number;
    affordability: Partial<{
      meetsRule: number;
      partialCredit: number;
      dtiException: number;
      fail: number;
    }>;
    credit: Partial<{ excellent: number; good: number; poor: number }>;
    rental: Partial<{ evictionPoints: number; latePaymentsThreshold: number; latePaymentsPoints: number }>;
    criminal: Partial<{ hasRecordPoints: number }>;
    employment: Partial<{ fullTime: number; partTime: number; unemployed: number }>;
  }>;
  decision: Partial<{ approvedMax: number; flaggedMax: number }>;
}>;

function validateAndMergeConfig(override: any): { value: ScreeningConfig; errors: string[] } {
  const errors: string[] = [];
  if (!override || typeof override !== 'object') {
    return { value: defaultScreeningConfig, errors };
  }

  const out: ScreeningConfig = JSON.parse(JSON.stringify(defaultScreeningConfig));
  const cfg = override as PartialConfig;

  // thresholds
  if (cfg.thresholds) {
    if (isFiniteNumber(cfg.thresholds.dtiHigh)) out.thresholds.dtiHigh = cfg.thresholds.dtiHigh!;
    if (cfg.thresholds.affordability) {
      const a = cfg.thresholds.affordability;
      if (isFiniteNumber(a.rentRule)) out.thresholds.affordability.rentRule = a.rentRule!;
      if (isFiniteNumber(a.partialCreditRatio)) out.thresholds.affordability.partialCreditRatio = a.partialCreditRatio!;
      if (isFiniteNumber(a.dtiMitigation)) out.thresholds.affordability.dtiMitigation = a.dtiMitigation!;
      if (isFiniteNumber(a.dtiException)) out.thresholds.affordability.dtiException = a.dtiException!;
    }
    if (cfg.thresholds.credit) {
      const c = cfg.thresholds.credit;
      if (isFiniteNumber(c.excellentMin)) out.thresholds.credit.excellentMin = c.excellentMin!;
      if (isFiniteNumber(c.goodMin)) out.thresholds.credit.goodMin = c.goodMin!;
    }
  }

  // scoring
  if (cfg.scoring) {
    if (isFiniteNumber(cfg.scoring.dtiHigh)) out.scoring.dtiHigh = cfg.scoring.dtiHigh!;
    if (cfg.scoring.affordability) {
      const a = cfg.scoring.affordability;
      if (isFiniteNumber(a.meetsRule)) out.scoring.affordability.meetsRule = a.meetsRule!;
      if (isFiniteNumber(a.partialCredit)) out.scoring.affordability.partialCredit = a.partialCredit!;
      if (isFiniteNumber(a.dtiException)) out.scoring.affordability.dtiException = a.dtiException!;
      if (isFiniteNumber(a.fail)) out.scoring.affordability.fail = a.fail!;
    }
    if (cfg.scoring.credit) {
      const c = cfg.scoring.credit;
      if (isFiniteNumber(c.excellent)) out.scoring.credit.excellent = c.excellent!;
      if (isFiniteNumber(c.good)) out.scoring.credit.good = c.good!;
      if (isFiniteNumber(c.poor)) out.scoring.credit.poor = c.poor!;
    }
    if (cfg.scoring.rental) {
      const r = cfg.scoring.rental;
      if (isFiniteNumber(r.evictionPoints)) out.scoring.rental.evictionPoints = r.evictionPoints!;
      if (isFiniteNumber(r.latePaymentsThreshold)) out.scoring.rental.latePaymentsThreshold = r.latePaymentsThreshold!;
      if (isFiniteNumber(r.latePaymentsPoints)) out.scoring.rental.latePaymentsPoints = r.latePaymentsPoints!;
    }
    if (cfg.scoring.criminal) {
      const cr = cfg.scoring.criminal;
      if (isFiniteNumber(cr.hasRecordPoints)) out.scoring.criminal.hasRecordPoints = cr.hasRecordPoints!;
    }
    if (cfg.scoring.employment) {
      const e = cfg.scoring.employment;
      if (isFiniteNumber(e.fullTime)) out.scoring.employment.fullTime = e.fullTime!;
      if (isFiniteNumber(e.partTime)) out.scoring.employment.partTime = e.partTime!;
      if (isFiniteNumber(e.unemployed)) out.scoring.employment.unemployed = e.unemployed!;
    }
  }

  // decision
  if (cfg.decision) {
    if (isFiniteNumber(cfg.decision.approvedMax)) out.decision.approvedMax = cfg.decision.approvedMax!;
    if (isFiniteNumber(cfg.decision.flaggedMax)) out.decision.flaggedMax = cfg.decision.flaggedMax!;
  }

  // sanity checks
  if (!(out.thresholds.credit.goodMin <= out.thresholds.credit.excellentMin)) {
    errors.push('thresholds.credit.goodMin must be <= thresholds.credit.excellentMin');
  }
  if (!(out.decision.approvedMax <= out.decision.flaggedMax)) {
    errors.push('decision.approvedMax must be <= decision.flaggedMax');
  }
  if (!(out.thresholds.dtiHigh >= 0)) {
    errors.push('thresholds.dtiHigh must be >= 0');
  }
  if (!(out.thresholds.affordability.partialCreditRatio <= out.thresholds.affordability.rentRule)) {
    errors.push('thresholds.affordability.partialCreditRatio must be <= thresholds.affordability.rentRule');
  }
  if (!(out.thresholds.affordability.dtiException <= out.thresholds.affordability.dtiMitigation)) {
    errors.push('thresholds.affordability.dtiException must be <= thresholds.affordability.dtiMitigation');
  }

  return { value: out, errors };
}
