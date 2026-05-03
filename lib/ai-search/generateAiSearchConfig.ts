import type { SeoConfig } from "@/lib/seo/seoTypes";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { AiSearchConfig } from "./aiSearchTypes";
import { buildEntitySummary, buildServicesSummary, buildServiceAreaSummary, buildTrustSummary } from "./entitySummary";
import { buildDirectAnswerBlocks, buildFaqAnswerBlocks } from "./directAnswerBlocks";
import { buildComparisonBlocks } from "./comparisonBlocks";
import { buildHowToBlocks } from "./howToBlocks";
import { generateLlmsTxt } from "./llmsTxtGenerator";
import { defaultCrawlerPolicy } from "./aiCrawlerPolicy";
import { gradeAiSearch } from "./aiSearchGrader";
import { analyzeFreshness } from "./freshnessAnalyzer";
import { buildManualAiTests } from "./manualAiSearchTests";
import { bingAiPlaceholder } from "./bingAiPerformance";
import { indexNowPlaceholder } from "./indexNow";
import { getNichePreset } from "@/lib/presets/niches";
import { APP_CONFIG } from "@/lib/utils/config";
import type { TrustArchitectureOutput } from "@/lib/agents/trustArchitectureAgent";
import type { ComplianceScanResult } from "@/lib/compliance/complianceScanner";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

/** Placeholder for compliance scan before full AI-search generation. */
export function createStubAiSearchConfig(
  indexingMode: "demo_noindex" | "client_indexable",
): AiSearchConfig {
  return {
    entitySummary: "",
    servicesSummary: "",
    serviceAreaSummary: "",
    trustSummary: "",
    directAnswerBlocks: [],
    faqAnswerBlocks: [],
    comparisonAnswerBlocks: [],
    howToAnswerBlocks: [],
    localRecommendationSignals: [],
    llmsTxtContent: "",
    aiCrawlerPolicy: defaultCrawlerPolicy(indexingMode),
    manualAiSearchTestPlan: [],
    bingAiPerformance: bingAiPlaceholder(),
    indexNow: indexNowPlaceholder(),
    freshness: analyzeFreshness(),
    aiSearchWarnings: [],
    aiSearchScore: 0,
  };
}

export interface GenerateAiSearchInput {
  businessName: string;
  city: string;
  nicheSlug: string;
  demoConfig: DemoConfig;
  seoConfig: SeoConfig;
  verifiedNearbyCities?: string[];
  serviceAreaUncertain?: boolean;
  trustArchitecture?: TrustArchitectureOutput;
  compliance?: ComplianceScanResult;
}

export function generateAiSearchConfig(input: GenerateAiSearchInput): AiSearchConfig {
  const niche = getNichePreset(input.nicheSlug);
  const indexingMode = input.seoConfig.seoIndexingMode;
  const baseUrl = `${APP_CONFIG.appUrl.replace(/\/$/, "")}/demo/${input.demoConfig.slug}`;
  const intra = (input.demoConfig.intraNicheStrategy ?? null) as IntraNicheStrategy | null;

  const clientAudience =
    intra?.parentNiche === "dental" || intra?.parentNiche === "med_spa"
      ? "patients and local families"
      : "homeowners";

  const entitySummary = buildEntitySummary({
    name: input.businessName,
    city: input.city,
    nicheLabel: niche.label,
    leadMagnet: input.demoConfig.strategy.leadMagnet,
    primaryConversion: input.demoConfig.strategy.primaryCTA,
    clientAudience,
    serviceLine: intra?.primaryServiceFocus,
  });

  const servicesSummary = buildServicesSummary(
    niche.defaultServices,
    input.city,
    niche.label,
  );

  const serviceAreaSummary = buildServiceAreaSummary(
    input.city,
    input.verifiedNearbyCities ?? [],
    input.serviceAreaUncertain ?? true,
  );

  const trustSummaryBase =
    input.trustArchitecture?.noPressureCopy?.slice(0, 400) ??
    buildTrustSummary({
      hasPhone: !!input.demoConfig.business.phone,
      hasReviews: (input.demoConfig.business.reviewCount ?? 0) > 0,
      reviewCount: input.demoConfig.business.reviewCount,
      riskReducers: input.demoConfig.strategy.riskReducers,
    });
  const trustSummary = intra?.trustBarrier
    ? `${trustSummaryBase} Primary concerns this experience addresses: ${intra.trustBarrier}.`.slice(0, 620)
    : trustSummaryBase;

  const directAnswerBlocks = buildDirectAnswerBlocks(
    input.nicheSlug,
    input.city,
    input.businessName,
    intra,
  );
  const faqAnswerBlocks = buildFaqAnswerBlocks(input.demoConfig.copy.faqs);
  const comparisonAnswerBlocks = buildComparisonBlocks(input.nicheSlug, input.city, intra);
  const howToAnswerBlocks = buildHowToBlocks(niche.label, intra);

  const signals = [
    `Business type: ${niche.label}`,
    `Primary city: ${input.city}`,
    input.demoConfig.business.phone ? `Phone on site` : `Phone pending`,
    `Conversion path: ${input.demoConfig.strategy.leadMagnet}`,
    "Structured data aligned with visible FAQs and services",
    ...(intra
      ? [
          `Sub-niche: ${intra.subNiche.replace(/_/g, " ")}`,
          `Buyer intent: ${intra.buyerIntent}`,
          `Proof emphasis: ${intra.proofTypeNeeded}`,
        ]
      : []),
  ];

  const llmsTxt = generateLlmsTxt({
    businessName: input.businessName,
    nicheLabel: niche.label,
    city: input.city,
    services: niche.defaultServices,
    areas: input.verifiedNearbyCities ?? [input.city],
    baseUrl,
    indexingMode,
    lastUpdated: new Date().toISOString().slice(0, 10),
    positioningNote: intra
      ? `Sub-niche ${intra.subNiche.replace(/_/g, " ")}; buyer ${intra.buyerIntent}; ${intra.differentiationRationale.slice(0, 220)}`
      : undefined,
  });

  const policy = defaultCrawlerPolicy(indexingMode);

  const cfg: AiSearchConfig = {
    entitySummary,
    servicesSummary,
    serviceAreaSummary,
    trustSummary,
    directAnswerBlocks,
    faqAnswerBlocks,
    comparisonAnswerBlocks,
    howToAnswerBlocks,
    localRecommendationSignals: signals,
    llmsTxtContent: llmsTxt,
    aiCrawlerPolicy: policy,
    manualAiSearchTestPlan: buildManualAiTests(input.nicheSlug, input.city),
    bingAiPerformance: bingAiPlaceholder(),
    indexNow: indexNowPlaceholder(),
    freshness: analyzeFreshness(),
    aiSearchWarnings: [],
    aiSearchScore: 0,
  };

  if (input.compliance?.severeWarnings?.length) {
    cfg.aiSearchWarnings.push(...input.compliance.severeWarnings);
  }

  const graded = gradeAiSearch(cfg);
  cfg.aiSearchScore = graded.score;
  cfg.aiSearchWarnings = [...cfg.aiSearchWarnings, ...graded.warnings];

  return cfg;
}
