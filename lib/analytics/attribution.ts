export type TrafficSourceCategory =
  | "organic"
  | "paid"
  | "direct"
  | "referral"
  | "social"
  | "unknown";

export interface AttributionInput {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
}

export function categorizeTrafficSource(input: AttributionInput): TrafficSourceCategory {
  const medium = (input.utmMedium ?? "").toLowerCase();
  const source = (input.utmSource ?? "").toLowerCase();
  if (medium === "cpc" || medium === "paid" || medium === "ppc") return "paid";
  if (medium === "organic" || source === "google" || source === "bing") return "organic";
  if (medium === "social" || /facebook|instagram|linkedin|tiktok/.test(source)) return "social";
  if (input.referrer && input.referrer.length > 0) return "referral";
  if (!input.referrer && !input.utmSource) return "direct";
  return "unknown";
}
