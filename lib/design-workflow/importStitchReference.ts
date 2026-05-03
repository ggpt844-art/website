import type { DesignReferenceSourceType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { generateDesignBrief } from "./generateDesignBrief";
import { generateDesignMdFromReference } from "./generateDesignMdFromReference";
import { parseStitchReference } from "./stitchReferenceParser";
import { mergeParsedReferenceIntoConfig, mergeVariantRowIntoConfig } from "./mergeSelectedVariant";
import { gradeDesignWorkflow } from "./designWorkflowGrader";
import { getNichePreset } from "@/lib/presets/niches";

/** Stitch imports: reference → DesignVariant. Only design-visual fields merge into DemoConfig; see `stitchDesignBoundary.ts`. */

export interface ImportStitchReferenceParams {
  businessId: string;
  demoConfigId: string | null;
  sourceType: DesignReferenceSourceType;
  rawText: string;
  codeSnippet?: string | null;
  selectedVariantName?: string | null;
  screenshotUrls?: string[];
  variantName?: string;
}

export async function importStitchReferenceAndCreateVariant(
  params: ImportStitchReferenceParams,
): Promise<{ referenceId: string; variantId: string | null }> {
  const business = await prisma.business.findUnique({ where: { id: params.businessId } });
  if (!business) throw new Error("Business not found");

  const demo = params.demoConfigId
    ? await prisma.demoConfig.findFirst({
        where: { id: params.demoConfigId, businessId: business.id },
      })
    : null;

  const config = (demo?.baseConfigJson as unknown as DemoConfig) ?? null;

  const ref = await prisma.designReference.create({
    data: {
      businessId: business.id,
      demoConfigId: demo?.id ?? null,
      sourceType: params.sourceType,
      rawText: params.rawText,
      codeSnippet: params.codeSnippet ?? null,
      selectedVariantName: params.selectedVariantName ?? null,
      screenshotUrlsJson: params.screenshotUrls?.length ? params.screenshotUrls : undefined,
      parsedReferenceJson: {} as object,
    },
  });

  const parsed = parseStitchReference(params.rawText, params.selectedVariantName ?? undefined);
  await prisma.designReference.update({
    where: { id: ref.id },
    data: { parsedReferenceJson: parsed as object },
  });

  if (!demo || !config?.pageStrategy) {
    return { referenceId: ref.id, variantId: null };
  }

  const nichePreset = getNichePreset(business.niche);
  const packetRow = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });
  const brief = generateDesignBrief({
    businessName: business.name,
    city: business.city,
    region: business.region,
    country: business.country,
    nicheSlug: business.niche,
    nichePreset,
    intelligencePacket: (packetRow?.packetJson as Record<string, unknown>) ?? null,
    pageStrategy: config.pageStrategy,
    seoPrimaryKeyword: config.seo?.primaryKeyword ?? `${business.niche} ${business.city}`,
    complianceWarnings: [
      ...(config.compliance?.warnings ?? []),
      ...(config.compliance?.severeWarnings ?? []),
    ],
  });

  const designMd = generateDesignMdFromReference(brief, parsed, business.name);
  const merged = mergeParsedReferenceIntoConfig(config, brief, parsed, designMd);

  const grade = gradeDesignWorkflow({
    config: merged,
    designBrief: brief,
    parsedReference: parsed,
    designMd,
  });

  if (!merged.pageStrategy || !merged.visualDirection || !merged.sceneSpec) {
    return { referenceId: ref.id, variantId: null };
  }

  const variantName =
    params.variantName?.trim() ||
    `Stitch · ${params.selectedVariantName ?? parsed.selectedDirection}`.slice(0, 120);

  const variant = await prisma.designVariant.create({
    data: {
      businessId: business.id,
      demoConfigId: demo.id,
      sourceReferenceId: ref.id,
      name: variantName,
      variantType: "custom",
      designMdJson: designMd as object,
      visualDirectionJson: merged.visualDirection as object,
      sceneSpecJson: merged.sceneSpec as object,
      pageStrategyJson: merged.pageStrategy as object,
      sectionOrderJson: merged.pageStrategy.sectionOrder as object,
      score: grade.designWorkflowScore,
      notes: grade.warnings.join("\n") || null,
    },
  });

  return { referenceId: ref.id, variantId: variant.id };
}

