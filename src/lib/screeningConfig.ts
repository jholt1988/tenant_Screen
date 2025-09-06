export interface ScreeningConfig {
  thresholds: {
    dtiHigh: number; // ratio above which DTI adds points
    credit: {
      excellentMin: number; // inclusive
      goodMin: number; // inclusive
    };
  };
  scoring: {
    dtiHigh: number; // points when DTI exceeds thresholds.dtiHigh
    credit: { excellent: number; good: number; poor: number };
    rental: {
      evictionPoints: number;
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
    credit: { excellentMin: 750, goodMin: 650 },
  },
  scoring: {
    dtiHigh: 2,
    credit: { excellent: 0, good: 1, poor: 2 },
    rental: { evictionPoints: 3, latePaymentsThreshold: 3, latePaymentsPoints: 2 },
    criminal: { hasRecordPoints: 3 },
    employment: { fullTime: 0, partTime: 1, unemployed: 2 },
  },
  decision: {
    approvedMax: 3,
    flaggedMax: 6,
  },
};

