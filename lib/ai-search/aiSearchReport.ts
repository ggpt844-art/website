import type { AiSearchConfig } from "./aiSearchTypes";
import type { SeoConfig } from "@/lib/seo/seoTypes";

export function buildAiSearchReportSection(ai: AiSearchConfig, seo: SeoConfig) {
  return {
    aiSearchScore: ai.aiSearchScore,
    oaiSearchBotAllowed: ai.aiCrawlerPolicy.allowOaiSearchBot,
    perplexityAllowed: ai.aiCrawlerPolicy.allowPerplexityBot,
    googlebot: ai.aiCrawlerPolicy.allowGooglebot,
    bingbot: ai.aiCrawlerPolicy.allowBingbot,
    llmsTxtPlanned: ai.llmsTxtContent.length > 50,
    directAnswerBlocks: ai.directAnswerBlocks.length,
    schemaAligned: true,
    freshness: ai.freshness,
    warnings: ai.aiSearchWarnings,
    manualTests: ai.manualAiSearchTestPlan.length,
    seoFoundation: seo.seoFoundationScore,
  };
}
