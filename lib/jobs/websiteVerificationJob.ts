import { prisma } from "@/lib/db/prisma";
import { fetchPage } from "@/lib/scraping/fetchPage";
import { auditPage, emptyAudit } from "@/lib/audit/auditEngine";
import { classifyWebsite } from "@/lib/discovery/classify";
import { extractAssetCandidates, findInternalLinks, inferPageType } from "@/lib/assets/extract";
import { classifyAssets } from "@/lib/assets/classify";

export interface WebsiteVerificationPayload {
  businessId: string;
}

export async function runWebsiteVerificationJob({
  businessId,
}: WebsiteVerificationPayload): Promise<void> {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return;

  if (!business.websiteUrl) {
    const status = classifyWebsite({
      websiteUrl: null,
      socialLinks: business.socialLinksJson as Record<string, string> | null,
      directoryLinks: business.directoryLinksJson as Record<string, string> | null,
    });
    await prisma.business.update({
      where: { id: businessId },
      data: { websiteStatus: status },
    });
    const empty = emptyAudit();
    await prisma.websiteCheck.create({
      data: {
        businessId,
        url: "(none)",
        status,
        loadsSuccessfully: false,
        visualQualityScore: empty.visualQualityScore,
        conversionScore: empty.conversionScore,
        trustScore: empty.trustScore,
        mobileCtaScore: empty.mobileCtaScore,
        speedScore: empty.speedScore,
        leadFunnelScore: empty.leadFunnelScore,
        websiteQualityScore: empty.websiteQualityScore,
        mainWeaknessesJson: empty.weaknesses,
        positivesJson: empty.positives,
        auditJson: empty.raw as object,
      },
    });
    return;
  }

  const page = await fetchPage(business.websiteUrl);
  if (!page) {
    const status = classifyWebsite({
      websiteUrl: business.websiteUrl,
      loadsSuccessfully: false,
      socialLinks: business.socialLinksJson as Record<string, string> | null,
      directoryLinks: business.directoryLinksJson as Record<string, string> | null,
    });
    await prisma.business.update({ where: { id: businessId }, data: { websiteStatus: status } });
    const empty = emptyAudit();
    await prisma.websiteCheck.create({
      data: {
        businessId,
        url: business.websiteUrl,
        status,
        loadsSuccessfully: false,
        httpStatus: null,
        visualQualityScore: empty.visualQualityScore,
        conversionScore: empty.conversionScore,
        trustScore: empty.trustScore,
        mobileCtaScore: empty.mobileCtaScore,
        speedScore: empty.speedScore,
        leadFunnelScore: empty.leadFunnelScore,
        websiteQualityScore: empty.websiteQualityScore,
        mainWeaknessesJson: ["Failed to load website"],
        positivesJson: empty.positives,
        auditJson: empty.raw as object,
      },
    });
    return;
  }

  const audit = auditPage(page);
  const status = classifyWebsite({
    websiteUrl: business.websiteUrl,
    loadsSuccessfully: page.ok,
    visualScore: audit.visualQualityScore,
    conversionScore: audit.conversionScore,
    leadFunnelScore: audit.leadFunnelScore,
    trustScore: audit.trustScore,
  });

  await prisma.business.update({
    where: { id: businessId },
    data: { websiteStatus: status },
  });

  await prisma.websiteCheck.create({
    data: {
      businessId,
      url: business.websiteUrl,
      status,
      httpStatus: page.status,
      loadsSuccessfully: page.ok,
      title: page.title,
      metaDescription: page.metaDescription,
      detectedPlatform: page.detectedPlatform,
      visualQualityScore: audit.visualQualityScore,
      conversionScore: audit.conversionScore,
      trustScore: audit.trustScore,
      mobileCtaScore: audit.mobileCtaScore,
      speedScore: audit.speedScore,
      leadFunnelScore: audit.leadFunnelScore,
      websiteQualityScore: audit.websiteQualityScore,
      mainWeaknessesJson: audit.weaknesses,
      positivesJson: audit.positives,
      auditJson: audit.raw as object,
    },
  });

  // Asset extraction (light multi-page crawl)
  const homeAssets = extractAssetCandidates(page.$, page.finalUrl, "home");
  const internalLinks = findInternalLinks(page.$, page.finalUrl);
  const allAssets = [...homeAssets];

  for (const link of internalLinks.slice(0, 5)) {
    const sub = await fetchPage(link);
    if (sub) {
      allAssets.push(
        ...extractAssetCandidates(sub.$, sub.finalUrl, inferPageType(sub.finalUrl)),
      );
    }
  }

  const profile = classifyAssets(allAssets);
  await prisma.assetProfile.create({
    data: {
      businessId,
      logoUrl: profile.logoUrl,
      assetQualityScore: profile.assetQualityScore,
      fallbackNeeded: profile.fallbackNeeded,
      assetsJson: profile as object,
      rejectedAssetsJson: profile.rejectedImages as object,
      screenshotsJson: profile.screenshots as object,
      notes: profile.notes.join("\n"),
    },
  });
}
