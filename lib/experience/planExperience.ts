import type { NichePreset } from "@/lib/presets/types";
import type { ThreeDPresetId } from "@/lib/presets/types";
import type {
  DesignFingerprint,
  FlowArchetype,
  FlowRationale,
  MobilePlan,
  PageStrategy,
  SceneSpec,
  SceneType,
  VisualDirection,
} from "./experienceSchemas";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";
import { normalizeFlowArchetype } from "@/lib/strategy/normalizeFlowArchetype";
import { buildCameraSpec } from "@/lib/visual-engine/cameraPresets";
import {
  colorFamilyFromAccent,
  hashSectionOrder,
  isFingerprintTooSimilar,
  varySectionOrderForAntiRepeat,
} from "./designMemory";

/** Section ids consumed by DemoRenderer SECTION_MAP */
export const DEMO_SECTION_IDS = [
  "hero",
  "trustStrip",
  "problemVisualization",
  "diagnosticTool",
  "services",
  "proof",
  "process",
  "photoUploadQuoteFlow",
  "faq",
  "finalCTA",
  "customNiche",
] as const;

export type DemoSectionId = (typeof DEMO_SECTION_IDS)[number];

const LEGACY_GENERIC_ORDER: DemoSectionId[] = [
  "hero",
  "trustStrip",
  "problemVisualization",
  "diagnosticTool",
  "services",
  "proof",
  "process",
  "photoUploadQuoteFlow",
  "faq",
  "finalCTA",
];

const EMERGENCY_RE = /leak|flood|emergency|today|asap|storm|active|no heat|no cool|broken|infestation|now\b/i;
const PLANNING_RE = /planning|future|just curious|research|later|this year/i;

export function slugHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function weaknessesText(weaknesses: string[]): string {
  return weaknesses.join(" ").toLowerCase();
}

function pickArchetype(niche: NichePreset, slug: string, weaknesses: string[]): FlowArchetype {
  const w = weaknessesText(weaknesses);
  const h = slugHash(slug);
  const isEmergencyTone = EMERGENCY_RE.test(w) && !PLANNING_RE.test(w);

  const slugN = niche.slug;

  if (slugN === "roofing" || slugN === "pest-control") {
    return isEmergencyTone ? "emergency_conversion" : "fast_quote_first";
  }
  if (slugN === "hvac") {
    return isEmergencyTone ? "emergency_conversion" : "education_first";
  }
  if (
    slugN === "dentists" ||
    slugN === "orthodontists" ||
    slugN === "med-spas" ||
    slugN === "cosmetic-clinics"
  ) {
    return h % 2 === 0 ? "premium_consultation" : "transformation_proof";
  }
  if (
    slugN === "attic-insulation" ||
    slugN === "landscaping" ||
    slugN === "windows-doors" ||
    slugN === "interlock" ||
    slugN === "concrete"
  ) {
    return h % 2 === 0 ? "local_authority" : "education_first";
  }
  if (
    slugN === "basement-renovation" ||
    slugN === "kitchen-renovation" ||
    slugN === "bathroom-renovation"
  ) {
    return h % 3 === 0 ? "portfolio_led" : "local_authority";
  }
  if (slugN === "cleaning" || slugN === "tattoo-shops" || slugN === "barbers") {
    return h % 2 === 0 ? "portfolio_led" : "fast_quote_first";
  }
  return h % 2 === 0 ? "local_authority" : "education_first";
}

const ARCHETYPE_SECTIONS: Record<FlowArchetype, DemoSectionId[]> = {
  emergency_conversion: [
    "hero",
    "trustStrip",
    "problemVisualization",
    "diagnosticTool",
    "services",
    "photoUploadQuoteFlow",
    "proof",
    "process",
    "faq",
    "finalCTA",
  ],
  fast_quote_first: [
    "hero",
    "photoUploadQuoteFlow",
    "trustStrip",
    "problemVisualization",
    "services",
    "proof",
    "process",
    "faq",
    "finalCTA",
  ],
  premium_consultation: [
    "hero",
    "trustStrip",
    "services",
    "proof",
    "process",
    "diagnosticTool",
    "photoUploadQuoteFlow",
    "faq",
    "finalCTA",
  ],
  transformation_proof: [
    "hero",
    "trustStrip",
    "proof",
    "problemVisualization",
    "services",
    "diagnosticTool",
    "photoUploadQuoteFlow",
    "faq",
    "finalCTA",
  ],
  local_authority: [
    "hero",
    "trustStrip",
    "problemVisualization",
    "services",
    "proof",
    "process",
    "diagnosticTool",
    "faq",
    "finalCTA",
  ],
  education_first: [
    "hero",
    "problemVisualization",
    "trustStrip",
    "services",
    "diagnosticTool",
    "proof",
    "process",
    "photoUploadQuoteFlow",
    "faq",
    "finalCTA",
  ],
  portfolio_led: [
    "hero",
    "proof",
    "trustStrip",
    "services",
    "problemVisualization",
    "process",
    "photoUploadQuoteFlow",
    "faq",
    "finalCTA",
  ],
};

