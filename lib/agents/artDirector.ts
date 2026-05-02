import type { NichePreset } from "@/lib/presets/types";

export interface ArtDirection {
  designSystem: NichePreset["designSystem"];
  themePreset: string;
  threeDPreset: NichePreset["threeDPreset"];
  motionPreset: NichePreset["motionPreset"];
  visualMood: string;
  heroObject: string;
  backgroundStyle: string;
  typographyDirection: string;
  accentColor: string;
}

export function directArt(args: {
  niche: NichePreset;
  premiumLevel: "high" | "medium";
  hasGoodHeroAsset: boolean;
}): ArtDirection {
  const { niche, premiumLevel, hasGoodHeroAsset } = args;
  return {
    designSystem: niche.designSystem,
    themePreset: niche.themePreset,
    threeDPreset: niche.threeDPreset,
    motionPreset: niche.motionPreset,
    visualMood: niche.visualDirection,
    heroObject: hasGoodHeroAsset
      ? "Real photographic hero with cinematic 3D accent layer"
      : `Cinematic 3D hero (${niche.threeDPreset})`,
    backgroundStyle:
      premiumLevel === "high"
        ? "Layered depth with subtle particles and accent glow"
        : "Simplified depth with reduced motion",
    typographyDirection:
      "Tight tracking, large display weight, restrained body copy with airy spacing.",
    accentColor: niche.accentColor,
  };
}
