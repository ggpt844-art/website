export function buildEntitySummary(args: {
  name: string;
  city: string;
  nicheLabel: string;
  leadMagnet: string;
  primaryConversion: string;
  /** e.g. homeowners vs patients — defaults from niche if omitted */
  clientAudience?: string;
  /** Sub-niche service line for first sentence */
  serviceLine?: string;
}): string {
  const who = args.clientAudience ?? "homeowners";
  const line = args.serviceLine?.trim() || args.nicheLabel.toLowerCase();
  return `${args.name} offers ${line} for ${who} in and around ${args.city}. The business frames next steps around ${args.primaryConversion.toLowerCase()}. Visitors can start with ${args.leadMagnet} and share photos or details before requesting the next step.`;
}

export function buildServicesSummary(services: string[], city: string, nicheLabel: string): string {
  const list = services.slice(0, 8).map((s) => `- ${s}`).join("\n");
  return `${nicheLabel} services for ${city} homeowners include:\n${list}\n\nEach service is described on the main site with a clear path to request more information.`;
}

export function buildServiceAreaSummary(
  city: string,
  verifiedNearby: string[],
  uncertain: boolean,
): string {
  if (uncertain || verifiedNearby.length === 0) {
    return `${city} is the primary service focus. Additional cities are listed only after they are verified with the business owner.`;
  }
  return `Primary coverage includes ${city}${verifiedNearby.length ? ` with nearby areas such as ${verifiedNearby.join(", ")} where service is confirmed` : ""}.`;
}

export function buildTrustSummary(args: {
  hasPhone: boolean;
  hasReviews: boolean;
  reviewCount?: number | null;
  riskReducers: string[];
}): string {
  const parts: string[] = [];
  if (args.hasPhone) parts.push("A real local phone number is shown for direct contact.");
  if (args.hasReviews && (args.reviewCount ?? 0) > 0)
    parts.push(`Reviews reflect real customer feedback where shown (${args.reviewCount} on record).`);
  parts.push(...args.riskReducers.slice(0, 3).map((r) => `${r}.`));
  return parts.join(" ");
}
