import type { SeoConfig } from "./seoTypes";

const CONTRACTOR_NICHES = new Set([
  "roofing",
  "attic-insulation",
  "hvac",
  "landscaping",
  "interlock",
  "concrete",
  "windows-doors",
  "pest-control",
  "cleaning",
  "basement-renovation",
  "kitchen-renovation",
  "bathroom-renovation",
]);

export interface SchemaContext {
  businessName: string;
  city: string;
  region?: string | null;
  country?: string;
  phone?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  nicheSlug: string;
  rating?: number | null;
  reviewCount?: number | null;
  primaryKeyword: string;
  services: string[];
  faqs: { q: string; a: string }[];
}

/** Does not add aggregateRating unless real rating + reviewCount provided. */
export function buildJsonLd(ctx: SchemaContext, canonicalUrl: string): Pick<
  SeoConfig,
  | "localBusinessSchemaJsonLd"
  | "serviceSchemaJsonLd"
  | "faqSchemaJsonLd"
  | "breadcrumbSchemaJsonLd"
  | "websiteSchemaJsonLd"
> {
  const hasAddress = !!ctx.address?.trim();
  const hasGeoHints = hasAddress || !!ctx.phone;
  let mainType = "LocalBusiness";
  if (ctx.nicheSlug === "roofing") mainType = "RoofingContractor";
  else if (ctx.nicheSlug === "dentists" || ctx.nicheSlug === "orthodontists")
    mainType = "Dentist";
  else if (
    ["med-spas", "cosmetic-clinics", "tattoo-shops", "barbers"].includes(ctx.nicheSlug)
  )
    mainType = "HealthAndBeautyBusiness";
  else if (CONTRACTOR_NICHES.has(ctx.nicheSlug)) mainType = "HomeAndConstructionBusiness";

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": mainType,
    name: ctx.businessName,
    description: `${ctx.businessName} serves homeowners in ${ctx.city}${ctx.region ? `, ${ctx.region}` : ""}.`,
    url: canonicalUrl,
  };
  if (ctx.phone) localBusiness.telephone = ctx.phone;
  if (ctx.address) localBusiness.address = { "@type": "PostalAddress", streetAddress: ctx.address };
  localBusiness.areaServed = { "@type": "City", name: ctx.city };
  if (ctx.rating != null && ctx.reviewCount != null && ctx.reviewCount > 0) {
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ctx.rating,
      reviewCount: ctx.reviewCount,
    };
  }

  const serviceBlocks = ctx.services.slice(0, 8).map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s,
    provider: { "@type": mainType, name: ctx.businessName },
    areaServed: ctx.city,
  }));

  const faqBlock =
    ctx.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ctx.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [] };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ctx.businessName,
    url: canonicalUrl,
  };

  if (!hasGeoHints) {
    localBusiness["@warning"] =
      "Minimal NAP — LocalBusiness schema uses city-level signals only until address is verified.";
  }

  return {
    localBusinessSchemaJsonLd: localBusiness,
    serviceSchemaJsonLd: serviceBlocks,
    faqSchemaJsonLd: faqBlock,
    breadcrumbSchemaJsonLd: breadcrumb,
    websiteSchemaJsonLd: website,
  };
}
