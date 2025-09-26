export interface ScreeningConfig {
  thresholds: {
    dtiHigh: number; // ratio above which DTI adds points
    affordability: {
      rentRule: number; // minimum income-to-rent ratio for full credit
      partialCreditRatio: number; // ratio where partial credit can be applied
      dtiMitigation: number; // maximum DTI to earn partial credit
      dtiException: number; // maximum DTI for alternative affordability consideration
    };
    credit: {
      excellentMin: number; // inclusive
      goodMin: number; // inclusive
    };
    rental?: {
      evictionLookbackYears: number; // horizon for applying time decay to filings
    };
  };
  scoring: {
    dtiHigh: number; // points when DTI exceeds thresholds.dtiHigh
    affordability: {
      meetsRule: number;
      partialCredit: number;
      dtiException: number;
      fail: number;
    };
    credit: { excellent: number; good: number; poor: number };
    rental: {
      evictionPoints: number; // fallback penalty per eviction when detailed filings absent
      evictionOutcomePoints?: {
        filing: number; // base penalty when only a filing is known
        dismissed: number; // penalty when the case was dismissed
        settled: number; // penalty when settled without judgment
        judgment: number; // penalty when eviction judgment granted
      };
      evictionTimeDecayFloor?: number; // minimum multiplier applied after time decay
      latePaymentsThreshold: number;
      latePaymentsPoints: number;
    };
    criminal: { hasRecordPoints: number };
    employment: { fullTime: number; partTime: number; unemployed: number };
  };
  decision: {
    approvedMax: number; // <= approvedMax => Approved
    flaggedMax: number; // <= flaggedMax => Flagged, else Denied
  };
}

export const defaultScreeningConfig: ScreeningConfig = {
  thresholds: {
    dtiHigh: 0.4,
    affordability: {
      rentRule: 3,
      partialCreditRatio: 2.5,
      dtiMitigation: 0.36,
      dtiException: 0.3,
    },
    credit: { excellentMin: 750, goodMin: 650 },
    rental: {
      evictionLookbackYears: 5,
    },
  },
  scoring: {
    dtiHigh: 2,
    affordability: { meetsRule: 0, partialCredit: 1, dtiException: 2, fail: 4 },
    credit: { excellent: 0, good: 1, poor: 2 },
    rental: {
      evictionPoints: 3,
      evictionOutcomePoints: {
        filing: 1,
        dismissed: 0.5,
        settled: 2,
        judgment: 3.5,
      },
      evictionTimeDecayFloor: 0.25,
      latePaymentsThreshold: 3,
      latePaymentsPoints: 2,
    },
    criminal: { hasRecordPoints: 3 },
    employment: { fullTime: 0, partTime: 1, unemployed: 2 },
  },
  decision: {
    approvedMax: 3,
    flaggedMax: 6,
  },
};

