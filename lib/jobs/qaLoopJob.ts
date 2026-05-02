import { prisma } from "@/lib/db/prisma";
import { applyConfigPatch, gradeDemo } from "@/lib/qa/critic";
import { APP_CONFIG } from "@/lib/utils/config";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export interface QaLoopPayload {
  demoConfigId: string;
}

export async function runQaLoopJob({ demoConfigId }: QaLoopPayload): Promise<void> {
  const demoConfig = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    include: { business: true },
  });
  if (!demoConfig) return;

  const websiteCheck = await prisma.websiteCheck.findFirst({
    where: { businessId: demoConfig.businessId },
    orderBy: { createdAt: "desc" },
  });

  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: { status: "qa_running" },
  });

  let current = demoConfig.baseConfigJson as unknown as DemoConfig;
  let bestVersionId: string | null = null;
  let bestScore = -1;

  for (let i = 1; i <= APP_CONFIG.qaMaxIterations; i++) {
    const grade = gradeDemo({
      config: current,
      iteration: i,
      currentSiteWeaknesses:
        (websiteCheck?.mainWeaknessesJson as string[] | null) ?? [],
      currentSitePositives:
        (websiteCheck?.positivesJson as string[] | null) ?? [],
      currentSiteVisualScore: websiteCheck?.visualQualityScore,
    });

    const version = await prisma.demoVersion.create({
      data: {
        demoConfigId,
        businessId: demoConfig.businessId,
        versionNumber: i,
        demoConfigJson: current as unknown as object,
        totalScore: grade.totalScore,
        scoreBreakdownJson: grade.categoryScores as object,
        criticNotesJson: {
          critical: grade.criticalIssues,
          minor: grade.minorIssues,
          reasoning: grade.reasoningSummary,
        } as object,
        improvementPlanJson: grade.improvementPlan as object,
        configPatchJson: grade.configPatch as object,
        status: "graded",
      },
    });

    if (grade.totalScore > bestScore) {
      bestScore = grade.totalScore;
      bestVersionId = version.id;
    }

    if (grade.verdict === "approve" || grade.verdict === "reject") break;
    if (i === APP_CONFIG.qaMaxIterations) break;

    current = applyConfigPatch(current, grade.configPatch);
    // Apply rule-based copy/CTA tightening if hard pass thresholds missed.
    if (current.copy.heroHeadline.length > 90) {
      current.copy.heroHeadline = current.copy.heroHeadline.slice(0, 88).trim();
    }
  }

  if (bestVersionId) {
    await prisma.demoVersion.update({
      where: { id: bestVersionId },
      data: { status: "winner" },
    });
  }

  const passes = bestScore >= APP_CONFIG.minDemoScore;
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      status: passes ? "approved" : "needs_manual_polish",
      winningVersionId: bestVersionId ?? undefined,
    },
  });

  if (passes && bestVersionId) {
    await prisma.reviewQueueItem.upsert({
      where: { id: `${demoConfigId}-review` },
      create: {
        id: `${demoConfigId}-review`,
        businessId: demoConfig.businessId,
        demoConfigId,
        status: "pending",
      },
      update: { status: "pending" },
    });
  }
}
