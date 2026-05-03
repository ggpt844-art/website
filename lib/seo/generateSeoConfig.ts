import type { SeoConfig } from "./seoTypes";
import { buildKeywordStrategy } from "./localKeywordStrategy";
import { buildJsonLd, type SchemaContext } from "./schemaGenerator";
import { buildImageAltMap } from "./imageSeo";
import { planCityPages, planServicePages } from "./pagePlanner";
import { gradeSeoFoundation } from "./seoGrader";
import { gbpAlignmentChecklist } from "./gbpChecklist";
import { truncateMeta, safeKeywordPhrase } from "./seoUtils";
import { scoreGbpHealth } from "@/lib/localSeo/gbpHealth";
import { analyzeNap } from "@/lib/localSeo/napChecker";
import { APP_CONFIG } from "@/lib/utils/config";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

export interface GenerateSeoInput {
  businessName: string;
  city: string;
  region?: string | null;
  country?: string;
  nicheSlug: string;
  /** Canonical demo URL slug, e.g. same as /demo/[slug] */
  demoSlug: string;
  phone?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  services: string[];
  faqs: { q: string; a: string }[];
  galleryUrls: string[];
  nicheLabel: string;
  directoryLinks?: Record<string, string> | null;
  socialLinks?: Record<string, string> | null;
  /** Only cities you can honestly list */
  verifiedNearbyCities?: string[];
  /** Intra-niche strategy — shapes keywords, headings, and meta for sub-niche intent */
  intraNicheStrategy?: IntraNicheStrategy | null;
}

export function generateSeoConfig(input: GenerateSeoInput): SeoConfig {
  const baseUrl = `${APP_CONFIG.appUrl.replace(/\/$/, "")}/demo/${input.demoSlug}`;
  const intra = input.intraNicheStrategy ?? null;

  const kw = buildKeywordStrategy(
    input.nicheSlug,
    input.city,
    input.businessName,
    intra,
  );
  const titlePhrase = safeKeywordPhrase(
    kw.primaryKeyword.split(" ").slice(0, 2).join(" ") || input.nicheLabel,
    input.city,
  );
  const titleTag = truncateMeta(`${input.businessName} | ${titlePhrase}`, 58);
  const labelForMeta = intra?.primaryServiceFocus?.trim() || input.nicheLabel;
  const metaTail = intra
    ? `${intra.conversionAngle} ${intra.trustBarrier}`.replace(/\s+/g, " ").trim().slice(0, 90)
    : `Start online with a guided quote — clear next steps, no pressure.`;
  const metaDescription = truncateMeta(
    `${input.businessName} — ${labelForMeta.toLowerCase()} in ${input.city}. ${metaTail}`,
    158,
  );
  const h1 = intra
    ? `${input.businessName} — ${labelForMeta} in ${input.city}`
    : `${input.businessName} — ${input.nicheLabel} in ${input.city}`;

  const headingPlan = intra
    ? [
        { level: "h2" as const, text: `${labelForMeta} in ${input.city}` },
        {
          level: "h2" as const,
          text:
            intra.buyerIntent === "urgent"
              ? "What to do next"
              : intra.buyerIntent === "education-first" || intra.buyerIntent === "comparison-shopping"
                ? "How it works — plain language"
                : "How we help you move forward",
        },
        { level: "h2" as const, text: "Frequently asked questions" },
      ]
    : [
        { level: "h2", text: `Services in ${input.city}` },
        { level: "h2", text: "How the quote process works" },
        { level: "h2", text: "Frequently asked questions" },
      ];

  const schemaCtx: SchemaContext = {
    businessName: input.businessName,
    city: input.city,
    region: input.region,
    country: input.country,
    phone: input.phone,
    address: input.address,
    websiteUrl: input.websiteUrl,
    nicheSlug: input.nicheSlug,
    rating: input.rating,
    reviewCount: input.reviewCount,
    primaryKeyword: kw.primaryKeyword,
    services: input.services,
    faqs: input.faqs,
  };

  const jsonLd = buildJsonLd(schemaCtx, baseUrl);

  const config: SeoConfig = {
    ...kw,
    titleTag,
    metaDescription,
    canonicalUrl: baseUrl,
    h1,
    headingPlan,
    ...jsonLd,
    openGraphTitle: titleTag,
    openGraphDescription: metaDescription,
    openGraphImage: input.galleryUrls[0],
    imageAltTextMap: buildImageAltMap({
      businessName: input.businessName,
      city: input.city,
      nicheLabel: input.nicheLabel,
      galleryUrls: input.galleryUrls,
    }),
    internalLinks: ["/#quote", "/#services", "/#faq"],
    sitemapEntries: [baseUrl],
    robotsTxtRules: [
      "User-agent: *",
      "Disallow: /api/",
      "Allow: /",
    ],
    gbpAlignmentChecklist: gbpAlignmentChecklist({
      hasPhone: !!input.phone,
      hasWebsite: !!input.websiteUrl,
      hasAddress: !!input.address,
      hasReviews: (input.reviewCount ?? 0) > 0,
    }),
    servicePagePlan: planServicePages(input.nicheSlug, input.city),
    cityPagePlan: planCityPages(input.nicheSlug, input.verifiedNearbyCities ?? []),
    monthlySeoContentPlan: intra
      ? [
          `Guide: ${labelForMeta} in ${input.city} — what to ask before you book`,
          `Comparison content: ${intra.proofTypeNeeded.slice(0, 60)}${intra.proofTypeNeeded.length > 60 ? "…" : ""}`,
          `FAQ depth: ${intra.subNiche.replace(/_/g, " ")} — pricing signals without invented numbers`,
        ]
      : [
          `Local guide: Choosing a ${input.nicheLabel.toLowerCase()} in ${input.city}`,
          `FAQ expansion: cost ranges and what affects pricing`,
          `Project spotlight: real ${input.city} work (with approval)`,
        ],
    competitorSeoGaps: intra
      ? [
          intra.competitivePositioning.uniqueAngle.slice(0, 220),
          intra.competitivePositioning.marketGap.slice(0, 180),
        ]
      : [
          "Competitors often lack guided quote flows — yours captures intent earlier.",
        ],
    seoWarnings: [],
    seoFoundationScore: 0,
    seoIndexingMode: "demo_noindex",
    gbpHealth: scoreGbpHealth({
      businessName: input.businessName,
      phone: input.phone,
      address: input.address,
      websiteUrl: input.websiteUrl,
      reviewCount: input.reviewCount,
      rating: input.rating,
    }),
    napCheck: analyzeNap({
      businessName: input.businessName,
      phone: input.phone,
      address: input.address,
      websiteUrl: input.websiteUrl,
      sources: [input.directoryLinks, input.socialLinks],
    }),
  };

  const graded = gradeSeoFoundation(config);
  config.seoFoundationScore = graded.score;
  config.seoWarnings = [...config.seoWarnings, ...graded.warnings];

  return config;
}