function buildCustomSections(
  niche: NichePreset,
  archetype: FlowArchetype,
  city: string,
): PageStrategy["customSections"] {
  const customs: PageStrategy["customSections"] = [];
  if (archetype === "local_authority" || archetype === "education_first") {
    customs.push({
      title: `${niche.label} norms in ${city}`,
      body: `We align with how ${city} homeowners actually decide: clear scope, written timelines, and no surprise line items. This section is specific to your trade — not a generic “we care” block.`,
    });
  }
  if (archetype === "emergency_conversion" || archetype === "fast_quote_first") {
    customs.push({
      title: "Triage, not turbulence",
      body:
        "Calls are routed for active problems first. You’ll get a calm sequence: what’s safe now → what we need to see → what happens next.",
    });
  }
  if (archetype === "premium_consultation") {
    customs.push({
      title: "Consultation framing",
      body:
        "Designed as a decision session: expectations, boundaries, and outcomes — without high-pressure closes.",
    });
  }
  return customs.slice(0, archetype === "portfolio_led" ? 1 : 2);
}

function injectCustomSection(order: DemoSectionId[], archetype: FlowArchetype): DemoSectionId[] {
  if (!order.includes("customNiche")) {
    const insertAt =
      archetype === "portfolio_led"
        ? Math.min(order.indexOf("services") + 1, order.length - 1)
        : Math.max(order.indexOf("diagnosticTool"), order.indexOf("services")) + 1;
    const at = Math.max(1, Math.min(insertAt, order.length - 1));
    const next = [...order];
    next.splice(at, 0, "customNiche");
    return next;
  }
  return order;
}

function optionalOmit(
  order: DemoSectionId[],
  slug: string,
  archetype: FlowArchetype,
): DemoSectionId[] {
  const h = slugHash(slug + archetype);
  let next = [...order];
  const optionalPool: DemoSectionId[] = ["process", "faq", "proof"];

  if (archetype === "fast_quote_first" && h % 2 === 0) {
    next = next.filter((s) => s !== "process");
  }
  if (archetype === "emergency_conversion" && h % 3 === 0) {
    next = next.filter((s) => s !== "faq");
  }
  if (archetype === "portfolio_led" && h % 2 === 0) {
    next = next.filter((s) => s !== "process");
  }
  if (h % 5 === 0) {
    const drop = optionalPool[h % optionalPool.length];
    if (next.filter((x) => x === drop).length && drop !== "proof") {
      next = next.filter((s) => s !== drop);
    }
  }
  return next;
}

function forbiddenFilter(order: DemoSectionId[], forbidden: Set<string>): DemoSectionId[] {
  return order.filter((s) => !forbidden.has(s));
}

const SECTION_ID_SET = new Set<string>(DEMO_SECTION_IDS as readonly string[]);

/** Reorder sections toward intra-niche priorities; omit avoided (never drops hero/finalCTA). */
function applyIntraSectionHints(
  baseOrder: DemoSectionId[],
  prioritize: string[],
  avoid: string[],
): DemoSectionId[] {
  const avoidF = new Set(
    avoid.filter((s) => SECTION_ID_SET.has(s) && s !== "hero" && s !== "finalCTA"),
  );
  const order = baseOrder.filter((s) => !avoidF.has(s));
  const pri = prioritize.filter((s) => SECTION_ID_SET.has(s));
  if (!pri.length) return order;

  const priRank = new Map<string, number>();
  pri.forEach((s, i) => {
    if (!priRank.has(s)) priRank.set(s, i);
  });

  return [...order].sort((a, b) => {
    const pa = priRank.has(a) ? priRank.get(a)! : 10_000;
    const pb = priRank.has(b) ? priRank.get(b)! : 10_000;
    if (pa !== pb) return pa - pb;
    return order.indexOf(a) - order.indexOf(b);
  });
}

