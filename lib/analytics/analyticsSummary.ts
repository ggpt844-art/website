/** Rollups for dashboards — v1 uses in-memory or DB aggregates later. */
export interface AnalyticsSummary {
  pageViews: number;
  ctaClicks: number;
  callClicks: number;
  quoteStarts: number;
  quoteSubmits: number;
  thankYouViews: number;
}

export function emptyAnalyticsSummary(): AnalyticsSummary {
  return {
    pageViews: 0,
    ctaClicks: 0,
    callClicks: 0,
    quoteStarts: 0,
    quoteSubmits: 0,
    thankYouViews: 0,
  };
}
