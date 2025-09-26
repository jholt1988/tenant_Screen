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
    alternativeData?: {
      utility: {
        strong: number;
        moderate: number;
        weak: number;
      };
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
      excellentReferenceOffset: number;
      satisfactoryReferenceOffset: number;
      concernReferencePoints: number;
    };
    criminal: { hasRecordPoints: number };
    employment: { fullTime: number; partTime: number; unemployed: number };
    alternativeData?: {
      utilityStrongOffset: number;
      utilityModerateOffset: number;
      utilityWeakPoints: number;
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
    credit: { excellentMin: 750, goodMin: 665 },
    alternativeData: {
      utility: {
        strong: 0.9,
        moderate: 0.8,
        weak: 0.65,
      },
    },
  },
  scoring: {
    dtiHigh: 1.5,
    affordability: { meetsRule: 0, partialCredit: 0.75, dtiException: 1.75, fail: 3.5 },
    credit: { excellent: 0, good: 0.75, poor: 1.75 },
    rental: {
      evictionPoints: 3,
      latePaymentsThreshold: 3,
      latePaymentsPoints: 1.5,
      excellentReferenceOffset: -1.25,
      satisfactoryReferenceOffset: -0.5,
      concernReferencePoints: 1.25,
    },
    criminal: { hasRecordPoints: 3 },
    employment: { fullTime: 0, partTime: 0.75, unemployed: 1.75 },
    alternativeData: {
      utilityStrongOffset: -1.25,
      utilityModerateOffset: -0.75,
      utilityWeakPoints: 0.75,
    },
  },
  decision: {
    approvedMax: 2.75,
    flaggedMax: 5.5,
  },
};

