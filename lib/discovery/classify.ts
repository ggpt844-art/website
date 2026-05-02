import type { WebsiteStatus } from "@prisma/client";
import { normalizeDomain } from "@/lib/utils/slug";

const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
];

const DIRECTORY_DOMAINS = [
  "yelp.com",
  "yelp.ca",
  "yellowpages.ca",
  "yellowpages.com",
  "homestars.com",
  "bbb.org",
  "bbb.ca",
  "google.com",
  "maps.google.com",
  "g.page",
  "thumbtack.com",
  "houzz.com",
  "trustedpros.ca",
];

export function isSocialDomain(url?: string | null): boolean {
  const d = normalizeDomain(url);
  return !!d && SOCIAL_DOMAINS.some((s) => d === s || d.endsWith(`.${s}`));
}

export function isDirectoryDomain(url?: string | null): boolean {
  const d = normalizeDomain(url);
  return !!d && DIRECTORY_DOMAINS.some((s) => d === s || d.endsWith(`.${s}`));
}

export function isLikelyOfficialDomain(url?: string | null): boolean {
  if (!url) return false;
  if (isSocialDomain(url)) return false;
  if (isDirectoryDomain(url)) return false;
  return true;
}

export function classifyWebsite(input: {
  websiteUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  directoryLinks?: Record<string, string> | null;
  loadsSuccessfully?: boolean;
  visualScore?: number;
  conversionScore?: number;
  leadFunnelScore?: number;
  trustScore?: number;
}): WebsiteStatus {
  const { websiteUrl, socialLinks, directoryLinks, loadsSuccessfully } = input;
  if (!websiteUrl) {
    if (socialLinks && Object.keys(socialLinks).length) return "social_only";
    if (directoryLinks && Object.keys(directoryLinks).length) return "directory_only";
    return "no_website";
  }
  if (isSocialDomain(websiteUrl)) return "social_only";
  if (isDirectoryDomain(websiteUrl)) return "directory_only";
  if (loadsSuccessfully === false) return "broken_website";

  const v = input.visualScore ?? 0;
  const c = input.conversionScore ?? 0;
  const f = input.leadFunnelScore ?? 0;

  if (v >= 80 && c >= 75 && f >= 70) return "hard_to_beat";
  if (v >= 75 && f < 60) return "good_site_but_no_funnel";
  if (v >= 55 && f < 55) return "decent_but_low_conversion";
  if (v >= 45) return "basic_brochure_site";
  if (v > 0) return "outdated_website";
  return "unclear";
}
