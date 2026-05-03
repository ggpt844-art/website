/**
 * Fully automated path: DESIGN brief + internal DESIGN.md → seed variants →
 * optional Stitch SDK reference → rescore → merge best variant into `baseConfigJson`.
 */
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { APP_CONFIG } from "@/lib/utils/config";
import { getNichePreset } from "@/lib/presets/niches";
import { generateDesignBrief } from "./generateDesignBrief";
import { generateDesignMdFromBriefOnly } from "./generateDesignMdFromReference";
import { generateStitchPrompt } from "./generateStitchPrompt";
import { gradeDesignWorkflow } from "./designWorkflowGrader";
import {
  importStitchReferenceAndCreateVariant,
  seedInternalVariantsForDemo,
  selectDesignVariantForDemo,
} from "./importStitchReference";
import { pickHighestScoringVariant, scoreVariantAgainstConfig } from "./designVariantSelector";
import { runStitchScreenFromPrompt } from "./stitchProgrammatic";
import { runStitchPromptAgentAndPersist } from "./stitchPromptAgent/persistAgentToDemo";
import { getStitchAutoBlockReason } from "./stitchPromptAgent/stitchGates";

export async function runAutomatedDesignWorkflowForDemo(demoConfigId: string): Promise<void> {
  const demo = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    include: { business: true },
  });
  if (!demo?.business) return;

  let config = demo.baseConfigJson as unknown as DemoConfig;
  if (!config.pageStrategy) return;

  const packetRow = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId: demo.businessId },
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

  const designMd = generateDesignMdFromBriefOnly(brief, demo.business.name);
  const wfGrade = gradeDesignWorkflow({
    config: {
      ...config,
      designBrief: brief as unknown as Record<string, unknown>,
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
        designMode: config.designMode ?? "internal_auto",
        designBrief: brief as unknown as Record<string, unknown>,
        designMd: designMd as unknown as Record<string, unknown>,
        designWorkflowMeta: {
          designWorkflowScore: wfGrade.designWorkflowScore,
          warnings: wfGrade.warnings,
          blocksApproval: wfGrade.blocksApproval,
          lastGradedAt: new Date().toISOString(),
          automated: true,
        },
      } as object,
    },
  });

  const demoReload = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demoReload) return;
  config = demoReload.baseConfigJson as unknown as DemoConfig;

  await seedInternalVariantsForDemo(demoConfigId);

  try {
    await runStitchPromptAgentAndPersist(demoConfigId);
  } catch (err) {
    console.error("[automated-design] Stitch prompt agent failed:", err);
  }

  const demoAfterPrompt = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (demoAfterPrompt) {
    config = demoAfterPrompt.baseConfigJson as unknown as DemoConfig;
  }

  if (APP_CONFIG.enableStitchSdk && process.env.STITCH_API_KEY?.trim()) {
    // Same prompt resolution as `runStitchSdkImportAction`: do not skip the SDK solely because
    // the stitch prompt grader score is below threshold — auto path should still call Stitch when
    // a usable prompt exists (graded, draft, or brief-derived).
    const gateNote = getStitchAutoBlockReason(config.designWorkflow);
    const prompt =
      config.designWorkflow?.finalStitchPrompt?.trim() ||
      config.stitchPromptLast?.trim() ||
      generateStitchPrompt(brief);
    if (!prompt.trim()) {
      console.warn("[automated-design] Skipping Stitch SDK: no prompt (brief/designWorkflow empty).");
    } else {
      if (gateNote) {
        console.warn("[automated-design] Stitch prompt gate note — running SDK anyway:", gateNote);
      }
      try {
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
        await importStitchReferenceAndCreateVariant({
          businessId: demo.businessId,
          demoConfigId,
          sourceType: "stitch",
          rawText,
          codeSnippet: out.htmlSnippet.slice(0, 8000),
          selectedVariantName: "stitch_sdk_auto",
          variantName: "Stitch SDK (auto)",
        });
        const demoAfterStitch = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
        if (demoAfterStitch) {
          config = demoAfterStitch.baseConfigJson as unknown as DemoConfig;
        }
      } catch (err) {
        console.error("[automated-design] Stitch SDK failed:", err);
      }
    }
  }

  const variants = await prisma.designVariant.findMany({
    where: { demoConfigId },
  });
  for (const v of variants) {
    const s = scoreVariantAgainstConfig(v, config);
    await prisma.designVariant.update({
      where: { id: v.id },
      data: { score: s },
    });
  }

  const ranked = await prisma.designVariant.findMany({
    where: { demoConfigId },
    orderBy: { score: "desc" },
  });
  const best = pickHighestScoringVariant(ranked);
  if (best && APP_CONFIG.autoSelectBestDesignVariant) {
    await selectDesignVariantForDemo(demoConfigId, best.id);
  }
}
