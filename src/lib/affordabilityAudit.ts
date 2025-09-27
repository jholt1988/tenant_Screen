import { tenantScreeningAlgorithm, type Decision } from './screening';
import { defaultScreeningConfig, type ScreeningConfig } from './screeningConfig';
import { applicantSamples, type ApplicantSample } from './sampleApplicants';

type DecisionCounts = { approved: number; flagged: number; denied: number };

type GroupSummary = DecisionCounts & {
  total: number;
  approvalRate: number;
  denialRate: number;
};

export interface PolicyOutcome {
  label: string;
  totals: GroupSummary;
  groups: Record<string, GroupSummary>;
  approvalRateRange: number;
}

function emptyCounts(): DecisionCounts {
  return { approved: 0, flagged: 0, denied: 0 };
}

function cloneConfig(config: ScreeningConfig): ScreeningConfig {
  return JSON.parse(JSON.stringify(config));
}

export function buildStrictAffordabilityConfig(base: ScreeningConfig = defaultScreeningConfig): ScreeningConfig {
  const cfg = cloneConfig(base);
  cfg.thresholds.affordability.partialCreditRatio = cfg.thresholds.affordability.rentRule;
  cfg.thresholds.affordability.dtiMitigation = 0;
  cfg.thresholds.affordability.dtiException = 0;
  cfg.scoring.affordability.partialCredit = cfg.scoring.affordability.fail;
  cfg.scoring.affordability.dtiException = cfg.scoring.affordability.fail;
  cfg.scoring.affordability.fail = Math.max(cfg.scoring.affordability.fail, cfg.decision.flaggedMax + 1);
  return cfg;
}

function decisionKey(decision: Decision): keyof DecisionCounts {
  if (decision === 'Approved') return 'approved';
  if (decision === 'Flagged for Review') return 'flagged';
  return 'denied';
}

function toSummary(counts: DecisionCounts & { total: number }): GroupSummary {
  const approvalRate = counts.total === 0 ? 0 : counts.approved / counts.total;
  const denialRate = counts.total === 0 ? 0 : counts.denied / counts.total;
  return { ...counts, approvalRate, denialRate };
}

function runPolicy(applicants: ApplicantSample[], config: ScreeningConfig, label: string): PolicyOutcome {
  const totals: DecisionCounts & { total: number } = { ...emptyCounts(), total: 0 };
  const groupMap = new Map<string, DecisionCounts & { total: number }>();

  for (const applicant of applicants) {
    const { decision } = tenantScreeningAlgorithm(applicant, config);
    totals.total += 1;
    totals[decisionKey(decision)] += 1;

    const key = `${applicant.neighborhood}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, { ...emptyCounts(), total: 0 });
    }
    const groupCounts = groupMap.get(key)!;
    groupCounts.total += 1;
    groupCounts[decisionKey(decision)] += 1;
  }

  const groups: Record<string, GroupSummary> = {};
  const approvals: number[] = [];
  for (const [key, counts] of Array.from(groupMap.entries())) {
    const summary = toSummary(counts);
    groups[key] = summary;
    approvals.push(summary.approvalRate);
  }

  const approvalRateRange = approvals.length > 0 ? Math.max(...approvals) - Math.min(...approvals) : 0;

  return {
    label,
    totals: toSummary(totals),
    groups,
    approvalRateRange,
  };
}

export function simulateAffordabilityPolicies(): { strict: PolicyOutcome; tiered: PolicyOutcome } {
  const strictConfig = buildStrictAffordabilityConfig();
  const strict = runPolicy(applicantSamples, strictConfig, 'Strict 3x Income');
  const tiered = runPolicy(applicantSamples, defaultScreeningConfig, 'Tiered Affordability');
  return { strict, tiered };
}

export { applicantSamples };
