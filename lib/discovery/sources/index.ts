import type { DiscoverySource } from "../types";
import { stubSource } from "./stub";
import { serpSource } from "./serp";

export const ALL_SOURCES: DiscoverySource[] = [stubSource, serpSource];

export function activeSources(): DiscoverySource[] {
  return ALL_SOURCES.filter((s) => s.available);
}
