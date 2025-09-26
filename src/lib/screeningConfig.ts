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
      evictionPoints: number;
      latePaymentsThreshold: number;
      latePaymentsPoints: number;
    };
    criminal: {
      cleanRecordPoints: number;
      staleRecordPoints: number;
      recentMisdemeanorPoints: number;
      recentFelonyPoints: number;
      recentViolentFelonyPoints: number;
    };
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
    rental: { evictionPoints: 3, latePaymentsThreshold: 3, latePaymentsPoints: 2 },
    criminal: {
      cleanRecordPoints: 0,
      staleRecordPoints: 1,
      recentMisdemeanorPoints: 2,
      recentFelonyPoints: 3,
      recentViolentFelonyPoints: 4,
    },
    employment: { fullTime: 0, partTime: 1, unemployed: 2 },
  },
  decision: {
    approvedMax: 3,
    flaggedMax: 6,
  },
};

