import type { AiCrawlerPolicy } from "./aiSearchTypes";

export function defaultCrawlerPolicy(
  mode: "demo_noindex" | "client_indexable",
): AiCrawlerPolicy {
  if (mode === "demo_noindex") {
    return {
      indexingMode: "demo_noindex",
      allowSearchCrawlers: false,
      allowTrainingCrawlers: false,
      allowGooglebot: false,
      allowBingbot: false,
      allowOaiSearchBot: false,
      allowGptBot: false,
      allowPerplexityBot: false,
      allowClaudeBot: false,
      exposeLlmsTxt: false,
    };
  }
  return {
    indexingMode: "client_indexable",
    allowSearchCrawlers: true,
    allowTrainingCrawlers: false,
    allowGooglebot: true,
    allowBingbot: true,
    allowOaiSearchBot: true,
    allowGptBot: false,
    allowPerplexityBot: true,
    allowClaudeBot: true,
    exposeLlmsTxt: true,
  };
}
