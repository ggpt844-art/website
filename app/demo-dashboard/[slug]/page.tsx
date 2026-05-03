import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import {
  isLiveDemoRebuildEnabled,
  rebuildDemoConfigForSlug,
} from "@/lib/demo/rebuildDemoConfigForSlug";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-accent-blue/20 text-accent-blue",
  contacted: "bg-accent-orange/20 text-accent-orange",
  booked: "bg-accent-green/20 text-accent-green",
  sold: "bg-accent-gold/20 text-accent-gold",
  lost: "bg-white/10 text-white/60",
  spam: "bg-white/5 text-white/40",
};

export default async function DemoDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug: params.slug },
    include: { business: true },
  });
  if (!demo) notFound();

  const [leads, eventGroups, lastEvents] = await Promise.all([
    prisma.crmLead.findMany({
      where: { demoConfigId: demo.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: { demoConfigId: demo.id },
      _count: true,
    }),
    prisma.analyticsEvent.findMany({
      where: { demoConfigId: demo.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const quoteSubmits =
    eventGroups.find((e) => e.eventType === "quote_form_submitted")?._count ?? 0;
  const pageViews = eventGroups.find((e) => e.eventType === "page_view")?._count ?? 0;
  const ctaClicks = eventGroups.find((e) => e.eventType === "cta_click")?._count ?? 0;

  let demoConfig = demo.baseConfigJson as unknown as DemoConfig;
  if (isLiveDemoRebuildEnabled()) {
    const live = await rebuildDemoConfigForSlug(params.slug);
    if (live) demoConfig = live;
  }

  const flow = demoConfig.flowRationale;
  const mobilePlan = demoConfig.mobilePlan;
  const fingerprint = demoConfig.designFingerprint;

  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Lead dashboard</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {demo.business.name} · Pipeline
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Live data for this demo slug: quote submissions, scores, and recent analytics events.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={`/demo/${params.slug}`}
            className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5"
          >
            ← Open demo
          </Link>
          <Link
            href={`/leads?businessId=${demo.businessId}`}
            className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5"
          >
            All CRM leads →
          </Link>
          {demoConfig.assets.heroLocked ? (
            <span
              className="rounded-full border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-amber-100/90"
              title="assets.heroAssetUrl, heroCinematic, use3DFallback, video/GLB — preserved on regenerate when true"
            >
              Hero locked
            </span>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Captures (this demo)" value={leads.length} />
          <Stat label="Quote submissions (events)" value={quoteSubmits} />
          <Stat label="Page views (events)" value={pageViews} />
          <Stat label="CTA clicks (events)" value={ctaClicks} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {flow ? (
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 lg:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200/70">
                Flow rationale (internal)
              </p>
              <p className="mt-3 text-sm font-medium text-white/90">
                Archetype: {flow.selectedArchetype.replace(/_/g, " ")}
              </p>
              <p className="mt-2 text-sm text-white/65">{flow.whyThisFlowFits}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Included</p>
                  <ul className="mt-2 space-y-1 text-xs text-white/55">
                    {flow.whySectionsWereIncluded.slice(0, 8).map((x) => (
                      <li key={x.slice(0, 48)}>· {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Excluded</p>
                  <ul className="mt-2 space-y-1 text-xs text-white/55">
                    {flow.whySectionsWereExcluded.slice(0, 8).map((x) => (
                      <li key={x.slice(0, 48)}>· {x}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/50">
                Goals — conversion: {flow.conversionGoal} · trust: {flow.trustGoal} · visual:{" "}
                {flow.visualGoal}
              </p>
            </div>
          ) : null}

          {fingerprint ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/65">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Design fingerprint
              </p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-white/40">Section hash</dt>
                  <dd className="font-mono text-white/80">{fingerprint.sectionOrderHash}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Scene</dt>
                  <dd>{fingerprint.sceneType}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Color family</dt>
                  <dd>{fingerprint.colorFamily}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Hero layout</dt>
                  <dd>{fingerprint.heroLayoutType}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {mobilePlan ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/65">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Mobile plan
              </p>
              <p className="mt-2 text-white/75">{mobilePlan.heroPriority}</p>
              <p className="mt-2 text-white/55">Sticky: {mobilePlan.stickyCtaType}</p>
              <p className="mt-2 text-white/45">{mobilePlan.motionReduction}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Recent events
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {lastEvents.length === 0 ? (
                <li>No analytics yet — open the demo once to seed page_view.</li>
              ) : (
                lastEvents.map((e) => (
                  <li key={e.id} className="flex justify-between gap-4 text-xs">
                    <span>{e.eventType}</span>
                    <span className="text-white/45">
                      {e.createdAt.toISOString().slice(5, 16).replace("T", " ")}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Event breakdown
            </p>
            <ul className="mt-4 space-y-1 text-xs text-white/65">
              {eventGroups
                .slice()
                .sort((a, b) => b._count - a._count)
                .map((g) => (
                  <li key={g.eventType} className="flex justify-between">
                    <span>{g.eventType}</span>
                    <span>{g._count}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {l.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {l.name ?? "—"}
                    <br />
                    {l.phone ?? l.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">{l.leadScore}</td>
                  <td className="px-4 py-3 text-xs">{l.priority}</td>
                  <td className="px-4 py-3 text-xs text-white/80">
                    {l.serviceNeeded ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        STATUS_STYLE[l.status] ?? "bg-white/5 text-white/70"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <p className="mt-6 text-center text-sm text-white/45">
            No captured leads for this demo yet — complete the quote flow on the public demo page.
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
