import { DemoConfigSchema, type DemoConfig } from "./demoConfig";
import type { PackageConfig } from "@/lib/growth/schemas";
import { getNichePreset } from "@/lib/presets/niches";
import { getDesignSystem } from "@/lib/presets/designSystems";
import { buildStrategy } from "@/lib/agents/conversionStrategist";
import { directArt } from "@/lib/agents/artDirector";
import { writeCopy } from "@/lib/agents/copywriter";
import { slugify } from "@/lib/utils/slug";
import type { AssetProfileJson } from "@/lib/assets/types";
import { generateSeoConfig } from "@/lib/seo/generateSeoConfig";
import { trustArchitectureAgent } from "@/lib/agents/trustArchitectureAgent";
import { scanCompliance } from "@/lib/compliance/complianceScanner";
import {
  createStubAiSearchConfig,
  generateAiSearchConfig,
} from "@/lib/ai-search/generateAiSearchConfig";
import { buildGrowthLayers } from "@/lib/growth/buildGrowthLayers";
import type { DesignFingerprint } from "@/lib/experience/experienceSchemas";
import { planExperience, DEMO_SECTION_IDS } from "@/lib/experience/planExperience";
import {
  HEAT_LOSS_CINEMATIC_PLATE,
  heatLossHeroVideoFromEnv,
} from "@/lib/cinematic/heatLossHero";
import { generateIntraNicheStrategy } from "@/lib/strategy/generateIntraNicheStrategy";
import { mergeIntraNicheStrategy } from "@/lib/strategy/mergeIntraNicheStrategy";
import {
  buildSameNicheDesignFingerprint,
  getRecentSameNicheFingerprints,
  nicheSlugToParentKey,
} from "@/lib/strategy/sameNicheFingerprint";
import { gradeIntraNicheDifferentiation } from "@/lib/strategy/intraNicheGrader";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";
import type { SameNicheDesignFingerprint } from "@/lib/strategy/intraNicheTypes";

export interface BuildDemoConfigInput {
  businessName: string;
  city: string;
  niche: string;
  phone?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  websiteUrl?: string | null;
  address?: string | null;
  region?: string | null;
  country?: string;
  weaknesses: string[];
  assetProfile?: AssetProfileJson | null;
  slugOverride?: string;
  packageTier?: PackageConfig["tier"];
  directoryLinks?: Record<string, string> | null;
  socialLinks?: Record<string, string> | null;
  verifiedNearbyCities?: string[];
  /** Recent demo fingerprints — anti-repetition for section rhythm / scene pairing */
  recentDesignFingerprints?: DesignFingerprint[];
  /** Optional crawl / audit summary for sub-niche classification */
  intelligenceSummary?: string | null;
  /** Merged on top of generated intra-niche strategy (dashboard / rebuild preserve). */
  intraNicheManualOverrides?: Partial<IntraNicheStrategy> | null;
  /**
   * When set, skips DB fetch for same-niche similarity. Omit to load recent same-parent demos.
   */
  recentSameNicheFingerprints?: SameNicheDesignFingerprint[];
}