function overlayVisualFromIntra(vd: VisualDirection, intra: IntraNicheStrategy): VisualDirection {
  const nicheCliches = intra.competitivePositioning.overusedNicheClichesToAvoid ?? [];
  return {
    ...vd,
    coreMetaphor: intra.visualMetaphor.trim() || vd.coreMetaphor,
    emotionalTone: `${vd.emotionalTone}; ${intra.visualTone}`.slice(0, 260),
    avoidList: [...(vd.avoidList ?? []), ...nicheCliches.slice(0, 8)],
  };
}

function buildVisualDirection(
  niche: NichePreset,
  archetype: FlowArchetype,
  city: string,
  businessName: string,
): VisualDirection {
  const overlays: Partial<Record<string, Partial<VisualDirection>>> = {
    roofing: {
      conceptName: "Shelter under pressure",
      coreMetaphor: "protection against pressure",
      emotionalTone: "urgent but controlled",
      visualMotif: "rain, roof planes, leak glow, storm contrast",
      colorLogic: "deep navy/charcoal with orange warning accents",
      lightingStyle: "moody storm light with hotspot glow",
      depthStyle: "stacked atmosphere: haze → roof → foreground rain",
      motionLanguage: "decisive parallax, restrained camera drift",
      typographyMood: "tight display, confident body",
      premiumSignals: ["documented inspections", "storm-grade contrast", "no gimmick UI"],
      textureGuidelines: ["wet matte shingles", "soft bloom on accent", "grain in shadow tiers"],
    },
    "attic-insulation": {
      conceptName: "Thermal envelope",
      coreMetaphor: "thermal containment",
      emotionalTone: "technical but comforting",
      visualMotif: "airflow, thermal gradients, house cutaway",
      colorLogic: "cool-dark with warm heat accents",
      lightingStyle: "subtle interior energy glow",
      depthStyle: "sectional cutaway depth",
      motionLanguage: "slow particle drift, measured reveals",
      typographyMood: "engineer-clean headlines, approachable body",
      premiumSignals: ["data-forward reporting", "honest payback framing"],
      textureGuidelines: ["soft volumetric gradients", "matte insulation reads"],
    },
    dentists: {
      conceptName: "Precision smile craft",
      coreMetaphor: "precision transformation",
      emotionalTone: "calm, premium, confidence-building",
      visualMotif: "enamel shine, clean arcs, soft reflections",
      colorLogic: "white, bone, gray, muted accent",
      lightingStyle: "soft premium clinical glow",
      depthStyle: "layered studio depth",
      motionLanguage: "gentle ease-in, floating hero rhythm",
      typographyMood: "editorial spacing, high-trust tone",
      premiumSignals: ["clinical calm", "editorial proof"],
      textureGuidelines: ["satin enamel reads", "micro-specular highlights"],
    },
    hvac: {
      conceptName: "Climate control stack",
      coreMetaphor: "balanced airflow and load",
      emotionalTone: "restorative clarity",
      visualMotif: "duct vectors, temperature ribbons, home silhouette",
      colorLogic: "cool teal depth + warm relief accent",
      lightingStyle: "rim-lit equipment with soft fill",
      depthStyle: "orthographic bias with cinematic tilt",
      motionLanguage: "vector-led motion, crisp snaps",
      typographyMood: "utility-premium, high legibility",
      premiumSignals: ["load-aware messaging", "no fear-mongering heat/cool copy"],
      textureGuidelines: ["brushed metal hints", "soft volumetric haze"],
    },
  };

  const base: VisualDirection = {
    conceptName: `${businessName.split(" ")[0] ?? businessName} · ${niche.label} signal — ${city}`,
    coreMetaphor: "earned trust through clarity",
    emotionalTone: "confident and grounded",
    visualMotif: "local proof, material honesty, structured grids",
    colorLogic: `${niche.accentColor} accent on deep neutrals`,
    lightingStyle: "directional key with soft ambient",
    depthStyle: "foreground subject → mid content → atmospheric back",
    motionLanguage: "pinned hero, subtle section reveals",
    typographyMood: "display authority + calm body",
    premiumSignals: ["proof-first composition", "restraint over decoration"],
    textureGuidelines: ["matte surfaces", "single accent energy"],
  };

  const bySlug = overlays[niche.slug];

  const archTone: Partial<VisualDirection> =
    archetype === "premium_consultation"
      ? {
          motionLanguage: "slow, editorial pacing; minimal snap",
          typographyMood: "spa-clinical hybrid, generous leading",
        }
      : archetype === "education_first"
        ? {
            motionLanguage: "stepwise reveals; diagram-feel transitions",
            visualMotif: `${base.visualMotif}; schematic cues`,
          }
        : archetype === "portfolio_led"
          ? {
              motionLanguage: "gallery stagger; image-led rhythm",
              depthStyle: "shallow DOF cues, portfolio tiles",
            }
          : {};

  return {
    ...base,
    ...bySlug,
    ...archTone,
    conceptName: bySlug?.conceptName
      ? `${businessName} — ${bySlug.conceptName}`
      : base.conceptName,
  };
}

