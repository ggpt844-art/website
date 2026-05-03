import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import {
  isLiveDemoRebuildEnabled,
  rebuildDemoConfigForSlug,
} from "@/lib/demo/rebuildDemoConfigForSlug";

export async function resolveDemoConfigFromSlug(
  slug: string,
  opts?: { versionNumber?: number },
): Promise<{
  config: DemoConfig;
  demoId: string;
} | null> {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug },
    include: { versions: { orderBy: { versionNumber: "asc" } } },
  });
  if (!demo) return null;

  const vn = opts?.versionNumber;

  let config: DemoConfig;

  if (vn != null && !Number.isNaN(vn)) {
    const v = demo.versions.find((vv) => vv.versionNumber === vn);
    config =
      (v?.demoConfigJson as unknown as DemoConfig) ??
      (demo.baseConfigJson as unknown as DemoConfig);
  } else if (isLiveDemoRebuildEnabled(vn)) {
    const live = await rebuildDemoConfigForSlug(slug);
    config = live ?? (demo.baseConfigJson as unknown as DemoConfig);
  } else if (demo.winningVersionId) {
    const winner = demo.versions.find((v) => v.id === demo.winningVersionId);
    config =
      (winner?.demoConfigJson as unknown as DemoConfig) ??
      (demo.baseConfigJson as unknown as DemoConfig);
  } else {
    config = demo.baseConfigJson as unknown as DemoConfig;
  }

  return { config, demoId: demo.id };
}
