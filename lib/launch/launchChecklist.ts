export interface LaunchChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export function defaultLaunchChecklistItems(): LaunchChecklistItem[] {
  return [
    { id: "domain", label: "Connect production domain", done: false },
    { id: "seo_mode", label: "Switch SEO mode from demo_noindex to client_indexable", done: false },
    { id: "ai_crawler", label: "Confirm AI crawler policy matches launch mode", done: false },
    { id: "canonical", label: "Confirm canonical URL", done: false },
    { id: "sitemap", label: "Submit sitemap (when live)", done: false },
    { id: "llms", label: "Expose llms.txt if enabled for client site", done: false },
    { id: "gsc", label: "Connect Google Search Console", done: false },
    { id: "bing", label: "Connect Bing Webmaster Tools", done: false },
    { id: "ga4", label: "Connect GA4 / measurement", done: false },
    { id: "form", label: "Test quote form end-to-end", done: false },
    { id: "photo", label: "Test photo upload", done: false },
    { id: "call", label: "Test call buttons & sticky CTA", done: false },
    { id: "leads", label: "Verify leads land in CRM", done: false },
    { id: "schema", label: "Verify JSON-LD in page source", done: false },
    { id: "robots", label: "Verify robots.txt", done: false },
    { id: "noindex_demo", label: "Confirm demo stays noindex", done: false },
    { id: "gbp_link", label: "Update GBP website link", done: false },
    { id: "compliance", label: "Final compliance scan", done: false },
    { id: "mobile_qa", label: "Final mobile QA", done: false },
  ];
}
