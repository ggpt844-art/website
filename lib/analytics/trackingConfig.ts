import type { AnalyticsEventName } from "./eventTypes";

export interface TrackingConfig {
  /** Local / GA4 placeholder — never sends without explicit provider + approval */
  enabled: boolean;
  endpointPath: string;
  eventNames: readonly AnalyticsEventName[];
}

export const defaultTrackingConfig: TrackingConfig = {
  enabled: true,
  endpointPath: "/api/analytics/track",
  eventNames: [
    "page_view",
    "cta_click",
    "call_click",
    "diagnostic_started",
    "quote_form_started",
    "quote_form_submitted",
    "thank_you_viewed",
  ],
};
