import { z } from "zod";

export const CompetitivePositioningSchema = z.object({
  competitorPattern: z.string(),
  howThisDemoShouldFeelDifferent: z.string(),
  overusedNicheClichesToAvoid: z.array(z.string()),
  uniqueAngle: z.string(),
  marketGap: z.string(),
  positioningRisk: z.string(),
});

export const AssetStrategySchema = z.object({
  assetQuality: z.enum(["none", "weak", "decent", "strong"]),
  assetTypesAvailable: z.array(z.string()),
  visualApproach: z.enum([
    "real_photo_led",
    "hybrid_photo_cinematic",
    "abstract_cinematic",
    "proof_card_led",
  ]),
  proofPlacement: z.string(),
  assetRisks: z.array(z.string()),
  recommendedAssetRequests: z.array(z.string()),
});

export const IntraNicheStrategySchema = z.object({
  parentNiche: z.string(),
  subNiche: z.string(),
  primaryServiceFocus: z.string(),
  secondaryServiceFocuses: z.array(z.string()),
  buyerIntent: z.string(),
  urgencyLevel: z.string(),
  pricePoint: z.string(),
  trustBarrier: z.string(),
  brandPosition: z.string(),
  proofTypeNeeded: z.string(),
  offerType: z.string(),
  funnelStyle: z.string(),
  visualMetaphor: z.string(),
  flowArchetype: z.string(),
  ctaStrategy: z.string(),
  sectionsToPrioritize: z.array(z.string()),
  sectionsToAvoid: z.array(z.string()),
  copyTone: z.string(),
  visualTone: z.string(),
  conversionAngle: z.string(),
  differentiationRationale: z.string(),
  assumptions: z.array(z.string()),
  confidence: z.number(),
  competitivePositioning: CompetitivePositioningSchema,
  businessMaturity: z.string(),
  assetStrategy: AssetStrategySchema,
});

export const SameNicheDesignFingerprintSchema = z.object({
  parentNiche: z.string(),
  subNiche: z.string(),
  flowArchetype: z.string(),
  sectionOrderHash: z.string(),
  heroComposition: z.string(),
  visualMetaphor: z.string(),
  sceneType: z.string(),
  cameraPreset: z.string(),
  lightingPreset: z.string(),
  ctaPattern: z.string(),
  trustPattern: z.string(),
  proofType: z.string(),
  offerType: z.string(),
  copyTone: z.string(),
  assetApproach: z.string(),
});

export const IntraNicheDifferentiationMetaSchema = z.object({
  intraNicheDifferentiationScore: z.number(),
  blocksApproval: z.boolean(),
  warnings: z.array(z.string()),
  lastGradedAt: z.string().optional(),
  breakdown: z.record(z.number()).optional(),
});
