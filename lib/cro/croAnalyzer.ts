import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { buildCroRecommendations } from "@/lib/cro/croRecommendations";
import { emptyAnalyticsSummary } from "@/lib/analytics/analyticsSummary";

export interface CroAnalysisResult {
  croScore: number;
  funnelNotes: string[];
  recommendations: string[];
}

/** Rule-based CRO scoring from aggregated event counts (v1, no paid APIs). */
export function analyzeCroFromEventCounts(
  counts: Record<string, number>,
  demoConfig?: DemoConfig | null,
): CroAnalysisResult {
  const pv = counts.page_view ?? 0;
  const quoteStart = counts.quote_form_started ?? 0;
  const quoteSubmit = counts.quote_form_submitted ?? 0;
  const ty = counts.thank_you_viewed ?? 0;
  const cta = counts.cta_click ?? 0;
  const photoUp = counts.photo_uploaded ?? 0;

  let croScore = 55;
  const funnelNotes: string[] = [];

  if (pv > 0) {
    const startRate = quoteStart / pv;
    const completeRate = quoteSubmit / Math.max(1, quoteStart);
    funnelNotes.push(
      `Quote start rate: ${(startRate * 100).toFixed(1)}% (${quoteStart} / ${pv} views)`,
    );
    funnelNotes.push(
      `Quote completion: ${(completeRate * 100).toFixed(1)}% (${quoteSubmit} / ${Math.max(1, quoteStart)} starts)`,
    );
    if (startRate >= 0.15) croScore += 10;
    if (completeRate >= 0.45) croScore += 12;
    else if (completeRate < 0.2) croScore -= 8;
    const tyRate = ty / Math.max(1, quoteSubmit);
    funnelNotes.push(
      `Thank-you views vs submits: ${(tyRate * 100).toFixed(1)}% (${ty} thank-you / ${quoteSubmit} submits)`,
    );
  } else {
    funnelNotes.push("Not enough page views yet to score funnel conversion.");
  }

  if (cta > 0 && pv > 0) {
    funnelNotes.push(`CTA engagement: ${cta} clicks for ${pv} views.`);
    if (cta / pv >= 0.25) croScore += 5;
  }

  if (photoUp > 0 && quoteSubmit > 0) {
    funnelNotes.push(`Photo uploads: ${photoUp} (helps qualification).`);
    croScore += 3;
  }

  croScore = Math.max(0, Math.min(100, croScore));

  const summary = emptyAnalyticsSummary();
  summary.pageViews = pv;
  summary.quoteStarts = quoteStart;
  summary.quoteSubmits = quoteSubmit;
  summary.thankYouViews = ty;
  summary.ctaClicks = cta;

  const recommendations = buildCroRecommendations(summary);
  if (demoConfig?.conversion?.urgencyRouting) {
    recommendations.push("Confirm urgency routing copy matches live emergency vs planning flows.");
  }

  return { croScore, funnelNotes, recommendations };
}
