import type { SeoConfig } from "./seoTypes";
import { getNichePreset } from "@/lib/presets/niches";

export function planServicePages(nicheSlug: string, city: string): SeoConfig["servicePagePlan"] {
  const niche = getNichePreset(nicheSlug);
  return niche.defaultServices.slice(0, 5).map((s) => {
    const slug = s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return {
      slug: `/services/${slug}`,
      targetKeyword: `${s} ${city}`,
      pagePurpose: `Capture searches for ${s} in ${city}.`,
      uniqueContentRequirements: [
        `Explain ${s} specific to ${city}.`,
        "Include process, what to expect, and CTA.",
      ],
      requiredFaqs: [
        `How fast can I get ${s} in ${city}?`,
        `What information do you need for a quote?`,
      ],
      cta: niche.primaryCTA,
      schemaType: "Service",
      internalLinks: ["/", "/contact", "#quote"],
    };
  });
}

export function planCityPages(
  nicheSlug: string,
  confidentNearby: string[],
): SeoConfig["cityPagePlan"] {
  if (confidentNearby.length === 0) return [];
  const niche = getNichePreset(nicheSlug);
  return confidentNearby.slice(0, 2).map((c) => ({
    slug: `/service-area/${c.toLowerCase().replace(/\s+/g, "-")}`,
    city: c,
    uniqueIntro: `${niche.label} for homeowners in ${c}.`,
    servicesOffered: niche.defaultServices.slice(0, 4),
    faqRequired: [`Do you serve ${c}?`, `How do quotes work in ${c}?`],
    proofNote: "Use only approved project photos with location context.",
    cta: niche.primaryCTA,
    internalLinks: ["/", "/services"],
  }));
}
