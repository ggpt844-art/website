import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { QA_HARD_PASS, QA_RUBRIC } from "@/lib/presets/scoringWeights";
import { mergeDeep } from "@/lib/utils/mergeDeep";
import { isLegacyTemplateOrder } from "@/lib/experience/planExperience";

export interface CriticInput {
  config: DemoConfig;
  iteration: number;
  currentSiteWeaknesses: string[];
  currentSitePositives: string[];
  currentSiteVisualScore?: number;
}

export interface CategoryScores {
  premiumVisual: number;
  leadConversion: number;
  trustCredibility: number;
  nicheFit: number;
  mobileExperience: number;
  performancePracticality: number;
  demoDifference: number;
}

/** Premium / concept QA beyond legacy rubric buckets */
export interface ExperienceQualityScores {
  nicheFitConcept: number;
  flowLogic: number;
  sectionRelevance: number;
  visualConceptStrength: number;
  sceneRelevance3D: number;
  premiumFeel: number;
  repetitionPenalty: number;
  claudeDesignLikeness: number;
}

export interface CriticOutput {
  totalScore: number;
  categoryScores: CategoryScores;
  experienceScores: ExperienceQualityScores;
  verdict: "approve" | "improve" | "reject";
  criticalIssues: string[];
  minorIssues: string[];
  improvementPlan: string[];
  configPatch: Partial<DemoConfig>;
  reasoningSummary: string;
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(n)));
}

