/** Intra-Niche Differentiation Engine — types only. */

export type BuyerIntent =
  | "urgent"
  | "aspirational"
  | "routine"
  | "high-trust"
  | "price-sensitive"
  | "comparison-shopping"
  | "education-first"
  | "maintenance/prevention"
  | "transformation-focused";

export type BrandPosition =
  | "premium/luxury"
  | "local-friendly"
  | "clinical-expert"
  | "comfort-first"
  | "fast-response"
  | "transformation-focused"
  | "technical-authority"
  | "family-safe"
  | "practical-budget"
  | "craftsmanship-led"
  | "eco/efficiency-focused";

export type PricePoint = "budget" | "mid-market" | "premium" | "luxury" | "unknown";

export type BusinessMaturity =
  | "solo_operator"
  | "small_local"
  | "established_local"
  | "premium_authority"
  | "multi_location"
  | "unknown";

export interface CompetitivePositioning {
  competitorPattern: string;
  howThisDemoShouldFeelDifferent: string;
  overusedNicheClichesToAvoid: string[];
  uniqueAngle: string;
  marketGap: string;
  positioningRisk: string;
}

export interface AssetStrategy {
  assetQuality: "none" | "weak" | "decent" | "strong";
  assetTypesAvailable: string[];
  visualApproach: "real_photo_led" | "hybrid_photo_cinematic" | "abstract_cinematic" | "proof_card_led";
  proofPlacement: string;
  assetRisks: string[];
  recommendedAssetRequests: string[];
}

export interface IntraNicheStrategy {
  parentNiche: string;
  subNiche: string;
  primaryServiceFocus: string;
  secondaryServiceFocuses: string[];
  buyerIntent: BuyerIntent;
  urgencyLevel: string;
  pricePoint: PricePoint;
  trustBarrier: string;
  brandPosition: BrandPosition;
  proofTypeNeeded: string;
  offerType: string;
  funnelStyle: string;
  visualMetaphor: string;
  flowArchetype: string;
  ctaStrategy: string;
  sectionsToPrioritize: string[];
  sectionsToAvoid: string[];
  copyTone: string;
  visualTone: string;
  conversionAngle: string;
  differentiationRationale: string;
  assumptions: string[];
  confidence: number;
  competitivePositioning: CompetitivePositioning;
  businessMaturity: BusinessMaturity;
  assetStrategy: AssetStrategy;
}

export interface SameNicheDesignFingerprint {
  parentNiche: string;
  subNiche: string;
  flowArchetype: string;
  sectionOrderHash: string;
  heroComposition: string;
  visualMetaphor: string;
  sceneType: string;
  cameraPreset: string;
  lightingPreset: string;
  ctaPattern: string;
  trustPattern: string;
  proofType: string;
  offerType: string;
  copyTone: string;
  assetApproach: string;
}

export interface IntraNicheDifferentiationMeta {
  intraNicheDifferentiationScore: number;
  blocksApproval: boolean;
  warnings: string[];
  lastGradedAt?: string;
  /** Rubric weights from grader (optional on older stored configs). */
  breakdown?: Record<string, number>;
}
