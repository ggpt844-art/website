/**
 * One-off: Text Search via Places API (New). Loads .env.local then .env.
 * Does not print secrets. Usage: npx tsx scripts/smokePlaces.ts
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });
process.env.ENABLE_GOOGLE_PLACES_SOURCE = "true";

async function main() {
  const { googlePlacesSource } = await import("../lib/discovery/sources/googlePlaces");
  if (!googlePlacesSource.available) {
    console.error(
      "Places smoke test skipped: set GOOGLE_MAPS_API_KEY in .env or .env.local (ENABLE_GOOGLE_PLACES_SOURCE can be set there too).",
    );
    process.exit(1);
  }

  const results = await googlePlacesSource.search({
    city: "Toronto",
    region: "ON",
    country: "CA",
    niche: "dentists",
    query: "dentist Toronto",
    limit: 3,
  });

  if (results.length === 0) {
    console.error("Places returned 0 results (check API billing, Places API (New) enabled, key restrictions).");
    process.exit(2);
  }

  console.log(`OK: ${results.length} place(s)`);
  for (const r of results) {
    console.log(`- ${r.name}${r.websiteUrl ? ` · ${r.websiteUrl}` : ""}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(3);
});