function finalizeScene(
  partial: Omit<SceneSpec, "cameraSpec" | "fallbacks">,
  archetype: FlowArchetype,
  labelForCamera: string,
): SceneSpec {
  const cameraSpec = buildCameraSpec({
    sceneType: partial.sceneType,
    archetype,
    accentLabel: labelForCamera.slice(0, 48),
  });
  const desktopQuality = partial.performanceTier === "low" ? "medium" : "high";
  const mobileQuality = partial.performanceTier === "high" ? "medium" : "low";
  return {
    ...partial,
    cameraSpec,
    fallbacks: {
      desktopQuality,
      mobileQuality,
      staticCinematicTreatment: `Premium still for ${partial.sceneType}: layered rim light, 2% grain, silhouette read aligned to ${partial.lightingPreset}.`,
      reducedMotionTreatment: `Editorial locked hero: soft bloom + vignette; hierarchy matches desktop story without camera travel.`,
    },
  };
}

function buildSceneSpec(
  niche: NichePreset,
  archetype: FlowArchetype,
  slug: string,
  businessName: string,
  intra: IntraNicheStrategy | null = null,
): { scene: SceneSpec; threePreset: ThreeDPresetId } {
  const h = slugHash(niche.slug + archetype + slug);
  const tier = h % 3 === 0 ? "low" : h % 2 === 0 ? "medium" : "high";

  if (
    intra &&
    (niche.slug === "dentists" || niche.slug === "orthodontists") &&
    intra.subNiche === "emergency_dentist"
  ) {
    return {
      threePreset: "tooth-orb",
      scene: finalizeScene(
        {
          enabled: true,
          sceneType: "clinical_glow_sphere",
          purpose: "Calm triage focal — fast help without literal gore",
          cameraStyle: "tighter clinical arc, slight push-in",
          lightingPreset: "high-trust cool key with warm relief rim",
          materialPreset: "satin clinical mineral",
          particleSystems: ["soft controlled bokeh"],
          depthLayers: ["deep falloff", "hero focal", "rim confidence"],
          interactiveElements: ["gentle stabilizing drift"],
          uiAnchors: ["emergency help CTA anchor"],
          performanceTier: tier as SceneSpec["performanceTier"],
        },
        archetype,
        businessName,
      ),
    };
  }

  if (intra && niche.slug === "dentists" && intra.subNiche === "dental_implants") {
    return {
      threePreset: "tooth-orb",
      scene: finalizeScene(
        {
          enabled: true,
          sceneType: "clinical_glow_sphere",
          purpose: "Stability, restoration precision — consult-first trust",
          cameraStyle: "slow macro confidence move",
          lightingPreset: "chiaroscuro clinical with soft fill",
          materialPreset: "precision ceramic read",
          particleSystems: ["sparse specular motes"],
          depthLayers: ["shadow depth", "implant metaphor mass", "edge truth"],
          interactiveElements: ["micro sway, restrained"],
          uiAnchors: ["consultation pathway card"],
          performanceTier: tier as SceneSpec["performanceTier"],
        },
        archetype,
        businessName,
      ),
    };
  }

  if (intra && niche.slug === "roofing" && intra.subNiche === "metal_roofing") {
    return {
      threePreset: "roof-plane-rain",
      scene: finalizeScene(
        {
          enabled: true,
          sceneType: "roof_storm_hotspot",
          purpose: "Architectural metal durability — premium daylight read",
          cameraStyle: "clean product angle, minimal dutch",
          lightingPreset: "clear daylight with refined edge contrast",
          materialPreset: "standing seam metal, fine grain",
          particleSystems: ["light haze only"],
          depthLayers: ["horizon", "roof plane", "micro texture foreground"],
          interactiveElements: ["slow parallax"],
          uiAnchors: ["material benefit overlay"],
          performanceTier: tier as SceneSpec["performanceTier"],
        },
        archetype,
        businessName,
      ),
    };
  }

  const table: Partial<
    Record<
      string,
      {
        sceneType: SceneType;
        threePreset: ThreeDPresetId;
        purpose: string;
        cameraStyle: string;
        lightingPreset: string;
        materialPreset: string;
        particles: string[];
        depths: string[];
        interact: string[];
        anchors: string[];
      }
    >
  > = {
    roofing: {
      sceneType: "roof_storm_hotspot",
      threePreset: "roof-plane-rain",
      purpose: "show urgency and roof protection",
      cameraStyle: "angled cinematic perspective, slight dutch tilt",
      lightingPreset: "storm-dark with orange leak glow",
      materialPreset: "wet matte roofing, damp metal flashings",
      particles: ["rain_foreground", "rain_background", "mist_haze"],
      depths: ["background haze", "mid roof plane", "foreground rain blur"],
      interact: ["hover tilt roof", "subtle parallax drift"],
      anchors: ["floating leak severity card"],
    },
    "attic-insulation": {
      sceneType: "thermal_house_cutaway",
      threePreset: "house-heat-loss",
      purpose: "visualize heat loss and containment",
      cameraStyle: "orthographic bias with gentle orbit",
      lightingPreset: "cool exterior vs warm bleed",
      materialPreset: "fiberglass mat, joist wood, gradient fog",
      particles: ["thermal airflow", "dust motes"],
      depths: ["outer shell", "insulation volume", "interior glow"],
      interact: ["slow orbit", "heatmap pulse"],
      anchors: ["energy loss meter"],
    },
    dentists: {
      sceneType: "abstract_smile_sculpture",
      threePreset: "tooth-orb",
      purpose: "precision and premium care without literal clinic stock",
      cameraStyle: "macro studio arc",
      lightingPreset: "soft studio glow, spec-controlled",
      materialPreset: "gloss ceramic / satin enamel",
      particles: ["soft bloom motes"],
      depths: ["backdrop", "hero form", "specular edge"],
      interact: ["slow float", "gentle yaw"],
      anchors: ["trust micro-badge stack"],
    },
    hvac: {
      sceneType: "hvac_airflow_stack",
      threePreset: "airflow-home",
      purpose: "comfort restoration and airflow intelligence",
      cameraStyle: "three-quarter home read with vector emphasis",
      lightingPreset: "cool plenum with warm register spill",
      materialPreset: "duct metal, soft insulation",
      particles: ["airflow ribbons", "dust catch in beam"],
      depths: ["sky/back", "equipment mid", "foreground particles"],
      interact: ["vector pulse", "light parallax"],
      anchors: ["comfort score chip"],
    },
    landscaping: {
      sceneType: "terrain_landform_study",
      threePreset: "terrain-layers",
      purpose: "grade, drainage, and composition as craft",
      cameraStyle: "aerial oblique sweep",
      lightingPreset: "golden-hour rim + cool fill",
      materialPreset: "soil strata, stone grit",
      particles: ["pollen dust", "fine haze"],
      depths: ["horizon", "terrain steps", "foreground foliage mass"],
      interact: ["slow pan", "layer peel hint"],
      anchors: ["scope callout"],
    },
    "pest-control": {
      sceneType: "renovation_layer_cutaway",
      threePreset: "terrain-layers",
      purpose: "boundary control — where problems enter and how you seal",
      cameraStyle: "low hero angle, tactical readability",
      lightingPreset: "high contrast with amber alert rim",
      materialPreset: "matte barrier textures",
      particles: ["fine particulate", "edge wisp"],
      depths: ["structure back", "problem plane", "treatment foreground"],
      interact: ["subtle pulse on threat plane"],
      anchors: ["response-time strip"],
    },
  };

  const row = table[niche.slug];
  if (row) {
    return {
      threePreset: row.threePreset,
      scene: finalizeScene(
        {
          enabled: true,
          sceneType: row.sceneType,
          purpose: row.purpose,
          cameraStyle: row.cameraStyle,
          lightingPreset: row.lightingPreset,
          materialPreset: row.materialPreset,
          particleSystems: row.particles,
          depthLayers: row.depths,
          interactiveElements: row.interact,
          uiAnchors: row.anchors,
          performanceTier: tier as SceneSpec["performanceTier"],
        },
        archetype,
        businessName,
      ),
    };
  }

  if (archetype === "premium_consultation" || niche.categoryGroup.includes("medical")) {
    return {
      threePreset: "tooth-orb",
      scene: finalizeScene(
        {
          enabled: true,
          sceneType: "clinical_glow_sphere",
          purpose: "premium clinical focal without generic SaaS orb",
          cameraStyle: "macro curve, slow dolly",
          lightingPreset: "chiaroscuro clinical",
          materialPreset: "satin mineral surface",
          particleSystems: ["controlled bokeh drift"],
          depthLayers: ["deep falloff", "hero sculpt", "edge light"],
          interactiveElements: ["gentle oscillation"],
          uiAnchors: ["consult CTA anchor"],
          performanceTier: tier as SceneSpec["performanceTier"],
        },
        archetype,
        businessName,
      ),
    };
  }

  return {
    threePreset: "abstract-orb",
    scene: finalizeScene(
      {
        enabled: true,
        sceneType: "abstract_precision_orb",
        purpose: "concept-led abstract hero tied to craft precision",
        cameraStyle: "locked-off heroic with micro-movement",
        lightingPreset: "single key + low fill",
        materialPreset: "brushed composite shell",
        particleSystems: ["sparse ember drift"],
        depthLayers: ["void", "hero mass", "rim"],
        interactiveElements: ["pointer-reactive tilt"],
        uiAnchors: ["primary story line"],
        performanceTier: tier as SceneSpec["performanceTier"],
      },
      archetype,
      businessName,
    ),
  };
}

