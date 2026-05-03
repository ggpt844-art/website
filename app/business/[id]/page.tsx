import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "@/components/dashboard/Shell";
import { jobRegistry } from "@/lib/jobs/runner";
import { registerAllJobs } from "@/lib/jobs/register";
import { revalidatePath } from "next/cache";
import {
  AiSearchGrowthPanel,
  ConversionGrowthPanel,
  GbpNapPanel,
  SeoGrowthPanel,
  TabBar,
  TrustCompliancePanel,
} from "@/components/business/GrowthPanels";
import {
  CaseStudyPanel,
  LaunchChecklistPanel,
  LeadOpsPanel,
  OutreachPanel,
  ReportsPanel,
} from "@/components/business/BusinessGrowthForms";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { DesignWorkflowDashboard } from "@/components/design-workflow/DesignWorkflowDashboard";
import { IntraNicheStrategyPanel } from "@/components/business/IntraNicheStrategyPanel";
import { APP_CONFIG } from "@/lib/utils/config";
import { getNichePreset } from "@/lib/presets/niches";
import { ensureLaunchChecklist } from "@/lib/launch/dbLaunchChecklist";
import { analyzeCroFromEventCounts } from "@/lib/cro/croAnalyzer";

registerAllJobs();
export const dynamic = "force-dynamic";

async function runVerify(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await jobRegistry.enqueue("website-verification", { businessId: id });
  await jobRegistry.enqueue("deep-audit", { businessId: id });
  revalidatePath(`/business/${id}`);
}

async function generateDemo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const result = (await jobRegistry.enqueue("demo-generation", {
    businessId: id,
  })) as { demoConfigId: string };
  await jobRegistry.enqueue("qa-loop", { demoConfigId: result.demoConfigId });
  revalidatePath(`/business/${id}`);
}

async function setNotes(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const notes = String(formData.get("notes") ?? "");
  await prisma.business.update({ where: { id }, data: { notes } });
  revalidatePath(`/business/${id}`);
}

