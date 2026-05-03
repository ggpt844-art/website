import type {
  BuyerPsychology,
  ConversionStrategy,
  CreativeStrategy,
  SectionStrategy,
  StitchPromptPlan,
} from "./types";

function asStr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
}

function asArr(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return out.length ? out : fallback;
}

export function mergeBuyerPsychology(base: BuyerPsychology, patch: unknown): BuyerPsychology {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    targetCustomer: asStr(p.targetCustomer, base.targetCustomer),
    currentPain: asStr(p.currentPain, base.currentPain),
    urgencyLevel: asStr(p.urgencyLevel, base.urgencyLevel),
    fears: asArr(p.fears, base.fears),
    objections: asArr(p.objections, base.objections),
    desiredOutcome: asStr(p.desiredOutcome, base.desiredOutcome),
    trustBarriers: asArr(p.trustBarriers, base.trustBarriers),
    emotionalHook: asStr(p.emotionalHook, base.emotionalHook),
  };
}

export function mergeCreativeStrategy(base: CreativeStrategy, patch: unknown): CreativeStrategy {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    conceptName: asStr(p.conceptName, base.conceptName),
    coreMetaphor: asStr(p.coreMetaphor, base.coreMetaphor),
    visualStory: asStr(p.visualStory, base.visualStory),
    heroEvent: asStr(p.heroEvent, base.heroEvent),
    sceneMood: asStr(p.sceneMood, base.sceneMood),
    lightingDirection: asStr(p.lightingDirection, base.lightingDirection),
    depthDirection: asStr(p.depthDirection, base.depthDirection),
    motionDirection: asStr(p.motionDirection, base.motionDirection),
    cameraFeel: asStr(p.cameraFeel, base.cameraFeel),
    premiumSignals: asArr(p.premiumSignals, base.premiumSignals),
    avoidVisuals: asArr(p.avoidVisuals, base.avoidVisuals),
  };
}

export function mergeConversionStrategy(base: ConversionStrategy, patch: unknown): ConversionStrategy {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    primaryCTA: asStr(p.primaryCTA, base.primaryCTA),
    secondaryCTA: asStr(p.secondaryCTA, base.secondaryCTA),
    diagnosticIdea: asStr(p.diagnosticIdea, base.diagnosticIdea),
    quoteFlowIdea: asStr(p.quoteFlowIdea, base.quoteFlowIdea),
    trustProofNearCTA: asStr(p.trustProofNearCTA, base.trustProofNearCTA),
    whatHappensNextCopy: asStr(p.whatHappensNextCopy, base.whatHappensNextCopy),
    mobileCTAPlan: asStr(p.mobileCTAPlan, base.mobileCTAPlan),
  };
}

export function mergeSectionStrategy(base: SectionStrategy, patch: unknown): SectionStrategy {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    recommendedFlow: asStr(p.recommendedFlow, base.recommendedFlow),
    sectionOrder: asArr(p.sectionOrder, base.sectionOrder),
    sectionsToAvoid: asArr(p.sectionsToAvoid, base.sectionsToAvoid),
    customSections: asArr(p.customSections, base.customSections),
    rationale: asStr(p.rationale, base.rationale),
  };
}

export function mergeStitchPromptPlan(base: StitchPromptPlan, patch: unknown): StitchPromptPlan {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const keys: (keyof StitchPromptPlan)[] = [
    "promptTitle",
    "projectContext",
    "buyerPsychologyBlock",
    "visualMetaphorBlock",
    "cinematicHeroBlock",
    "cameraDepthBlock",
    "motionBlock",
    "uiStyleBlock",
    "sectionFlowBlock",
    "conversionBlock",
    "mobileBlock",
    "complianceBlock",
    "antiTemplateBlock",
    "variantRequestBlock",
    "outputRequirementsBlock",
  ];
  const out = { ...base };
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "string" && v.trim().length > 0) {
      out[k] = v.trim();
    }
  }
  return out;
}

export function extractJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* fall through */
    }
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      /* fall through */
    }
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }
  throw new Error("Could not parse JSON from model response");
}
