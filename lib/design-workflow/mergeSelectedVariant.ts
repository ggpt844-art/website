import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { DesignVariant } from "@prisma/client";
import {
  buildSceneSpecFromReference,
  buildVisualDirectionFromReference,
} from "./applyDesignPatches";
import type { DesignBrief, DesignMd, ParsedStitchReference } from "./designWorkflowTypes";
import { DEMO_SECTION_IDS } from "@/lib/experience/planExperience";
import { PageStrategySchema, SceneSpecSchema, VisualDirectionSchema } from "@/lib/experience/experienceSchemas";

export function normalizeImportedSections(
  raw: string[],
  allowed: readonly string[] = DEMO_SECTION_IDS,
): string[] {
  const set = new Set<string>(allowed);
  const syn: [RegExp, string][] = [
    [/hero/i, "hero"],
    [/trust/i, "trustStrip"],
    [/problem|pain/i, "problemVisualization"],
    [/diagnostic|tool|check/i, "diagnosticTool"],
    [/service/i, "services"],
    [/proof|gallery|before/i, "proof"],
    [/process/i, "process"],
    [/photo|upload|quote/i, "photoUploadQuoteFlow"],
    [/faq/i, "faq"],
    [/final|cta|contact/i, "finalCTA"],
  ];
  const out: string[] = [];
  for (const line of raw) {
    for (const [re, id] of syn) {
      if (re.test(line) && set.has(id) && !out.includes(id)) {
        out.push(id);
        break;
      }
    }
  }
  return out.length ? out : [...allowed].filter((id) => id !== "customNiche").slice(0, 7);
}

/** Section order only — Stitch must not replace full PageStrategy (flow/rules stay internal). */
function extractSectionOrderFromVariant(row: DesignVariant): string[] | null {
  if (row.sectionOrderJson && Array.isArray(row.sectionOrderJson)) {
    return row.sectionOrderJson as string[];
  }
  if (row.pageStrategyJson) {
    const p = PageStrategySchema.safeParse(row.pageStrategyJson);
    if (p.success && p.data.sectionOrder?.length) return p.data.sectionOrder;
  }
  return null;
}

export function mergeVariantRowIntoConfig(config: DemoConfig, row: DesignVariant): DemoConfig {
  let next = { ...config };

  if (row.visualDirectionJson) {
    const p = VisualDirectionSchema.safeParse(row.visualDirectionJson);
    if (p.success) next = { ...next, visualDirection: p.data };
  }

  if (row.sceneSpecJson) {
    const p = SceneSpecSchema.safeParse(row.sceneSpecJson);
    if (p.success) next = { ...next, sceneSpec: p.data };
  }

  const rawOrder = extractSectionOrderFromVariant(row);
  if (rawOrder?.length && next.pageStrategy) {
    const norm = normalizeImportedSections(rawOrder);
    next = {
      ...next,
      pageStrategy: { ...next.pageStrategy, sectionOrder: norm },
      sections: norm.filter((s) => DEMO_SECTION_IDS.includes(s as (typeof DEMO_SECTION_IDS)[number])),
    };
  }

  if (row.designMdJson) {
    next = { ...next, designMd: row.designMdJson as Record<string, unknown> };
  }

  return next;
}

/**
 * Apply parsed Stitch reference: design layers + section composition only.
 * Does not touch seo, conversion, trust, compliance, analytics, quoteFlow, or business facts.
 * @see stitchDesignBoundary.ts
 */
export function mergeParsedReferenceIntoConfig(
  config: DemoConfig,
  brief: DesignBrief,
  parsed: ParsedStitchReference,
  designMd: DesignMd,
): DemoConfig {
  if (!config.visualDirection || !config.sceneSpec || !config.pageStrategy) return config;

  const vd = buildVisualDirectionFromReference(config.visualDirection, brief, parsed, designMd);
  const sc = buildSceneSpecFromReference(config.sceneSpec, brief, parsed);
  const sectionOrder = normalizeImportedSections(parsed.sectionOrder);

  return {
    ...config,
    visualDirection: vd,
    sceneSpec: sc,
    pageStrategy: { ...config.pageStrategy, sectionOrder },
    sections: sectionOrder.filter((s) =>
      DEMO_SECTION_IDS.includes(s as (typeof DEMO_SECTION_IDS)[number]),
    ),
    designMd: designMd as unknown as Record<string, unknown>,
    designMode: "stitch_assisted",
    designWorkflowMeta: {
      ...(config.designWorkflowMeta ?? {}),
      lastGradedAt: undefined,
    },
  };
}
