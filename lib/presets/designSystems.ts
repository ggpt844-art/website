import type { DesignSystem, DesignSystemId } from "./types";

export const DESIGN_SYSTEMS: Record<DesignSystemId, DesignSystem> = {
  "contractor-cinematic-dark": {
    id: "contractor-cinematic-dark",
    label: "Contractor Cinematic Dark",
    mode: "dark",
    description:
      "Dark cinematic premium for roofing, HVAC, insulation, landscaping, concrete, windows.",
    cssVars: {
      "--bg": "#05070d",
      "--bg-elev": "#0a0e1a",
      "--surface": "#10141fcc",
      "--border": "rgba(255,255,255,0.08)",
      "--text": "#f4f6fb",
      "--text-dim": "rgba(244,246,251,0.65)",
      "--accent": "#ff6a3d",
      "--accent-2": "#4d8bff",
      "--ring": "rgba(255,106,61,0.4)",
    },
    typography: {
      displayFont: "var(--font-display)",
      bodyFont: "var(--font-body)",
      scale: {
        h1: "clamp(2.75rem, 6vw, 5.5rem)",
        h2: "clamp(2rem, 4vw, 3.25rem)",
        h3: "clamp(1.25rem, 2vw, 1.75rem)",
        body: "1.0625rem",
        small: "0.875rem",
      },
    },
    spacing: { sectionY: "8rem", containerX: "1.5rem", gap: "1.5rem" },
    radius: { card: "1.25rem", button: "999px", chip: "999px" },
    cardStyle:
      "bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]",
    buttonStyle:
      "bg-[var(--accent)] text-black hover:brightness-110 transition rounded-full px-6 py-3 font-semibold tracking-tight",
    trustStripStyle:
      "border-y border-[var(--border)] bg-black/20 backdrop-blur-sm",
    quoteFlowStyle:
      "bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6",
    threeMaterialHint: "metallic + glass + emissive accents",
    motionIntensity: "high",
  },
  "medical-clean-3d": {
    id: "medical-clean-3d",
    label: "Medical Clean 3D",
    mode: "light",
    description: "Calm, clinical, trust-first. For dentists, ortho, clinics.",
    cssVars: {
      "--bg": "#f6f8fc",
      "--bg-elev": "#ffffff",
      "--surface": "#ffffffcc",
      "--border": "rgba(15,23,42,0.08)",
      "--text": "#0f172a",
      "--text-dim": "rgba(15,23,42,0.65)",
      "--accent": "#2563eb",
      "--accent-2": "#22c5d6",
      "--ring": "rgba(37,99,235,0.35)",
    },
    typography: {
      displayFont: "var(--font-display)",
      bodyFont: "var(--font-body)",
      scale: {
        h1: "clamp(2.5rem, 5.5vw, 4.75rem)",
        h2: "clamp(1.875rem, 4vw, 3rem)",
        h3: "clamp(1.25rem, 2vw, 1.625rem)",
        body: "1.0625rem",
        small: "0.875rem",
      },
    },
    spacing: { sectionY: "7rem", containerX: "1.5rem", gap: "1.25rem" },
    radius: { card: "1.5rem", button: "999px", chip: "999px" },
    cardStyle:
      "bg-white/85 border border-[var(--border)] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur",
    buttonStyle:
      "bg-[var(--accent)] text-white hover:brightness-110 transition rounded-full px-6 py-3 font-semibold",
    trustStripStyle: "border-y border-[var(--border)] bg-white/60",
    quoteFlowStyle:
      "bg-white/90 border border-[var(--border)] rounded-3xl p-6 shadow-sm",
    threeMaterialHint: "enamel + glass + soft clinical lights",
    motionIntensity: "subtle",
  },
  "luxury-wellness-glass": {
    id: "luxury-wellness-glass",
    label: "Luxury Wellness Glass",
    mode: "soft",
    description: "Soft gradients, glass, glow. For med spas, beauty, wellness.",
    cssVars: {
      "--bg": "#fbf6f3",
      "--bg-elev": "#ffffff",
      "--surface": "rgba(255,255,255,0.7)",
      "--border": "rgba(120,80,80,0.12)",
      "--text": "#2a1f23",
      "--text-dim": "rgba(42,31,35,0.65)",
      "--accent": "#c97a8b",
      "--accent-2": "#e7c2a3",
      "--ring": "rgba(201,122,139,0.35)",
    },
    typography: {
      displayFont: "var(--font-display)",
      bodyFont: "var(--font-body)",
      scale: {
        h1: "clamp(2.5rem, 5.5vw, 4.75rem)",
        h2: "clamp(1.875rem, 4vw, 3rem)",
        h3: "clamp(1.25rem, 2vw, 1.625rem)",
        body: "1.0625rem",
        small: "0.875rem",
      },
    },
    spacing: { sectionY: "8rem", containerX: "1.5rem", gap: "1.5rem" },
    radius: { card: "1.75rem", button: "999px", chip: "999px" },
    cardStyle:
      "bg-white/70 border border-[var(--border)] backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(120,80,80,0.25)]",
    buttonStyle:
      "bg-[var(--accent)] text-white hover:brightness-110 transition rounded-full px-6 py-3 font-semibold tracking-wide",
    trustStripStyle: "border-y border-[var(--border)] bg-white/50",
    quoteFlowStyle:
      "bg-white/80 border border-[var(--border)] rounded-3xl p-6 backdrop-blur",
    threeMaterialHint: "iridescent glass + soft glow + particles",
    motionIntensity: "medium",
  },
  "industrial-premium": {
    id: "industrial-premium",
    label: "Industrial Premium",
    mode: "dark",
    description: "Steel, precision, technical credibility.",
    cssVars: {
      "--bg": "#0b0c0f",
      "--bg-elev": "#121317",
      "--surface": "#16181d",
      "--border": "rgba(255,255,255,0.08)",
      "--text": "#e9eaee",
      "--text-dim": "rgba(233,234,238,0.6)",
      "--accent": "#f5b301",
      "--accent-2": "#7e8794",
      "--ring": "rgba(245,179,1,0.35)",
    },
    typography: {
      displayFont: "var(--font-display)",
      bodyFont: "var(--font-body)",
      scale: {
        h1: "clamp(2.75rem, 6vw, 5.25rem)",
        h2: "clamp(2rem, 4vw, 3.25rem)",
        h3: "clamp(1.25rem, 2vw, 1.75rem)",
        body: "1rem",
        small: "0.85rem",
      },
    },
    spacing: { sectionY: "7rem", containerX: "1.5rem", gap: "1.25rem" },
    radius: { card: "0.5rem", button: "0.25rem", chip: "0.25rem" },
    cardStyle:
      "bg-[var(--surface)] border border-[var(--border)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]",
    buttonStyle:
      "bg-[var(--accent)] text-black hover:brightness-110 transition rounded px-6 py-3 font-semibold uppercase tracking-wider text-sm",
    trustStripStyle:
      "border-y border-[var(--border)] bg-black/30 uppercase text-xs tracking-wider",
    quoteFlowStyle:
      "bg-[var(--surface)] border border-[var(--border)] rounded-md p-6",
    threeMaterialHint: "brushed steel + concrete + precise grids",
    motionIntensity: "medium",
  },
  "home-service-motion": {
    id: "home-service-motion",
    label: "Home Service Motion",
    mode: "light",
    description: "Bright, friendly premium. Cleaning, pest, general services.",
    cssVars: {
      "--bg": "#f8fafc",
      "--bg-elev": "#ffffff",
      "--surface": "#ffffffd9",
      "--border": "rgba(15,23,42,0.08)",
      "--text": "#0f172a",
      "--text-dim": "rgba(15,23,42,0.65)",
      "--accent": "#16a34a",
      "--accent-2": "#0ea5e9",
      "--ring": "rgba(22,163,74,0.35)",
    },
    typography: {
      displayFont: "var(--font-display)",
      bodyFont: "var(--font-body)",
      scale: {
        h1: "clamp(2.5rem, 5.5vw, 4.5rem)",
        h2: "clamp(1.875rem, 4vw, 2.875rem)",
        h3: "clamp(1.25rem, 2vw, 1.5rem)",
        body: "1.0625rem",
        small: "0.875rem",
      },
    },
    spacing: { sectionY: "7rem", containerX: "1.5rem", gap: "1.25rem" },
    radius: { card: "1.5rem", button: "999px", chip: "999px" },
    cardStyle:
      "bg-white border border-[var(--border)] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]",
    buttonStyle:
      "bg-[var(--accent)] text-white hover:brightness-110 transition rounded-full px-6 py-3 font-semibold",
    trustStripStyle: "border-y border-[var(--border)] bg-white/80",
    quoteFlowStyle:
      "bg-white border border-[var(--border)] rounded-3xl p-6 shadow-sm",
    threeMaterialHint: "soft glass + sparkle particles",
    motionIntensity: "medium",
  },
};

export function getDesignSystem(id: DesignSystemId): DesignSystem {
  return DESIGN_SYSTEMS[id] ?? DESIGN_SYSTEMS["contractor-cinematic-dark"];
}
