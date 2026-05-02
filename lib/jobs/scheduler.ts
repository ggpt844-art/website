import { prisma } from "@/lib/db/prisma";
import { jobRegistry } from "./runner";
import { registerAllJobs } from "./register";
import { APP_CONFIG } from "@/lib/utils/config";
import { buildQueries } from "@/lib/discovery/queries";

registerAllJobs();

export interface SchedulerStatus {
  enabled: boolean;
  intervalHours: number;
  nextRun?: string;
  lastRun?: string;
  pending: number;
}

export async function pickNextTarget() {
  const cities = await prisma.targetCity.findMany({ where: { enabled: true } });
  const niches = await prisma.targetNiche.findMany({ where: { enabled: true } });
  if (cities.length === 0 || niches.length === 0) return null;

  // Pick the (city, niche) pair with the oldest most recent discovery.
  const recent = await prisma.discoveryJob.findMany({
    select: { cityId: true, nicheId: true, createdAt: true },
  });
  const lastByPair = new Map<string, number>();
  for (const r of recent) {
    const k = `${r.cityId}:${r.nicheId}`;
    lastByPair.set(k, Math.max(lastByPair.get(k) ?? 0, r.createdAt.getTime()));
  }

  let best: { city: typeof cities[number]; niche: typeof niches[number]; ts: number } | null = null;
  for (const c of cities) {
    for (const n of niches) {
      const ts = lastByPair.get(`${c.id}:${n.id}`) ?? 0;
      if (!best || ts < best.ts) best = { city: c, niche: n, ts };
    }
  }
  return best;
}

export async function tick(): Promise<{ enqueued: number }> {
  const pair = await pickNextTarget();
  if (!pair) return { enqueued: 0 };
  const queries = buildQueries(pair.niche.slug, pair.city.name);
  const job = await prisma.discoveryJob.create({
    data: {
      cityId: pair.city.id,
      nicheId: pair.niche.id,
      query: queries.join(" | "),
      batchSize: APP_CONFIG.discoveryBatchSize,
      status: "queued",
    },
  });
  void jobRegistry.enqueue("discovery", { jobId: job.id });
  return { enqueued: 1 };
}

export async function status(): Promise<SchedulerStatus> {
  const pending = await prisma.discoveryJob.count({
    where: { status: { in: ["queued", "running"] } },
  });
  const last = await prisma.discoveryJob.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return {
    enabled: APP_CONFIG.workerEnabled,
    intervalHours: APP_CONFIG.schedulerIntervalHours,
    pending,
    lastRun: last?.createdAt.toISOString(),
  };
}
