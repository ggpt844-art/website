import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { DashboardShell } from "@/components/dashboard/Shell";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as
    | "approved"
    | "rejected"
    | "needs_manual_polish"
    | "contacted";
  await prisma.reviewQueueItem.update({ where: { id }, data: { status } });
  revalidatePath("/review-queue");
}

export default async function ReviewQueuePage() {
  const items = await prisma.reviewQueueItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: {
        include: {
          websiteChecks: { orderBy: { createdAt: "desc" }, take: 1 },
          leadScores: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      demoConfig: {
        include: { versions: { orderBy: { totalScore: "desc" }, take: 1 } },
      },
    },
  });

  return (
    <DashboardShell
      title="Review queue"
      subtitle="Manual approval before any outreach. Approve, reject, or send back for polish."
    >
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/60">
            No demos in the queue. Run a discovery batch with demo generation
            enabled.
          </div>
        )}
        {items.map((it) => {
          const wc = it.business.websiteChecks[0];
          const score = it.business.leadScores[0];
          const top = it.demoConfig.versions[0];
          const weak = (wc?.mainWeaknessesJson as string[] | null)?.[0];
          const cfg = it.demoConfig.baseConfigJson as {
            seo?: { seoFoundationScore?: number };
            aiSearch?: { aiSearchScore?: number };
            package?: { tier?: string };
          } | null;
          const seoScore = cfg?.seo?.seoFoundationScore;
          const aiScore = cfg?.aiSearch?.aiSearchScore;
          const pkgTier = cfg?.package?.tier;
          return (
            <article
              key={it.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/business/${it.business.id}`}
                    className="font-display text-2xl font-semibold tracking-tight hover:underline"
                  >
                    {it.business.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                    {it.business.city} · {it.business.niche} ·{" "}
                    {it.business.websiteStatus}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    it.status === "pending"
                      ? "bg-white/10 text-white"
                      : it.status === "approved"
                        ? "bg-accent-green/20 text-accent-green"
                        : it.status === "rejected"
                          ? "bg-accent-orange/20 text-accent-orange"
                          : "bg-white/5 text-white/60"
                  }`}
                >
                  {it.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-4 lg:grid-cols-7">
                <Stat k="Lead score" v={score?.finalLeadScore ?? "—"} />
                <Stat k="Demo score" v={top?.totalScore ?? "—"} />
                <Stat k="SEO" v={seoScore ?? "—"} />
                <Stat k="AI search" v={aiScore ?? "—"} />
                <Stat k="Package" v={pkgTier ?? "—"} small />
                <Stat
                  k="Difference"
                  v={
                    top && wc
                      ? Math.max(0, top.totalScore - wc.websiteQualityScore)
                      : "—"
                  }
                />
                <Stat k="Main weakness" v={weak ?? "—"} small />
              </div>

              <p className="mt-4 text-xs text-white/60">
                Contact reason: {it.demoConfig.baseConfigJson &&
                  (it.demoConfig.baseConfigJson as { strategy?: { contactReason?: string } })
                    .strategy?.contactReason}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {it.business.websiteUrl && (
                  <a
                    href={it.business.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                  >
                    Open current site ↗
                  </a>
                )}
                <Link
                  href={`/demo/${it.demoConfig.slug}`}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
                >
                  Open demo →
                </Link>
                <Link
                  href={`/audit/${it.demoConfig.slug}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                >
                  Open audit →
                </Link>
                <Link
                  href={`/demo-dashboard/${it.demoConfig.slug}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                >
                  Lead dashboard →
                </Link>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {[
                    { s: "approved", c: "bg-accent-green/20 text-accent-green" },
                    {
                      s: "needs_manual_polish",
                      c: "bg-accent-blue/20 text-accent-blue",
                    },
                    { s: "rejected", c: "bg-white/10 text-white/70" },
                  ].map((o) => (
                    <form key={o.s} action={setStatus}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="status" value={o.s} />
                      <button className={`rounded-full px-3 py-1.5 text-xs ${o.c}`}>
                        {o.s.replace(/_/g, " ")}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardShell>
  );
}

function Stat({
  k,
  v,
  small,
}: {
  k: string;
  v: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{k}</p>
      <p className={`mt-1 ${small ? "text-xs text-white/80" : "font-display text-xl"}`}>
        {v}
      </p>
    </div>
  );
}
