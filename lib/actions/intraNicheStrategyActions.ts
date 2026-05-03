"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { rebuildDemoConfigForSlug } from "@/lib/demo/rebuildDemoConfigForSlug";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { AssetStrategy, IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

export async function saveIntraNicheManualOverrides(formData: FormData) {
  const demoConfigId = String(formData.get("demoConfigId") ?? "");
  const businessId = String(formData.get("businessId") ?? "");
  if (!demoConfigId || !businessId) return;

  const demo = await prisma.demoConfig.findUnique({ where: { id: demoConfigId } });
  if (!demo) return;

  const cfg = { ...(demo.baseConfigJson as object) } as DemoConfig;
  const prevOverride: Partial<IntraNicheStrategy> = (cfg.intraNicheManualOverrides ?? {}) as Partial<IntraNicheStrategy>;

  const pick = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return v || undefined;
  };

  const assetApproach = pick("assetVisualApproach") as AssetStrategy["visualApproach"] | undefined;

  const nextOverride: Partial<IntraNicheStrategy> = {
    ...prevOverride,
    ...(pick("subNiche") ? { subNiche: pick("subNiche")! } : {}),
    ...(pick("buyerIntent") ? { buyerIntent: pick("buyerIntent")! as IntraNicheStrategy["buyerIntent"] } : {}),
    ...(pick("brandPosition") ? { brandPosition: pick("brandPosition")! as IntraNicheStrategy["brandPosition"] } : {}),
    ...(pick("businessMaturity")
      ? { businessMaturity: pick("businessMaturity")! as IntraNicheStrategy["businessMaturity"] }
      : {}),
    ...(pick("primaryServiceFocus") ? { primaryServiceFocus: pick("primaryServiceFocus")! } : {}),
    ...(pick("ctaStrategy") ? { ctaStrategy: pick("ctaStrategy")! } : {}),
    ...(pick("flowArchetype") ? { flowArchetype: pick("flowArchetype")! } : {}),
    ...(pick("visualMetaphor") ? { visualMetaphor: pick("visualMetaphor")! } : {}),
    ...(assetApproach && cfg.intraNicheStrategy?.assetStrategy
      ? {
          assetStrategy: {
            ...cfg.intraNicheStrategy.assetStrategy,
            ...prevOverride.assetStrategy,
            visualApproach: assetApproach,
          },
        }
      : {}),
  };

  await prisma.demoConfig.update({
    where: { id: demoConfigId },
    data: {
      baseConfigJson: {
        ...cfg,
        intraNicheManualOverrides: nextOverride,
      } as object,
    },
  });

  const rebuilt = await rebuildDemoConfigForSlug(demo.slug);
  if (rebuilt) {
    await prisma.demoConfig.update({
      where: { id: demoConfigId },
      data: { baseConfigJson: rebuilt as object },
    });
  }

  revalidatePath(`/business/${businessId}`);
}
