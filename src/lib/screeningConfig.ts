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
      evictionPoints: number;
      latePaymentsThreshold: number;
      latePaymentsPoints: number;
    };
    criminal: { hasRecordPoints: number };
    employment: { fullTime: number; partTime: number; unemployed: number };
    qualitative: {
      landlord: {
        strong: number;
        positive: number;
        neutral: number;
        concern: number;
        unverifiedPenalty: number;
        missing: number;
      };
      paymentHistory: {
        excellentMin: number;
        goodMin: number;
        fairMin: number;
        excellent: number;
        good: number;
        fair: number;
        poor: number;
        missing: number;
      };
    };
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
  },
  scoring: {
    dtiHigh: 2,
    affordability: { meetsRule: 0, partialCredit: 1, dtiException: 2, fail: 4 },
    credit: { excellent: 0, good: 1, poor: 2 },
    rental: { evictionPoints: 3, latePaymentsThreshold: 3, latePaymentsPoints: 2 },
    criminal: { hasRecordPoints: 3 },
    employment: { fullTime: 0, partTime: 1, unemployed: 2 },
    qualitative: {
      landlord: {
        strong: 0,
        positive: 0.5,
        neutral: 1,
        concern: 3,
        unverifiedPenalty: 0.5,
        missing: 1.5,
      },
      paymentHistory: {
        excellentMin: 0.95,
        goodMin: 0.85,
        fairMin: 0.7,
        excellent: 0,
        good: 0.5,
        fair: 1.5,
        poor: 3,
        missing: 1.5,
      },
    },
  },
  decision: {
    approvedMax: 5.5,
    flaggedMax: 5.75,
  },
};

