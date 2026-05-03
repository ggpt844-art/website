import type { AnalyticsSummary } from "@/lib/analytics/analyticsSummary";

/** Placeholder CRO recommendations from funnel metrics — expand when events are populated. */
export function buildCroRecommendations(_summary: AnalyticsSummary): string[] {
  return [
    "Review mobile vs desktop completion once event volume is available.",
    "If photo-upload step shows heavy drop-off, move it later in the flow.",
    "Test primary CTA wording using the configured variants in the business dashboard.",
  ];
}
