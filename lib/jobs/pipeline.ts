import { prisma } from "@/lib/db/prisma";
import { jobRegistry } from "./runner";
import { registerAllJobs } from "./register";
import { APP_CONFIG } from "@/lib/utils/config";

registerAllJobs();

export interface PipelineProgress {
  step: string;
  detail: string;
  done: number;
  total: number;
}

/** Discovery → verify → audit → optional demos + QA (used by UI + automation). */
export async function executeFullPipelineSteps(
  args: {
    cityId: string;
    nicheId: string;
    batchSize?: number;
    generateDemos?: boolean;
  },
  discoveryJobId: string,
): Promise<void> {
  await jobRegistry.enqueue("discovery", { jobId: discoveryJobId });
  const niche = await prisma.targetNiche.findUnique({ where: { id: args.nicheId } });
  const city = await prisma.targetCity.findUnique({ where: { id: args.cityId } });
  if (!niche || !city) {
    throw new Error(
      `Target city or niche not found (cityId=${args.cityId}, nicheId=${args.nicheId})`,
    );
  }
  const found = await prisma.business.findMany({
    where: { niche: niche.slug, city: city.name },
    orderBy: { createdAt: "desc" },
    take: args.batchSize ?? APP_CONFIG.discoveryBatchSize,
  });
  for (const b of found) {
    await jobRegistry.enqueue("website-verification", { businessId: b.id });
  }
  const top = await prisma.business.findMany({
    where: { id: { in: found.map((f) => f.id) } },
    orderBy: { createdAt: "desc" },
    take: APP_CONFIG.deepAuditLimit,
  });
  for (const b of top) {
    await jobRegistry.enqueue("deep-audit", { businessId: b.id });
  }
  if (args.generateDemos) {
    const ranked = await prisma.business.findMany({
      where: { id: { in: top.map((t) => t.id) } },
      include: { leadScores: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    const winners = ranked
      .filter((r) => (r.leadScores[0]?.finalLeadScore ?? 0) >= APP_CONFIG.minLeadScore)
      .slice(0, APP_CONFIG.demoGenerationLimit);
    for (const w of winners) {
      const result = (await jobRegistry.enqueue("demo-generation", {
        businessId: w.id,
      })) as { demoConfigId: string; slug: string };
      await jobRegistry.enqueue("qa-loop", { demoConfigId: result.demoConfigId });
    }
  }
}

// Run discovery → verify → audit → demo → qa for one (city, niche) batch.
export async function runFullPipeline(args: {
  cityId: string;
  nicheId: string;
  batchSize?: number;
  generateDemos?: boolean;
}): Promise<{ jobId: string }> {
  const job = await prisma.discoveryJob.create({
    data: {
      cityId: args.cityId,
      nicheId: args.nicheId,
      query: "",
      batchSize: args.batchSize ?? APP_CONFIG.discoveryBatchSize,
      status: "queued",
    },
  });

  void executeFullPipelineSteps(args, job.id).catch((err) => {
    console.error("[pipeline]", err);
  });

  return { jobId: job.id };
}

/** Waits until the full batch finishes — for `npm run pipeline` and CI. */
export async function runFullPipelineAwait(args: {
  cityId: string;
  nicheId: string;
  batchSize?: number;
  generateDemos?: boolean;
}): Promise<{ jobId: string }> {
  const job = await prisma.discoveryJob.create({
    data: {
      cityId: args.cityId,
      nicheId: args.nicheId,
      query: "",
      batchSize: args.batchSize ?? APP_CONFIG.discoveryBatchSize,
      status: "queued",
    },
  });

  await executeFullPipelineSteps(args, job.id);
  return { jobId: job.id };
}
