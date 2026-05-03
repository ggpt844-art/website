import type { PageStrategy } from "@/lib/experience/experienceSchemas";
import type { NichePreset } from "@/lib/presets/types";
import type { DesignBrief } from "./designWorkflowTypes";

export interface GenerateDesignBriefInput {
  businessName: string;
  city: string;
  region?: string | null;
  country?: string;
  nicheSlug: string;
  nichePreset: NichePreset;
  intelligencePacket: Record<string, unknown> | null;
  pageStrategy: PageStrategy;
  seoPrimaryKeyword: string;
  complianceWarnings: string[];
}

function str(x: unknown): string {
  return typeof x === "string" ? x : "";
}

export function generateDesignBrief(input: GenerateDesignBriefInput): DesignBrief {
  const pkt = input.intelligencePacket;
  const strategyInputs = (pkt?.strategyInputs as Record<string, unknown> | undefined) ?? {};
  const profile = (pkt?.profile as Record<string, unknown> | undefined) ?? {};
  const mainPain =
    str(strategyInputs.mainBuyerPain) ||
    input.nichePreset.buyerPains[0] ||
    input.pageStrategy.desiredStoryArc;

  const targetCustomer =
    str((profile as { targetCustomer?: string }).targetCustomer) ||
    `Local ${input.nichePreset.label.toLowerCase()} buyers in ${input.city}`;

  const visualMetaphor =
    input.nicheSlug.includes("insulation") || input.nicheSlug.includes("attic")
      ? "Thermal containment / heat escaping through the attic"
      : input.nicheSlug === "dentists" || input.nicheSlug === "orthodontists"
        ? "Clinical precision and calm confidence — radiant oral health glow"
        : input.nicheSlug === "roofing"
          ? "Storm line and protective roof plane over the home"
          : `Category-native visual metaphor for ${input.nichePreset.label}`;

  const premiumStyle =
    "High-end cinematic local lead funnel — not a generic contractor template or SaaS landing page";

  const sectionsNeeded = input.pageStrategy.sectionOrder.length
    ? [...input.pageStrategy.sectionOrder]
    : [...input.pageStrategy.mustIncludeSections];

  const sectionsToAvoid = [
    ...input.pageStrategy.forbiddenSections,
    "generic stock icon grid",
    "meaningless testimonial carousel without proof",
  ];

  const mustAvoid = [
    ...sectionsToAvoid.filter((s) => s.length < 80),
    "cartoon mascots",
    "fake before/after",
    "unverified same-day guarantee",
    ...input.complianceWarnings.slice(0, 6),
  ];

  const mustInclude = [
    ...input.pageStrategy.mustIncludeSections.filter((s) => !sectionsToAvoid.includes(s)),
    "clear primary CTA on mobile",
    "what happens next",
    "service area clarity",
  ];

  const sceneGoal =
    input.nicheSlug.includes("insulation") || input.nicheSlug.includes("attic")
      ? "Premium house / attic cutaway with readable heat-loss overlay tied to diagnostic CTA"
      : input.nicheSlug === "roofing"
        ? "Roof plane hero with storm emphasis — trust + urgency without panic"
        : `Niche scene from library that states the buyer problem in 3D, anchored to the primary CTA`;

  const motionGoal =
    "Slow, controlled camera; purposeful parallax; no random particles; reduced-motion safe";

  return {
    businessName: input.businessName,
    niche: input.nichePreset.label,
    city: input.city,
    targetCustomer,
    mainBuyerPain: mainPain,
    primaryOffer: input.nichePreset.leadMagnet,
    conversionGoal: `Drive ${input.nichePreset.primaryCTA.toLowerCase()} and capture qualified leads`,
    trustGoal:
      "Feel technical, local, and credible — proof-forward, low pressure, compliance-safe copy",
    seoGoal: input.seoPrimaryKeyword,
    emotionalGoal: `Address ${mainPain.slice(0, 120)} with clarity and confidence`,
    visualMetaphor,
    premiumReferenceStyle: premiumStyle,
    sectionsNeeded,
    sectionsToAvoid: [...new Set(sectionsToAvoid)],
    "3dSceneGoal": sceneGoal,
    motionGoal,
    mustInclude: [...new Set(mustInclude)],
    mustAvoid: [...new Set(mustAvoid)],
  };
}
