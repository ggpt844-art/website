import type { AiSearchConfig } from "./aiSearchTypes";

const WEIGHTS = {
  entity: 15,
  services: 15,
  area: 10,
  direct: 15,
  faq: 10,
  comparison: 10,
  schemaHint: 10,
  crawler: 5,
  trust: 5,
  safety: 5,
};

export function gradeAiSearch(c: AiSearchConfig): { score: number; warnings: string[] } {
  const warnings = [...c.aiSearchWarnings];
  let score = 0;
  if (c.entitySummary.length > 80 && c.entitySummary.length < 900) score += WEIGHTS.entity;
  else warnings.push("Entity summary should be concise and factual.");
  if (c.servicesSummary.includes("-")) score += WEIGHTS.services;
  else warnings.push("Services summary should list real services clearly.");
  if (c.serviceAreaSummary && !/fake|every city/i.test(c.serviceAreaSummary)) score += WEIGHTS.area;
  if (c.directAnswerBlocks.length >= 3) score += WEIGHTS.direct;
  if (c.faqAnswerBlocks.length >= 2) score += WEIGHTS.faq;
  if (c.comparisonAnswerBlocks.length >= 1) score += WEIGHTS.comparison;
  if (c.howToAnswerBlocks.length >= 1) score += 5;
  if (c.localRecommendationSignals.length >= 4) score += 5;
  score += WEIGHTS.schemaHint - 5;
  if (c.aiCrawlerPolicy.indexingMode === "demo_noindex" && c.aiCrawlerPolicy.allowGooglebot)
    warnings.push("Demo should not allow googlebot when noindex intent.");
  score += WEIGHTS.crawler - (warnings.some((w) => w.includes("googlebot")) ? 5 : 0);
  if (c.trustSummary.length > 40) score += WEIGHTS.trust;
  if (!/best in|guaranteed|number one/i.test(c.entitySummary + c.trustSummary)) score += WEIGHTS.safety;
  else warnings.push("Remove superlative or guarantee language.");
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, warnings };
}

export function minAiSearchScoreForPackage(tier: "starter" | "growth" | "premium"): number {
  if (tier === "premium") return 90;
  return 85;
}
