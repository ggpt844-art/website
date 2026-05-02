import type { NichePreset } from "@/lib/presets/types";

export interface ConversionStrategy {
  positioning: string;
  primaryPain: string;
  moneyAngle: string;
  conversionGap: string;
  contactReason: string;
  primaryGoal: string;
  leadMagnet: string;
  primaryCTA: string;
  secondaryCTA: string;
  riskReducers: string[];
  ctaHierarchy: string[];
  trustProofNeeded: string[];
  quoteFlowQuestionIds: string[];
}

export function buildStrategy(args: {
  niche: NichePreset;
  city: string;
  weaknesses: string[];
  hasGoodAssets: boolean;
}): ConversionStrategy {
  const { niche, city, weaknesses } = args;
  const conversionGap =
    weaknesses.find((w) => /funnel|upload|sticky|cta|trust/i.test(w)) ??
    "No guided lead-capture path on the current site.";
  return {
    positioning: `${niche.label} in ${city} with a clear, modern lead-capture path.`,
    primaryPain: niche.buyerPains[0],
    moneyAngle: niche.heroFormula.headline,
    conversionGap,
    contactReason: `${niche.label} demo focused on capturing better quote requests in ${city}.`,
    primaryGoal: "Generate qualified quote requests with photo upload + contact details.",
    leadMagnet: niche.leadMagnet,
    primaryCTA: niche.primaryCTA,
    secondaryCTA: niche.secondaryCTA,
    riskReducers: niche.riskReducers,
    ctaHierarchy: [niche.primaryCTA, niche.secondaryCTA, "Call now"],
    trustProofNeeded: niche.trustPoints,
    quoteFlowQuestionIds: niche.quoteFlow.map((q) => q.id),
  };
}
