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
    rental?: {
      evictionLookbackYears: number; // horizon for applying time decay to filings
    };
    criminal: {
      violentFelonyLookbackYears: number;
      felonyLookbackYears: number;
      misdemeanorLookbackYears: number;
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
      excellentReferenceOffset: number;
      satisfactoryReferenceOffset: number;
      concernReferencePoints: number;
    };
    criminal: {
      cleanRecordPoints: number;
      staleRecordPoints: number;
      recentMisdemeanorPoints: number;
      recentFelonyPoints: number;
      recentViolentFelonyPoints: number;
    };
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
    rental: {
      evictionLookbackYears: 5,
    },
    criminal: {
      violentFelonyLookbackYears: 10,
      felonyLookbackYears: 7,
      misdemeanorLookbackYears: 3,
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
      excellentReferenceOffset: -1.25,
      satisfactoryReferenceOffset: -0.5,
      concernReferencePoints: 1.25,
    },
    criminal: {
      cleanRecordPoints: 0,
      staleRecordPoints: 0.5,
      recentMisdemeanorPoints: 1.5,
      recentFelonyPoints: 3,
      recentViolentFelonyPoints: 4,
    },
    employment: { fullTime: 0, partTime: 1, unemployed: 2 },
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
