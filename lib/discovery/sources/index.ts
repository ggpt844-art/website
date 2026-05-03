import type { DiscoverySource } from "../types";
import { googlePlacesSource } from "./googlePlaces";
import { stubSource } from "./stub";
import { serpSource } from "./serp";
import { webResearchSource } from "./webResearch";

/** Places first when enabled so higher-trust results feed dedupe before HTML stub flows. */
export const ALL_SOURCES: DiscoverySource[] = [
  googlePlacesSource,
  stubSource,
  serpSource,
  webResearchSource,
];

export function activeSources(): DiscoverySource[] {
  return ALL_SOURCES.filter((s) => s.available);
}
