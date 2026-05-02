import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "@/components/dashboard/Shell";
import { runFullPipeline } from "@/lib/jobs/pipeline";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function startBatch(formData: FormData) {
  "use server";
  const cityId = String(formData.get("cityId"));
  const nicheId = String(formData.get("nicheId"));
  const batchSize = Number(formData.get("batchSize") ?? 30);
  const generateDemos = formData.get("generateDemos") === "on";
  if (!cityId || !nicheId) return;
  await runFullPipeline({ cityId, nicheId, batchSize, generateDemos });
  revalidatePath("/discover");
  revalidatePath("/dashboard");
  redirect("/discover");
}

export default async function DiscoverPage() {
  const [cities, niches, recent] = await Promise.all([
    prisma.targetCity.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
    }),
    prisma.targetNiche.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
    }),
    prisma.discoveryJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { city: true, niche: true },
    }),
  ]);

  return (
    <DashboardShell
      title="Discover"
      subtitle="Run a full pipeline batch: discovery → verify → audit → demos → QA."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <form
          action={startBatch}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              City
            </label>
            <select
              name="cityId"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Niche
            </label>
            <select
              name="nicheId"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
            >
              {niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Batch size
            </label>
            <input
              type="number"
              name="batchSize"
              defaultValue={30}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="generateDemos" defaultChecked />
            Generate demos for top-scoring leads
          </label>
          <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-black hover:brightness-110">
            Start batch
          </button>
          <p className="text-[11px] text-white/40">
            v1 uses the in-process job runner — pipelines start immediately. Once
            running, refresh the page to see results.
          </p>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            Recent batches
          </p>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">No batches yet.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="py-2 text-left">When</th>
                  <th className="py-2 text-left">Target</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-right">Found</th>
                  <th className="py-2 text-right">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 text-white/70">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">
                      {r.city.name} · {r.niche.name}
                    </td>
                    <td className="py-2">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">{r.businessesFound}</td>
                    <td className="py-2 text-right">{r.businessesSaved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
