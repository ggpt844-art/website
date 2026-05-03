import { prisma } from "@/lib/db/prisma";
import { getNichePreset } from "@/lib/presets/niches";
import type { DemoConfig, DesignWorkflowBundle } from "@/lib/renderer/demoConfig";
import { runStitchPromptAgent } from "./runStitchPromptAgent";
import type { StitchPromptAgentInput, StitchPromptAgentResult } from "./types";

export async function runStitchPromptAgentAndPersist(demoConfigId: string): Promise<StitchPromptAgentResult> {
  const demo = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    include: { business: true },
  });
  if (!demo?.business) throw new Error("Demo not found");
  const config = demo.baseConfigJson as unknown as DemoConfig;
  if (!config.pageStrategy) throw new Error("Demo has no pageStrategy — regenerate demo first.");

  const packetRow = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId: demo.businessId },
    orderBy: { createdAt: "desc" },
  });

  const b = demo.business;
  const nichePreset = getNichePreset(b.niche);
  const complianceWarnings = [
    ...(config.compliance?.warnings ?? []),
    ...(config.compliance?.severeWarnings ?? []),
  ];

  const input: StitchPromptAgentInput = {
    business: {
      id: b.id,
      name: b.name,
      city: b.city,
      niche: b.niche,
      category: b.category,
      region: b.region,
      country: b.country,
      websiteUrl: b.websiteUrl,
      rating: b.rating,
      reviewCount: b.reviewCount,
    },
    businessIntelligencePacket: (packetRow?.packetJson as Record<string, unknown>) ?? null,
    nichePreset,
    pageStrategy: config.pageStrategy,
    seoConfig: config.seo,
    aiSearchConfig: config.aiSearch,
    conversionConfig: config.conversion,
    trustArchitecture: { ...(config.trust as object) } as Record<string, unknown>,
    complianceWarnings,
    availableAssets: {
      logoUrl: config.assets.logoUrl ?? null,
      heroAssetUrl: config.assets.heroAssetUrl ?? null,
      heroCinematic: Boolean(config.assets.heroCinematic),
      galleryCount: config.assets.galleryImages?.length ?? 0,
      proofCount: config.assets.proofImages?.length ?? 0,
      use3DFallback: config.assets.use3DFallback,
    },
    previousDesignFingerprints: config.designFingerprint ? [config.designFingerprint] : [],
    desiredVariantCount: Math.max(3, config.designWorkflow?.desiredVariantCount ?? 3),
    demoConfig: config,
  };

  const result = await runStitchPromptAgent(input);

  const designWorkflow: DesignWorkflowBundle = {
    buyerPsychology: { ...result.buyerPsychology },
    creativeStrategy: { ...result.creativeStrategy },
    conversionStrategy: { ...result.conversionStrategy },
    sectionStrategy: { ...result.sectionStrategy },
    stitchPromptPlan: { ...result.stitchPromptPlan },
    finalStitchPrompt: result.finalStitchPrompt,
    stitchPromptAgentWarnings: result.warnings,
    stitchPromptConfidence: result.confidence,
    stitchPromptScore: result.stitchPromptScore,
    stitchPromptBlocksAutoStitch: result.stitchPromptBlocksAutoStitch,
    stitchPromptGradedAt: new Date().toISOString(),
    desiredVariantCount: input.desiredVariantCount,
    lastStitchPromptAgentAt: new Date().toISOString(),
    stitchPromptGraderBreakdown: result.stitchPromptGraderBreakdown,
    stitchPromptUsedClaude: result.usedClaude,
  };

  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...config,
        designWorkflow,
        stitchPromptLast: result.finalStitchPrompt,
      } as object,
    },
  });

  return result;
}
