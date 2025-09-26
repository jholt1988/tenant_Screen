"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { defaultScreeningConfig } from '@/lib/screeningConfig';

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="block text-gray-700 mb-1">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

type EmploymentStatus = 'full-time' | 'part-time' | 'unemployed';

interface FormState {
  income: string;
  monthly_rent: string;
  debt: string;
  credit_score: string;
  rental_history: { evictions: string; late_payments: string };
  criminal_background: { has_criminal_record: boolean; type_of_crime: string };
  employment_status: EmploymentStatus;
}

export default function ScreeningCalculatorPage() {
  const [form, setForm] = useState<FormState>({
    income: '50000',
    monthly_rent: '1600',
    debt: '15000',
    credit_score: '720',
    rental_history: { evictions: '0', late_payments: '2' },
    criminal_background: { has_criminal_record: false, type_of_crime: '' },
    employment_status: 'full-time',
  });
  const [result, setResult] = useState<{ risk_score: number; decision: string } | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [audits, setAudits] = useState<any[] | null>(null);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [configForm, setConfigForm] = useState(() => toConfigForm(defaultScreeningConfig));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors(null);
    setResult(null);

    const payload: any = {
      income: Number(form.income),
      monthly_rent: Number(form.monthly_rent),
      debt: Number(form.debt),
      credit_score: Number(form.credit_score),
      rental_history: {
        evictions: Number(form.rental_history.evictions),
        late_payments: Number(form.rental_history.late_payments),
      },
      criminal_background: {
        has_criminal_record: form.criminal_background.has_criminal_record,
        type_of_crime: form.criminal_background.has_criminal_record ? form.criminal_background.type_of_crime : null,
      },
      employment_status: form.employment_status,
    };

    if (customEnabled) {
      payload.config = fromConfigForm(configForm);
    }

    try {
      const res = await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data?.errors ?? [data?.error ?? 'Something went wrong']);
      } else {
        setResult(data);
      }
    } catch (err) {
      setErrors(['Network or server error']);
    } finally {
      setSubmitting(false);
    }
  }

  async function loadAudits() {
    setLoadingAudits(true);
    try {
      const res = await fetch('/api/screening');
      const data = await res.json();
      setAudits(Array.isArray(data?.audits) ? data.audits : []);
    } catch {
      setAudits([]);
    } finally {
      setLoadingAudits(false);
    }
  }

  useEffect(() => {
    // initial load
    loadAudits();
  }, []);

  function toConfigForm(cfg: typeof defaultScreeningConfig) {
    return {
      thresholds: {
        dtiHigh: String(cfg.thresholds.dtiHigh),
        affordability: {
          rentRule: String(cfg.thresholds.affordability.rentRule),
          partialCreditRatio: String(cfg.thresholds.affordability.partialCreditRatio),
          dtiMitigation: String(cfg.thresholds.affordability.dtiMitigation),
          dtiException: String(cfg.thresholds.affordability.dtiException),
        },
        credit: {
          excellentMin: String(cfg.thresholds.credit.excellentMin),
          goodMin: String(cfg.thresholds.credit.goodMin),
        },
      },
      scoring: {
        dtiHigh: String(cfg.scoring.dtiHigh),
        affordability: {
          meetsRule: String(cfg.scoring.affordability.meetsRule),
          partialCredit: String(cfg.scoring.affordability.partialCredit),
          dtiException: String(cfg.scoring.affordability.dtiException),
          fail: String(cfg.scoring.affordability.fail),
        },
        credit: {
          excellent: String(cfg.scoring.credit.excellent),
          good: String(cfg.scoring.credit.good),
          poor: String(cfg.scoring.credit.poor),
        },
        rental: {
          evictionPoints: String(cfg.scoring.rental.evictionPoints),
          latePaymentsThreshold: String(cfg.scoring.rental.latePaymentsThreshold),
          latePaymentsPoints: String(cfg.scoring.rental.latePaymentsPoints),
        },
        criminal: { hasRecordPoints: String(cfg.scoring.criminal.hasRecordPoints) },
        employment: {
          fullTime: String(cfg.scoring.employment.fullTime),
          partTime: String(cfg.scoring.employment.partTime),
          unemployed: String(cfg.scoring.employment.unemployed),
        },
      },
      decision: {
        approvedMax: String(cfg.decision.approvedMax),
        flaggedMax: String(cfg.decision.flaggedMax),
      },
    };
  }

  function fromConfigForm(cf: ReturnType<typeof toConfigForm>) {
    return {
      thresholds: {
        dtiHigh: Number(cf.thresholds.dtiHigh),
        affordability: {
          rentRule: Number(cf.thresholds.affordability.rentRule),
          partialCreditRatio: Number(cf.thresholds.affordability.partialCreditRatio),
          dtiMitigation: Number(cf.thresholds.affordability.dtiMitigation),
          dtiException: Number(cf.thresholds.affordability.dtiException),
        },
        credit: {
          excellentMin: Number(cf.thresholds.credit.excellentMin),
          goodMin: Number(cf.thresholds.credit.goodMin),
        },
      },
      scoring: {
        dtiHigh: Number(cf.scoring.dtiHigh),
        affordability: {
          meetsRule: Number(cf.scoring.affordability.meetsRule),
          partialCredit: Number(cf.scoring.affordability.partialCredit),
          dtiException: Number(cf.scoring.affordability.dtiException),
          fail: Number(cf.scoring.affordability.fail),
        },
        credit: {
          excellent: Number(cf.scoring.credit.excellent),
          good: Number(cf.scoring.credit.good),
          poor: Number(cf.scoring.credit.poor),
        },
        rental: {
          evictionPoints: Number(cf.scoring.rental.evictionPoints),
          latePaymentsThreshold: Number(cf.scoring.rental.latePaymentsThreshold),
          latePaymentsPoints: Number(cf.scoring.rental.latePaymentsPoints),
        },
        criminal: { hasRecordPoints: Number(cf.scoring.criminal.hasRecordPoints) },
        employment: {
          fullTime: Number(cf.scoring.employment.fullTime),
          partTime: Number(cf.scoring.employment.partTime),
          unemployed: Number(cf.scoring.employment.unemployed),
        },
      },
      decision: {
        approvedMax: Number(cf.decision.approvedMax),
        flaggedMax: Number(cf.decision.flaggedMax),
      },
    };
  }

  function exportCsv() {
    if (!audits || audits.length === 0) return;
    const headers = [
      'timestamp','income','monthly_rent','debt','credit_score','evictions','late_payments','has_criminal_record','type_of_crime','employment_status','risk_score','decision'
    ];
    const rows = audits.map((a) => [
      a.timestamp,
      a.input.income,
      a.input.monthly_rent,
      a.input.debt,
      a.input.credit_score,
      a.input.rental_history?.evictions ?? '',
      a.input.rental_history?.late_payments ?? '',
      a.input.criminal_background?.has_criminal_record ?? '',
      a.input.criminal_background?.type_of_crime ?? '',
      a.input.employment_status ?? '',
      a.risk_score,
      a.decision,
    ]);
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        r
          .map((v) => String(v).replace(/"/g, '""'))
          .map((v) => `"${v}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenant-screening-audits-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadConfig() {
    const cfg = fromConfigForm(configForm);
    const json = JSON.stringify(cfg, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-screening-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onUploadClick() {
    setUploadError(null);
    fileInputRef.current?.click();
  }

  function mergePartialConfig(base: any, override: any) {
    const out = JSON.parse(JSON.stringify(base));
    if (!override || typeof override !== 'object') return out;
    const isNum = (v: any) => typeof v === 'number' && Number.isFinite(v);

    if (override.thresholds) {
      if (isNum(override.thresholds.dtiHigh)) out.thresholds.dtiHigh = override.thresholds.dtiHigh;
      if (override.thresholds.affordability) {
        const a = override.thresholds.affordability;
        if (isNum(a.rentRule)) out.thresholds.affordability.rentRule = a.rentRule;
        if (isNum(a.partialCreditRatio)) out.thresholds.affordability.partialCreditRatio = a.partialCreditRatio;
        if (isNum(a.dtiMitigation)) out.thresholds.affordability.dtiMitigation = a.dtiMitigation;
        if (isNum(a.dtiException)) out.thresholds.affordability.dtiException = a.dtiException;
      }
      if (override.thresholds.credit) {
        const c = override.thresholds.credit;
        if (isNum(c.excellentMin)) out.thresholds.credit.excellentMin = c.excellentMin;
        if (isNum(c.goodMin)) out.thresholds.credit.goodMin = c.goodMin;
      }
    }
    if (override.scoring) {
      if (isNum(override.scoring.dtiHigh)) out.scoring.dtiHigh = override.scoring.dtiHigh;
      if (override.scoring.affordability) {
        const a = override.scoring.affordability;
        if (isNum(a.meetsRule)) out.scoring.affordability.meetsRule = a.meetsRule;
        if (isNum(a.partialCredit)) out.scoring.affordability.partialCredit = a.partialCredit;
        if (isNum(a.dtiException)) out.scoring.affordability.dtiException = a.dtiException;
        if (isNum(a.fail)) out.scoring.affordability.fail = a.fail;
      }
      if (override.scoring.credit) {
        const c = override.scoring.credit;
        if (isNum(c.excellent)) out.scoring.credit.excellent = c.excellent;
        if (isNum(c.good)) out.scoring.credit.good = c.good;
        if (isNum(c.poor)) out.scoring.credit.poor = c.poor;
      }
      if (override.scoring.rental) {
        const r = override.scoring.rental;
        if (isNum(r.evictionPoints)) out.scoring.rental.evictionPoints = r.evictionPoints;
        if (isNum(r.latePaymentsThreshold)) out.scoring.rental.latePaymentsThreshold = r.latePaymentsThreshold;
        if (isNum(r.latePaymentsPoints)) out.scoring.rental.latePaymentsPoints = r.latePaymentsPoints;
      }
      if (override.scoring.criminal) {
        const cr = override.scoring.criminal;
        if (isNum(cr.hasRecordPoints)) out.scoring.criminal.hasRecordPoints = cr.hasRecordPoints;
      }
      if (override.scoring.employment) {
        const e = override.scoring.employment;
        if (isNum(e.fullTime)) out.scoring.employment.fullTime = e.fullTime;
        if (isNum(e.partTime)) out.scoring.employment.partTime = e.partTime;
        if (isNum(e.unemployed)) out.scoring.employment.unemployed = e.unemployed;
      }
    }
    if (override.decision) {
      if (isNum(override.decision.approvedMax)) out.decision.approvedMax = override.decision.approvedMax;
      if (isNum(override.decision.flaggedMax)) out.decision.flaggedMax = override.decision.flaggedMax;
    }
    return out;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const merged = mergePartialConfig(defaultScreeningConfig, parsed);
      setConfigForm(toConfigForm(merged));
      setCustomEnabled(true);
    } catch (err: any) {
      setUploadError('Invalid config JSON');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Screening Calculator</h1>
          <Link href="/screening"><Button variant="outline">Back to Screening</Button></Link>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Information</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income ($)</label>
                <input
                  type="number"
                  min={0}
                  value={form.income}
                  onChange={(e) => setForm({ ...form, income: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                <input
                  type="number"
                  min={0}
                  value={form.monthly_rent}
                  onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Debt ($)</label>
                <input
                  type="number"
                  min={0}
                  value={form.debt}
                  onChange={(e) => setForm({ ...form, debt: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                <input
                  type="number"
                  min={300}
                  max={850}
                  value={form.credit_score}
                  onChange={(e) => setForm({ ...form, credit_score: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rental History</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evictions</label>
                <input
                  type="number"
                  min={0}
                  value={form.rental_history.evictions}
                  onChange={(e) => setForm({ ...form, rental_history: { ...form.rental_history, evictions: e.target.value } })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Late Payments</label>
                <input
                  type="number"
                  min={0}
                  value={form.rental_history.late_payments}
                  onChange={(e) => setForm({ ...form, rental_history: { ...form.rental_history, late_payments: e.target.value } })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Background & Employment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.criminal_background.has_criminal_record}
                    onChange={(e) => setForm({ ...form, criminal_background: { ...form.criminal_background, has_criminal_record: e.target.checked } })}
                  />
                  Has Criminal Record
                </label>
                <input
                  type="text"
                  placeholder="Type of crime (optional)"
                  value={form.criminal_background.type_of_crime}
                  onChange={(e) => setForm({ ...form, criminal_background: { ...form.criminal_background, type_of_crime: e.target.value } })}
                  className="mt-2 w-full border rounded px-3 py-2"
                  disabled={!form.criminal_background.has_criminal_record}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.employment_status}
                  onChange={(e) => setForm({ ...form, employment_status: e.target.value as EmploymentStatus })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
            </div>
          </section>

          {errors && (
            <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3">
              <ul className="list-disc list-inside">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className="rounded border border-green-300 bg-green-50 text-green-800 p-4">
              <p className="font-medium">Risk Score: {result.risk_score}</p>
              <p className="font-medium">Decision: {result.decision}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Evaluating...' : 'Calculate Risk'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({
                  income: '50000',
                  monthly_rent: '1600',
                  debt: '15000',
                  credit_score: '720',
                  rental_history: { evictions: '0', late_payments: '2' },
                  criminal_background: { has_criminal_record: false, type_of_crime: '' },
                  employment_status: 'full-time',
                });
                setErrors(null);
                setResult(null);
              }}
            >
              Reset
            </Button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            Note: This simplified calculator is for internal decision support. Ensure usage complies with local laws
            and fair housing regulations. Do not use protected characteristics as inputs.
          </p>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <button type="button" className="w-full text-left" onClick={() => setAdvancedOpen(!advancedOpen)}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Advanced: Custom Scoring</h2>
              <span className="text-sm text-gray-500">{advancedOpen ? 'Hide' : 'Show'}</span>
            </div>
          </button>
          {advancedOpen && (
            <div className="mt-4 space-y-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={customEnabled} onChange={(e) => setCustomEnabled(e.target.checked)} />
                Enable custom scoring and thresholds
              </label>
              {customEnabled && (
                <div className="space-y-6">
                  <section>
                    <h3 className="font-medium text-gray-800 mb-2">Thresholds</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <NumberField label="DTI High" value={configForm.thresholds.dtiHigh} onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, dtiHigh: v}})} />
                      <NumberField
                        label="Income-to-Rent Full Credit"
                        value={configForm.thresholds.affordability.rentRule}
                        onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, affordability: {...configForm.thresholds.affordability, rentRule: v}}})}
                      />
                      <NumberField
                        label="Income-to-Rent Partial Credit"
                        value={configForm.thresholds.affordability.partialCreditRatio}
                        onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, affordability: {...configForm.thresholds.affordability, partialCreditRatio: v}}})}
                      />
                      <NumberField
                        label="Partial Credit Max DTI"
                        value={configForm.thresholds.affordability.dtiMitigation}
                        onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, affordability: {...configForm.thresholds.affordability, dtiMitigation: v}}})}
                      />
                      <NumberField
                        label="Alt Affordability Max DTI"
                        value={configForm.thresholds.affordability.dtiException}
                        onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, affordability: {...configForm.thresholds.affordability, dtiException: v}}})}
                      />
                      <NumberField label="Credit Excellent Min" value={configForm.thresholds.credit.excellentMin} onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, credit: {...configForm.thresholds.credit, excellentMin: v}}})} />
                      <NumberField label="Credit Good Min" value={configForm.thresholds.credit.goodMin} onChange={(v)=>setConfigForm({...configForm, thresholds: {...configForm.thresholds, credit: {...configForm.thresholds.credit, goodMin: v}}})} />
                    </div>
                  </section>
                  <section>
                    <h3 className="font-medium text-gray-800 mb-2">Scoring</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <NumberField label="DTI High Points" value={configForm.scoring.dtiHigh} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, dtiHigh: v}})} />
                      <NumberField
                        label="Affordability Meets Rule"
                        value={configForm.scoring.affordability.meetsRule}
                        onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, affordability: {...configForm.scoring.affordability, meetsRule: v}}})}
                      />
                      <NumberField
                        label="Affordability Partial Credit"
                        value={configForm.scoring.affordability.partialCredit}
                        onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, affordability: {...configForm.scoring.affordability, partialCredit: v}}})}
                      />
                      <NumberField
                        label="Affordability DTI Exception"
                        value={configForm.scoring.affordability.dtiException}
                        onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, affordability: {...configForm.scoring.affordability, dtiException: v}}})}
                      />
                      <NumberField
                        label="Affordability Fail"
                        value={configForm.scoring.affordability.fail}
                        onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, affordability: {...configForm.scoring.affordability, fail: v}}})}
                      />
                      <NumberField label="Credit Excellent Points" value={configForm.scoring.credit.excellent} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, credit: {...configForm.scoring.credit, excellent: v}}})} />
                      <NumberField label="Credit Good Points" value={configForm.scoring.credit.good} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, credit: {...configForm.scoring.credit, good: v}}})} />
                      <NumberField label="Credit Poor Points" value={configForm.scoring.credit.poor} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, credit: {...configForm.scoring.credit, poor: v}}})} />
                      <NumberField label="Eviction Points" value={configForm.scoring.rental.evictionPoints} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, rental: {...configForm.scoring.rental, evictionPoints: v}}})} />
                      <NumberField label="Late Pmts Threshold" value={configForm.scoring.rental.latePaymentsThreshold} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, rental: {...configForm.scoring.rental, latePaymentsThreshold: v}}})} />
                      <NumberField label="Late Pmts Points" value={configForm.scoring.rental.latePaymentsPoints} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, rental: {...configForm.scoring.rental, latePaymentsPoints: v}}})} />
                      <NumberField label="Criminal Record Points" value={configForm.scoring.criminal.hasRecordPoints} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, criminal: {...configForm.scoring.criminal, hasRecordPoints: v}}})} />
                      <NumberField label="Employment Full-time" value={configForm.scoring.employment.fullTime} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, employment: {...configForm.scoring.employment, fullTime: v}}})} />
                      <NumberField label="Employment Part-time" value={configForm.scoring.employment.partTime} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, employment: {...configForm.scoring.employment, partTime: v}}})} />
                      <NumberField label="Employment Unemployed" value={configForm.scoring.employment.unemployed} onChange={(v)=>setConfigForm({...configForm, scoring: {...configForm.scoring, employment: {...configForm.scoring.employment, unemployed: v}}})} />
                    </div>
                  </section>
                  <section>
                    <h3 className="font-medium text-gray-800 mb-2">Decision Thresholds</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <NumberField label="Approved Max" value={configForm.decision.approvedMax} onChange={(v)=>setConfigForm({...configForm, decision: {...configForm.decision, approvedMax: v}})} />
                      <NumberField label="Flagged Max" value={configForm.decision.flaggedMax} onChange={(v)=>setConfigForm({...configForm, decision: {...configForm.decision, flaggedMax: v}})} />
                    </div>
                  </section>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button type="button" variant="outline" onClick={()=>setConfigForm(toConfigForm(defaultScreeningConfig))}>Reset to Defaults</Button>
                    <Button type="button" variant="outline" onClick={downloadConfig}>Download Config JSON</Button>
                    <Button type="button" variant="outline" onClick={onUploadClick}>Upload Config JSON</Button>
                    <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={onFileChange} />
                    {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Recent Evaluations</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadAudits}>
                {loadingAudits ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={!audits || audits.length===0}>
                Export CSV
              </Button>
            </div>
          </div>
          {audits && audits.length === 0 && (
            <p className="text-gray-500">No evaluations yet.</p>
          )}
          {audits && audits.length > 0 && (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {audits!.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${'{'}a.input.income{'}'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${'{'}a.input.monthly_rent{'}'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${'{'}a.input.debt{'}'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${'{'}a.input.credit_score{'}'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{a.risk_score}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <span
                          className={
                            a.decision === 'Approved'
                              ? 'inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700'
                              : a.decision === 'Flagged for Review'
                              ? 'inline-flex px-2 py-1 rounded-full bg-yellow-100 text-yellow-700'
                              : 'inline-flex px-2 py-1 rounded-full bg-red-100 text-red-700'
                          }
                        >
                          {a.decision}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
