/** Canonical analytics event names (config-driven tracking). */
export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "cta_click",
  "call_click",
  "diagnostic_started",
  "diagnostic_step_completed",
  "diagnostic_completed",
  "quote_form_started",
  "quote_form_submitted",
  "photo_upload_clicked",
  "photo_uploaded",
  "thank_you_viewed",
  "service_card_clicked",
  "faq_expanded",
  "audit_demo_opened",
  "demo_dashboard_opened",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
