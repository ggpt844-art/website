import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "@/components/dashboard/Shell";
import { StatCard } from "@/components/dashboard/StatCard";
import { status as schedulerStatus } from "@/lib/jobs/scheduler";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalBusinesses,
    hotLeads,
    demosGenerated,
    needsPolish,
    approved,
    rejected,
    latestBatches,
    topLeads,
    sched,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.leadScore.count({ where: { priority: "hot" } }),
    prisma.demoConfig.count({ where: { status: { not: "draft" } } }),
    prisma.demoConfig.count({ where: { status: "needs_manual_polish" } }),
    prisma.demoConfig.count({ where: { status: "approved" } }),
    prisma.reviewQueueItem.count({ where: { status: "rejected" } }),
    prisma.discoveryJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { city: true, niche: true },
    }),
    prisma.leadScore.findMany({
      orderBy: { finalLeadScore: "desc" },
      take: 8,
      include: { business: true },
    }),
    schedulerStatus(),
  ]);

  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Live state of discovery, audit, and demo generation across your targets."
      actions={
        <Link
          href="/discover"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          Run discovery
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Businesses discovered" value={totalBusinesses} />
        <StatCard label="Hot leads" value={hotLeads} accent="text-accent-orange" />
        <StatCard label="Demos generated" value={demosGenerated} />
        <StatCard label="Needs manual polish" value={needsPolish} />
        <StatCard label="Approved demos" value={approved} accent="text-accent-green" />
        <StatCard label="Rejected leads" value={rejected} />
        <StatCard
          label="Scheduler"
          value={sched.enabled ? "On" : "Off"}
          helper={`Every ${sched.intervalHours}h · ${sched.pending} pending`}
        />
        <StatCard
          label="Last batch"
          value={sched.lastRun ? new Date(sched.lastRun).toLocaleString() : "—"}
        />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Latest batches">
          {latestBatches.length === 0 ? (
            <Empty text="No discovery batches yet. Run one from /discover." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="py-2 text-left">When</th>
                  <th className="py-2 text-left">City</th>
                  <th className="py-2 text-left">Niche</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-right">Found</th>
                  <th className="py-2 text-right">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {latestBatches.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 text-white/70">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">{b.city.name}</td>
                    <td className="py-2">{b.niche.name}</td>
                    <td className="py-2">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">{b.businessesFound}</td>
                    <td className="py-2 text-right">{b.businessesSaved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
        <Section title="Top scoring leads">
          {topLeads.length === 0 ? (
            <Empty text="No scored leads yet." />
          ) : (
            <ul className="divide-y divide-white/5">
              {topLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/business/${l.business.id}`}
                      className="font-medium hover:underline"
                    >
                      {l.business.name}
                    </Link>
                    <p className="text-xs text-white/50">
                      {l.business.city} · {l.business.niche} · {l.priority}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 font-display text-sm">
                    {l.finalLeadScore}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-white/50">{text}</p>;
}
