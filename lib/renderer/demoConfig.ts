import { z } from "zod";
import type { DesignSystemId, MotionPresetId, ThreeDPresetId } from "@/lib/presets/types";
import { SeoConfigSchema } from "@/lib/seo/seoTypes";
import { AiSearchConfigSchema } from "@/lib/ai-search/aiSearchTypes";
import {
  AnalyticsConfigSchema,
  ComplianceConfigSchema,
  ConversionConfigSchema,
  PackageConfigSchema,
  ReportingConfigSchema,
  TrustConfigSchema,
} from "@/lib/growth/schemas";
import {
  DesignFingerprintSchema,
  FlowRationaleSchema,
  MobilePlanSchema,
  PageStrategySchema,
  SceneSpecSchema,
  VisualDirectionSchema,
} from "@/lib/experience/experienceSchemas";
import {
  IntraNicheDifferentiationMetaSchema,
  IntraNicheStrategySchema,
  SameNicheDesignFingerprintSchema,
} from "@/lib/strategy/intraNicheZod";

export const QuoteFlowQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["choice", "text", "upload", "contact", "date"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  helper: z.string().optional(),
});

/** Persisted bundle from the cinematic Stitch prompt agent (dashboard + automation). */
export const DesignWorkflowBundleSchema = z.object({
  buyerPsychology: z.record(z.unknown()).optional(),
  creativeStrategy: z.record(z.unknown()).optional(),
  conversionStrategy: z.record(z.unknown()).optional(),
  sectionStrategy: z.record(z.unknown()).optional(),
  stitchPromptPlan: z.record(z.unknown()).optional(),
  finalStitchPrompt: z.string().optional(),
  stitchPromptAgentWarnings: z.array(z.string()).optional(),
  stitchPromptConfidence: z.number().optional(),
  stitchPromptScore: z.number().optional(),
  stitchPromptBlocksAutoStitch: z.boolean().optional(),
  stitchPromptGradedAt: z.string().optional(),
  desiredVariantCount: z.number().optional(),
  lastStitchPromptAgentAt: z.string().optional(),
  stitchPromptGraderBreakdown: z.record(z.unknown()).optional(),
  stitchPromptUsedClaude: z.boolean().optional(),
});

export type DesignWorkflowBundle = z.infer<typeof DesignWorkflowBundleSchema>;