function computeDesignFingerprint(
  archetype: FlowArchetype,
  sectionOrder: string[],
  sceneType: SceneType,
  accentColor: string,
  visualDirection: VisualDirection,
  pageStrategy: PageStrategy,
): DesignFingerprint {
  return {
    flowArchetype: archetype,
    sectionOrderHash: hashSectionOrder(sectionOrder),
    heroLayoutType:
      archetype === "fast_quote_first"
        ? "quote_first_composition"
        : archetype === "portfolio_led"
          ? "proof_led_hero"
          : archetype === "premium_consultation"
            ? "consult_calm_hero"
            : "story_orbit_hero",
    sceneType,
    colorFamily: colorFamilyFromAccent(accentColor),
    ctaPattern: pageStrategy.offerType.slice(0, 72),
    trustPattern: pageStrategy.trustType.slice(0, 72),
    motionPattern: visualDirection.motionLanguage.slice(0, 72),
  };
}

function buildMobilePlan(
  archetype: FlowArchetype,
  sectionOrder: string[],
  sceneType: SceneType,
): MobilePlan {
  const collapse =
    archetype === "fast_quote_first"
      ? ["process", "faq"]
      : archetype === "emergency_conversion"
        ? ["faq"]
        : archetype === "premium_consultation"
          ? ["process"]
          : ["process", "faq"];

  const reorder =
    archetype === "fast_quote_first"
      ? ["photoUploadQuoteFlow", "trustStrip", "hero"]
      : ["hero", "trustStrip", "diagnosticTool"];

  return {
    heroPriority:
      archetype === "fast_quote_first" || archetype === "emergency_conversion"
        ? "quote entry + call + urgency legibility"
        : "trust line + primary CTA + diagnostic start",
    simplifiedScene: true,
    stickyCtaType:
      archetype === "premium_consultation"
        ? "book_consult_primary_call_secondary"
        : "quote_primary_call_secondary",
    sectionsToCollapse: collapse.filter((s) => sectionOrder.includes(s)),
    sectionsToReorder: reorder,
    motionReduction:
      "−35% motion amplitude; shorten hero ease; camera orbit halved vs desktop; parallax deltas capped",
    performanceFallback: `One-tier 3D quality reduction for ${sceneType}; particle cap; lighter fog`,
  };
}