async function approveDemo(formData: FormData) {
  "use server";
  const demoConfigId = String(formData.get("demoConfigId"));
  const row = await prisma.demoConfig.findUnique({
    where: { id: demoConfigId },
    select: { baseConfigJson: true, businessId: true },
  });
  if (!row) redirect("/review-queue");
  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: { status: "approved" },
  });
  redirect("/review-queue");
}

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string; approvalBlocked?: string };
}) {
  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: {
      sources: true,
      websiteChecks: { orderBy: { createdAt: "desc" }, take: 1 },
      assetProfiles: { orderBy: { createdAt: "desc" }, take: 1 },
      leadScores: { orderBy: { createdAt: "desc" }, take: 1 },
      competitorScans: { orderBy: { createdAt: "desc" }, take: 1 },
      intelligencePackets: { orderBy: { createdAt: "desc" }, take: 1 },
      demoConfigs: {
        orderBy: { createdAt: "desc" },
        include: {
          versions: { orderBy: { versionNumber: "asc" } },
        },
      },
      outreachMessages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!business) notFound();

  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview";
  const approvalBlocked = searchParams.approvalBlocked === "1";
  const demoCfg = business.demoConfigs[0]?.baseConfigJson as unknown as DemoConfig | undefined;

  const [leadGroups, eventGroups] =
    tab === "leads" || tab === "analytics" || tab === "reports"
      ? await Promise.all([
          prisma.crmLead.groupBy({
            by: ["status"],
            where: { businessId: business.id },
            _count: true,
          }),
          prisma.analyticsEvent.groupBy({
            by: ["eventType"],
            where: { businessId: business.id },
            _count: true,
          }),
        ])
      : [[], []];

  const eventCounts: Record<string, number> = {};
  for (const g of eventGroups) eventCounts[g.eventType] = g._count;
  const croAnalysis = analyzeCroFromEventCounts(eventCounts, demoCfg ?? null);

  type LeadNotificationRow = Prisma.LeadNotificationGetPayload<{
    include: { lead: { select: { id: true; name: true } } };
  }>;
  type FollowUpTaskRow = Prisma.FollowUpTaskGetPayload<{
    include: { lead: { select: { id: true; name: true } } };
  }>;

  let launchChecklist: Awaited<ReturnType<typeof ensureLaunchChecklist>> | null = null;
  let outreachContacts: Awaited<ReturnType<typeof prisma.outreachContact.findMany>> = [];
  let caseStudies: Awaited<ReturnType<typeof prisma.caseStudy.findMany>> = [];
  let growthReports: Awaited<ReturnType<typeof prisma.growthReport.findMany>> = [];
  let leadNotifications: LeadNotificationRow[] = [];
  let followUpTasks: FollowUpTaskRow[] = [];

  if (tab === "launch") {
    launchChecklist = await ensureLaunchChecklist(business.id);
  }
  if (tab === "outreach") {
    outreachContacts = await prisma.outreachContact.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
  if (tab === "case-study") {
    caseStudies = await prisma.caseStudy.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
  if (tab === "reports") {
    growthReports = await prisma.growthReport.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  }
  if (tab === "leads") {
    [leadNotifications, followUpTasks] = await Promise.all([
      prisma.leadNotification.findMany({
        where: { businessId: business.id, status: "pending", type: "dashboard_alert" },
        include: { lead: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.followUpTask.findMany({
        where: { businessId: business.id, status: "pending" },
        include: { lead: { select: { id: true, name: true } } },
        orderBy: { dueAt: "asc" },
        take: 40,
      }),
    ]);
  }

  const wc = business.websiteChecks[0];
  const score = business.leadScores[0];
  const demo = business.demoConfigs[0];
  const outreach = business.outreachMessages[0];
  const ap = business.assetProfiles[0];

  let designVariants: Awaited<ReturnType<typeof prisma.designVariant.findMany>> = [];
  let designReferences: Awaited<ReturnType<typeof prisma.designReference.findMany>> = [];
  if (tab === "design-workflow") {
    designVariants = demo
      ? await prisma.designVariant.findMany({
          where: { demoConfigId: demo.id },
          orderBy: { createdAt: "desc" },
        })
      : [];
    designReferences = await prisma.designReference.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
  }

  return (
    <DashboardShell title={business.name} subtitle={`${business.city} · ${business.niche}`}>
      <TabBar businessId={business.id} tab={tab} />

      {tab === "strategy" && (
        <IntraNicheStrategyPanel
          businessId={business.id}
          demoConfigId={demo?.id ?? null}
          config={demoCfg ?? null}
          approvalBlocked={approvalBlocked}
        />
      )}

      {tab === "seo" && <SeoGrowthPanel config={demoCfg ?? null} />}
      {tab === "ai-search" && <AiSearchGrowthPanel config={demoCfg ?? null} />}
      {tab === "conversion" && <ConversionGrowthPanel config={demoCfg ?? null} />}
      {tab === "trust" && <TrustCompliancePanel config={demoCfg ?? null} />}
      {tab === "gbp" && <GbpNapPanel config={demoCfg ?? null} />}
      {tab === "launch" && launchChecklist && (
        <LaunchChecklistPanel
          checklist={launchChecklist}
          businessId={business.id}
          demoPath={demo ? `/demo/${demo.slug}` : null}
        />
      )}

      {tab === "leads" && (
        <div className="space-y-6 text-sm">
          <LeadOpsPanel
            businessId={business.id}
            notifications={leadNotifications}
            tasks={followUpTasks}
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Pipeline</p>
            <ul className="mt-3 space-y-1 text-white/75">
              {leadGroups.map((g) => (
                <li key={g.status}>
                  · {g.status}: {g._count}
                </li>
              ))}
            </ul>
            <Link
              href={`/leads?businessId=${business.id}`}
              className="mt-4 inline-block text-sm underline text-white/70"
            >
              Open full CRM →
            </Link>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm">
            <p className="text-[11px] uppercase tracking-wider text-white/50">CRO (rule-based)</p>
            <p className="mt-2 font-display text-3xl">{croAnalysis.croScore}</p>
            <ul className="mt-3 space-y-1 text-xs text-white/65">
              {croAnalysis.funnelNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-white/50">Recommendations</p>
            <ul className="mt-2 space-y-1 text-xs text-white/70">
              {croAnalysis.recommendations.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Events (all time)</p>
            <ul className="mt-3 max-h-64 overflow-auto text-xs text-white/70">
              {eventGroups
                .slice()
                .sort((a, b) => b._count - a._count)
                .map((g) => (
                  <li key={g.eventType} className="flex justify-between gap-4 border-b border-white/5 py-1">
                    <span>{g.eventType}</span>
                    <span>{g._count}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "reports" && <ReportsPanel businessId={business.id} reports={growthReports} />}

      {tab === "outreach" && (
        <OutreachPanel
          businessId={business.id}
          contacts={outreachContacts}
          businessName={business.name}
          demoPath={demo ? `/demo/${demo.slug}` : null}
        />
      )}

      {tab === "case-study" && <CaseStudyPanel businessId={business.id} studies={caseStudies} />}

      {tab === "design-workflow" && (
        <DesignWorkflowDashboard
          businessId={business.id}
          demoConfigId={demo?.id ?? null}
          config={demoCfg ?? null}
          variants={designVariants}
          references={designReferences}
          hasIntelligencePacket={!!business.intelligencePackets[0]}
          stitchSdkEnabled={APP_CONFIG.enableStitchSdk && Boolean(process.env.STITCH_API_KEY)}
          nicheLabel={getNichePreset(business.niche).label}
          stitchMinAutoScore={APP_CONFIG.stitchPromptMinAutoScore}
        />
      )}

      {tab === "overview" && (
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Card title="Identity">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Row k="Phone" v={business.phone ?? "—"} />
              <Row k="Email" v={business.email ?? "—"} />
              <Row k="Address" v={business.address ?? "—"} />
              <Row k="Website" v={business.websiteUrl ?? "—"} />
              <Row k="Status" v={business.websiteStatus} />
              <Row k="Rating" v={business.rating ? `${business.rating} (${business.reviewCount ?? 0})` : "—"} />
            </dl>
          </Card>

          <Card title="Audit">
            {wc ? (
              <div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Score k="Visual" v={wc.visualQualityScore} />
                  <Score k="Conversion" v={wc.conversionScore} />
                  <Score k="Trust" v={wc.trustScore} />
                  <Score k="Mobile CTA" v={wc.mobileCtaScore} />
                  <Score k="Speed" v={wc.speedScore} />
                  <Score k="Funnel" v={wc.leadFunnelScore} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Bullets title="Positives" items={wc.positivesJson as string[] | null} />
                  <Bullets title="Weaknesses" items={wc.mainWeaknessesJson as string[] | null} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/50">No audit yet.</p>
            )}
            <form action={runVerify} className="mt-4">
              <input type="hidden" name="id" value={business.id} />
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
                Re-verify website + audit
              </button>
            </form>
          </Card>

          <Card title="Lead score">
            {score ? (
              <div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                  <Score k="Value" v={score.businessValueScore} />
                  <Score k="Weakness" v={score.websiteWeaknessScore} />
                  <Score k="Opportunity" v={score.demoOpportunityScore} />
                  <Score k="Outreach" v={score.outreachReadinessScore} />
                  <Score
                    k="Final"
                    v={score.finalLeadScore}
                    accent={score.priority === "hot" ? "text-accent-orange" : ""}
                  />
                </div>
                <p className="mt-3 text-xs text-white/50">{score.reason}</p>
              </div>
            ) : (
              <p className="text-sm text-white/50">No lead score yet.</p>
            )}
          </Card>

          <Card title="Assets">
            {ap ? (
              <div className="text-sm">
                <p>
                  Quality {ap.assetQualityScore} ·{" "}
                  {ap.fallbackNeeded ? "3D fallback hero" : "Real hero available"}
                </p>
                <p className="mt-2 text-xs text-white/50 whitespace-pre-line">{ap.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-white/50">No asset profile yet.</p>
            )}
          </Card>

          <Card title="Demos">
            {!demo ? (
              <form action={generateDemo}>
                <input type="hidden" name="id" value={business.id} />
                <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:brightness-110">
                  Generate demo
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                    {demo.status}
                  </span>
                  <Link
                    href={`/demo/${demo.slug}`}
                    className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:brightness-110"
                  >
                    Open demo →
                  </Link>
                  <Link
                    href={`/audit/${demo.slug}`}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-sm hover:bg-white/5"
                  >
                    Open audit →
                  </Link>
                  <Link
                    href={`/demo-dashboard/${demo.slug}`}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-sm hover:bg-white/5"
                  >
                    Lead dashboard →
                  </Link>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-white/40">
                    <tr>
                      <th className="py-2 text-left">Version</th>
                      <th className="py-2 text-left">Score</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {demo.versions.map((v) => (
                      <tr key={v.id}>
                        <td className="py-2">v{v.versionNumber}</td>
                        <td className="py-2">{v.totalScore}</td>
                        <td className="py-2">
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-white/50">
                          {(v.improvementPlanJson as string[] | null)?.[0] ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <form action={approveDemo}>
                  <input type="hidden" name="demoConfigId" value={demo.id} />
                  <button className="rounded-full bg-accent-green/20 px-4 py-2 text-sm text-accent-green hover:bg-accent-green/30">
                    Approve & send to review queue
                  </button>
                </form>
                {demoCfg?.intraNicheDifferentiationMeta?.blocksApproval ? (
                  <p className="text-xs text-accent-orange">
                    Intra-niche QA is blocking approval — open the Strategy tab to adjust or rebuild.
                  </p>
                ) : null}
              </div>
            )}
          </Card>

          {outreach && (
            <Card title="Outreach (manual review only)">
              <div className="space-y-3 text-sm">
                <Block label="SMS" body={outreach.smsText} />
                <Block label={`Email · ${outreach.emailSubject}`} body={outreach.emailBody} />
                <Block label="Instagram DM" body={outreach.instagramDm} />
                <Block label="Call script" body={outreach.callScript} />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card title="Notes">
            <form action={setNotes}>
              <input type="hidden" name="id" value={business.id} />
              <textarea
                name="notes"
                defaultValue={business.notes ?? ""}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-white/30"
              />
              <button className="mt-2 rounded-full border border-white/10 px-4 py-1.5 text-sm hover:bg-white/5">
                Save notes
              </button>
            </form>
          </Card>

          <Card title="Sources">
            <ul className="space-y-2 text-sm">
              {business.sources.map((s) => (
                <li key={s.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    {s.sourceType} · conf {s.confidence.toFixed(2)}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/70">{s.sourceUrl}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      )}

    </DashboardShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <dt className="text-[11px] uppercase tracking-wider text-white/50">{k}</dt>
      <dd className="mt-1 break-words text-sm">{v}</dd>
    </div>
  );
}

function Score({ k, v, accent = "" }: { k: string; v: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{k}</p>
      <p className={`mt-1 font-display text-xl ${accent}`}>{v}</p>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] | null | undefined }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-white/70">
        {(items ?? []).map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
      <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">{body}</pre>
    </div>
  );
}
