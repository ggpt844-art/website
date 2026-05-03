import type { PageStrategy, SceneSpec, VisualDirection } from "@/lib/experience/experienceSchemas";

export type DesignMode = "internal_auto" | "stitch_assisted" | "manual_reference";

export type DesignPatchTarget = "visualDirection" | "sceneSpec" | "pageStrategy" | "designMd";

export interface DesignPatch {
  target: DesignPatchTarget;
  action: "update" | "replace";
  patch: Record<string, unknown>;
}

export interface DesignBrief {
  businessName: string;
  niche: string;
  city: string;
  targetCustomer: string;
  mainBuyerPain: string;
  primaryOffer: string;
  conversionGoal: string;
  trustGoal: string;
  seoGoal: string;
  emotionalGoal: string;
  visualMetaphor: string;
  premiumReferenceStyle: string;
  sectionsNeeded: string[];
  sectionsToAvoid: string[];
  "3dSceneGoal": string;
  motionGoal: string;
  mustInclude: string[];
  mustAvoid: string[];
}

export interface ParsedStitchReference {
  selectedDirection: string;
  heroLayout: string;
  sectionOrder: string[];
  visualMotif: string;
  colorSystem: Record<string, string>;
  typographyMood: string;
  motionStyle: string;
  "3dSceneDirection": string;
  cardStyle: string;
  ctaStyle: string;
  trustStyle: string;
  mobileNotes: string;
  avoidList: string[];
  implementationNotes: string[];
  uncertainFields: string[];
}

export interface DesignMd {
  projectName: string;
  businessNiche: string;
  designIntent: string;
  emotionalGoal: string;
  coreMetaphor: string;
  targetUserFeeling: string;
  visualMotif: string;
  colorTokens: string[];
  colorMeanings: Record<string, string>;
  typographyRules: string[];
  spacingRules: string[];
  componentRules: string[];
  motionRules: string[];
  "3dSceneRules": string[];
  accessibilityRules: string[];
  premiumQualityBar: string[];
  avoidList: string[];
  copyToneExamples: string[];
  badGenericChoicesToAvoid: string[];
}

export interface DesignWorkflowGradeResult {
  designWorkflowScore: number;
  warnings: string[];
  blocksApproval: boolean;
  suggestedPatches: DesignPatch[];
}

export type DesignVariantTypeSlug =
  | "safe_conversion"
  | "premium_cinematic"
  | "bold_experimental"
  | "custom";

export function designModeDefault(mode: DesignMode | undefined): DesignMode {
  return mode ?? "internal_auto";
}

export type { PageStrategy, SceneSpec, VisualDirection };
