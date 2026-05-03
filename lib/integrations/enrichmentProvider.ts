import type { AdapterHealth, IntegrationMode } from "./types";

export interface EnrichmentProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubEnrichmentProvider(): EnrichmentProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