function buildFlowRationale(args: {
  archetype: FlowArchetype;
  niche: NichePreset;
  sectionOrder: string[];
  excludedSectionIds: string[];
  conversionHint: string;
  antiRepetitionApplied: boolean;
}): FlowRationale {
  const included = args.sectionOrder.map(
    (s) =>
      `${s}: present because it advances ${args.archetype.replace(/_/g, " ")} narrative for ${args.niche.label}.`,
  );
  if (args.antiRepetitionApplied) {
    included.push(
      "Anti-repetition: section rhythm nudged to differ from recent demos while preserving niche logic.",
    );
  }
  const excluded = args.excludedSectionIds.map(
    (s) =>
      `${s}: excluded to reduce scroll fatigue or because another block already covers the job for this archetype.`,
  );
  return {
    selectedArchetype: args.archetype,
    whyThisFlowFits: `Matches ${args.niche.label} commercial posture (${args.niche.categoryGroup}) and the buyer’s likely intent for ${args.archetype.replace(/_/g, " ")}.`,
    whySectionsWereIncluded: included,
    whySectionsWereExcluded: excluded,
    conversionGoal: args.conversionHint,
    trustGoal:
      "Reduce perceived risk before the ask — credentials, process clarity, and proof where it matters.",
    visualGoal:
      "Concept-native hero and 3D scene so the page cannot read as another niche with swapped headlines.",
  };
}

