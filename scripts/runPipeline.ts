/**
 * Automate the full funnel batch without opening /discover:
 * discovery → verify → audit → (optional) demo generation + QA.
 *
 * Uses the same stub or real discovery sources as the app (.env toggles).
 *
 * Usage:
 *   npm run pipeline -- --city Vaughan --niche attic-insulation
 *   npm run pipeline -- --city Mississauga --niche roofing --batch-size 12 --demos
 *
 * Flags:
 *   --city       Target city name (matches TargetCity.name, case-insensitive)
 *   --niche      Target niche slug (e.g. attic-insulation, roofing)
 *   --batch-size Optional; defaults to DISCOVERY_BATCH_SIZE / app config
 *   --demos      Also run demo generation + QA for qualifying leads
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "@/lib/db/prisma";
import { runFullPipelineAwait } from "@/lib/jobs/pipeline";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function mainArgs(): {
  city: string;
  niche: string;
  batchSize: number | undefined;
  generateDemos: boolean;
} {
  const city = argValue("--city");
  const niche = argValue("--niche");
  const batchRaw = argValue("--batch-size");
  const generateDemos = process.argv.includes("--demos");

  if (!city || !niche) {
    console.error(`Missing required flags.

  npm run pipeline -- --city <CityName> --niche <niche-slug> [--batch-size N] [--demos]

Examples:
  npm run pipeline -- --city Vaughan --niche attic-insulation --demos
`);
    process.exit(1);
  }

  const batchSize = batchRaw != null && batchRaw !== "" ? Number(batchRaw) : undefined;
  if (batchSize != null && (Number.isNaN(batchSize) || batchSize < 1)) {
    console.error("--batch-size must be a positive number");
    process.exit(1);
  }

  return { city: city.trim(), niche: niche.trim(), batchSize, generateDemos };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (.env or environment).");
    process.exit(1);
  }

  const { city, niche, batchSize, generateDemos } = mainArgs();

  const [cityRow, nicheRow] = await Promise.all([
    prisma.targetCity.findFirst({
      where: { enabled: true, name: { equals: city, mode: "insensitive" } },
    }),
    prisma.targetNiche.findFirst({
      where: { enabled: true, slug: { equals: niche, mode: "insensitive" } },
    }),
  ]);

  if (!cityRow) {
    console.error(`Could not find enabled city matching name: "${city}"`);
    const all = await prisma.targetCity.findMany({
      where: { enabled: true },
      select: { name: true, region: true },
      orderBy: { name: "asc" },
    });
    console.error("Available cities:", all.map((c) => `${c.name}, ${c.region}`).join("; "));
    process.exit(1);
  }

  if (!nicheRow) {
    console.error(`Could not find enabled niche with slug: "${niche}"`);
    const all = await prisma.targetNiche.findMany({
      where: { enabled: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    });
    console.error("Available niches:", all.map((n) => `${n.slug} (${n.name})`).join("; "));
    process.exit(1);
  }

  console.log(
    `Running pipeline: ${cityRow.name}, ${cityRow.region} × ${nicheRow.name} (${nicheRow.slug})` +
      (batchSize != null ? ` batch=${batchSize}` : "") +
      (generateDemos ? " + demos/QA" : ""),
  );

  const { jobId } = await runFullPipelineAwait({
    cityId: cityRow.id,
    nicheId: nicheRow.id,
    batchSize,
    generateDemos,
  });

  console.log(`Done. Discovery job id: ${jobId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
