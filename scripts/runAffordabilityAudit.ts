import { simulateAffordabilityPolicies } from '../src/lib/affordabilityAudit';

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function logPolicy(label: string, policy: ReturnType<typeof simulateAffordabilityPolicies>['strict']) {
  console.log(`\n=== ${label} ===`);
  console.log(`Overall approval rate: ${pct(policy.totals.approvalRate)} (denials: ${pct(policy.totals.denialRate)})`);
  console.log(`Approval rate spread across neighborhoods: ${pct(policy.approvalRateRange)}`);
  console.log('Group breakdown:');
  for (const [group, summary] of Object.entries(policy.groups)) {
    console.log(
      `  ${group}: approvals ${summary.approved}/${summary.total} (${pct(summary.approvalRate)}), denials ${pct(summary.denialRate)}`,
    );
  }
}

const results = simulateAffordabilityPolicies();

console.log('Income verification policy audit using applicant proxy data');
logPolicy(results.strict.label, results.strict);
logPolicy(results.tiered.label, results.tiered);

const neighborhoods = new Set([...Object.keys(results.strict.groups), ...Object.keys(results.tiered.groups)]);

console.log('\nImpact by neighborhood when moving from strict rule to tiered scoring:');
for (const neighborhood of Array.from(neighborhoods)) {
  const strictGroup = results.strict.groups[neighborhood];
  const tieredGroup = results.tiered.groups[neighborhood];
  if (strictGroup && tieredGroup) {
    const approvalDelta = tieredGroup.approvalRate - strictGroup.approvalRate;
    const denialDelta = tieredGroup.denialRate - strictGroup.denialRate;
    console.log(
      `  ${neighborhood}: approval change ${pct(approvalDelta)}, denial change ${pct(denialDelta)}`,
    );
  }
}

const disparityChange = results.strict.approvalRateRange - results.tiered.approvalRateRange;
console.log(`\nApproval rate disparity reduction: ${pct(disparityChange)}`);
