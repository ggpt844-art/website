import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { prisma } from "@/lib/db/prisma";
import type { PageStrategy } from "@/lib/experience/experienceSchemas";
import type { DesignFingerprint } from "@/lib/experience/experienceSchemas";
import type { VisualDirection, SceneSpec } from "@/lib/experience/experienceSchemas";
import { hashSectionOrder } from "@/lib/experience/designMemory";
import type { IntraNicheStrategy, SameNicheDesignFingerprint } from "./intraNicheTypes";

/** Map preset slug → intra `parentNiche` key used in stored strategy (for DB queries). */
export function nicheSlugToParentKey(nicheSlug: string): string {
  if (nicheSlug === "dentists" || nicheSlug === "orthodontists") return "dental";
  if (nicheSlug === "roofing") return "roofing";
  if (nicheSlug === "hvac") return "hvac";
  if (nicheSlug === "med-spas" || nicheSlug === "cosmetic-clinics") return "med_spa";
  if (nicheSlug === "attic-insulation") return "insulation";
  if (nicheSlug === "landscaping" || nicheSlug === "interlock") return "landscaping";
  return nicheSlug;
}

export function buildSameNicheDesignFingerprint(args: {
  intra: IntraNicheStrategy;
  pageStrategy: PageStrategy;
  visualDirection: VisualDirection;
  sceneSpec: SceneSpec;
  primaryCTA: string;
  designFingerprint: DesignFingerprint;
}): SameNicheDesignFingerprint {
  const cam =
    args.sceneSpec.cameraSpec?.cameraAngle ??
    args.sceneSpec.cameraStyle.slice(0, 48) ??
    "";
  return {
    parentNiche: args.intra.parentNiche,
    subNiche: args.intra.subNiche,
    flowArchetype: args.pageStrategy.flowArchetype,
    sectionOrderHash: hashSectionOrder(args.pageStrategy.sectionOrder),
    heroComposition: args.designFingerprint.heroLayoutType,
    visualMetaphor: args.intra.visualMetaphor.slice(0, 120),
    sceneType: args.sceneSpec.sceneType,
    cameraPreset: cam,
    lightingPreset: args.sceneSpec.lightingPreset.slice(0, 80),
    ctaPattern: args.primaryCTA.slice(0, 72),
    trustPattern: args.pageStrategy.trustType.slice(0, 72),
    proofType: args.intra.proofTypeNeeded.slice(0, 72),
    offerType: args.intra.offerType.slice(0, 72),
    copyTone: args.intra.copyTone.slice(0, 72),
    assetApproach: args.intra.assetStrategy.visualApproach,
  };
}

/** 0–1, higher = more alike (same parent niche only). */
export function sameNicheFingerprintSimilarity(
  a: SameNicheDesignFingerprint,
  b: SameNicheDesignFingerprint,
): number {
  if (a.parentNiche !== b.parentNiche) return 0;
  let hits = 0;
  const checks: boolean[] = [
    a.subNiche === b.subNiche,
    a.flowArchetype === b.flowArchetype,
    a.sectionOrderHash === b.sectionOrderHash,
    a.sceneType === b.sceneType,
    a.visualMetaphor.slice(0, 40) === b.visualMetaphor.slice(0, 40),
    a.ctaPattern === b.ctaPattern,
    a.heroComposition === b.heroComposition,
    a.copyTone === b.copyTone,
  ];
  for (const c of checks) if (c) hits++;
  return hits / checks.length;
}

export function maxSameNicheSimilarity(
  candidate: SameNicheDesignFingerprint,
  recent: SameNicheDesignFingerprint[],
): number {
  let m = 0;
  for (const r of recent) {
    const s = sameNicheFingerprintSimilarity(candidate, r);
    if (s > m) m = s;
  }
  return m;
}

/**
 * Recent same-parent fingerprints from stored demo configs (skips rows without fingerprint).
 */
export async function getRecentSameNicheFingerprints(
  parentKey: string,
  limit = 16,
  excludeSlug?: string | null,
): Promise<SameNicheDesignFingerprint[]> {
  const rows = await prisma.demoConfig.findMany({
    orderBy: { createdAt: "desc" },
    take: 96,
    select: { slug: true, baseConfigJson: true, business: { select: { niche: true } } },
  });
  const out: SameNicheDesignFingerprint[] = [];
  for (const r of rows) {
    if (excludeSlug && r.slug === excludeSlug) continue;
    const cfg = r.baseConfigJson as unknown as DemoConfig;
    const fp = cfg.sameNicheDesignFingerprint;
    if (!fp) continue;
    const slugParent = r.business ? nicheSlugToParentKey(r.business.niche) : "";
    if (fp.parentNiche === parentKey || slugParent === parentKey) {
      out.push(fp);
      if (out.length >= limit) break;
    }
  }
  return out;
}
