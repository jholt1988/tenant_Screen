import fs from 'fs';
import path from 'path';
import { calculateRiskScore, evaluateCreditScore, makeDecision, type TenantData } from '../src/lib/screening';
import { defaultScreeningConfig, type ScreeningConfig } from '../src/lib/screeningConfig';

type ActualOutcome = 'approved' | 'flagged' | 'denied';

interface HistoricalApplicant extends TenantData {
  id: string;
  proxy_group: string;
  proxy_label: string;
  utility_payment_score?: number;
  actual_outcome: ActualOutcome;
}

interface Scheme {
  name: string;
  description: string;
  config: ScreeningConfig;
  adjustRisk?: (applicant: HistoricalApplicant, risk: number) => number;
}

interface GroupSummary {
  total: number;
  approvals: number;
  flagged: number;
  denials: number;
  riskSum: number;
  creditPenaltySum: number;
}

interface GroupMetrics {
  proxyGroup: string;
  total: number;
  approvalRate: number;
  flaggedRate: number;
  denialRate: number;
  avgRiskScore: number;
  avgCreditPenalty: number;
  disparateImpact: number;
}

interface SchemeResult {
  scheme: Scheme;
  metrics: GroupMetrics[];
  overallApprovalRate: number;
  adverseImpactFindings: GroupMetrics[];
}

function cloneConfig(config: ScreeningConfig): ScreeningConfig {
  return JSON.parse(JSON.stringify(config)) as ScreeningConfig;
}

function toPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return value.toFixed(2);
}

function buildSchemes(): Scheme[] {
  const baseline = cloneConfig(defaultScreeningConfig);

  const reducedCredit = cloneConfig(defaultScreeningConfig);
  reducedCredit.scoring.credit = { excellent: 0, good: 0.5, poor: 1 };

  const utilityAugmented = cloneConfig(defaultScreeningConfig);
  utilityAugmented.scoring.credit = { excellent: 0, good: 0.5, poor: 1.25 };

  const schemes: Scheme[] = [
    {
      name: 'Baseline – Current Weights',
      description: 'Production QuickLease credit scoring weights (0 / 1 / 2 points).',
      config: baseline,
    },
    {
      name: 'Reduced Credit Weighting (50% penalty)',
      description: 'Halves the credit penalties to lessen their contribution to the total risk score.',
      config: reducedCredit,
    },
    {
      name: 'Credit + Utility Payment Adjustment',
      description:
        'Moderate credit penalties while granting offsets for strong utility payment history and mild surcharges for low payment reliability.',
      config: utilityAugmented,
      adjustRisk: (applicant, risk) => {
        const utility = applicant.utility_payment_score ?? 0.5;
        if (utility >= 0.9) return Math.max(0, risk - 1.5);
        if (utility >= 0.8) return Math.max(0, risk - 1.0);
        if (utility >= 0.7) return Math.max(0, risk - 0.75);
        if (utility >= 0.6) return Math.max(0, risk - 0.5);
        if (utility < 0.5) return risk + 0.5;
        return risk;
      },
    },
  ];

  return schemes;
}

function analyzeScheme(applicants: HistoricalApplicant[], scheme: Scheme): SchemeResult {
  const groupSummaries = new Map<string, GroupSummary>();
  let totalApprovals = 0;

  for (const applicant of applicants) {
    const riskScore = calculateRiskScore(applicant, scheme.config);
    const adjustedRisk = scheme.adjustRisk ? scheme.adjustRisk(applicant, riskScore) : riskScore;
    const decision = makeDecision(adjustedRisk, scheme.config);
    const creditPenalty = evaluateCreditScore(applicant.credit_score, scheme.config);

    if (!groupSummaries.has(applicant.proxy_group)) {
      groupSummaries.set(applicant.proxy_group, {
        total: 0,
        approvals: 0,
        flagged: 0,
        denials: 0,
        riskSum: 0,
        creditPenaltySum: 0,
      });
    }

    const summary = groupSummaries.get(applicant.proxy_group)!;
    summary.total += 1;
    summary.riskSum += adjustedRisk;
    summary.creditPenaltySum += creditPenalty;

    if (decision === 'Approved') {
      summary.approvals += 1;
      totalApprovals += 1;
    } else if (decision === 'Flagged for Review') {
      summary.flagged += 1;
    } else {
      summary.denials += 1;
    }
  }

  const metrics: GroupMetrics[] = [];
  let maxApprovalRate = 0;
  let totalApplicants = 0;

  for (const [proxyGroup, summary] of groupSummaries.entries()) {
    const approvalRate = summary.approvals / summary.total;
    maxApprovalRate = Math.max(maxApprovalRate, approvalRate);
    totalApplicants += summary.total;

    metrics.push({
      proxyGroup,
      total: summary.total,
      approvalRate,
      flaggedRate: summary.flagged / summary.total,
      denialRate: summary.denials / summary.total,
      avgRiskScore: summary.riskSum / summary.total,
      avgCreditPenalty: summary.creditPenaltySum / summary.total,
      disparateImpact: 0, // placeholder
    });
  }

  metrics.sort((a, b) => a.proxyGroup.localeCompare(b.proxyGroup));

  for (const metric of metrics) {
    metric.disparateImpact = maxApprovalRate === 0 ? 0 : metric.approvalRate / maxApprovalRate;
  }

  const adverseImpactFindings = metrics.filter((metric) => metric.disparateImpact < 0.8);

  return {
    scheme,
    metrics,
    overallApprovalRate: totalApprovals / totalApplicants,
    adverseImpactFindings,
  };
}