export const DemoConfigSchema = z.object({
  slug: z.string(),
  business: z.object({
    name: z.string(),
    city: z.string(),
    phone: z.string().nullable().optional(),
    category: z.string(),
    /** Niche preset slug (e.g. roofing) — optional on legacy stored configs */
    nicheSlug: z.string().optional(),
    rating: z.number().nullable().optional(),
    reviewCount: z.number().nullable().optional(),
    websiteUrl: z.string().nullable().optional(),
  }),
  strategy: z.object({
    positioning: z.string(),
    primaryPain: z.string(),
    moneyAngle: z.string(),
    leadMagnet: z.string(),
    primaryCTA: z.string(),
    secondaryCTA: z.string(),
    contactReason: z.string(),
    riskReducers: z.array(z.string()),
  }),
  design: z.object({
    designSystem: z.custom<DesignSystemId>(),
    themePreset: z.string(),
    motionPreset: z.custom<MotionPresetId>(),
    threeDPreset: z.custom<ThreeDPresetId>(),
    visualTone: z.string(),
    accentColor: z.string(),
    backgroundMode: z.enum(["dark", "light", "soft"]),
  }),
  assets: z.object({
    logoUrl: z.string().optional(),
    heroAssetUrl: z.string().optional(),
    /** Optional GLB for niche hero accents (e.g. /models/roof-detail.glb) */
    heroGlbUrl: z.string().optional(),
    /**
     * `thermal_loss` = attic / envelope cinematic grade; `dental_local` = village/clinic plate + calm grade.
     */
    heroCinematic: z.enum(["thermal_loss", "dental_local"]).optional(),
    heroVideoUrl: z.string().optional(),
    /** Poster for video + fallback still URL for thermal treatment */
    heroPosterUrl: z.string().optional(),
    /**
     * When true, `regenerate-demos` and live rebuild keep hero fields below from stored JSON
     * instead of re-deriving from crawl / niche defaults.
     */
    heroLocked: z.boolean().optional(),
    use3DFallback: z.boolean(),
    galleryImages: z.array(z.string()).default([]),
    proofImages: z.array(z.string()).default([]),
  }),
  sections: z.array(z.string()),
  quoteFlow: z.array(QuoteFlowQuestionSchema),
  copy: z.object({
    heroHeadline: z.string(),
    heroSubheadline: z.string(),
    problemTitle: z.string(),
    problemBody: z.string(),
    finalCtaTitle: z.string(),
    finalCtaBody: z.string(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })),
    trustStrip: z.array(z.string()).optional(),
    servicesHeadline: z.string().optional(),
    proofHeadline: z.string().optional(),
    processHeadline: z.string().optional(),
  }),
  services: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        problem: z.string().optional(),
      }),
    )
    .default([]),
  process: z
    .array(z.object({ step: z.string(), description: z.string() }))
    .default([]),
  seo: SeoConfigSchema,
  aiSearch: AiSearchConfigSchema,
  conversion: ConversionConfigSchema,
  analytics: AnalyticsConfigSchema,
  trust: TrustConfigSchema,
  compliance: ComplianceConfigSchema,
  package: PackageConfigSchema,
  reporting: ReportingConfigSchema,
  /** Experience planning: flow, visual concept, 3D scene (optional on older configs). */
  pageStrategy: PageStrategySchema.optional(),
  visualDirection: VisualDirectionSchema.optional(),
  sceneSpec: SceneSpecSchema.optional(),
  designFingerprint: DesignFingerprintSchema.optional(),
  mobilePlan: MobilePlanSchema.optional(),
  flowRationale: FlowRationaleSchema.optional(),
  /**
   * internal_auto — presets + planExperience only.
   * stitch_assisted — Stitch prompt + imported reference layered on top.
   * manual_reference — same as stitch_assisted but sources are non-Stitch.
   */
  designMode: z.enum(["internal_auto", "stitch_assisted", "manual_reference"]).optional(),
  /** Stitch / design workflow — structured brief (editable in dashboard). */
  designBrief: z.record(z.unknown()).optional(),
  /** Structured design memory (from internal gen or Stitch import). */
  designMd: z.record(z.unknown()).optional(),
  /** Latest design workflow QA (not a substitute for demo QA loop). */
    designWorkflowMeta: z
    .object({
      designWorkflowScore: z.number().optional(),
      lastGradedAt: z.string().optional(),
      warnings: z.array(z.string()).optional(),
      blocksApproval: z.boolean().optional(),
      automated: z.boolean().optional(),
    })
    .optional(),
  /** Last exported Stitch prompt (manual copy/paste workflow). */
  stitchPromptLast: z.string().optional(),
  /**
   * Claude → Stitch Prompt Agent: reasoning objects, graded final prompt, automation gates.
   */
  designWorkflow: DesignWorkflowBundleSchema.optional(),
  /** Intra-niche differentiation — generated before planExperience; optional on legacy JSON. */
  intraNicheStrategy: IntraNicheStrategySchema.optional(),
  sameNicheDesignFingerprint: SameNicheDesignFingerprintSchema.optional(),
  intraNicheDifferentiationMeta: IntraNicheDifferentiationMetaSchema.optional(),
  /**
   * Dashboard overrides merged on top of `generateIntraNicheStrategy` on rebuild/regenerate.
   * Shallow partial keys supported — nested objects replace by branch in merge helper.
   */
  intraNicheManualOverrides: IntraNicheStrategySchema.partial().optional(),
});

export type DemoConfig = z.infer<typeof DemoConfigSchema>;
