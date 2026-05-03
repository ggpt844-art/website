"use client";

import { useEffect } from "react";

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function DemoAnalytics({ slug }: { slug: string }) {
  useEffect(() => {
    const pagePath = `/demo/${slug}`;
    const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const payload = {
      slug,
      eventType: "page_view",
      pagePath,
      deviceType: detectDevice(),
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      utmSource: qs?.get("utm_source") ?? undefined,
      utmMedium: qs?.get("utm_medium") ?? undefined,
      utmCampaign: qs?.get("utm_campaign") ?? undefined,
    };
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [slug]);

  return null;
}

export function trackDemoEvent(
  slug: string,
  eventType: string,
  extra?: Record<string, unknown>,
) {
  const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      eventType,
      pagePath: typeof window !== "undefined" ? window.location.pathname : `/demo/${slug}`,
      deviceType: detectDevice(),
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      utmSource: qs?.get("utm_source") ?? undefined,
      utmMedium: qs?.get("utm_medium") ?? undefined,
      utmCampaign: qs?.get("utm_campaign") ?? undefined,
      ...extra,
    }),
  }).catch(() => {});
}
