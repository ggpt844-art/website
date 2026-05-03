import type { PackageTier } from "@prisma/client";

import type { AssetProfileJson } from "@/lib/assets/types";
import { prisma } from "@/lib/db/prisma";
import { getRecentDesignFingerprints } from "@/lib/experience/designMemory";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { buildDemoConfig } from "@/lib/renderer/buildDemoConfig";
import { applyLockedHeroFromPrevious } from "@/lib/demo/mergeLockedHeroConfig";
import { applySelectedVariantLayerToConfig } from "@/lib/design-workflow/importStitchReference";
import { getRecentSameNicheFingerprints, nicheSlugToParentKey } from "@/lib/strategy/sameNicheFingerprint";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

function toPackageTier(value: string | null | undefined): PackageTier {
  if (value === "starter" || value === "growth" || value === "premium") return value;
  return "growth";
}

/** True → `/demo` and dashboard rebuild config on read (latest TS pipeline). */
export function isLiveDemoRebuildEnabled(requestedVersion?: number | null): boolean {
  if (requestedVersion != null && !Number.isNaN(requestedVersion)) return false;
  if (process.env.DEMO_LIVE_REBUILD === "0") return false;
  if (process.env.DEMO_LIVE_REBUILD === "1") return true;
  return process.env.NODE_ENV === "development";
}

/**
 * Recompute DemoConfig from DB business + checks (same inputs as regenerate script).
 * Does not write to the database.
 */
export async function rebuildDemoConfigForSlug(slug: string): Promise<DemoConfig | null> {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug },
    include: { business: true },
  });
  if (!demo?.business) return null;

  const b = demo.business;

  const websiteCheck = await prisma.websiteCheck.findFirst({
    where: { businessId: b.id },
    orderBy: { createdAt: "desc" },
  });

  const assetProfile = await prisma.assetProfile.findFirst({
    where: { businessId: b.id },
    orderBy: { createdAt: "desc" },
  });

  const intelligencePacket = await prisma.businessIntelligencePacket.findFirst({
    where: { businessId: b.id },
    orderBy: { createdAt: "desc" },
  });

  const fingerprints = await getRecentDesignFingerprints(24);
  const tier = toPackageTier(demo.packageTier);

  const prev = demo.baseConfigJson as unknown as DemoConfig;
  const manual = (prev.intraNicheManualOverrides ?? null) as Partial<IntraNicheStrategy> | null;
  const recentSame = await getRecentSameNicheFingerprints(nicheSlugToParentKey(`${b.niche}`), 16, demo.slug);

  const placeholderCustomSections = (prev.pageStrategy?.customSections ?? []).filter((c) =>
    /placeholder/i.test(c.title),
  );

  const fresh = await buildDemoConfig({
    businessName: b.name,
    city: b.city,
    niche: b.niche,
    phone: b.phone,
    category: b.category,
    rating: b.rating,
    reviewCount: b.reviewCount,
    websiteUrl: b.websiteUrl,
    address: b.address,
    region: b.region,
    country: b.country,
    weaknesses:
      (websiteCheck?.mainWeaknessesJson as string[] | null) ??
      ["No guided quote flow", "No mobile sticky CTA"],
    assetProfile: (assetProfile?.assetsJson as unknown as AssetProfileJson | null) ?? null,
    slugOverride: demo.slug,
    packageTier: tier,
    directoryLinks: (b.directoryLinksJson as Record<string, string> | null) ?? undefined,
    socialLinks: (b.socialLinksJson as Record<string, string> | null) ?? undefined,
    recentDesignFingerprints: fingerprints,
    intraNicheManualOverrides: manual,
    recentSameNicheFingerprints: recentSame,
    intelligenceSummary: intelligencePacket?.packetJson
      ? JSON.stringify(intelligencePacket.packetJson).slice(0, 12_000)
      : null,
    verifiedNearbyCities:
      (intelligencePacket?.packetJson as { localSeoNotes?: { verifiedNearbyCities?: string[] } } | null)
        ?.localSeoNotes?.verifiedNearbyCities ?? undefined,
    dentalLocalCinematicHero: prev.assets?.heroCinematic === "dental_local",
    extraCustomSections: placeholderCustomSections.length ? placeholderCustomSections : undefined,
  });

  const locked = applyLockedHeroFromPrevious(fresh, demo.baseConfigJson);
  return await applySelectedVariantLayerToConfig(demo.id, locked);
}