function renderMetricsTable(result: SchemeResult): string {
  const header =
    '| Proxy Group | Applicants | Approval Rate | Flagged Rate | Denial Rate | Avg Risk Score | Avg Credit Penalty | Disparate Impact |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |';

  const rows = result.metrics
    .map(
      (metric) =>
        `| ${metric.proxyGroup} | ${metric.total} | ${toPercent(metric.approvalRate)} | ${toPercent(metric.flaggedRate)} | ${toPercent(metric.denialRate)} | ${formatNumber(metric.avgRiskScore)} | ${formatNumber(metric.avgCreditPenalty)} | ${formatNumber(metric.disparateImpact)} |`,
    )
    .join('\n');

  return `${header}\n${rows}`;
}

function buildNarrative(results: SchemeResult[]): string {
  const lines: string[] = [];

  lines.push('# QuickLease Tenant Score Fairness Audit');
  lines.push('');
  lines.push('This report quantifies the effect of credit weighting on applicant outcomes segmented by protected-class proxy groups and compares mitigation options.');
  lines.push('');

  lines.push('## Data Set');
  lines.push('');
  lines.push(
    'Historical sample consists of 24 QuickLease applicants with proxy indicators for community type (HighOpportunityZip, LegacyRedlinedZip, ImmigrantCommunity), recorded credit scores, rental history, employment status, and utility payment reliability.',
  );
  lines.push('');
  lines.push('Current scoring weights, including the credit component, are defined in `src/lib/screeningConfig.ts`.');
  lines.push('');

  for (const result of results) {
    lines.push(`## ${result.scheme.name}`);
    lines.push('');
    lines.push(result.scheme.description);
    lines.push('');
    lines.push(renderMetricsTable(result));
    lines.push('');
    lines.push(`Overall approval rate: ${toPercent(result.overallApprovalRate)}`);

    if (result.adverseImpactFindings.length > 0) {
      lines.push('');
      lines.push('**Adverse impact alerts (approval rate < 80% of reference group):**');
      for (const finding of result.adverseImpactFindings) {
        lines.push(
          `- ${finding.proxyGroup}: approval rate ${toPercent(finding.approvalRate)} (disparate impact ratio ${formatNumber(
            finding.disparateImpact,
          )}).`,
        );
      }
    }

    lines.push('');
  }

  const baseline = results[0];
  const reduced = results[1];
  const utility = results[2];

  lines.push('## Comparative Insights');
  lines.push('');
  lines.push(
    `- Baseline weights show the strongest disparate impact, with approval ratios for LegacyRedlinedZip and ImmigrantCommunity groups falling below the 0.80 threshold (${formatNumber(
      baseline.metrics.find((m) => m.proxyGroup === 'LegacyRedlinedZip')?.disparateImpact ?? 0,
    )} and ${formatNumber(baseline.metrics.find((m) => m.proxyGroup === 'ImmigrantCommunity')?.disparateImpact ?? 0)} respectively).`,
  );
  lines.push(
    `- Reducing credit penalties boosts ImmigrantCommunity parity to ${formatNumber(
      reduced.metrics.find((m) => m.proxyGroup === 'ImmigrantCommunity')?.disparateImpact ?? 0,
    )} while maintaining similar approval throughput (${toPercent(baseline.overallApprovalRate)} → ${toPercent(
      reduced.overallApprovalRate,
    )}); LegacyRedlinedZip remains constrained (${formatNumber(
      reduced.metrics.find((m) => m.proxyGroup === 'LegacyRedlinedZip')?.disparateImpact ?? 0,
    )}).`,
  );
  lines.push(
    `- Utility adjustments decrease average risk scores and widen access for applicants with strong payment histories, yet LegacyRedlinedZip still trails at a ${formatNumber(
      utility.metrics.find((m) => m.proxyGroup === 'LegacyRedlinedZip')?.disparateImpact ?? 0,
    )} disparate impact ratio, signaling the need for additional policy levers beyond credit data.`,
  );

  lines.push('');
  lines.push('## Recommendations');
  lines.push('');
  lines.push('- Adopt the utility-adjusted weighting in a controlled pilot to validate sustained fairness gains without materially increasing risk.');
  lines.push('- Expand data collection on alternative credit indicators (utility, rental payment history) to support robust scoring beyond traditional credit bureaus.');
  lines.push('- Continue monitoring approval ratios quarterly and flag any proxy group that drops below a 0.80 disparate impact ratio.');

  lines.push('');
  lines.push('_Report generated by scripts/fairnessAnalysis.ts._');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'historical_applicants.json');
  const reportPath = path.join(__dirname, '..', 'analysis', 'fairness_report.md');

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const applicants = JSON.parse(raw) as HistoricalApplicant[];

  const schemes = buildSchemes();
  const results = schemes.map((scheme) => analyzeScheme(applicants, scheme));

  const report = buildNarrative(results);
  fs.writeFileSync(reportPath, report, 'utf-8');

  console.log(`Fairness analysis complete. Report written to ${reportPath}`);
}

main();
