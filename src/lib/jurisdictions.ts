import type { ScreeningConfig } from './screeningConfig';

export type JurisdictionId =
  | 'us-ca'
  | 'us-nyc'
  | 'us-il-cook'
  | 'us-wa-seattle'
  | 'us-or-portland';

export interface RegulationReference {
  title: string;
  citation: string;
  url: string;
}

export interface CreditRestriction {
  allowed: boolean;
  stage?: 'post-offer';
  requiresAlternativeEvidence?: boolean;
  notes: string;
}

export interface IncomeRestriction {
  maxRentMultiple?: number;
  portableScreeningAccepted?: boolean;
  requiresAlternativeEvidence?: boolean;
  notes: string;
}

export interface CriminalRestriction {
  allowed: boolean;
  stage?: 'post-offer';
  lookbackYears?: number;
  disallowedCategories?: string[];
  notes: string;
}

export interface JurisdictionRestrictions {
  credit?: CreditRestriction;
  income?: IncomeRestriction;
  criminal?: CriminalRestriction;
}

export interface JurisdictionPolicy {
  id: JurisdictionId;
  name: string;
  markets: string[];
  summary: string;
  restrictions: JurisdictionRestrictions;
  references: RegulationReference[];
}

export const jurisdictionPolicies: Record<JurisdictionId, JurisdictionPolicy> = {
  'us-ca': {
    id: 'us-ca',
    name: 'California Statewide',
    markets: ['Los Angeles', 'San Francisco', 'San Diego'],
    summary:
      'Statewide baseline that limits the use of credit history for voucher holders and requires acceptance of portable screening reports.',
    restrictions: {
      credit: {
        allowed: true,
        requiresAlternativeEvidence: true,
        notes:
          'SB 267 (2023) requires housing providers to offer applicants using Housing Choice Vouchers a chance to present alternative evidence of creditworthiness before denying based on credit history.',
      },
      income: {
        requiresAlternativeEvidence: true,
        portableScreeningAccepted: true,
        notes:
          'Civil Code §1950.6 and SB 267 require landlords to accept reusable screening reports when offered and to evaluate voucher holders using alternative documentation instead of strict income multiples.',
      },
      criminal: {
        allowed: true,
        notes:
          'California places fewer statewide limits on criminal screening but defers to local ordinances; adverse action notices are still required under the ICRAA.',
      },
    },
    references: [
      {
        title: 'SB 267 (2023)',
        citation: 'Cal. Civ. Code § 1950.6 & Gov. Code § 12955',
        url: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB267',
      },
      {
        title: 'Tenant Screening Fee Act',
        citation: 'Cal. Civ. Code § 1950.6',
        url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.6',
      },
    ],
  },
  'us-nyc': {
    id: 'us-nyc',
    name: 'New York City, NY',
    markets: ['New York City'],
    summary:
      'Implements the Fair Chance for Housing Act by deferring criminal history reviews until after a conditional offer and banning consideration of sealed or vacated records.',
    restrictions: {
      credit: {
        allowed: true,
        requiresAlternativeEvidence: true,
        notes:
          'The NYC Human Rights Law bars discrimination based on lawful source of income, so providers must offer non-credit alternatives when applicants rely on subsidies.',
      },
      income: {
        maxRentMultiple: 2.5,
        notes:
          'The NYC Commission on Human Rights treats high income-multiple requirements as discriminatory for voucher holders; guidance recommends capping at roughly 2.5× rent for subsidized applicants.',
      },
      criminal: {
        allowed: false,
        stage: 'post-offer',
        disallowedCategories: ['sealed records', 'non-convictions', 'adjournments in contemplation of dismissal'],
        notes:
          'Local Law 24 of 2023 (Fair Chance for Housing Act) prohibits criminal history inquiries until after a conditional offer and forbids consideration of sealed, pardoned, or vacated cases.',
      },
    },
    references: [
      {
        title: 'Fair Chance for Housing Act Guidance',
        citation: 'NYC Local Law 24 (2023)',
        url: 'https://www.nyc.gov/site/cchr/media/fair-chance-for-housing.page',
      },
      {
        title: 'NYC Human Rights Law – Source of Income Protection',
        citation: 'N.Y.C. Admin. Code § 8-107(5)(a)(1)',
        url: 'https://www1.nyc.gov/assets/cchr/downloads/pdf/publications/fairhousingbrochure.pdf',
      },
    ],
  },
  'us-il-cook': {
    id: 'us-il-cook',
    name: 'Cook County, IL',
    markets: ['Chicago', 'Cook County Suburbs'],
    summary:
      'Applies the Just Housing Amendment: criminal screens require a prequalification step and may only consider convictions from the past three years.',
    restrictions: {
      credit: {
        allowed: true,
        notes:
          'Credit checks remain permitted but must be weighed with individualized assessment when paired with criminal history findings.',
      },
      income: {
        notes:
          'No county-wide cap on income multiples, but housing providers must consider reasonable accommodations for subsidies.',
      },
      criminal: {
        allowed: true,
        stage: 'post-offer',
        lookbackYears: 3,
        disallowedCategories: ['arrests', 'sealed or expunged records'],
        notes:
          'The Just Housing Amendment mandates a two-step process: prequalification before any criminal inquiry, and only convictions within the last three years can be weighed after an individualized assessment.',
      },
    },
    references: [
      {
        title: 'Cook County Just Housing Amendment',
        citation: 'Cook County Code of Ordinances § 42-38',
        url: 'https://www.cookcountyil.gov/service/just-housing-ordinance',
      },
      {
        title: 'Cook County Commission on Human Rights Regulations',
        citation: 'Adopted Rules (2020)',
        url: 'https://www.cookcountyil.gov/sites/g/files/ywwepo161/files/service/just_housing_amendment_rules_final.pdf',
      },
    ],
  },
  'us-wa-seattle': {
    id: 'us-wa-seattle',
    name: 'Seattle, WA',
    markets: ['Seattle'],
    summary:
      'Seattle’s Fair Chance Housing Ordinance bans nearly all use of criminal history in tenant screening and limits credit screening to risk-based adverse action notices.',
    restrictions: {
      credit: {
        allowed: true,
        notes:
          'Providers must follow adverse action notice requirements and cannot use credit as a proxy for criminal history or source-of-income discrimination.',
      },
      income: {
        maxRentMultiple: 2.5,
        notes:
          'Seattle Office for Civil Rights recommends capping income requirements at 2.5× rent to comply with source-of-income protections for voucher holders.',
      },
      criminal: {
        allowed: false,
        disallowedCategories: ['all arrests', 'all convictions except sex offender registry exceptions'],
        notes:
          'SMC 14.09 largely prohibits asking about or using criminal history information, with limited exceptions for adult sex offender registry checks when the housing qualifies.',
      },
    },
    references: [
      {
        title: 'Seattle Fair Chance Housing Ordinance',
        citation: 'Seattle Municipal Code 14.09',
        url: 'https://seattle.gov/civilrights/fair-housing/fair-chance-housing',
      },
      {
        title: 'Fair Chance Housing FAQ',
        citation: 'Seattle Office for Civil Rights (2021)',
        url: 'https://seattle.gov/documents/Departments/CivilRights/FairHousing/FCH%20FAQ.pdf',
      },
    ],
  },
  'us-or-portland': {
    id: 'us-or-portland',
    name: 'Portland, OR',
    markets: ['Portland'],
    summary:
      'The FAIR Ordinance establishes low-barrier screening criteria with caps on income multiples and limits on credit and criminal record usage.',
    restrictions: {
      credit: {
        allowed: true,
        requiresAlternativeEvidence: true,
        notes:
          'Portland’s FAIR rules require landlords to accept alternative evidence of creditworthiness and prohibit denial solely for credit scores above 500 when using low-barrier screening.',
      },
      income: {
        maxRentMultiple: 2.5,
        notes: 'Low-barrier screening caps minimum income at 2.5× the rent except for rental assistance recipients.',
      },
      criminal: {
        allowed: true,
        lookbackYears: 7,
        disallowedCategories: ['arrests not leading to conviction', 'expunged convictions'],
        notes:
          'Criminal screening must ignore arrests, expunged or vacated cases, and convictions older than seven years unless an individualized assessment is completed.',
      },
    },
    references: [
      {
        title: 'Fair Access in Renting (FAIR) Ordinance',
        citation: 'Portland City Code 30.01.086',
        url: 'https://www.portland.gov/phb/rental-services/fair-access-renting',
      },
      {
        title: 'Administrative Rules for FAIR Ordinance',
        citation: 'Portland Housing Bureau (2020)',
        url: 'https://www.portland.gov/sites/default/files/2020-02/fair-administrative-rules.pdf',
      },
    ],
  },
};

