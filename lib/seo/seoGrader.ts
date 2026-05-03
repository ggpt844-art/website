import type { SeoConfig } from "./seoTypes";

export function gradeSeoFoundation(s: SeoConfig): { score: number; warnings: string[] } {
  const warnings = [...s.seoWarnings];
  let score = 50;
  if (s.titleTag.length >= 30 && s.titleTag.length <= 60) score += 8;
  else warnings.push("Title tag length should be ~30–60 characters.");
  if (s.metaDescription.length >= 70 && s.metaDescription.length <= 160) score += 8;
  else warnings.push("Meta description should be ~70–160 characters.");
  if (s.h1 && s.h1.length > 8 && s.h1.length < 90) score += 8;
  if (s.headingPlan.length >= 3) score += 6;
  if (s.keywordIntentMap.length >= 3) score += 6;
  if (Object.keys(s.localBusinessSchemaJsonLd).length > 3) score += 6;
  if (s.serviceSchemaJsonLd.length > 0) score += 4;
  const mainEntity = (s.faqSchemaJsonLd as { mainEntity?: unknown[] }).mainEntity;
  if (Array.isArray(mainEntity) && mainEntity.length > 0) score += 5;
  if (Object.keys(s.imageAltTextMap).length > 0) score += 3;
  if (warnings.length > 4) score -= 6;
  score = Math.max(0, Math.min(100, score));
  return { score, warnings };
}
