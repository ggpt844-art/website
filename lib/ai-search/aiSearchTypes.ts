import { z } from "zod";

export const AiCrawlerPolicySchema = z.object({
  indexingMode: z.enum(["demo_noindex", "client_indexable"]),
  allowSearchCrawlers: z.boolean(),
  allowTrainingCrawlers: z.boolean(),
  allowGooglebot: z.boolean(),
  allowBingbot: z.boolean(),
  allowOaiSearchBot: z.boolean(),
  allowGptBot: z.boolean(),
  allowPerplexityBot: z.boolean(),
  allowClaudeBot: z.boolean(),
  exposeLlmsTxt: z.boolean(),
});

export const AiSearchConfigSchema = z.object({
  entitySummary: z.string(),
  servicesSummary: z.string(),
  serviceAreaSummary: z.string(),
  trustSummary: z.string(),
  directAnswerBlocks: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      targetIntent: z.string(),
      visibleOnPage: z.boolean(),
    }),
  ),
  faqAnswerBlocks: z.array(
    z.object({ question: z.string(), answer: z.string(), targetIntent: z.string() }),
  ),
  comparisonAnswerBlocks: z.array(
    z.object({ title: z.string(), body: z.string(), visibleOnPage: z.boolean() }),
  ),
  howToAnswerBlocks: z.array(
    z.object({ title: z.string(), steps: z.array(z.string()) }),
  ),
  localRecommendationSignals: z.array(z.string()),
  llmsTxtContent: z.string(),
  aiCrawlerPolicy: AiCrawlerPolicySchema,
  manualAiSearchTestPlan: z.array(z.record(z.unknown())),
  bingAiPerformance: z.object({
    enabled: z.boolean(),
    connected: z.boolean(),
    citations: z.array(z.string()),
    citedPages: z.array(z.string()),
    groundingQueries: z.array(z.string()),
  }),
  indexNow: z.object({
    enabled: z.boolean(),
    lastPingedAt: z.string().nullable(),
    urlsPendingPing: z.array(z.string()),
  }),
  freshness: z.object({
    lastUpdated: z.string(),
    staleSections: z.array(z.string()),
    recommendedRefreshes: z.array(z.string()),
  }),
  aiSearchWarnings: z.array(z.string()),
  aiSearchScore: z.number(),
});

export type AiSearchConfig = z.infer<typeof AiSearchConfigSchema>;
export type AiCrawlerPolicy = z.infer<typeof AiCrawlerPolicySchema>;