export function listJurisdictionPolicies(): JurisdictionPolicy[] {
  return Object.values(jurisdictionPolicies);
}

export function getJurisdictionPolicy(id: JurisdictionId | string | undefined): JurisdictionPolicy | undefined {
  if (!id) return undefined;
  return jurisdictionPolicies[id as JurisdictionId];
}

export interface ComplianceAdjustment {
  criteria: 'credit' | 'income' | 'criminal';
  description: string;
}

export interface ComplianceApplicationResult {
  config: ScreeningConfig;
  adjustments: ComplianceAdjustment[];
  warnings: string[];
}

function cloneConfig(config: ScreeningConfig): ScreeningConfig {
  return JSON.parse(JSON.stringify(config));
}

export function applyJurisdictionPolicy(
  config: ScreeningConfig,
  policy: JurisdictionPolicy,
): ComplianceApplicationResult {
  const adjusted = cloneConfig(config);
  const adjustments: ComplianceAdjustment[] = [];
  const warnings: string[] = [];

  const { credit, income, criminal } = policy.restrictions;

  if (credit) {
    if (!credit.allowed || credit.stage === 'post-offer') {
      if (
        adjusted.scoring.credit.excellent !== 0 ||
        adjusted.scoring.credit.good !== 0 ||
        adjusted.scoring.credit.poor !== 0
      ) {
        adjustments.push({
          criteria: 'credit',
          description: `${policy.name}: credit scoring disabled because screening is ${credit.allowed ? 'restricted to post-offer' : 'not permitted'} pre-offer.`,
        });
      }
      adjusted.scoring.credit.excellent = 0;
      adjusted.scoring.credit.good = 0;
      adjusted.scoring.credit.poor = 0;
    } else if (credit.requiresAlternativeEvidence) {
      warnings.push(
        `${policy.name}: credit review must accept alternative evidence when applicants use subsidies or portable reports.`,
      );
    }
  }

  if (income) {
    if (typeof income.maxRentMultiple === 'number' && income.maxRentMultiple > 0) {
      if (adjusted.thresholds.affordability.rentRule > income.maxRentMultiple) {
        adjustments.push({
          criteria: 'income',
          description: `${policy.name}: income-to-rent threshold reduced to ${income.maxRentMultiple}× rent per local rules.`,
        });
        adjusted.thresholds.affordability.rentRule = income.maxRentMultiple;
      }
      if (adjusted.thresholds.affordability.partialCreditRatio > income.maxRentMultiple) {
        adjusted.thresholds.affordability.partialCreditRatio = income.maxRentMultiple;
      }
    }
    if (income.requiresAlternativeEvidence) {
      warnings.push(
        `${policy.name}: staff must accept alternative income or credit documentation when applicants present vouchers or reusable reports.`,
      );
    }
    if (income.portableScreeningAccepted) {
      warnings.push(
        `${policy.name}: reusable screening reports must be accepted instead of running new credit pulls when they meet statutory requirements.`,
      );
    }
  }

  if (criminal) {
    if (!criminal.allowed || criminal.stage === 'post-offer') {
      if (adjusted.scoring.criminal.cleanRecordPoints !== 0 || 
          adjusted.scoring.criminal.staleRecordPoints !== 0 ||
          adjusted.scoring.criminal.recentMisdemeanorPoints !== 0 ||
          adjusted.scoring.criminal.recentFelonyPoints !== 0 ||
          adjusted.scoring.criminal.recentViolentFelonyPoints !== 0) {
        adjustments.push({
          criteria: 'criminal',
          description: `${policy.name}: criminal history scoring removed because checks are ${criminal.allowed ? 'limited to post-offer reviews' : 'not allowed'} at application.`,
        });
      }
      adjusted.scoring.criminal.cleanRecordPoints = 0;
      adjusted.scoring.criminal.staleRecordPoints = 0;
      adjusted.scoring.criminal.recentMisdemeanorPoints = 0;
      adjusted.scoring.criminal.recentFelonyPoints = 0;
      adjusted.scoring.criminal.recentViolentFelonyPoints = 0;
    }
    if (criminal.lookbackYears && criminal.allowed) {
      warnings.push(
        `${policy.name}: only convictions from the past ${criminal.lookbackYears} years may be considered and individualized assessments are required.`,
      );
    }
    if (criminal.disallowedCategories?.length) {
      warnings.push(
        `${policy.name}: criminal reviews must ignore ${criminal.disallowedCategories.join(', ')}.`,
      );
    }
  }

  return { config: adjusted, adjustments, warnings };
}

