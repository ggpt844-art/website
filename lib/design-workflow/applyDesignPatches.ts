import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { PageStrategy, SceneSpec, SceneType, VisualDirection } from "@/lib/experience/experienceSchemas";
import { SceneTypeSchema } from "@/lib/experience/experienceSchemas";
import type { DesignBrief, DesignMd, DesignPatch, ParsedStitchReference } from "./designWorkflowTypes";

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    if (v == null) continue;
    if (
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function applyDesignPatchesToDemoConfig(config: DemoConfig, patches: DesignPatch[]): DemoConfig {
  let next = { ...config };
  for (const p of patches) {
    if (p.action === "replace" && p.target === "visualDirection" && next.visualDirection) {
      next = { ...next, visualDirection: p.patch as unknown as VisualDirection };
      continue;
    }
    if (p.target === "visualDirection" && next.visualDirection) {
      next = {
        ...next,
        visualDirection: deepMerge(
          next.visualDirection as unknown as Record<string, unknown>,
          p.patch,
        ) as unknown as VisualDirection,
      };
    }
    if (p.target === "sceneSpec" && next.sceneSpec) {
      next = {
        ...next,
        sceneSpec: deepMerge(
          next.sceneSpec as unknown as Record<string, unknown>,
          p.patch,
        ) as unknown as SceneSpec,
      };
    }
    if (p.target === "pageStrategy" && next.pageStrategy) {
      next = {
        ...next,
        pageStrategy: deepMerge(
          next.pageStrategy as unknown as Record<string, unknown>,
          p.patch,
        ) as unknown as PageStrategy,
      };
    }
    if (p.target === "designMd" && p.patch) {
      next = {
        ...next,
        designMd: { ...(next.designMd ?? {}), ...p.patch },
      };
    }
  }
  return next;
}

function inferSceneType(text: string): SceneType {
  const t = text.toLowerCase();
  if (/thermal|attic|heat|cutaway|insulation/i.test(t)) return "thermal_house_cutaway";
  if (/hvac|airflow|air.flow/i.test(t)) return "hvac_airflow_stack";
  if (/roof|storm|shingle/i.test(t)) return "roof_storm_hotspot";
  if (/terrain|yard|landscape/i.test(t)) return "terrain_landform_study";
  if (/tooth|dental|smile/i.test(t)) return "abstract_smile_sculpture";
  if (/glow|wellness|spa|med/i.test(t)) return "clinical_glow_sphere";
  if (/renovation|basement|kitchen/i.test(t)) return "renovation_layer_cutaway";
  return "abstract_precision_orb";
}

/** Map Stitch/import layers onto production experience fields — keeps SEO/conversion in baseConfig elsewhere. */
export function buildVisualDirectionFromReference(
  base: VisualDirection,
  brief: DesignBrief,
  parsed: ParsedStitchReference,
  designMd: DesignMd,
): VisualDirection {
  return {
    ...base,
    conceptName: `${brief.businessName.split(" ")[0]} — ${parsed.selectedDirection}`.slice(0, 120),
    coreMetaphor: brief.visualMetaphor,
    emotionalTone: brief.emotionalGoal,
    visualMotif: parsed.visualMotif,
    colorLogic: designMd.colorTokens.slice(0, 3).join(" · ") || base.colorLogic,
    lightingStyle: base.lightingStyle.includes("dark") ? base.lightingStyle : `${base.lightingStyle}; ${parsed.cardStyle}`,
    depthStyle: base.depthStyle,
    motionLanguage: parsed.motionStyle,
    typographyMood: parsed.typographyMood,
    premiumSignals: [...new Set([...base.premiumSignals, ...designMd.premiumQualityBar.slice(0, 3)])],
    textureGuidelines: [...new Set([...base.textureGuidelines, ...designMd.componentRules.slice(0, 2)])],
    avoidList: [...new Set([...(base.avoidList ?? []), ...designMd.avoidList])],
  };
}

export function buildSceneSpecFromReference(base: SceneSpec, brief: DesignBrief, parsed: ParsedStitchReference): SceneSpec {
  const st = inferSceneType(`${parsed["3dSceneDirection"]} ${brief["3dSceneGoal"]}`);
  const parsedSafe = SceneTypeSchema.safeParse(st);
  const sceneType = parsedSafe.success ? parsedSafe.data : base.sceneType;

  return {
    ...base,
    sceneType,
    purpose: `${base.purpose} · ${brief["3dSceneGoal"].slice(0, 120)}`,
    heroComposition: parsed.heroLayout.slice(0, 320),
    particleSystems:
      sceneType === "thermal_house_cutaway"
        ? [...new Set([...base.particleSystems, "heat_particles"])]
        : base.particleSystems,
    uiAnchors:
      sceneType === "thermal_house_cutaway"
        ? [...new Set([...base.uiAnchors, "EnergyLossMeterCard"])]
        : base.uiAnchors,
    scrollMoments: ["hero emphasis", "diagnostic reveal", "proof stack"],
    mobileFallback: "Static still + simplified gradient; drop particles",
    reducedMotionFallback: base.fallbacks?.reducedMotionTreatment ?? "Single hero still; no auto camera path",
  };
}

export function suggestedPatchesFromImport(
  brief: DesignBrief,
  parsed: ParsedStitchReference,
  designMd: DesignMd,
): DesignPatch[] {
  return [
    {
      target: "designMd",
      action: "update",
      patch: designMd as unknown as Record<string, unknown>,
    },
  ];
}
