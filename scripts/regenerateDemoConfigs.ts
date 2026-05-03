/**
 * Rebuild baseConfigJson for every DemoConfig using the current buildDemoConfig
 * pipeline (pageStrategy, visualDirection, sceneSpec, designFingerprint, etc.).
 * If winningVersionId is set, updates that DemoVersion.demoConfigJson too so
 * public /demo routes stay consistent with resolveDemoConfig.
 *
 * Usage: pnpm run regenerate-demos [-- --dry-run]
 *
 * Requires DATABASE_URL in the environment.
 *
 * Note: In development, /demo/[slug] already recomputes on each request unless
 * DEMO_LIVE_REBUILD=0. This script persists that output to the DB.
 */
import { prisma } from "@/lib/db/prisma";
import { rebuildDemoConfigForSlug } from "@/lib/demo/rebuildDemoConfigForSlug";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const demos = await prisma.demoConfig.findMany({
    include: { business: true },
  });

  let ok = 0;
  let skipped = 0;

  for (const demo of demos) {
    if (!demo.business) {
      skipped++;
      console.warn(`Skip ${demo.slug}: no business`);
      continue;
    }

    try {
      const config = await rebuildDemoConfigForSlug(demo.slug);
      if (!config) {
        skipped++;
        console.warn(`Skip ${demo.slug}: rebuild returned null`);
        continue;
      }

      if (dryRun) {
        console.log(
          `[dry-run] Would update ${demo.slug} (base + ${demo.winningVersionId ? "winner" : "no winner"})`,
        );
        ok++;
        continue;
      }

      await prisma.demoConfig.update({
        where: { id: demo.id },
        data: {
          baseConfigJson: config as unknown as object,
          packageTier: config.package.tier,
        },
      });

      if (demo.winningVersionId) {
        await prisma.demoVersion.update({
          where: { id: demo.winningVersionId },
          data: { demoConfigJson: config as unknown as object },
        });
      }

      console.log(`Updated ${demo.slug}`);
      ok++;
    } catch (e) {
      console.error(`Failed ${demo.slug}:`, e);
    }
  }

  console.log(`Done. Updated ${ok}, skipped ${skipped}, total ${demos.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
