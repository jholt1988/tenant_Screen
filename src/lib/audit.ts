import type { TenantData, Decision } from './screening';
import type { AdverseActionNotice } from './adverseActionNotice';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  input: TenantData;
  risk_score: number;
  decision: Decision;
  notice?: AdverseActionNotice | null;
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

