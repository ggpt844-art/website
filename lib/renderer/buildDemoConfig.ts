import type { DemoConfig } from "./demoConfig";
import { getNichePreset } from "@/lib/presets/niches";
import { getDesignSystem } from "@/lib/presets/designSystems";
import { buildStrategy } from "@/lib/agents/conversionStrategist";
import { directArt } from "@/lib/agents/artDirector";
import { writeCopy } from "@/lib/agents/copywriter";
import { slugify } from "@/lib/utils/slug";
import type { AssetProfileJson } from "@/lib/assets/types";

export interface BuildDemoConfigInput {
  businessName: string;
  city: string;
  niche: string;
  phone?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  websiteUrl?: string | null;
  weaknesses: string[];
  assetProfile?: AssetProfileJson | null;
  slugOverride?: string;
}

export function buildDemoConfig(input: BuildDemoConfigInput): DemoConfig {
  const niche = getNichePreset(input.niche);
  const hero = input.assetProfile?.heroCandidates?.[0];
  const goodHero = !!hero && hero.heroSuitabilityScore >= 75;
  const strategy = buildStrategy({
    niche,
    city: input.city,
    weaknesses: input.weaknesses,
    hasGoodAssets: !!input.assetProfile && input.assetProfile.assetQualityScore >= 60,
  });
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

  return {
    slug,
    business: {
      name: input.businessName,
      city: input.city,
      phone: input.phone ?? null,
      category: input.category ?? niche.label,
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
      threeDPreset: art.threeDPreset,
      visualTone: art.visualMood,
      accentColor: art.accentColor,
      backgroundMode: ds.mode,
    },
    assets: {
      logoUrl: input.assetProfile?.logoUrl,
      heroAssetUrl: goodHero ? hero?.url : undefined,
      use3DFallback: !goodHero,
      galleryImages: (input.assetProfile?.galleryImages ?? [])
        .map((g) => g.url)
        .slice(0, 8),
      proofImages: (input.assetProfile?.beforeAfterCandidates ?? [])
        .map((g) => g.url)
        .slice(0, 6),
    },
    sections: niche.sectionOrder,
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
      { step: "Tell us what's happening", description: "Quick guided form — usually under a minute on mobile." },
      { step: "We reply with options", description: "Same-day during business hours with realistic pricing ranges." },
      { step: "Quick on-site or virtual review", description: "Usually 15–30 minutes — no commitment to book." },
      { step: "Written quote", description: "Clear line items so there are no surprises." },
    ],
  };
}
