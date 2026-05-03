"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { getNichePreset } from "@/lib/presets/niches";
import { generateDesignBrief } from "@/lib/design-workflow/generateDesignBrief";
import { generateStitchPrompt } from "@/lib/design-workflow/generateStitchPrompt";
import {
  importStitchReferenceAndCreateVariant,
  seedInternalVariantsForDemo,
  selectDesignVariantForDemo,
  applySelectedVariantLayerToConfig,
} from "@/lib/design-workflow/importStitchReference";
import { gradeDesignWorkflow } from "@/lib/design-workflow/designWorkflowGrader";
import { generateDesignMdFromBriefOnly } from "@/lib/design-workflow/generateDesignMdFromReference";
import type { DesignBrief, DesignMode } from "@/lib/design-workflow/designWorkflowTypes";
import type { DesignReferenceSourceType } from "@prisma/client";
import { APP_CONFIG } from "@/lib/utils/config";
import { runStitchScreenFromPrompt } from "@/lib/design-workflow/stitchProgrammatic";
import { runStitchPromptAgentAndPersist } from "@/lib/design-workflow/stitchPromptAgent/persistAgentToDemo";
import { gradeStitchPrompt } from "@/lib/design-workflow/stitchPromptAgent/stitchPromptGrader";
import type { StitchPromptAgentResult } from "@/lib/design-workflow/stitchPromptAgent/types";

export async function setDesignModeAction(demoConfigId: string, mode: DesignMode) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  const base = demo.baseConfigJson as unknown as DemoConfig;
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: { ...base, designMode: mode } as object,
    },
  });
  revalidatePath(`/business/${demo.businessId}`);
}

export async function regenerateDesignBriefAction(businessId: string, demoConfigId: string) {
  const [business, demo, packetRow] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.demoConfig.findFirst({ where: { id: demoConfigId, businessId } }),
    prisma.businessIntelligencePacket.findFirst({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!business || !demo) throw new Error("Missing business or demo");

  const config = demo.baseConfigJson as unknown as DemoConfig;
  if (!config.pageStrategy) throw new Error("Demo has no pageStrategy — regenerate demo first");

  const nichePreset = getNichePreset(business.niche);
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

  const designMd = generateDesignMdFromBriefOnly(brief, business.name);
  const graded = gradeDesignWorkflow({
    config: {
      ...config,
      designMd: designMd as unknown as Record<string, unknown>,
    },
    designBrief: brief,
    designMd,
  });

  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...config,
        designBrief: brief as unknown as Record<string, unknown>,
        designMd: designMd as unknown as Record<string, unknown>,
        designWorkflowMeta: {
          designWorkflowScore: graded.designWorkflowScore,
          warnings: graded.warnings,
          blocksApproval: graded.blocksApproval,
          lastGradedAt: new Date().toISOString(),
        },
      } as object,
    },
  });

  revalidatePath(`/business/${businessId}`);
  return brief;
}

export async function runClaudeStitchPromptAgentAction(
  businessId: string,
  demoConfigId: string,
): Promise<StitchPromptAgentResult> {
  const demo = await prisma.demoConfig.findFirst({
    where: { id: demoConfigId, businessId },
  });
  if (!demo) throw new Error("Demo not found");
  const result = await runStitchPromptAgentAndPersist(demoConfigId);
  revalidatePath(`/business/${businessId}`);
  return result;
}

export async function saveManualStitchPromptFromWorkflowAction(demoConfigId: string, prompt: string) {
  const demo = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    include: { business: true },
  });
  if (!demo?.business) throw new Error("Demo not found");
  const base = demo.baseConfigJson as unknown as DemoConfig;
  const complianceWarnings = [
    ...(base.compliance?.warnings ?? []),
    ...(base.compliance?.severeWarnings ?? []),
  ];
  const graded = gradeStitchPrompt({
    finalStitchPrompt: prompt,
    businessName: demo.business.name,
    city: demo.business.city,
    nicheLabel: getNichePreset(demo.business.niche).label,
    complianceWarnings,
  });
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...base,
        stitchPromptLast: prompt,
        designWorkflow: {
          ...(base.designWorkflow ?? {}),
          finalStitchPrompt: prompt,
          stitchPromptScore: graded.score,
          stitchPromptBlocksAutoStitch: graded.blocksAutoStitch,
          stitchPromptGraderBreakdown: graded.breakdown,
          stitchPromptGradedAt: new Date().toISOString(),
          stitchPromptAgentWarnings: graded.reasons,
        },
      } as object,
    },
  });
  revalidatePath(`/business/${demo.businessId}`);
}

export async function saveStitchPromptDraftAction(demoConfigId: string, prompt: string) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  const base = demo.baseConfigJson as unknown as DemoConfig & { stitchPromptLast?: string };
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: { ...base, stitchPromptLast: prompt } as object,
    },
  });
  revalidatePath(`/business/${demo.businessId}`);
}

