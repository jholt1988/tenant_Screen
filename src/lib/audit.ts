import type { TenantData, TenantScreeningResult } from './screening';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  input: TenantData;
  result: TenantScreeningResult;
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