export interface PlanExperienceArgs {
  niche: NichePreset;
  businessName: string;
  city: string;
  slug: string;
  weaknesses: string[];
  primaryPain: string;
  categoryLabel: string;
  accentColor: string;
  recentFingerprints?: DesignFingerprint[];
  /** Intra-niche differentiation — refines flow, visuals, and scene before render. */
  intraNicheStrategy?: IntraNicheStrategy | null;
}

export interface PlannedExperience {
  pageStrategy: PageStrategy;
  visualDirection: VisualDirection;
  sceneSpec: SceneSpec;
  threeDPreset: ThreeDPresetId;
  designFingerprint: DesignFingerprint;
  mobilePlan: MobilePlan;
  flowRationale: FlowRationale;
}

export function planExperience(args: PlanExperienceArgs): PlannedExperience {
  const {
    niche,
    businessName,
    city,
    slug,
    weaknesses,
    categoryLabel,
    accentColor,
    recentFingerprints = [],
    intraNicheStrategy = null,
  } = args;

  const intra = intraNicheStrategy ?? null;

  let archetype = pickArchetype(niche, slug, weaknesses);
  if (intra) {
    const normalized = normalizeFlowArchetype(intra.flowArchetype);
    if (normalized) archetype = normalized;
  }
  let sectionOrder = [...ARCHETYPE_SECTIONS[archetype]];

  const forbidden = new Set<string>();
  if (archetype === "fast_quote_first") {
    /** keep diagnostic but never duplicate quote — already photoUpload early */
  }

  const customs = buildCustomSections(niche, archetype, city);
  if (customs.length) {
    sectionOrder = injectCustomSection(sectionOrder, archetype);
  }

  sectionOrder = optionalOmit(sectionOrder, slug, archetype);
  sectionOrder = forbiddenFilter(sectionOrder, forbidden);

  if (intra) {
    sectionOrder = applyIntraSectionHints(
      sectionOrder,
      intra.sectionsToPrioritize,
      intra.sectionsToAvoid,
    );
  }

  if (sectionOrder.join(",") === LEGACY_GENERIC_ORDER.join(",")) {
    const i = sectionOrder.indexOf("diagnosticTool");
    const j = sectionOrder.indexOf("problemVisualization");
    if (i >= 0 && j >= 0 && slugHash(slug) % 2 === 0) {
      const copy = [...sectionOrder];
      copy[i] = "problemVisualization";
      copy[j] = "diagnosticTool";
      sectionOrder = copy;
    }
  }

  const mustIncludeSections: string[] = ["hero", "finalCTA"];
  if (archetype !== "fast_quote_first") {
    mustIncludeSections.push("diagnosticTool");
  } else {
    mustIncludeSections.push("photoUploadQuoteFlow");
  }
  if (archetype !== "portfolio_led") {
    mustIncludeSections.push("trustStrip");
  }
  let optionalSections: string[] = DEMO_SECTION_IDS.filter((s) => !sectionOrder.includes(s));

  const w = weaknessesText(weaknesses);
  const urgencyLevel = intra
    ? intra.urgencyLevel
    : EMERGENCY_RE.test(w)
      ? "high"
      : PLANNING_RE.test(w)
        ? "low"
        : "medium";
  let salesModel =
    archetype === "premium_consultation"
      ? "consultation-led / value demonstration"
      : archetype === "fast_quote_first" || archetype === "emergency_conversion"
        ? "triage + fast qualified quote"
        : "education + authority proof";
  if (intra?.conversionAngle) {
    salesModel = `${intra.conversionAngle}`.slice(0, 160);
  }

  let trustType =
    niche.categoryGroup === "home-services-contractor"
      ? "license, insurance, documented work"
      : "credentials, outcomes, process transparency";
  if (intra) {
    trustType = `${trustType}; buyer barrier: ${intra.trustBarrier}; proof: ${intra.proofTypeNeeded}`.slice(
      0,
      240,
    );
  }

  let offerType =
    archetype === "emergency_conversion"
      ? "rapid inspection + stabilization narrative"
      : archetype === "education_first"
        ? "explainer-led offer with opt-in quote"
        : "structured consultation + written scope";
  if (intra?.offerType) {
    offerType = intra.offerType.slice(0, 180);
  }

  const desiredStoryArc =
    archetype === "transformation_proof"
      ? "doubt → proof → mechanism → commit"
      : archetype === "education_first"
        ? "confusion → clarity → plan → action"
        : archetype === "emergency_conversion"
          ? "panic → control → fix path → booking"
          : "recognition → trust → process → conversion";

  let pageStrategy: PageStrategy = {
    nicheType: `${niche.label} (${categoryLabel})`,
    salesModel,
    urgencyLevel,
    trustType,
    offerType,
    desiredStoryArc,
    flowArchetype: archetype,
    mustIncludeSections,
    optionalSections: [...optionalSections],
    forbiddenSections: [...forbidden],
    customSections: customs,
    sectionOrder: [...sectionOrder],
  };

  const visualDirection = intra
    ? overlayVisualFromIntra(buildVisualDirection(niche, archetype, city, businessName), intra)
    : buildVisualDirection(niche, archetype, city, businessName);
  const { scene: sceneSpec, threePreset } = buildSceneSpec(
    niche,
    archetype,
    slug,
    businessName,
    intra,
  );

  let designFingerprint = computeDesignFingerprint(
    archetype,
    sectionOrder,
    sceneSpec.sceneType,
    accentColor,
    visualDirection,
    pageStrategy,
  );

  let antiRepetitionApplied = false;
  if (isFingerprintTooSimilar(designFingerprint, recentFingerprints)) {
    sectionOrder = varySectionOrderForAntiRepeat(sectionOrder, archetype, `${slug}-antirepeat`) as DemoSectionId[];
    optionalSections = DEMO_SECTION_IDS.filter((s) => !sectionOrder.includes(s));
    pageStrategy = {
      ...pageStrategy,
      sectionOrder: [...sectionOrder],
      optionalSections: [...optionalSections],
    };
    designFingerprint = computeDesignFingerprint(
      archetype,
      sectionOrder,
      sceneSpec.sceneType,
      accentColor,
      visualDirection,
      pageStrategy,
    );
    antiRepetitionApplied = true;
  }

  const mobilePlan = buildMobilePlan(archetype, sectionOrder, sceneSpec.sceneType);

  const conversionHint =
    archetype === "premium_consultation"
      ? "Book a consult with expectation alignment and clear next steps."
      : archetype === "fast_quote_first"
        ? "Fast qualified quote with photo/context where possible."
        : "Qualified lead with diagnostic clarity and trust before scheduling.";

  const flowRationale = buildFlowRationale({
    archetype,
    niche,
    sectionOrder,
    excludedSectionIds: optionalSections,
    conversionHint,
    antiRepetitionApplied,
  });

  return {
    pageStrategy,
    visualDirection,
    sceneSpec,
    threeDPreset: threePreset,
    designFingerprint,
    mobilePlan,
    flowRationale,
  };
}

export function isLegacyTemplateOrder(sections: string[]): boolean {
  return sections.join(",") === LEGACY_GENERIC_ORDER.join(",");
}
