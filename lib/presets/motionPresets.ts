import type { MotionPreset, MotionPresetId } from "./types";

export const MOTION_PRESETS: Record<MotionPresetId, MotionPreset> = {
  "cinematic-pin": {
    id: "cinematic-pin",
    label: "Cinematic Pin",
    scrollStory: [
      "Hero pinned 1.2x viewport with 3D depth pull",
      "Reveal of problem visualization with parallax glow",
      "Diagnostic tool stage with focused spotlight",
      "Process timeline with stepped reveals",
      "Final CTA with reduced motion arrival",
    ],
    pinnedSections: ["hero", "problemVisualization", "diagnosticTool"],
    parallaxRules:
      "Depth tiers (-30, -15, 0, 15) on hero. Subtle Y parallax on cards.",
    reducedMotionBehavior: "All pinned sections become static; transitions fade only.",
    intensity: "high",
  },
  "calm-clinical": {
    id: "calm-clinical",
    label: "Calm Clinical",
    scrollStory: [
      "Soft fade-in hero with slow drift",
      "Trust strip slides up gently",
      "Treatment cards stagger with calm easing",
      "Process explained with subtle reveals",
    ],
    pinnedSections: [],
    parallaxRules: "Minimal parallax. Focus on whitespace and rhythm.",
    reducedMotionBehavior: "Replace easing with simple opacity transitions.",
    intensity: "subtle",
  },
  "editorial-glass": {
    id: "editorial-glass",
    label: "Editorial Glass",
    scrollStory: [
      "Hero glass pane with iridescent shimmer",
      "Outcome quotes with luxurious type reveal",
      "Treatment quiz spotlight",
      "Final CTA with soft glow",
    ],
    pinnedSections: ["hero"],
    parallaxRules: "Slow Y parallax on glass cards, soft shimmer rotation.",
    reducedMotionBehavior: "Disable shimmer; cards fade only.",
    intensity: "medium",
  },
  "industrial-precision": {
    id: "industrial-precision",
    label: "Industrial Precision",
    scrollStory: [
      "Hero grid drawing in",
      "Process steps with linear scrub",
      "Project gallery with strict snap",
      "CTA with mechanical reveal",
    ],
    pinnedSections: ["hero", "process"],
    parallaxRules: "Linear scrub-driven reveals with snap.",
    reducedMotionBehavior: "Disable scrub; show static stepped reveals.",
    intensity: "medium",
  },
  "friendly-fast": {
    id: "friendly-fast",
    label: "Friendly Fast",
    scrollStory: [
      "Energetic hero with quick CTA reveal",
      "Trust strip pop-in",
      "Service cards stagger",
      "Quote flow front-and-center",
    ],
    pinnedSections: [],
    parallaxRules: "Light parallax on cards, quick easing.",
    reducedMotionBehavior: "Replace pop-ins with simple fade.",
    intensity: "medium",
  },
};

export function getMotionPreset(id: MotionPresetId): MotionPreset {
  return MOTION_PRESETS[id] ?? MOTION_PRESETS["cinematic-pin"];
}
