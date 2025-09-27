import fs from 'fs';
import path from 'path';
import {
  calculateRiskScore,
  makeDecision,
  type TenantData,
} from '../src/lib/screening';
import { defaultScreeningConfig, type ScreeningConfig } from '../src/lib/screeningConfig';

type TenancyOutcome = {
  on_time_payment_rate: number;
  late_payments: number;
  lease_violations: number;
  eviction_filed: boolean;
  renewed: boolean;
};

interface ApplicantRecord extends TenantData {
  id: string;
  proxy_group: string;
  proxy_label: string;
  tenancy_outcome: TenancyOutcome;
}

type Scheme = {
  name: string;
  description: string;
  config: ScreeningConfig;
};

type Confusion = {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
};

interface GroupSummary {
  proxyGroup: string;
  total: number;
  approvals: number;
  approvalRate: number;
  successRate: number;
  precisionAmongApprovals: number;
}

function readApplicants(): ApplicantRecord[] {
  const datasetPath = path.join(process.cwd(), 'data', 'tenant_applicant_outcomes.json');
  const raw = fs.readFileSync(datasetPath, 'utf-8');
  return JSON.parse(raw) as ApplicantRecord[];
}

function cloneConfig(config: ScreeningConfig): ScreeningConfig {
  return JSON.parse(JSON.stringify(config)) as ScreeningConfig;
}

function buildLegacyConfig(): ScreeningConfig {
  const legacy: ScreeningConfig = {
    thresholds: {
      dtiHigh: 0.4,
      affordability: {
        rentRule: 3,
        partialCreditRatio: 2.5,
        dtiMitigation: 0.36,
        dtiException: 0.3,
      },
      credit: { excellentMin: 750, goodMin: 650 },
      alternativeData: {
        utility: {
          strong: 0.9,
          moderate: 0.8,
          weak: 0.65,
        },
      },
      rental: {
        evictionLookbackYears: 5,
      },
      criminal: {
        violentFelonyLookbackYears: 10,
        felonyLookbackYears: 7,
        misdemeanorLookbackYears: 3,
      },
    },
    scoring: {
      dtiHigh: 2,
      affordability: { meetsRule: 0, partialCredit: 1, dtiException: 2, fail: 4 },
      credit: { excellent: 0, good: 1, poor: 2 },
      rental: {
        evictionPoints: 3,
        latePaymentsThreshold: 3,
        latePaymentsPoints: 2,
        excellentReferenceOffset: 0,
        satisfactoryReferenceOffset: 0,
        concernReferencePoints: 0,
      },
      criminal: {
        cleanRecordPoints: 0,
        staleRecordPoints: 1,
        recentMisdemeanorPoints: 2,
        recentFelonyPoints: 3,
        recentViolentFelonyPoints: 4,
      },
      employment: { fullTime: 0, partTime: 1, unemployed: 2 },
      alternativeData: {
        utilityStrongOffset: 0,
        utilityModerateOffset: 0,
        utilityWeakPoints: 0,
      },
    },
    decision: {
      approvedMax: 3,
      flaggedMax: 6,
    },
  };

  return legacy;
}

function buildReferenceWeightedConfig(): ScreeningConfig {
  const config = cloneConfig(defaultScreeningConfig);
  config.scoring.alternativeData = {
    utilityStrongOffset: 0,
    utilityModerateOffset: 0,
    utilityWeakPoints: 0,
  };
  return config;
}

