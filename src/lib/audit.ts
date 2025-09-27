
import type { TenantData, Decision, ComplianceSummary } from './screening';
import type { AdverseActionNotice } from './adverseActionNotice';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  input: TenantData;

  risk_score: number;
  decision: Decision;

  compliance?: ComplianceSummary;

  notice?: AdverseActionNotice | null;

  result: {
    risk_score: number; 
    decision: Decision; 
    compliance?: ComplianceSummary;
    breakdown?: any[];
    adverse_actions?: any[];
  };

}

const MAX = 50;
const audits: AuditEntry[] = [];

export function logAudit(entry: AuditEntry) {
  audits.unshift(entry);
  if (audits.length > MAX) audits.length = MAX;
}

export function getAudits(): AuditEntry[] {
  return audits;
}

