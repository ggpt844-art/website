/**
 * One-shot: Stonebridge Insulation demo — cinematic thermal hero + heroLocked.
 * Merges into existing baseConfigJson, then run `pnpm run regenerate-demos`.
 *
 * Usage: npx tsx scripts/lockStonebridgeCinematicHero.ts
 */
import { prisma } from "@/lib/db/prisma";
import { HEAT_LOSS_CINEMATIC_PLATE, heatLossHeroVideoFromEnv } from "@/lib/cinematic/heatLossHero";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

const SLUG = "stonebridge-insulation-vaughan";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const demo = await prisma.demoConfig.findUnique({ where: { slug: SLUG } });
  if (!demo) {
    console.error(`No DemoConfig with slug "${SLUG}". Run prisma seed or create the demo first.`);
    process.exit(1);
  }

  const prev = demo.baseConfigJson as unknown as DemoConfig;
  const video = heatLossHeroVideoFromEnv();
  const plate = HEAT_LOSS_CINEMATIC_PLATE;

  const next: DemoConfig = {
    ...prev,
    assets: {
      ...prev.assets,
      heroAssetUrl: plate,
      heroPosterUrl: plate,
      heroCinematic: "thermal_loss",
      use3DFallback: false,
      heroLocked: true,
      ...(video ? { heroVideoUrl: video } : {}),
    },
  };

  await prisma.demoConfig.update({
    where: { id: demo.id },
    data: { baseConfigJson: next as object },
  });

  console.log(`Updated ${SLUG}: assets.heroLocked=true, thermal cinematic hero, poster=${plate.slice(0, 48)}…`);
  if (video) console.log("Included heroVideoUrl from env.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
