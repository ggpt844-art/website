import { z } from "zod";
import type { DesignSystemId, MotionPresetId, ThreeDPresetId } from "@/lib/presets/types";

export const QuoteFlowQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["choice", "text", "upload", "contact", "date"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  helper: z.string().optional(),
});

export const DemoConfigSchema = z.object({
  slug: z.string(),
  business: z.object({
    name: z.string(),
    city: z.string(),
    phone: z.string().nullable().optional(),
    category: z.string(),
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
});

export type DemoConfig = z.infer<typeof DemoConfigSchema>;
