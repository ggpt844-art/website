import type { ThreeDPresetId } from "@/lib/presets/types";

export interface SceneProps {
  accentColor?: string;
  backgroundColor?: string;
  intensity?: "subtle" | "medium" | "high";
  motionSpeed?: number;
  labels?: boolean;
  reducedMotion?: boolean;
  quality?: "low" | "medium" | "high";
}

export type SceneId = ThreeDPresetId;
