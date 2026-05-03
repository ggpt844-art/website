import { z } from "zod";
import {
  CameraAngleSchemaValues,
  MovementStyleSchemaValues,
} from "@/lib/visual-engine/cameraTypes";

export const FlowArchetypeSchema = z.enum([
  "emergency_conversion",
  "premium_consultation",
  "local_authority",
  "education_first",
  "transformation_proof",
  "portfolio_led",
  "fast_quote_first",
]);

export type FlowArchetype = z.infer<typeof FlowArchetypeSchema>;

export const PageStrategySchema = z.object({
  nicheType: z.string(),
  salesModel: z.string(),
  urgencyLevel: z.string(),
  trustType: z.string(),
  offerType: z.string(),
  desiredStoryArc: z.string(),
  flowArchetype: FlowArchetypeSchema,
  mustIncludeSections: z.array(z.string()),
  optionalSections: z.array(z.string()),
  forbiddenSections: z.array(z.string()),
  customSections: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
    }),
  ),
  sectionOrder: z.array(z.string()),
});

export type PageStrategy = z.infer<typeof PageStrategySchema>;

export const VisualDirectionSchema = z.object({
  conceptName: z.string(),
  coreMetaphor: z.string(),
  emotionalTone: z.string(),
  visualMotif: z.string(),
  colorLogic: z.string(),
  lightingStyle: z.string(),
  depthStyle: z.string(),
  motionLanguage: z.string(),
  typographyMood: z.string(),
  premiumSignals: z.array(z.string()),
  textureGuidelines: z.array(z.string()),
  /** Design-workflow / Stitch layer — avoid generic or off-brand patterns. */
  avoidList: z.array(z.string()).optional(),
});

export type VisualDirection = z.infer<typeof VisualDirectionSchema>;

/** Semantic scene types mapped to Three.js implementations in ThreeSceneRouter. */
export const SceneTypeSchema = z.enum([
  "roof_storm_hotspot",
  "thermal_house_cutaway",
  "hvac_airflow_stack",
  "terrain_landform_study",
  "abstract_smile_sculpture",
  "clinical_glow_sphere",
  "abstract_precision_orb",
  "renovation_layer_cutaway",
]);

export type SceneType = z.infer<typeof SceneTypeSchema>;

export const CameraSpecSchema = z.object({
  initialPosition: z.tuple([z.number(), z.number(), z.number()]),
  initialTarget: z.tuple([z.number(), z.number(), z.number()]),
  focalLength: z.string(),
  cameraAngle: z.enum(CameraAngleSchemaValues),
  movementStyle: z.enum(MovementStyleSchemaValues),
  scrollCameraMoves: z.array(z.string()),
  hoverCameraMoves: z.array(z.string()),
  zoomMoments: z.array(z.string()),
  focusTargets: z.array(z.string()),
  mobileCameraFallback: z.string(),
  reducedMotionCameraFallback: z.string(),
});

export type CameraSpec = z.infer<typeof CameraSpecSchema>;

export const SceneFallbacksSchema = z.object({
  desktopQuality: z.enum(["high", "medium"]),
  mobileQuality: z.enum(["medium", "low"]),
  staticCinematicTreatment: z.string(),
  reducedMotionTreatment: z.string(),
});

export type SceneFallbacks = z.infer<typeof SceneFallbacksSchema>;

export const SceneSpecSchema = z.object({
  enabled: z.boolean(),
  sceneType: SceneTypeSchema,
  purpose: z.string(),
  /** Optional hero layout note — consumed by design workflow / docs; scenes may ignore. */
  heroComposition: z.string().optional(),
  cameraStyle: z.string(),
  lightingPreset: z.string(),
  materialPreset: z.string(),
  particleSystems: z.array(z.string()),
  depthLayers: z.array(z.string()),
  interactiveElements: z.array(z.string()),
  uiAnchors: z.array(z.string()),
  /** Scroll-linked beats — documentation / QA; optional for scenes. */
  scrollMoments: z.array(z.string()).optional(),
  performanceTier: z.enum(["low", "medium", "high"]),
  mobileFallback: z.string().optional(),
  reducedMotionFallback: z.string().optional(),
  cameraSpec: CameraSpecSchema.optional(),
  fallbacks: SceneFallbacksSchema.optional(),
});

export type SceneSpec = z.infer<typeof SceneSpecSchema>;

export const DesignFingerprintSchema = z.object({
  flowArchetype: FlowArchetypeSchema,
  sectionOrderHash: z.string(),
  heroLayoutType: z.string(),
  sceneType: SceneTypeSchema,
  colorFamily: z.string(),
  ctaPattern: z.string(),
  trustPattern: z.string(),
  motionPattern: z.string(),
});

export type DesignFingerprint = z.infer<typeof DesignFingerprintSchema>;

export const MobilePlanSchema = z.object({
  heroPriority: z.string(),
  simplifiedScene: z.boolean(),
  stickyCtaType: z.string(),
  sectionsToCollapse: z.array(z.string()),
  sectionsToReorder: z.array(z.string()),
  motionReduction: z.string(),
  performanceFallback: z.string(),
});

export type MobilePlan = z.infer<typeof MobilePlanSchema>;

export const FlowRationaleSchema = z.object({
  selectedArchetype: FlowArchetypeSchema,
  whyThisFlowFits: z.string(),
  whySectionsWereIncluded: z.array(z.string()),
  whySectionsWereExcluded: z.array(z.string()),
  conversionGoal: z.string(),
  trustGoal: z.string(),
  visualGoal: z.string(),
});

export type FlowRationale = z.infer<typeof FlowRationaleSchema>;