export async function buildDemoConfig(input: BuildDemoConfigInput): Promise<DemoConfig> {
  const niche = getNichePreset(input.niche);

  const intraRaw = generateIntraNicheStrategy({
    niche,
    businessName: input.businessName,
    city: input.city,
    category: input.category ?? null,
    weaknesses: input.weaknesses,
    rating: input.rating ?? null,
    reviewCount: input.reviewCount ?? null,
    websiteUrl: input.websiteUrl ?? null,
    assetProfile: input.assetProfile ?? null,
    intelligenceSummary: input.intelligenceSummary ?? null,
  });
  const intra = mergeIntraNicheStrategy(intraRaw, input.intraNicheManualOverrides ?? null);

  const recentSame =
    input.recentSameNicheFingerprints !== undefined
      ? input.recentSameNicheFingerprints
      : await getRecentSameNicheFingerprints(nicheSlugToParentKey(input.niche));

  const hero = input.assetProfile?.heroCandidates?.[0];
  const goodHero = !!hero && hero.heroSuitabilityScore >= 75;
  const strategyBase = buildStrategy({
    niche,
    city: input.city,
    weaknesses: input.weaknesses,
    hasGoodAssets: !!input.assetProfile && input.assetProfile.assetQualityScore >= 60,
  });
  const strategy = { ...strategyBase, primaryCTA: intra.ctaStrategy };
  const art = directArt({
    niche,
    premiumLevel: "high",
    hasGoodHeroAsset: goodHero,
  });
  const copy = writeCopy({
    niche,
    city: input.city,
    businessName: input.businessName,
    strategy,
  });
  const ds = getDesignSystem(art.designSystem);

  const slug =
    input.slugOverride ?? slugify(`${input.businessName}-${input.city}`);

  const allowed = new Set<string>(DEMO_SECTION_IDS);

  const exp = planExperience({
    niche,
    businessName: input.businessName,
    city: input.city,
    slug,
    weaknesses: input.weaknesses,
    primaryPain: strategy.primaryPain,
    categoryLabel: input.category ?? niche.label,
    accentColor: art.accentColor,
    recentFingerprints: input.recentDesignFingerprints,
    intraNicheStrategy: intra,
  });

  const sameNicheDesignFingerprint = buildSameNicheDesignFingerprint({
    intra,
    pageStrategy: exp.pageStrategy,
    visualDirection: exp.visualDirection,
    sceneSpec: exp.sceneSpec,
    primaryCTA: strategy.primaryCTA,
    designFingerprint: exp.designFingerprint,
  });

  const intraNicheDifferentiationMeta = gradeIntraNicheDifferentiation({
    strategy: intra,
    pageStrategy: exp.pageStrategy,
    visualDirection: exp.visualDirection,
    sceneSpec: exp.sceneSpec,
    primaryCTA: strategy.primaryCTA,
    sameNicheFingerprint: sameNicheDesignFingerprint,
    recentSameNicheFingerprints: recentSame,
  });

  const sections = exp.pageStrategy.sectionOrder.filter((s: string) => allowed.has(s));

  const galleryUrls = (input.assetProfile?.galleryImages ?? [])
    .map((g) => g.url)
    .slice(0, 8);
  const proofUrls = (input.assetProfile?.beforeAfterCandidates ?? [])
    .map((g) => g.url)
    .slice(0, 6);

  const tier = input.packageTier ?? "growth";

  const growth = buildGrowthLayers({
    nicheSlug: input.niche,
    demoSlug: slug,
    packageTier: tier,
    proofImageUrls: proofUrls,
  });

  const seo = generateSeoConfig({
    businessName: input.businessName,
    city: input.city,
    region: input.region,
    country: input.country,
    nicheSlug: input.niche,
    demoSlug: slug,
    phone: input.phone,
    address: input.address,
    websiteUrl: input.websiteUrl,
    rating: input.rating,
    reviewCount: input.reviewCount,
    services: niche.defaultServices,
    faqs: copy.faqs,
    galleryUrls,
    nicheLabel: niche.label,
    directoryLinks: input.directoryLinks,
    socialLinks: input.socialLinks,
    verifiedNearbyCities: input.verifiedNearbyCities,
    intraNicheStrategy: intra,
  });

  const trustArch = trustArchitectureAgent({
    nicheSlug: input.niche,
    buyerPain: intra.trustBarrier || niche.buyerPains[0] || strategy.primaryPain,
    services: niche.defaultServices,
    hasVerifiedLicense: false,
    hasRealReviews: (input.reviewCount ?? 0) > 0,
  });

  const initialAssets = {
    logoUrl: input.assetProfile?.logoUrl,
    heroAssetUrl: goodHero ? hero?.url : undefined,
    use3DFallback: !goodHero,
    heroLocked: false,
    galleryImages: galleryUrls,
    proofImages: proofUrls,
  };

  const heatVid = heatLossHeroVideoFromEnv();
  const assets =
    exp.threeDPreset === "house-heat-loss"
      ? {
          ...initialAssets,
          heroCinematic: "thermal_loss" as const,
          use3DFallback: false,
          heroAssetUrl: initialAssets.heroAssetUrl ?? HEAT_LOSS_CINEMATIC_PLATE,
          heroPosterUrl: initialAssets.heroAssetUrl ?? HEAT_LOSS_CINEMATIC_PLATE,
          ...(heatVid ? { heroVideoUrl: heatVid } : {}),
        }
      : initialAssets;

  const base: Omit<
    DemoConfig,
    "seo" | "aiSearch" | "conversion" | "analytics" | "trust" | "compliance" | "package" | "reporting"
  > = {
    slug,
    business: {
      name: input.businessName,
      city: input.city,
      phone: input.phone ?? null,
      category: input.category ?? niche.label,
      nicheSlug: input.niche,
      rating: input.rating ?? null,
      reviewCount: input.reviewCount ?? null,
      websiteUrl: input.websiteUrl ?? null,
    },
    strategy: {
      positioning: strategy.positioning,
      primaryPain: strategy.primaryPain,
      moneyAngle: strategy.moneyAngle,
      leadMagnet: strategy.leadMagnet,
      primaryCTA: strategy.primaryCTA,
      secondaryCTA: strategy.secondaryCTA,
      contactReason: strategy.contactReason,
      riskReducers: strategy.riskReducers,
    },
    design: {
      designSystem: art.designSystem,
      themePreset: art.themePreset,
      motionPreset: art.motionPreset,
      threeDPreset: exp.threeDPreset,
      visualTone: `${art.visualMood} — ${exp.visualDirection.emotionalTone}`,
      accentColor: art.accentColor,
      backgroundMode: ds.mode,
    },
    assets,
    sections,
    quoteFlow: niche.quoteFlow,
    copy: {
      heroHeadline: copy.heroHeadline,
      heroSubheadline: copy.heroSubheadline,
      problemTitle: copy.problemTitle,
      problemBody: copy.problemBody,
      finalCtaTitle: copy.finalCtaTitle,
      finalCtaBody: copy.finalCtaBody,
      faqs: copy.faqs,
      trustStrip: copy.trustStrip,
      servicesHeadline: copy.servicesHeadline,
      proofHeadline: copy.proofHeadline,
      processHeadline: copy.processHeadline,
    },
    services: niche.defaultServices.map((s) => ({
      title: s,
      description: `Real ${s.toLowerCase()} for ${input.city} clients with a clear written quote.`,
      problem: niche.buyerPains[0],
    })),
    process: [
      {
        step: "Tell us what's happening",
        description:
          "Quick guided form — usually under a minute on mobile.",
      },
      {
        step: "We reply with options",
        description:
          "Same-day during business hours with realistic pricing ranges.",
      },
      {
        step: "Quick on-site or virtual review",
        description:
          "Usually 15–30 minutes — no commitment to book.",
      },
      {
        step: "Written quote",
        description: "Clear line items so there are no surprises.",
      },
    ],
  };

  const interim: DemoConfig = {
    ...base,
    seo,
    aiSearch: createStubAiSearchConfig(seo.seoIndexingMode),
    conversion: growth.conversion,
    analytics: growth.analytics,
    trust: {
      architectureJson: trustArch as unknown as Record<string, unknown>,
    },
    compliance: {
      lastScanAt: undefined,
      warnings: [],
      severeWarnings: [],
    },
    package: growth.package,
    reporting: growth.reporting,
  };

  const complianceScan = scanCompliance(interim);
  const compliance = {
    lastScanAt: new Date().toISOString(),
    warnings: complianceScan.warnings,
    severeWarnings: complianceScan.severeWarnings,
  };

  const aiSearch = generateAiSearchConfig({
    businessName: input.businessName,
    city: input.city,
    nicheSlug: input.niche,
    demoConfig: { ...interim, compliance },
    seoConfig: seo,
    verifiedNearbyCities: input.verifiedNearbyCities,
    serviceAreaUncertain: !input.verifiedNearbyCities?.length,
    trustArchitecture: trustArch,
    compliance: complianceScan,
  });

    return DemoConfigSchema.parse({
    ...interim,
    compliance,
    aiSearch,
    pageStrategy: exp.pageStrategy,
    visualDirection: exp.visualDirection,
    sceneSpec: exp.sceneSpec,
    designFingerprint: exp.designFingerprint,
    mobilePlan: exp.mobilePlan,
    flowRationale: exp.flowRationale,
    designMode: "internal_auto",
    intraNicheStrategy: intra,
    sameNicheDesignFingerprint,
    intraNicheDifferentiationMeta,
    intraNicheManualOverrides: input.intraNicheManualOverrides ?? undefined,
  });
}