export function gradeDemo(input: CriticInput): CriticOutput {
  const { config, iteration } = input;
  const critical: string[] = [];
  const minor: string[] = [];
  const plan: string[] = [];
  const patch: Partial<DemoConfig> = {};

  if (!("seo" in config) || !config.seo) {
    critical.push("Demo config missing SEO / growth layer — regenerate from the updated builder.");
  }
  if (!("aiSearch" in config) || !config.aiSearch) {
    critical.push("Demo config missing AI search layer — regenerate.");
  }

  // Premium visual (out of 20)
  let premiumVisual = 13;
  if (config.assets.use3DFallback) premiumVisual += 4;
  if (config.assets.heroAssetUrl) premiumVisual += 2;
  if (config.design.visualTone?.toLowerCase().includes("cinematic")) premiumVisual += 2;
  if (config.copy.heroHeadline.length > 90) {
    minor.push("Hero headline is long — premium hero needs concise headline.");
    premiumVisual -= 2;
  }

  // Lead conversion (out of 20)
  let leadConversion = 10;
  if (config.sections.includes("photoUploadQuoteFlow")) leadConversion += 4;
  if (config.sections.includes("diagnosticTool")) leadConversion += 3;
  if (config.quoteFlow.some((q) => q.type === "upload")) leadConversion += 2;
  if (config.quoteFlow.some((q) => q.type === "contact")) leadConversion += 1;
  if (config.copy.finalCtaTitle && config.copy.finalCtaBody) leadConversion += 1;
  if (!config.strategy.primaryCTA) {
    critical.push("Missing primary CTA in strategy.");
    leadConversion -= 5;
  }

  if ((config.seo?.seoFoundationScore ?? 0) < 80) {
    critical.push("SEO foundation score below 80 — expand metadata, headings, and entity clarity.");
  }
  const tier = config.package?.tier ?? "growth";
  const aiMin = tier === "premium" ? 85 : 78;
  if ((config.aiSearch?.aiSearchScore ?? 0) < aiMin) {
    critical.push(
      `AI Search readiness below ${aiMin} for ${tier} tier — strengthen answer blocks and entity summaries.`,
    );
  }
  if ((config.compliance?.severeWarnings?.length ?? 0) > 0) {
    critical.push("Severe compliance issues — remove risky claims before approval.");
  }
  if (config.intraNicheDifferentiationMeta?.blocksApproval) {
    minor.push(
      "Intra-niche differentiation flagged — review score/warnings on Strategy tab; not a hard reject for QA.",
    );
  }
  if (
    config.seo?.seoIndexingMode === "client_indexable" &&
    (config.aiSearch?.aiCrawlerPolicy?.indexingMode !== "client_indexable" ||
      !config.aiSearch?.aiCrawlerPolicy?.allowSearchCrawlers)
  ) {
    critical.push("Indexable client site must allow search crawlers with aligned AI crawler policy.");
  }
  if (
    config.seo?.seoIndexingMode === "demo_noindex" &&
    config.aiSearch?.aiCrawlerPolicy?.allowSearchCrawlers
  ) {
    critical.push("Demo preview must stay noindex — crawler policy should block search crawlers.");
  }
  if (!config.conversion?.leadQualification?.enabled) {
    critical.push("Lead qualification must stay enabled for CRM readiness.");
  }
  if (!config.analytics?.enabled || (config.analytics?.events?.length ?? 0) < 8) {
    critical.push("Analytics must be enabled with a full core event list.");
  }
  if (!config.reporting?.biWeeklyEnabled) {
    minor.push("Consider enabling bi-weekly reporting for retainers.");
  }

  // Trust credibility (out of 15)
  let trust = 9;
  if (config.strategy.riskReducers.length >= 3) trust += 3;
  if (config.copy.trustStrip && config.copy.trustStrip.length >= 3) trust += 2;
  if (config.business.rating && config.business.reviewCount) trust += 1;

  // Niche fit (out of 15)
  let niche = 12;
  if (!config.design.threeDPreset) {
    critical.push("Missing 3D preset in design.");
    niche -= 5;
  }
  if (config.strategy.leadMagnet) niche += 2;
  if (config.copy.problemTitle && config.copy.problemBody) niche += 1;

  // Mobile (out of 10)
  let mobile = 8;
  if (config.sections.includes("photoUploadQuoteFlow")) mobile += 1;
  if (!config.strategy.primaryCTA) mobile -= 3;
  if (config.copy.heroHeadline.length > 110) mobile -= 2;

  // Performance practicality (out of 10)
  let performance = 8;
  if (config.assets.galleryImages.length > 12) performance -= 2;
  if (config.design.motionPreset === "cinematic-pin" && config.copy.heroHeadline.length > 80)
    performance -= 1;
  if (iteration > 1) performance += 1;

  // Demo difference (out of 10)
  let diff = 6;
  diff += Math.min(4, input.currentSiteWeaknesses.length);
  if (input.currentSiteVisualScore !== undefined && input.currentSiteVisualScore < 50)
    diff += 2;
  diff = Math.min(10, diff);

  let repetitionPenalty = 0;
  if (config.pageStrategy && isLegacyTemplateOrder(config.sections)) {
    repetitionPenalty = 3;
    critical.push(
      "Universal legacy section order detected — experience must be archetype-driven, not copy-paste.",
    );
  }

  const emergencyArc =
    config.pageStrategy?.flowArchetype === "emergency_conversion" ||
    config.pageStrategy?.flowArchetype === "fast_quote_first";
  if (
    emergencyArc &&
    (config.sceneSpec?.sceneType === "abstract_precision_orb" ||
      config.design.threeDPreset === "abstract-orb")
  ) {
    critical.push(
      "Triage archetype paired with generic abstract 3D — assign a tactical, urgency-native scene.",
    );
  }

  if (
    config.pageStrategy &&
    config.visualDirection &&
    !config.visualDirection.coreMetaphor?.trim()
  ) {
    minor.push("Visual direction missing core metaphor — page may read as interchangeable template.");
  }

  const ps = config.pageStrategy;
  const vd = config.visualDirection;
  const ss = config.sceneSpec;
  const hasPlan = !!(ps && vd && ss);

  const dm = config.designMd as
    | { avoidList?: string[]; premiumQualityBar?: string[]; badGenericChoicesToAvoid?: string[] }
    | undefined;
  let designMdPremiumBonus = 0;
  if (dm?.premiumQualityBar && dm.premiumQualityBar.length >= 2) designMdPremiumBonus = 1;
  if (dm?.avoidList?.length) {
    const heroBlob = `${config.copy.heroHeadline} ${config.copy.heroSubheadline}`.toLowerCase();
    for (const a of dm.avoidList) {
      const fragment = a.toLowerCase().slice(0, 24);
      if (fragment.length > 4 && heroBlob.includes(fragment)) {
        minor.push(
          `Hero copy may conflict with DESIGN.md avoid-list: "${a.slice(0, 72)}${a.length > 72 ? "…" : ""}"`,
        );
        designMdPremiumBonus = Math.min(designMdPremiumBonus, 0);
      }
    }
  }
  if (dm?.badGenericChoicesToAvoid?.length && vd?.visualMotif) {
    const motif = vd.visualMotif.toLowerCase();
    for (const g of dm.badGenericChoicesToAvoid) {
      if (g.length > 6 && motif.includes(g.toLowerCase().slice(0, 12))) {
        minor.push(`Visual motif may echo a generic pattern flagged in DESIGN.md: "${g.slice(0, 60)}"`);
      }
    }
  }
  if (config.designWorkflowMeta?.blocksApproval) {
    minor.push("Design workflow automation/meta flagged blocksApproval — verify variants or brief.");
  }

  const experienceScores: ExperienceQualityScores = {
    nicheFitConcept: hasPlan ? 9 : 3,
    flowLogic: hasPlan ? 8 : 4,
    sectionRelevance: hasPlan
      ? Math.min(10, 6 + Math.min(3, ps!.customSections.length))
      : 4,
    visualConceptStrength: (vd?.premiumSignals?.length ?? 0) >= 3 ? 9 : 6,
    sceneRelevance3D:
      ss?.enabled && (ss.particleSystems?.length ?? 0) > 0 ? 8 : 5,
    premiumFeel:
      hasPlan && (vd?.textureGuidelines?.length ?? 0) >= 2
        ? Math.min(10, 8 + designMdPremiumBonus)
        : Math.min(10, 5 + designMdPremiumBonus),
    repetitionPenalty,
    claudeDesignLikeness:
      hasPlan && repetitionPenalty === 0 && ps!.customSections.length > 0 ? 9 : 6,
  };

  const conceptDrag = Math.min(
    18,
    Math.round((10 - experienceScores.claudeDesignLikeness) * 0.8 + repetitionPenalty * 2),
  );

  premiumVisual = clamp(premiumVisual, QA_RUBRIC.premiumVisual);
  leadConversion = clamp(leadConversion, QA_RUBRIC.leadConversion);
  trust = clamp(trust, QA_RUBRIC.trustCredibility);
  niche = clamp(niche, QA_RUBRIC.nicheFit);
  mobile = clamp(mobile, QA_RUBRIC.mobileExperience);
  performance = clamp(performance, QA_RUBRIC.performancePracticality);
  diff = clamp(diff, QA_RUBRIC.demoDifference);

  const total =
    premiumVisual +
    leadConversion +
    trust +
    niche +
    mobile +
    performance +
    diff -
    conceptDrag;

  if (premiumVisual < QA_HARD_PASS.premiumVisual)
    plan.push("Tighten hero typography, add cinematic 3D layer, reduce visual noise.");
  if (leadConversion < QA_HARD_PASS.leadConversion) {
    plan.push("Add or strengthen photo-upload quote flow and primary CTA.");
    if (!config.sections.includes("photoUploadQuoteFlow")) {
      patch.sections = [...config.sections, "photoUploadQuoteFlow"];
    }
  }
  if (mobile < QA_HARD_PASS.mobile)
    plan.push("Shorten hero headline, ensure sticky mobile CTA.");
  if (diff < QA_HARD_PASS.demoDifference)
    plan.push("Sharpen the side-by-side audit story to make the upgrade obvious.");

  const passes =
    total >= QA_HARD_PASS.total &&
    premiumVisual >= QA_HARD_PASS.premiumVisual &&
    leadConversion >= QA_HARD_PASS.leadConversion &&
    mobile >= QA_HARD_PASS.mobile &&
    diff >= QA_HARD_PASS.demoDifference;

  const verdict: CriticOutput["verdict"] = critical.length > 0
    ? "reject"
    : passes
      ? "approve"
      : "improve";

  return {
    totalScore: Math.max(0, total),
    categoryScores: {
      premiumVisual,
      leadConversion,
      trustCredibility: trust,
      nicheFit: niche,
      mobileExperience: mobile,
      performancePracticality: performance,
      demoDifference: diff,
    },
    experienceScores,
    verdict,
    criticalIssues: critical,
    minorIssues: minor,
    improvementPlan: plan,
    configPatch: patch,
    reasoningSummary: `Iteration ${iteration}: total ${Math.max(0, total)}/100. Verdict: ${verdict}. Flow: ${ps?.flowArchetype ?? "unplanned"}. Concept: ${vd?.conceptName ?? "—"}.`,
  };
}

export function applyConfigPatch(
  config: DemoConfig,
  patch: Partial<DemoConfig>,
): DemoConfig {
  return mergeDeep(config, patch);
}
