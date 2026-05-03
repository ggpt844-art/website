import type { CameraSpec } from "@/lib/experience/experienceSchemas";
import type { ThreeDPresetId } from "@/lib/presets/types";

export interface SceneProps {
  accentColor?: string;
  backgroundColor?: string;
  intensity?: "subtle" | "medium" | "high";
  motionSpeed?: number;
  labels?: boolean;
  reducedMotion?: boolean;
  quality?: "low" | "medium" | "high";
  /** From sceneSpec — informs materials, fog, particles in scenes that read these. */
  lightingPreset?: string;
  materialPreset?: string;
  cameraSpec?: CameraSpec | null;
  isMobile?: boolean;
  /** Optional `/public/models/*.glb` accent (roofing hero) */
  heroGlbUrl?: string | null;
}

export type SceneId = ThreeDPresetId;
