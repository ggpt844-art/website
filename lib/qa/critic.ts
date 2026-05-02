import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { QA_HARD_PASS, QA_RUBRIC } from "@/lib/presets/scoringWeights";

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

export interface CriticOutput {
  totalScore: number;
  categoryScores: CategoryScores;
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

  premiumVisual = clamp(premiumVisual, QA_RUBRIC.premiumVisual);
  leadConversion = clamp(leadConversion, QA_RUBRIC.leadConversion);
  trust = clamp(trust, QA_RUBRIC.trustCredibility);
  niche = clamp(niche, QA_RUBRIC.nicheFit);
  mobile = clamp(mobile, QA_RUBRIC.mobileExperience);
  performance = clamp(performance, QA_RUBRIC.performancePracticality);
  diff = clamp(diff, QA_RUBRIC.demoDifference);

  const total =
    premiumVisual + leadConversion + trust + niche + mobile + performance + diff;

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
    totalScore: total,
    categoryScores: {
      premiumVisual,
      leadConversion,
      trustCredibility: trust,
      nicheFit: niche,
      mobileExperience: mobile,
      performancePracticality: performance,
      demoDifference: diff,
    },
    verdict,
    criticalIssues: critical,
    minorIssues: minor,
    improvementPlan: plan,
    configPatch: patch,
    reasoningSummary: `Iteration ${iteration}: total ${total}/100. Verdict: ${verdict}.`,
  };
}

export function applyConfigPatch(
  config: DemoConfig,
  patch: Partial<DemoConfig>,
): DemoConfig {
  return {
    ...config,
    ...patch,
    business: { ...config.business, ...(patch.business ?? {}) },
    strategy: { ...config.strategy, ...(patch.strategy ?? {}) },
    design: { ...config.design, ...(patch.design ?? {}) },
    assets: { ...config.assets, ...(patch.assets ?? {}) },
    copy: { ...config.copy, ...(patch.copy ?? {}) },
    sections: patch.sections ?? config.sections,
    quoteFlow: patch.quoteFlow ?? config.quoteFlow,
    services: patch.services ?? config.services,
    process: patch.process ?? config.process,
  };
}
