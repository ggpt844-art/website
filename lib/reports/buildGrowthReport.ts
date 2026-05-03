import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { analyzeCroFromEventCounts } from "@/lib/cro/croAnalyzer";
import type { Prisma } from "@prisma/client";

export interface BuiltGrowthReport {
  reportJson: Prisma.InputJsonValue;
  seoHealthScore: number | null;
  aiSearchScore: number | null;
  gbpHealthScore: number | null;
  napConsistencyScore: number | null;
  croScore: number | null;
  leadSummaryJson: Prisma.InputJsonValue;
  recommendationsJson: Prisma.InputJsonValue;
}

export function buildGrowthReportPayload(args: {
  businessName: string;
  periodStart: Date;
  periodEnd: Date;
  demoConfig: DemoConfig | null;
  eventCounts: Record<string, number>;
  leadStats: { total: number; hot: number; booked: number; new: number };
}): BuiltGrowthReport {
  const cfg = args.demoConfig;
  const seo = cfg?.seo;
  const ai = cfg?.aiSearch;

  const cro = analyzeCroFromEventCounts(args.eventCounts, cfg);

  const executive = [
    `${args.businessName}: ${args.periodStart.toISOString().slice(0, 10)} → ${args.periodEnd.toISOString().slice(0, 10)}`,
    `Leads captured: ${args.leadStats.total} (hot: ${args.leadStats.hot}, new: ${args.leadStats.new}, booked: ${args.leadStats.booked})`,
    "This report does not guarantee rankings. It summarizes visibility prep, site health, and lead activity.",
  ];

  const recommendations = [
    ...cro.recommendations,
    ...(seo?.seoWarnings ?? []).slice(0, 5).map((w) => `SEO: ${w}`),
    ...(ai?.aiSearchWarnings ?? []).slice(0, 5).map((w) => `AI search: ${w}`),
    ...(seo?.gbpHealth?.recommendedActions ?? []).slice(0, 3).map((x) => `GBP: ${x}`),
  ];

  const reportJson = {
    version: 1,
    executiveSummary: executive,
    leadPerformance: args.leadStats,
    funnelNotes: cro.funnelNotes,
    eventCounts: args.eventCounts,
    reviewReminders: cfg?.conversion?.reviewRequestFlow?.enabled
      ? cfg.conversion.reviewRequestFlow.messageTemplates.slice(0, 2)
      : ["Review growth: request only from real customers; never incentivize fake reviews."],
    aiSearchManualTests: ai?.manualAiSearchTestPlan?.slice(0, 6) ?? [],
    nextPeriodPlan: [
      "Review hot leads not contacted within SLA",
      "Refresh stale FAQs or service copy noted in AI freshness",
      "Confirm demo vs client indexing modes",
    ],
  };

  return {
    reportJson: reportJson as Prisma.InputJsonValue,
    seoHealthScore: seo?.seoFoundationScore ?? null,
    aiSearchScore: ai?.aiSearchScore ?? null,
    gbpHealthScore: seo?.gbpHealth?.gbpHealthScore ?? null,
    napConsistencyScore: seo?.napCheck?.napConsistencyScore ?? null,
    croScore: cro.croScore,
    leadSummaryJson: args.leadStats,
    recommendationsJson: recommendations,
  };
}
