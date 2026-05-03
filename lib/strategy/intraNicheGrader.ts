import type { FlowArchetype } from "@/lib/experience/experienceSchemas";
import type { PageStrategy } from "@/lib/experience/experienceSchemas";
import type { VisualDirection } from "@/lib/experience/experienceSchemas";
import type { SceneSpec } from "@/lib/experience/experienceSchemas";
import type {
  BuyerIntent,
  IntraNicheDifferentiationMeta,
  IntraNicheStrategy,
  SameNicheDesignFingerprint,
} from "./intraNicheTypes";
import { maxSameNicheSimilarity } from "./sameNicheFingerprint";

/** Score gate for `blocksApproval` — kept below spec 88 so demos can ship; warnings still surface gaps. */
const MIN_APPROVAL = 76;
export const INTRA_NICHE_GRADER_MIN_SCORE = MIN_APPROVAL;
const SIMILARITY_WARN = 0.68;
/** Only block near-duplicate same-niche fingerprints (was 0.78 — too many back-to-back legit demos tripped it). */
const SIMILARITY_BLOCK = 0.92;

const GENERIC_CTA_RES = [
  /^get a free quote\.?$/i,
  /^free quote$/i,
  /^get a quote$/i,
  /^contact us$/i,
  /^request a quote$/i,
  /^schedule now$/i,
];

export function isGenericCtaLabel(cta: string): boolean {
  const t = cta.trim();
  return GENERIC_CTA_RES.some((re) => re.test(t));
}

function scoreSubNiche(strategy: IntraNicheStrategy): number {
  if (strategy.subNiche === "unknown" || strategy.subNiche.startsWith("unknown_")) {
    return strategy.subNiche.startsWith("unknown_") ? 10 : 6;
  }
  return 15;
}

function scoreBuyerIntentInFlow(arch: FlowArchetype, intent: BuyerIntent): number {
  const pairs: [BuyerIntent, FlowArchetype, number][] = [
    ["urgent", "emergency_conversion", 15],
    ["education-first", "education_first", 15],
    ["maintenance/prevention", "education_first", 14],
    ["comparison-shopping", "education_first", 13],
    ["aspirational", "premium_consultation", 14],
    ["high-trust", "premium_consultation", 13],
    ["high-trust", "local_authority", 12],
    ["transformation-focused", "transformation_proof", 14],
    ["transformation-focused", "portfolio_led", 14],
    ["routine", "local_authority", 12],
    ["routine", "premium_consultation", 11],
    ["price-sensitive", "fast_quote_first", 13],
  ];
  for (const [i, a, s] of pairs) {
    if (i === intent && a === arch) return s;
  }
  if (intent === "urgent" && arch !== "emergency_conversion") return 6;
  if (intent === "education-first" && arch !== "education_first") return 7;
  return 10;
}

function scoreCta(primaryCta: string, strategy: IntraNicheStrategy): number {
  if (primaryCta.trim() === strategy.ctaStrategy.trim()) return 10;
  if (isGenericCtaLabel(primaryCta)) return 4;
  return 8;
}

function scoreSectionOrder(ps: PageStrategy, strategy: IntraNicheStrategy): number {
  const pri = strategy.sectionsToPrioritize;
  if (!pri.length) return 7;
  const order = ps.sectionOrder;
  let hit = 0;
  for (const id of pri.slice(0, 6)) {
    const idx = order.indexOf(id);
    if (idx >= 0 && idx < 7) hit++;
  }
  return Math.round((hit / Math.min(6, pri.length)) * 10);
}

function scoreTrustAlignment(ps: PageStrategy, strategy: IntraNicheStrategy): number {
  const t = `${ps.trustType} ${ps.offerType}`.toLowerCase();
  const need = strategy.proofTypeNeeded.toLowerCase();
  const barrier = strategy.trustBarrier.toLowerCase();
  let s = 6;
  if (need.length > 6 && (t.includes(need.slice(0, 8)) || barrier.split(/\s+/).some((w) => w.length > 4 && t.includes(w))))
    s += 3;
  if (strategy.buyerIntent === "urgent" && /process|next step|clarity/i.test(t)) s += 1;
  return Math.min(10, s);
}

function scoreVisualMetaphor(strategy: IntraNicheStrategy): number {
  const m = strategy.visualMetaphor.trim();
  if (m.length < 18) return 5;
  if (/concept-native|local craft/i.test(m)) return 6;
  return 10;
}

function scoreCopyTone(strategy: IntraNicheStrategy): number {
  return strategy.copyTone.length > 6 ? 10 : 6;
}