function isSuccessful(outcome: TenancyOutcome): boolean {
  return outcome.on_time_payment_rate >= 0.9 && outcome.lease_violations === 0 && !outcome.eviction_filed;
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function evaluateScheme(applicants: ApplicantRecord[], scheme: Scheme) {
  const confusion: Confusion = { tp: 0, fp: 0, tn: 0, fn: 0 };
  let approvals = 0;
  let flagged = 0;
  let denials = 0;
  let approvedRiskSum = 0;
  let approvedOnTimeSum = 0;
  const groupMap = new Map<string, { total: number; approvals: number; successCount: number; successApproved: number }>();

  for (const applicant of applicants) {
    const risk = calculateRiskScore(applicant, scheme.config);
    const decision = makeDecision(risk, scheme.config);
    const predictedGood = decision === 'Approved';
    const actualGood = isSuccessful(applicant.tenancy_outcome);

    if (predictedGood && actualGood) confusion.tp += 1;
    else if (predictedGood && !actualGood) confusion.fp += 1;
    else if (!predictedGood && actualGood) confusion.fn += 1;
    else confusion.tn += 1;

    if (decision === 'Approved') {
      approvals += 1;
      approvedRiskSum += risk;
      approvedOnTimeSum += applicant.tenancy_outcome.on_time_payment_rate;
    } else if (decision === 'Flagged for Review') {
      flagged += 1;
    } else {
      denials += 1;
    }

    if (!groupMap.has(applicant.proxy_group)) {
      groupMap.set(applicant.proxy_group, { total: 0, approvals: 0, successCount: 0, successApproved: 0 });
    }
    const group = groupMap.get(applicant.proxy_group)!;
    group.total += 1;
    if (actualGood) group.successCount += 1;
    if (decision === 'Approved') {
      group.approvals += 1;
      if (actualGood) group.successApproved += 1;
    }
  }

  const total = applicants.length;
  const accuracy = safeDivide(confusion.tp + confusion.tn, total);
  const precision = safeDivide(confusion.tp, confusion.tp + confusion.fp);
  const recall = safeDivide(confusion.tp, confusion.tp + confusion.fn);
  const falsePositiveRate = safeDivide(confusion.fp, confusion.fp + confusion.tn);
  const approvalRate = safeDivide(approvals, total);
  const avgRiskApproved = approvals > 0 ? approvedRiskSum / approvals : 0;
  const avgOnTimeApproved = approvals > 0 ? approvedOnTimeSum / approvals : 0;

  const groups: GroupSummary[] = [];
  for (const [proxyGroup, stats] of groupMap.entries()) {
    groups.push({
      proxyGroup,
      total: stats.total,
      approvals: stats.approvals,
      approvalRate: safeDivide(stats.approvals, stats.total),
      successRate: safeDivide(stats.successCount, stats.total),
      precisionAmongApprovals: safeDivide(stats.successApproved, stats.approvals),
    });
  }
  groups.sort((a, b) => a.proxyGroup.localeCompare(b.proxyGroup));

  console.log(`\n=== ${scheme.name} ===`);
  console.log(scheme.description);
  console.log(`Applicants evaluated: ${total}`);
  console.log(`Accuracy: ${(accuracy * 100).toFixed(1)}% | Precision: ${(precision * 100).toFixed(1)}% | Recall: ${(recall * 100).toFixed(1)}% | FPR: ${(falsePositiveRate * 100).toFixed(1)}%`);
  console.log(`Approval rate: ${(approvalRate * 100).toFixed(1)}% (Approved ${approvals}, Flagged ${flagged}, Denied ${denials})`);
  console.log(`Avg risk score for approvals: ${avgRiskApproved.toFixed(2)} | Avg on-time rate for approvals: ${(avgOnTimeApproved * 100).toFixed(1)}%`);

  console.log('\nGroup-level alignment (approval vs. realized success):');
  for (const group of groups) {
    console.log(
      `  - ${group.proxyGroup}: approvals ${group.approvals}/${group.total} (${(group.approvalRate * 100).toFixed(1)}%), success ${(group.successRate * 100).toFixed(1)}%, precision among approvals ${(group.precisionAmongApprovals * 100).toFixed(1)}%`,
    );
  }
}

function main() {
  const applicants = readApplicants();
  const schemes: Scheme[] = [
    {
      name: 'Legacy Baseline',
      description: 'Original QuickLease scoring (no reference or alternative data credits).',
      config: buildLegacyConfig(),
    },
    {
      name: 'Rental Reference Weighted',
      description: 'Adds positive points for strong landlord references and moderates late-payment penalties.',
      config: buildReferenceWeightedConfig(),
    },
    {
      name: 'Utility & Reference Hybrid (Proposed)',
      description: 'Empirically tuned production candidate using utility payment reliability and landlord references.',
      config: cloneConfig(defaultScreeningConfig),
    },
  ];

  console.log('Tenant scoring benchmark on labeled tenancy outcomes');
  for (const scheme of schemes) {
    evaluateScheme(applicants, scheme);
  }
}

main();
