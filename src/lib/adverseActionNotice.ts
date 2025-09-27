import type { Decision, TenantData } from './screening';

export type AdverseActionNoticeType = 'pre-adverse' | 'adverse';

export interface NoticeDataSource {
  name: string;
  description: string;
  disputeRoute: string;
}

export interface DisputeRight {
  title: string;
  detail: string;
}

export interface NoticeContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface AdverseActionNotice {
  type: AdverseActionNoticeType;
  headline: string;
  summary: string;
  decision: Decision;
  waitingPeriodDays: number;
  dataSources: NoticeDataSource[];
  disputeRights: DisputeRight[];
  contact: NoticeContactInfo;
}

function buildDataSources(data: TenantData): NoticeDataSource[] {
  const sources: NoticeDataSource[] = [
    {
      name: 'National Credit Bureau Feed',
      description: `Credit score ${data.credit_score} and tradeline payment history received from our integrated consumer reporting agency on the evaluation date.`,
      disputeRoute: 'Contact the credit bureau listed on the pre-adverse notice or email compliance@tenant-screen.com to initiate a bureau dispute.',
    },
    {
      name: 'Rental Reference Repository',
      description: `${data.rental_history.evictions} eviction(s) and ${data.rental_history.late_payments} reported late payment(s) supplied by prior landlord references.`,
      disputeRoute: 'Provide written documentation from the prior landlord or court records to dispute reported rental history.',
    },
    {
      name: 'Criminal Records Scan',
      description: data.criminal_background.has_criminal_record
        ? `Criminal record flag for "${data.criminal_background.type_of_crime ?? 'unspecified offense'}" returned by multi-jurisdiction search.`
        : 'No disqualifying criminal records were located, but the database search vendor was queried.',
      disputeRoute: 'Submit court disposition documents or expungement orders to challenge criminal record matches.',
    },
    {
      name: 'Employment & Income Verification',
      description: `Employment status reported as ${data.employment_status.replace('-', ' ')} with stated annual income of $${data.income.toLocaleString()} and monthly rent obligation of $${data.monthly_rent.toLocaleString()}.`,
      disputeRoute: 'Provide recent pay stubs, W-2/1099 forms, or employer letters to update income and employment information.',
    },
  ];

  return sources;
}

function buildDisputeRights(type: AdverseActionNoticeType): DisputeRight[] {
  const rights: DisputeRight[] = [
    {
      title: 'Request a copy of your screening report',
      detail:
        'You may obtain a free copy of the consumer report(s) relied upon within 60 days. Submit your request to our compliance team or directly to the listed data sources.',
    },
    {
      title: 'Dispute inaccurate or incomplete information',
      detail:
        'If you believe any item is inaccurate or incomplete, notify us with supporting documentation. We will forward disputes to the relevant data furnisher and pause final decisions during reinvestigation.',
    },
    {
      title: 'Reinvestigation timeline',
      detail:
        type === 'pre-adverse'
          ? 'Upon receiving a dispute we will reinvestigate and respond with results within 30 days before issuing any final adverse action.'
          : 'We will reopen the application and reinvestigate within 30 days of receiving your dispute. Any corrected information will trigger an updated eligibility review.',
    },
  ];

  return rights;
}

export function generateAdverseActionNotice(
  decision: Decision,
  data: TenantData,
): AdverseActionNotice | null {
  if (decision === 'Approved') return null;

  const type: AdverseActionNoticeType = decision === 'Denied' ? 'adverse' : 'pre-adverse';
  const waitingPeriodDays = type === 'pre-adverse' ? 5 : 0;

  const headline =
    type === 'pre-adverse'
      ? 'Pre-Adverse Action Notice: Screening Results Pending'
      : 'Adverse Action Notice: Application Denied';

  const summary =
    type === 'pre-adverse'
      ? 'We identified potential issues in your tenant screening results. No final decision has been made. Please review the data sources below and exercise your dispute rights within the waiting period before adverse action is taken.'
      : 'Your tenant screening results led to a denial of the application. Review the data sources that contributed to this decision and contact us immediately if you need to dispute any item.';

  return {
    type,
    headline,
    summary,
    decision,
    waitingPeriodDays,
    dataSources: buildDataSources(data),
    disputeRights: buildDisputeRights(type),
    contact: {
      email: 'compliance@tenant-screen.com',
      phone: '(800) 555-0199',
      address: 'Tenant Screen Compliance Team, 450 Market Street, Suite 900, San Francisco, CA 94105',
    },
  };
}
