import type { DiscoverySource } from "../types";
import { APP_CONFIG } from "@/lib/utils/config";

// Real SERP source via Playwright is intentionally a no-op until the operator
// explicitly enables it. Even when enabled, it must respect rate limits, never
// attempt CAPTCHA bypass, and degrade gracefully when blocked.
export const serpSource: DiscoverySource = {
  name: "serp",
  available: APP_CONFIG.enableSerpSource,
  rateLimitMs: 6000,
  async search() {
    if (!APP_CONFIG.enableSerpSource) return [];
    return [];
  },
};
