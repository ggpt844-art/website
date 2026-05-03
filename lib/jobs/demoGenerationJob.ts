import { prisma } from "@/lib/db/prisma";
import { buildDemoConfig } from "@/lib/renderer/buildDemoConfig";
import { getRecentDesignFingerprints } from "@/lib/experience/designMemory";
import { getRecentSameNicheFingerprints, nicheSlugToParentKey } from "@/lib/strategy/sameNicheFingerprint";
import { writeOutreach } from "@/lib/agents/outreachWriter";
import { APP_CONFIG } from "@/lib/utils/config";
import { runAutomatedDesignWorkflowForDemo } from "@/lib/design-workflow/runAutomatedDesignWorkflow";
import { slugify, uniqueSlug } from "@/lib/utils/slug";
import type { AssetProfileJson } from "@/lib/assets/types";

export interface DemoGenerationPayload {
  businessId: string;
}

export async function runDemoGenerationJob({
  businessId,
}: DemoGenerationPayload): Promise<{ demoConfigId: string; slug: string }> {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Business not found");

  const websiteCheck = await prisma.websiteCheck.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const assetProfile = await prisma.assetProfile.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const existingSlugs = new Set(
    (await prisma.demoConfig.findMany({ select: { slug: true } })).map((d) => d.slug),
  );
  const slug = uniqueSlug(slugify(`${business.name}-${business.city}`), existingSlugs);

  const recentDesignFingerprints = await getRecentDesignFingerprints(22);
  const recentSameNicheFingerprints = await getRecentSameNicheFingerprints(
    nicheSlugToParentKey(business.niche),
    16,
  );

  const intelligencePacket = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const intelligenceSummary = intelligencePacket?.packetJson
    ? JSON.stringify(intelligencePacket.packetJson).slice(0, 12_000)
    : null;
  const verifiedNearby =
    (
      intelligencePacket?.packetJson as
        | { localSeoNotes?: { verifiedNearbyCities?: string[] } }
        | null
        | undefined
    )?.localSeoNotes?.verifiedNearbyCities ?? undefined;

  const demoConfig = await buildDemoConfig({
    businessName: business.name,
    city: business.city,
    niche: business.niche,
    phone: business.phone,
    category: business.category,
    rating: business.rating,
    reviewCount: business.reviewCount,
    websiteUrl: business.websiteUrl,
    address: business.address,
    region: business.region,
    country: business.country,
    weaknesses:
      (websiteCheck?.mainWeaknessesJson as string[] | null) ??
      ["No guided quote flow", "No mobile sticky CTA"],
    assetProfile: (assetProfile?.assetsJson as unknown as AssetProfileJson | null) ?? null,
    slugOverride: slug,
    directoryLinks:
      (business.directoryLinksJson as Record<string, string> | null) ?? undefined,
    socialLinks: (business.socialLinksJson as Record<string, string> | null) ?? undefined,
    recentDesignFingerprints,
    intelligenceSummary,
    verifiedNearbyCities: verifiedNearby,
    recentSameNicheFingerprints,
  });

  const created = await prisma.demoConfig.create({
    data: {
      businessId,
      slug,
      baseConfigJson: demoConfig as unknown as object,
      status: "generated",
      packageTier: demoConfig.package.tier,
    },
  });

  const demoUrl = `${APP_CONFIG.appUrl}/demo/${slug}`;
  const auditUrl = `${APP_CONFIG.appUrl}/audit/${slug}`;
  const outreach = writeOutreach({
    businessName: business.name,
    city: business.city,
    niche: business.niche,
    websiteStatus: business.websiteStatus,
    demoUrl,
    auditUrl,
    contactReason: demoConfig.strategy.contactReason,
  });

  await prisma.outreachMessage.create({
    data: {
      businessId,
      demoConfigId: created.id,
      smsText: outreach.smsText,
      emailSubject: outreach.emailSubject,
      emailBody: outreach.emailBody,
      instagramDm: outreach.instagramDm,
      callScript: outreach.callScript,
      followUp1: outreach.followUp1,
      followUp2: outreach.followUp2,
      contactReason: outreach.contactReason,
    },
  });

  if (APP_CONFIG.automateDesignWorkflow) {
    await runAutomatedDesignWorkflowForDemo(created.id);
  }

  return { demoConfigId: created.id, slug };
}
