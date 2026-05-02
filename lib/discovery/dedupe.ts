import type { DiscoveredBusiness } from "./types";
import { normalizeBusinessName, normalizePhone, normalizeDomain } from "@/lib/utils/slug";

interface MergedBusiness extends DiscoveredBusiness {
  sourceUrls: string[];
  sourceConfidences: Record<string, number>;
}

function key(b: DiscoveredBusiness): string[] {
  const out: string[] = [];
  const phone = normalizePhone(b.phone);
  if (phone) out.push(`phone:${phone}`);
  const domain = normalizeDomain(b.websiteUrl);
  if (domain) out.push(`domain:${domain}`);
  out.push(`name:${normalizeBusinessName(b.name)}|city:${b.city.toLowerCase()}`);
  return out;
}

export function dedupe(records: DiscoveredBusiness[]): MergedBusiness[] {
  const buckets = new Map<string, MergedBusiness>();
  for (const rec of records) {
    const keys = key(rec);
    const existingKey = keys.find((k) => buckets.has(k));
    if (existingKey) {
      const existing = buckets.get(existingKey)!;
      existing.sourceUrls.push(rec.sourceUrl);
      existing.sourceConfidences[rec.sourceUrl] = rec.confidence;
      existing.phone ??= rec.phone;
      existing.email ??= rec.email;
      existing.address ??= rec.address;
      existing.websiteUrl ??= rec.websiteUrl;
      existing.rating ??= rec.rating;
      existing.reviewCount ??= rec.reviewCount;
      existing.socialLinks = { ...rec.socialLinks, ...existing.socialLinks };
      existing.directoryLinks = {
        ...rec.directoryLinks,
        ...existing.directoryLinks,
      };
      for (const k of keys) buckets.set(k, existing);
    } else {
      const merged: MergedBusiness = {
        ...rec,
        sourceUrls: [rec.sourceUrl],
        sourceConfidences: { [rec.sourceUrl]: rec.confidence },
      };
      for (const k of keys) buckets.set(k, merged);
    }
  }
  return Array.from(new Set(buckets.values()));
}