export async function buildStitchPromptFromBriefAction(demoConfigId: string) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  const base = demo.baseConfigJson as unknown as DemoConfig & { designBrief?: DesignBrief };
  if (!base.designBrief) throw new Error("Generate design brief first");
  const prompt = generateStitchPrompt(base.designBrief as DesignBrief);
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: { ...base, stitchPromptLast: prompt } as object,
    },
  });
  revalidatePath(`/business/${demo.businessId}`);
  return prompt;
}

export async function importDesignReferenceAction(input: {
  businessId: string;
  demoConfigId: string | null;
  sourceType: DesignReferenceSourceType;
  rawText: string;
  selectedVariantName?: string;
  codeSnippet?: string;
}) {
  const out = await importStitchReferenceAndCreateVariant({
    businessId: input.businessId,
    demoConfigId: input.demoConfigId,
    sourceType: input.sourceType,
    rawText: input.rawText,
    codeSnippet: input.codeSnippet ?? null,
    selectedVariantName: input.selectedVariantName ?? null,
  });
  revalidatePath(`/business/${input.businessId}`);
  return out;
}

export async function pickVariantAction(demoConfigId: string, variantId: string) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  await selectDesignVariantForDemo(demoConfigId, variantId);
  revalidatePath(`/business/${demo.businessId}`);
}

export async function seedInternalVariantsAction(demoConfigId: string) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  await seedInternalVariantsForDemo(demoConfigId);
  revalidatePath(`/business/${demo.businessId}`);
}

export async function gradeDesignOnlyAction(demoConfigId: string) {
  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) throw new Error("Demo not found");
  let config = demo.baseConfigJson as unknown as DemoConfig;
  config = await applySelectedVariantLayerToConfig(demoConfigId, config);
  const variant = await prisma.designVariant.findFirst({
    where: { demoConfigId, selected: true },
  });
  const graded = gradeDesignWorkflow({
    config,
    designMd: variant?.designMdJson as never,
    designBrief: config.designBrief as never,
  });
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...config,
        designWorkflowMeta: {
          designWorkflowScore: graded.designWorkflowScore,
          warnings: graded.warnings,
          blocksApproval: graded.blocksApproval,
          lastGradedAt: new Date().toISOString(),
        },
      } as object,
    },
  });
  revalidatePath(`/business/${demo.businessId}`);
  return graded;
}

/**
 * Calls Google Stitch (Labs) via @google/stitch-sdk, then runs the same import → variant pipeline as manual paste.
 */
export async function runStitchSdkImportAction(businessId: string, demoConfigId: string) {
  if (!APP_CONFIG.enableStitchSdk || !process.env.STITCH_API_KEY?.trim()) {
    throw new Error("Set ENABLE_STITCH_SDK=true and STITCH_API_KEY in the environment.");
  }

  const demo = await prisma.demoConfig.findFirst({
    where: { id: demoConfigId, businessId },
    include: { business: true },
  });
  if (!demo?.business) throw new Error("Demo not found");

  const config = demo.baseConfigJson as unknown as DemoConfig;
  if (!config.pageStrategy) throw new Error("Demo is missing pageStrategy — regenerate the demo first.");

  const packetRow = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const nichePreset = getNichePreset(demo.business.niche);
  const brief = generateDesignBrief({
    businessName: demo.business.name,
    city: demo.business.city,
    region: demo.business.region,
    country: demo.business.country,
    nicheSlug: demo.business.niche,
    nichePreset,
    intelligencePacket: (packetRow?.packetJson as Record<string, unknown>) ?? null,
    pageStrategy: config.pageStrategy,
    seoPrimaryKeyword: config.seo?.primaryKeyword ?? `${demo.business.niche} ${demo.business.city}`,
    complianceWarnings: [
      ...(config.compliance?.warnings ?? []),
      ...(config.compliance?.severeWarnings ?? []),
    ],
  });

  const dw = config.designWorkflow;
  const prompt =
    dw?.finalStitchPrompt?.trim() ||
    (config as DemoConfig & { stitchPromptLast?: string }).stitchPromptLast?.trim() ||
    generateStitchPrompt(brief);
  const out = await runStitchScreenFromPrompt({
    projectTitle: `${demo.business.name} · ${demo.slug}`.slice(0, 120),
    prompt,
    deviceType: "MOBILE",
  });

  const rawText = [
    "Google Stitch SDK — generated screen (plain text extracted from HTML).",
    `projectId=${out.projectId} screenId=${out.screenId}`,
    out.screenshotUrl ? `screenshot=${out.screenshotUrl}` : "",
    "",
    out.plainTextForParser,
  ].join("\n");

  const result = await importStitchReferenceAndCreateVariant({
    businessId,
    demoConfigId,
    sourceType: "stitch",
    rawText,
    codeSnippet: out.htmlSnippet.slice(0, 8000),
    selectedVariantName: "stitch_sdk",
    variantName: "Stitch SDK",
  });

  revalidatePath(`/business/${businessId}`);
  return result;
}

export async function deleteVariantAction(businessId: string, variantId: string) {
  const v = await prisma.designVariant.findFirst({ where: { id: variantId, businessId } });
  if (!v) return;
  await prisma.designVariant.delete({ where: { id: variantId } });
  revalidatePath(`/business/${businessId}`);
}