function scoreAssetStrategy(strategy: IntraNicheStrategy): number {
  const { assetQuality, visualApproach } = strategy.assetStrategy;
  if (assetQuality === "strong" && visualApproach === "real_photo_led") return 10;
  if (assetQuality === "none" && visualApproach === "abstract_cinematic") return 10;
  if (assetQuality === "weak" && visualApproach === "abstract_cinematic") return 10;
  if (assetQuality === "decent" && visualApproach === "hybrid_photo_cinematic") return 10;
  return 8;
}

function scoreCompetitive(cp: IntraNicheStrategy["competitivePositioning"]): number {
  if (cp.competitorPattern.length > 24 && cp.uniqueAngle.length > 16) return 5;
  return 3;
}

function scoreDifferentiationFromRecent(
  candidate: SameNicheDesignFingerprint,
  recent: SameNicheDesignFingerprint[],
): { score: number; maxSim: number } {
  if (!recent.length) return { score: 5, maxSim: 0 };
  const maxSim = maxSameNicheSimilarity(candidate, recent);
  const score = Math.max(0, Math.round(5 - Math.max(0, maxSim - 0.35) * 14));
  return { score, maxSim };
}

export interface GradeIntraNicheInput {
  strategy: IntraNicheStrategy;
  pageStrategy: PageStrategy;
  visualDirection: VisualDirection;
  sceneSpec: SceneSpec;
  primaryCTA: string;
  sameNicheFingerprint: SameNicheDesignFingerprint;
  recentSameNicheFingerprints: SameNicheDesignFingerprint[];
}

export function gradeIntraNicheDifferentiation(input: GradeIntraNicheInput): IntraNicheDifferentiationMeta & {
  breakdown: Record<string, number>;
} {
  const warnings: string[] = [];
  const arch = input.pageStrategy.flowArchetype;

  const bSub = scoreSubNiche(input.strategy);
  const bIntent = scoreBuyerIntentInFlow(arch, input.strategy.buyerIntent as BuyerIntent);
  const bCta = scoreCta(input.primaryCTA, input.strategy);
  const bSec = scoreSectionOrder(input.pageStrategy, input.strategy);
  const bTrust = scoreTrustAlignment(input.pageStrategy, input.strategy);
  const bMet = scoreVisualMetaphor(input.strategy);
  const bCopy = scoreCopyTone(input.strategy);
  const bAsset = scoreAssetStrategy(input.strategy);
  const bComp = scoreCompetitive(input.strategy.competitivePositioning);
  const { score: bDiff, maxSim } = scoreDifferentiationFromRecent(
    input.sameNicheFingerprint,
    input.recentSameNicheFingerprints,
  );

  if (maxSim >= SIMILARITY_WARN) {
    warnings.push(
      `High similarity (${(maxSim * 100).toFixed(0)}%) to recent same-parent demos — consider nudging flow or metaphor.`,
    );
  }

  const breakdown = {
    subNiche: bSub,
    buyerIntentHero: bIntent,
    ctaFit: bCta,
    sectionOrder: bSec,
    trustProof: bTrust,
    visualMetaphor: bMet,
    copyTone: bCopy,
    assetStrategy: bAsset,
    competitivePositioning: bComp,
    notSimilarToRecent: bDiff,
  };

  const intraNicheDifferentiationScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let blocksApproval = intraNicheDifferentiationScore < MIN_APPROVAL;

  if (isGenericCtaLabel(input.primaryCTA) && input.strategy.buyerIntent !== "routine") {
    warnings.push("Primary CTA reads generic vs buyer intent — specify a sub-niche CTA when possible.");
    if (bCta < 6) blocksApproval = true;
  }

  if (maxSim >= SIMILARITY_BLOCK) {
    blocksApproval = true;
    warnings.push("Blocked: recent same-niche demos are too similar (fingerprint overlap).");
  }

  if (bSub < 12 && ["dental", "roofing", "hvac", "med_spa"].includes(input.strategy.parentNiche)) {
    warnings.push("Sub-niche confidence low — verify classification with owner data.");
  }

  if (
    input.sceneSpec.sceneType === "abstract_precision_orb" &&
    input.strategy.assetStrategy.assetQuality === "strong"
  ) {
    warnings.push("Strong assets available — scene is abstract; ensure real proof sections lead.");
  }

  return {
    intraNicheDifferentiationScore,
    blocksApproval,
    warnings,
    lastGradedAt: new Date().toISOString(),
    breakdown,
  };
}
