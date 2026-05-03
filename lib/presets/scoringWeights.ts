import type { ScoringWeights } from "./types";

export const SCORING_WEIGHTS: ScoringWeights = {
  business: { value: 0.3 },
  weakness: { value: 0.25 },
  opportunity: { value: 0.3 },
  outreach: { value: 0.15 },
  thresholds: { hot: 80, warm: 60, low: 0 },
};

export const QA_RUBRIC = {
  premiumVisual: 20,
  leadConversion: 20,
  trustCredibility: 15,
  nicheFit: 15,
  mobileExperience: 10,
  performancePracticality: 10,
  demoDifference: 10,
} as const;

export const QA_HARD_PASS = {
  total: 80,
  premiumVisual: 15,
  leadConversion: 15,
  mobile: 7,
  demoDifference: 7,
} as const;
