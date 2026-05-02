import type { Business, WebsiteCheck } from "@prisma/client";
import { SCORING_WEIGHTS } from "@/lib/presets/scoringWeights";
import { getNichePreset } from "@/lib/presets/niches";
import type { LeadPriority } from "@prisma/client";

export interface LeadScoreInput {
  business: Pick<
    Business,
    | "niche"
    | "phone"
    | "email"
    | "websiteUrl"
    | "websiteStatus"
    | "rating"
    | "reviewCount"
    | "isClosed"
    | "isFranchise"
  >;
  websiteCheck?: Pick<
    WebsiteCheck,
    | "visualQualityScore"
    | "conversionScore"
    | "trustScore"
    | "mobileCtaScore"
    | "speedScore"
    | "leadFunnelScore"
    | "websiteQualityScore"
  > | null;
  assetQualityScore?: number;
}

export interface LeadScoreOutput {
  businessValueScore: number;
  websiteWeaknessScore: number;
  demoOpportunityScore: number;
  outreachReadinessScore: number;
  finalLeadScore: number;
  priority: LeadPriority;
  breakdown: Record<string, unknown>;
  reason: string;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function scoreLead(input: LeadScoreInput): LeadScoreOutput {
  const { business, websiteCheck } = input;
  const niche = getNichePreset(business.niche);

  // Business value
  let value = 30;
  value += Math.min(40, niche.estimatedLeadValue / 50);
  if (business.phone) value += 8;
  if (business.email) value += 4;
  if ((business.reviewCount ?? 0) > 10) value += 6;
  if ((business.rating ?? 0) >= 4) value += 4;
  if (business.isFranchise) value -= 15;
  if (business.isClosed) value -= 60;

  // Website weakness (higher = more upside for us)
  let weakness = 30;
  switch (business.websiteStatus) {
    case "no_website":
      weakness = 95;
      break;
    case "social_only":
      weakness = 90;
      break;
    case "directory_only":
      weakness = 85;
      break;
    case "broken_website":
      weakness = 90;
      break;
    case "outdated_website":
      weakness = 80;
      break;
    case "basic_brochure_site":
      weakness = 70;
      break;
    case "decent_but_low_conversion":
      weakness = 55;
      break;
    case "good_site_but_no_funnel":
      weakness = 45;
      break;
    case "hard_to_beat":
      weakness = 10;
      break;
    default:
      weakness = 50;
  }
  if (websiteCheck) {
    const inverse =
      100 -
      (websiteCheck.visualQualityScore * 0.25 +
        websiteCheck.conversionScore * 0.25 +
        websiteCheck.leadFunnelScore * 0.3 +
        websiteCheck.mobileCtaScore * 0.2);
    weakness = Math.round(weakness * 0.5 + inverse * 0.5);
  }

  // Demo opportunity
  let opportunity = 50;
  if (
    business.websiteStatus === "no_website" ||
    business.websiteStatus === "social_only" ||
    business.websiteStatus === "directory_only" ||
    business.websiteStatus === "broken_website" ||
    business.websiteStatus === "outdated_website" ||
    business.websiteStatus === "basic_brochure_site"
  ) {
    opportunity = 92;
  } else if (business.websiteStatus === "decent_but_low_conversion") {
    opportunity = 75;
  } else if (business.websiteStatus === "good_site_but_no_funnel") {
    opportunity = 65;
  } else if (business.websiteStatus === "hard_to_beat") {
    opportunity = 15;
  }
  if ((websiteCheck?.leadFunnelScore ?? 100) < 50) opportunity += 5;
  if (niche.estimatedLeadValue >= 1000) opportunity += 4;

  // Outreach readiness
  let outreach = 30;
  if (business.phone) outreach += 30;
  if (business.email) outreach += 15;
  if (!business.isFranchise) outreach += 10;
  if (!business.isClosed) outreach += 15;

  value = clamp(value);
  weakness = clamp(weakness);
  opportunity = clamp(opportunity);
  outreach = clamp(outreach);

  const finalScore = clamp(
    value * SCORING_WEIGHTS.business.value +
      weakness * SCORING_WEIGHTS.weakness.value +
      opportunity * SCORING_WEIGHTS.opportunity.value +
      outreach * SCORING_WEIGHTS.outreach.value,
  );

  let priority: LeadPriority;
  if (business.isClosed || business.websiteStatus === "hard_to_beat") priority = "skip";
  else if (finalScore >= SCORING_WEIGHTS.thresholds.hot) priority = "hot";
  else if (finalScore >= SCORING_WEIGHTS.thresholds.warm) priority = "warm";
  else priority = "low";

  const reason = `Status=${business.websiteStatus}, niche=${business.niche}, value≈$${niche.estimatedLeadValue}/lead. Weakness ${weakness}, opportunity ${opportunity}.`;

  return {
    businessValueScore: value,
    websiteWeaknessScore: weakness,
    demoOpportunityScore: opportunity,
    outreachReadinessScore: outreach,
    finalLeadScore: finalScore,
    priority,
    breakdown: { value, weakness, opportunity, outreach, websiteCheck },
    reason,
  };
}
