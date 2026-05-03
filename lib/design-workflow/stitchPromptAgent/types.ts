import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { NichePreset } from "@/lib/presets/types";
import type { PageStrategy } from "@/lib/experience/experienceSchemas";
import type { SeoConfig } from "@/lib/seo/seoTypes";
import type { AiSearchConfig } from "@/lib/ai-search/aiSearchTypes";
import type { ConversionConfig } from "@/lib/growth/schemas";
import type { DesignFingerprint } from "@/lib/experience/experienceSchemas";

export interface StitchPromptAgentBusiness {
  id: string;
  name: string;
  city: string;
  niche: string;
  category: string | null;
  region: string | null;
  country: string;
  websiteUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
}

export interface AvailableAssets {
  logoUrl?: string | null;
  heroAssetUrl?: string | null;
  heroCinematic?: boolean;
  galleryCount: number;
  proofCount: number;
  use3DFallback: boolean;
}

export interface StitchPromptAgentInput {
  business: StitchPromptAgentBusiness;
  businessIntelligencePacket: Record<string, unknown> | null;
  nichePreset: NichePreset;
  pageStrategy: PageStrategy;
  seoConfig: SeoConfig;
  aiSearchConfig: AiSearchConfig;
  conversionConfig: ConversionConfig;
  trustArchitecture: Record<string, unknown>;
  complianceWarnings: string[];
  availableAssets: AvailableAssets;
  previousDesignFingerprints: DesignFingerprint[];
  desiredVariantCount: number;
  demoConfig: DemoConfig;
}

export interface BuyerPsychology {
  targetCustomer: string;
  currentPain: string;
  urgencyLevel: string;
  fears: string[];
  objections: string[];
  desiredOutcome: string;
  trustBarriers: string[];
  emotionalHook: string;
}

export interface CreativeStrategy {
  conceptName: string;
  coreMetaphor: string;
  visualStory: string;
  heroEvent: string;
  sceneMood: string;
  lightingDirection: string;
  depthDirection: string;
  motionDirection: string;
  cameraFeel: string;
  premiumSignals: string[];
  avoidVisuals: string[];
}

export interface ConversionStrategy {
  primaryCTA: string;
  secondaryCTA: string;
  diagnosticIdea: string;
  quoteFlowIdea: string;
  trustProofNearCTA: string;
  whatHappensNextCopy: string;
  mobileCTAPlan: string;
}

export interface SectionStrategy {
  recommendedFlow: string;
  sectionOrder: string[];
  sectionsToAvoid: string[];
  customSections: string[];
  rationale: string;
}

export interface StitchPromptPlan {
  promptTitle: string;
  projectContext: string;
  buyerPsychologyBlock: string;
  visualMetaphorBlock: string;
  cinematicHeroBlock: string;
  cameraDepthBlock: string;
  motionBlock: string;
  uiStyleBlock: string;
  sectionFlowBlock: string;
  conversionBlock: string;
  mobileBlock: string;
  complianceBlock: string;
  antiTemplateBlock: string;
  variantRequestBlock: string;
  outputRequirementsBlock: string;
}

/** Deterministic bundle produced before optional Claude merge. */
export interface DeterministicStitchBundle {
  buyerPsychology: BuyerPsychology;
  creativeStrategy: CreativeStrategy;
  conversionStrategy: ConversionStrategy;
  sectionStrategy: SectionStrategy;
  stitchPromptPlan: StitchPromptPlan;
}

export interface StitchPromptAgentResult {
  buyerPsychology: BuyerPsychology;
  creativeStrategy: CreativeStrategy;
  conversionStrategy: ConversionStrategy;
  sectionStrategy: SectionStrategy;
  stitchPromptPlan: StitchPromptPlan;
  finalStitchPrompt: string;
  warnings: string[];
  confidence: number;
  stitchPromptScore: number;
  stitchPromptBlocksAutoStitch: boolean;
  stitchPromptGraderBreakdown: Record<string, number>;
  usedClaude: boolean;
}
