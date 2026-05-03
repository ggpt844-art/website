import type { SeoConfig } from "./seoTypes";

export function buildImageAltMap(args: {
  businessName: string;
  city: string;
  nicheLabel: string;
  galleryUrls: string[];
}): Record<string, string> {
  const map: Record<string, string> = {};
  args.galleryUrls.forEach((url, i) => {
    map[url] = `${args.nicheLabel} project work by ${args.businessName} — ${args.city} area (${i + 1})`;
  });
  return map;
}
