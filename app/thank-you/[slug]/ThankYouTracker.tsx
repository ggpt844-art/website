"use client";

import { useEffect } from "react";
import { trackDemoEvent } from "@/components/demo/DemoAnalytics";

export function ThankYouTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackDemoEvent(slug, "thank_you_viewed", { pagePath: `/thank-you/${slug}` });
  }, [slug]);
  return null;
}
