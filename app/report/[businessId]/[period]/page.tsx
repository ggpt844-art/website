import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { DashboardShell } from "@/components/dashboard/Shell";

export const dynamic = "force-dynamic";

export default async function GrowthReportPage({
  params,
}: {
  params: { businessId: string; period: string };
}) {
  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
  });
  if (!business) notFound();

  const parts = decodeURIComponent(params.period).split("_");
  if (parts.length < 2) notFound();
  const start = new Date(parts[0]);
  const end = new Date(parts[1]);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) notFound();

  const demo = await prisma.demoConfig.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  const config = demo?.baseConfigJson as unknown as DemoConfig | undefined;

  const [events, leads, stored] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        businessId: business.id,
        createdAt: { gte: start, lte: end },
      },
    }),
    prisma.crmLead.findMany({
      where: {
        businessId: business.id,
        createdAt: { gte: start, lte: end },
      },
    }),
    prisma.growthReport.findFirst({
      where: {
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
      },
    }),
  ]);

  const byType = new Map<string, number>();
  for (const e of events) {
    byType.set(e.eventType, (byType.get(e.eventType) ?? 0) + 1);
  }

  const seoScore = config?.seo?.seoFoundationScore;
  const aiScore = config?.aiSearch?.aiSearchScore;
  const gbpScore = config?.seo?.gbpHealth?.gbpHealthScore;
  const napScore = config?.seo?.napCheck?.napConsistencyScore;

  return (
    <DashboardShell
      title="Bi-weekly growth snapshot"
      subtitle={`${business.name} · ${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`}
    >
      <p className="mb-6 text-sm text-white/60">
        This does not guarantee rankings. It summarizes site health signals, AI-search readiness,
        and lead activity for internal review.
      </p>

      {stored && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
          Stored report status: {stored.status} ·{" "}
          <Link href={`/business/${business.id}?tab=reports`} className="underline">
            open in business profile
          </Link>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStat label="SEO foundation" value={seoScore ?? "—"} />
        <ReportStat label="AI search readiness" value={aiScore ?? "—"} />
        <ReportStat label="GBP health" value={gbpScore ?? "—"} />
        <ReportStat label="NAP consistency" value={napScore ?? "—"} />
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Lead activity</p>
        <ul className="mt-4 space-y-2 text-sm text-white/75">
          <li>· New captures in window: {leads.length}</li>
          <li>· Hot priority: {leads.filter((l) => l.priority === "hot").length}</li>
          <li>· Booked: {leads.filter((l) => l.status === "booked").length}</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Analytics (selected)</p>
        <ul className="mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
          {["page_view", "cta_click", "call_click", "quote_form_submitted", "thank_you_viewed"].map(
            (k) => (
              <li key={k}>
                · {k}: {byType.get(k) ?? 0}
              </li>
            ),
          )}
        </ul>
      </section>

      {config?.aiSearch && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            AI search (config)
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              · Googlebot allowed:{" "}
              {config.aiSearch.aiCrawlerPolicy.allowGooglebot ? "yes" : "no"}
            </li>
            <li>
              · OAI-SearchBot allowed:{" "}
              {config.aiSearch.aiCrawlerPolicy.allowOaiSearchBot ? "yes" : "no"}
            </li>
            <li>
              · PerplexityBot allowed:{" "}
              {config.aiSearch.aiCrawlerPolicy.allowPerplexityBot ? "yes" : "no"}
            </li>
            <li>
              · llms.txt exposed (policy):{" "}
              {config.aiSearch.aiCrawlerPolicy.exposeLlmsTxt ? "yes" : "no"}
            </li>
            <li>
              · Direct answer blocks: {config.aiSearch.directAnswerBlocks.length}
            </li>
          </ul>
          {config.aiSearch.freshness?.recommendedRefreshes?.length ? (
            <p className="mt-4 text-xs text-white/50">
              Freshness: {config.aiSearch.freshness.recommendedRefreshes.join("; ")}
            </p>
          ) : null}
        </section>
      )}

      <div className="mt-10 text-sm">
        <Link href={`/business/${business.id}`} className="text-white/60 underline hover:text-white">
          ← Back to business
        </Link>
      </div>
    </DashboardShell>
  );
}

function ReportStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
