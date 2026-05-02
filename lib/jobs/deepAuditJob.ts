import { prisma } from "@/lib/db/prisma";
import { scoreLead } from "@/lib/scoring/leadScorer";
import { inferCompetitorGap } from "@/lib/agents/competitorGap";
import { profileBusiness } from "@/lib/agents/businessProfiler";

export interface DeepAuditPayload {
  businessId: string;
}

export async function runDeepAuditJob({ businessId }: DeepAuditPayload): Promise<void> {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return;

  const websiteCheck = await prisma.websiteCheck.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const assetProfile = await prisma.assetProfile.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const score = scoreLead({
    business,
    websiteCheck: websiteCheck ?? null,
    assetQualityScore: assetProfile?.assetQualityScore ?? 0,
  });

  await prisma.leadScore.create({
    data: {
      businessId,
      businessValueScore: score.businessValueScore,
      websiteWeaknessScore: score.websiteWeaknessScore,
      demoOpportunityScore: score.demoOpportunityScore,
      outreachReadinessScore: score.outreachReadinessScore,
      finalLeadScore: score.finalLeadScore,
      priority: score.priority,
      scoreBreakdownJson: score.breakdown as object,
      reason: score.reason,
    },
  });

  const competitor = inferCompetitorGap({ niche: business.niche, city: business.city });
  await prisma.competitorScan.create({
    data: {
      businessId,
      competitorsJson: competitor.competitors as object,
      competitorGapSummary: competitor.competitorGap,
      differentiationAngle: competitor.differentiationAngle,
    },
  });

  const profile = profileBusiness({
    name: business.name,
    niche: business.niche,
    city: business.city,
    rating: business.rating,
    reviewCount: business.reviewCount,
  });

  const packet = {
    business: {
      name: business.name,
      city: business.city,
      region: business.region,
      country: business.country,
      niche: business.niche,
      category: business.category,
      phone: business.phone,
      email: business.email,
      address: business.address,
      websiteUrl: business.websiteUrl,
      rating: business.rating,
      reviewCount: business.reviewCount,
      sourceUrls:
        ((business.sourceUrlsJson as { urls?: string[] } | null)?.urls) ?? [],
    },
    currentWebsite: websiteCheck
      ? {
          status: websiteCheck.status,
          visualScore: websiteCheck.visualQualityScore,
          conversionScore: websiteCheck.conversionScore,
          trustScore: websiteCheck.trustScore,
          mobileScore: websiteCheck.mobileCtaScore,
          leadFunnelScore: websiteCheck.leadFunnelScore,
          positives: websiteCheck.positivesJson ?? [],
          weaknesses: websiteCheck.mainWeaknessesJson ?? [],
          screenshots: {
            desktop: websiteCheck.screenshotDesktopUrl,
            mobile: websiteCheck.screenshotMobileUrl,
            aboveFold: websiteCheck.screenshotAboveFoldUrl,
          },
        }
      : null,
    assets: assetProfile
      ? {
          logoUrl: assetProfile.logoUrl,
          fallbackNeeded: assetProfile.fallbackNeeded,
          assetQualityScore: assetProfile.assetQualityScore,
        }
      : null,
    leadScoring: score,
    competitors: competitor,
    profile,
    strategyInputs: {
      mainBuyerPain: profile.likelyBuyerIntent,
      moneyAngle: "Better lead capture from existing visitors",
      conversionGap: competitor.competitorGap,
      contactReason: `Audit + cinematic demo for ${business.niche} in ${business.city}`,
    },
  };

  await prisma.businessIntelligencePacket.create({
    data: { businessId, packetJson: packet as object },
  });
}