export async function applySelectedVariantLayerToConfig(
  demoConfigId: string,
  config: DemoConfig,
): Promise<DemoConfig> {
  const row = await prisma.designVariant.findFirst({
    where: { demoConfigId, selected: true },
  });
  if (!row) return config;
  return mergeVariantRowIntoConfig(config, row);
}

export async function selectDesignVariantForDemo(
  demoConfigId: string,
  variantId: string,
): Promise<void> {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");

  await prisma.designVariant.updateMany({
    where: { demoConfigId },
    data: { selected: false },
  });

  const variant = await prisma.designVariant.findFirst({
    where: { id: variantId, demoConfigId },
  });
  if (!variant) throw new Error("Variant not found");

  await prisma.designVariant.update({
    where: { id: variant.id },
    data: { selected: true },
  });

  const base = demo.baseConfigJson as unknown as DemoConfig;
  const merged = mergeVariantRowIntoConfig(base, variant);
  const graded = gradeDesignWorkflow({
    config: merged,
    designMd: variant.designMdJson as never,
  });

  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...merged,
        designWorkflowMeta: {
          designWorkflowScore: graded.designWorkflowScore,
          warnings: graded.warnings,
          blocksApproval: graded.blocksApproval,
          lastGradedAt: new Date().toISOString(),
        },
      } as object,
    },
  });
}

export async function seedInternalVariantsForDemo(demoConfigId: string): Promise<void> {
  const demo = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    include: { business: true },
  });
  if (!demo?.business) return;

  const existing = await prisma.designVariant.count({ where: { demoConfigId } });
  if (existing >= 3) return;

  const config = demo.baseConfigJson as unknown as DemoConfig;
  if (!config.pageStrategy || !config.visualDirection || !config.sceneSpec) return;

  const { buildInternalVariantSeeds } = await import("./designVariantSelector");
  const seeds = buildInternalVariantSeeds();
  const nichePreset = getNichePreset(demo.business.niche);

  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const vd = { ...config.visualDirection };
    if (s.variantType === "safe_conversion") {
      vd.motionLanguage = "Short, predictable transitions; low parallax";
      vd.premiumSignals = [...vd.premiumSignals, "Proof-first hero subhead"];
    } else if (s.variantType === "premium_cinematic") {
      vd.motionLanguage = "Slow dolly; layered depth haze; restrained glow";
      vd.lightingStyle = `${vd.lightingStyle}; cinematic edge roll-off`;
    } else {
      vd.motionLanguage = "Snappier easing; asymmetric layout bias";
      vd.visualMotif = `${vd.visualMotif}; higher contrast focal band`;
    }

    const variant = await prisma.designVariant.create({
      data: {
        businessId: demo.businessId,
        demoConfigId,
        sourceReferenceId: null,
        name: s.name,
        variantType: s.variantType,
        designMdJson: {
          projectName: demo.business.name,
          businessNiche: nichePreset.label,
          designIntent: s.notes,
          emotionalGoal: config.strategy?.primaryPain ?? "",
          coreMetaphor: vd.coreMetaphor,
          targetUserFeeling: "Confident, informed",
          visualMotif: vd.visualMotif,
          colorTokens: [],
          colorMeanings: {},
          typographyRules: [vd.typographyMood],
          spacingRules: [],
          componentRules: [],
          motionRules: [vd.motionLanguage],
          "3dSceneRules": [config.sceneSpec.purpose],
          accessibilityRules: [],
          premiumQualityBar: vd.premiumSignals,
          avoidList: vd.avoidList ?? [],
          copyToneExamples: [],
          badGenericChoicesToAvoid: [],
        } as object,
        visualDirectionJson: vd as object,
        sceneSpecJson: config.sceneSpec as object,
        pageStrategyJson: config.pageStrategy as object,
        sectionOrderJson: config.pageStrategy.sectionOrder as object,
        score: 70 + i * 3,
        notes: s.notes,
      },
    });

    const graded = gradeDesignWorkflow({
      config: mergeVariantRowIntoConfig(config, variant),
    });
    await prisma.designVariant.update({
      where: { id: variant.id },
      data: { score: graded.designWorkflowScore },
    });
  }
}
