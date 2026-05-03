import { z } from "zod";

export const KeywordIntentSchema = z.object({
  keyword: z.string(),
  intent: z.enum([
    "emergency",
    "quote",
    "service",
    "comparison",
    "informational",
    "local",
  ]),
  targetPage: z.string().optional(),
});

export const SeoConfigSchema = z.object({
  primaryKeyword: z.string(),
  moneyKeywords: z.array(z.string()),
  secondaryKeywords: z.array(z.string()),
  informationalKeywords: z.array(z.string()),
  cityKeywords: z.array(z.string()),
  serviceAreaKeywords: z.array(z.string()),
  keywordIntentMap: z.array(KeywordIntentSchema),
  titleTag: z.string(),
  metaDescription: z.string(),
  canonicalUrl: z.string(),
  h1: z.string(),
  headingPlan: z.array(z.object({ level: z.string(), text: z.string() })),
  localBusinessSchemaJsonLd: z.record(z.unknown()),
  serviceSchemaJsonLd: z.array(z.record(z.unknown())),
  faqSchemaJsonLd: z.record(z.unknown()),
  breadcrumbSchemaJsonLd: z.record(z.unknown()),
  websiteSchemaJsonLd: z.record(z.unknown()),
  openGraphTitle: z.string(),
  openGraphDescription: z.string(),
  openGraphImage: z.string().optional(),
  imageAltTextMap: z.record(z.string()),
  internalLinks: z.array(z.string()),
  sitemapEntries: z.array(z.string()),
  robotsTxtRules: z.array(z.string()),
  gbpAlignmentChecklist: z.array(z.string()),
  servicePagePlan: z.array(z.record(z.unknown())),
  cityPagePlan: z.array(z.record(z.unknown())),
  monthlySeoContentPlan: z.array(z.string()),
  competitorSeoGaps: z.array(z.string()),
  seoWarnings: z.array(z.string()),
  seoFoundationScore: z.number(),
  seoIndexingMode: z.enum(["demo_noindex", "client_indexable"]),
  gbpHealth: z
    .object({
      gbpHealthScore: z.number(),
      missingItems: z.array(z.string()),
      recommendedActions: z.array(z.string()),
      reviewStrategy: z.array(z.string()),
      photoStrategy: z.array(z.string()),
      serviceCategorySuggestions: z.array(z.string()),
    })
    .optional(),
  napCheck: z
    .object({
      napConsistencyScore: z.number(),
      nameVariants: z.array(z.string()),
      phoneVariants: z.array(z.string()),
      addressVariants: z.array(z.string()),
      inconsistencies: z.array(z.string()),
      recommendedFixes: z.array(z.string()),
      sourceUrls: z.array(z.string()),
    })
    .optional(),
});

export type SeoConfig = z.infer<typeof SeoConfigSchema>;
