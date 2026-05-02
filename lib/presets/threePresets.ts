import type { ThreeDPreset, ThreeDPresetId } from "./types";

export const THREE_PRESETS: Record<ThreeDPresetId, ThreeDPreset> = {
  "roof-plane-rain": {
    id: "roof-plane-rain",
    label: "Roof Plane + Rain",
    description: "Slanted roof with shingle grid and rain particles, glowing leak hotspot.",
    defaultAccent: "#ff6a3d",
    defaultBackground: "#05070d",
    defaultIntensity: "high",
    niches: ["roofing"],
  },
  "house-heat-loss": {
    id: "house-heat-loss",
    label: "House Heat Loss",
    description: "Cutaway house with attic and orange heat particles escaping upward.",
    defaultAccent: "#ff8a3d",
    defaultBackground: "#070912",
    defaultIntensity: "high",
    niches: ["attic-insulation", "windows-doors", "energy"],
  },
  "airflow-home": {
    id: "airflow-home",
    label: "Airflow Home",
    description: "Abstract home with blue/red airflow streams.",
    defaultAccent: "#4d8bff",
    defaultBackground: "#05070d",
    defaultIntensity: "medium",
    niches: ["hvac"],
  },
  "terrain-layers": {
    id: "terrain-layers",
    label: "Terrain Layers",
    description: "Stacked terrain slabs, patio grid, grass/stone materials.",
    defaultAccent: "#39d98a",
    defaultBackground: "#06090c",
    defaultIntensity: "medium",
    niches: ["landscaping", "interlock", "concrete"],
  },
  "tooth-orb": {
    id: "tooth-orb",
    label: "Tooth Orb",
    description: "Enamel-like orb with smile arc and soft clinical light.",
    defaultAccent: "#2563eb",
    defaultBackground: "#f6f8fc",
    defaultIntensity: "subtle",
    niches: ["dentists", "orthodontists"],
  },
  "glow-sphere": {
    id: "glow-sphere",
    label: "Glow Sphere",
    description: "Glowing premium sphere with soft rings and particles.",
    defaultAccent: "#c97a8b",
    defaultBackground: "#fbf6f3",
    defaultIntensity: "medium",
    niches: ["med-spas", "cosmetic-clinics"],
  },
  "abstract-orb": {
    id: "abstract-orb",
    label: "Abstract Orb",
    description: "Premium abstract object with glass/metal material.",
    defaultAccent: "#4d8bff",
    defaultBackground: "#05070d",
    defaultIntensity: "medium",
    niches: ["fallback"],
  },
};

export function getThreePreset(id: ThreeDPresetId): ThreeDPreset {
  return THREE_PRESETS[id] ?? THREE_PRESETS["abstract-orb"];
}
