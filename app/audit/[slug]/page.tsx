import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { explainAudit } from "@/lib/agents/auditExplainer";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export const dynamic = "force-dynamic";

export default async function AuditPage({ params }: { params: { slug: string } }) {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug: params.slug },
    include: { business: true },
  });
  if (!demo) notFound();
  const wc = await prisma.websiteCheck.findFirst({
    where: { businessId: demo.businessId },
    orderBy: { createdAt: "desc" },
  });

  const explanation = explainAudit({
    positives: (wc?.positivesJson as string[] | null) ?? [],
    weaknesses: (wc?.mainWeaknessesJson as string[] | null) ?? [],
  });
  const config = demo.baseConfigJson as unknown as DemoConfig;

  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Conversion Demo Review
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {demo.business.name}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {demo.business.city} · {demo.business.niche} ·{" "}
          {wc?.url ?? "no current site"}
        </p>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card title="Current site snapshot">
            <p className="text-sm text-white/70">
              Status: <span className="text-white">{wc?.status ?? "unclear"}</span>
            </p>
            {wc?.title && (
              <p className="mt-2 text-sm text-white/70">{wc.title}</p>
            )}
            <Bullets title="What's already working" items={explanation.positiveFoundation} />
          </Card>
          <Card title="Missed conversion opportunities">
            <Bullets title="" items={explanation.missedOpportunities} />
          </Card>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            New demo version
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/demo/${demo.slug}`}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Open the live demo →
            </Link>
            <Link
              href={`/demo-dashboard/${demo.slug}`}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm hover:bg-white/5"
            >
              See the lead dashboard mock →
            </Link>
          </div>
          <Bullets
            title="How the new version fixes them"
            items={explanation.howNewVersionFixes}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            Why this can generate better leads
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>· Visitors get a clear, guided path instead of a wall of services.</li>
            <li>· The quote flow captures real job details, not just an email.</li>
            <li>· Photo upload improves lead quality and quote speed.</li>
            <li>· Sticky mobile CTA reduces friction on small screens.</li>
            <li>· The diagnostic ({config.strategy.leadMagnet}) increases engagement.</li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-white/80">
            {explanation.clientFacingExplanation}
          </p>
        </section>

        <p className="mt-12 text-center text-xs text-white/40">
          Audit prepared by Local Funnel Radar · Manual review only · No false claims.
        </p>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      {title && (
        <p className="text-[11px] uppercase tracking-wider text-white/50">{title}</p>
      )}
      <ul className="mt-2 space-y-1.5 text-sm text-white/80">
        {items.map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}
