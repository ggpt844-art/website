// Shared preset and config types for niches, design systems, motion, 3D, scoring.

export type ThemeMode = "dark" | "light" | "soft";
export type MotionLevel = "subtle" | "medium" | "high";
export type DesignSystemId =
  | "contractor-cinematic-dark"
  | "medical-clean-3d"
  | "luxury-wellness-glass"
  | "industrial-premium"
  | "home-service-motion";

export type ThreeDPresetId =
  | "roof-plane-rain"
  | "house-heat-loss"
  | "airflow-home"
  | "terrain-layers"
  | "tooth-orb"
  | "glow-sphere"
  | "abstract-orb";

export type MotionPresetId =
  | "cinematic-pin"
  | "calm-clinical"
  | "editorial-glass"
  | "industrial-precision"
  | "friendly-fast";

export interface QuoteFlowQuestion {
  id: string;
  question: string;
  type: "choice" | "text" | "upload" | "contact" | "date";
  options?: string[];
  required?: boolean;
  helper?: string;
}

export interface NichePreset {
  slug: string;
  label: string;
  categoryGroup: string;
  estimatedLeadValue: number;
  defaultServices: string[];
  buyerPains: string[];
  highValueServices: string[];
  leadMagnet: string;
  primaryCTA: string;
  secondaryCTA: string;
  quoteFlow: QuoteFlowQuestion[];
  trustPoints: string[];
  faqs: { q: string; a: string }[];
  riskReducers: string[];
  visualDirection: string;
  designSystem: DesignSystemId;
  themePreset: string;
  motionPreset: MotionPresetId;
  threeDPreset: ThreeDPresetId;
  accentColor: string;
  sectionOrder: string[];
  heroFormula: { headline: string; subheadline: string };
  problem: { title: string; body: string };
  finalCta: { title: string; body: string };
}

export interface DesignSystem {
  id: DesignSystemId;
  label: string;
  mode: ThemeMode;
  description: string;
  cssVars: Record<string, string>;
  typography: {
    displayFont: string;
    bodyFont: string;
    scale: { h1: string; h2: string; h3: string; body: string; small: string };
  };
  spacing: { sectionY: string; containerX: string; gap: string };
  radius: { card: string; button: string; chip: string };
  cardStyle: string;
  buttonStyle: string;
  trustStripStyle: string;
  quoteFlowStyle: string;
  threeMaterialHint: string;
  motionIntensity: MotionLevel;
}

export interface MotionPreset {
  id: MotionPresetId;
  label: string;
  scrollStory: string[];
  pinnedSections: string[];
  parallaxRules: string;
  reducedMotionBehavior: string;
  intensity: MotionLevel;
}

export interface ThreeDPreset {
  id: ThreeDPresetId;
  label: string;
  description: string;
  defaultAccent: string;
  defaultBackground: string;
  defaultIntensity: MotionLevel;
  niches: string[];
}

export interface ScoringWeights {
  business: { value: number };
  weakness: { value: number };
  opportunity: { value: number };
  outreach: { value: number };
  thresholds: { hot: number; warm: number; low: number };
}
