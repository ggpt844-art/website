import type { AdapterHealth, IntegrationMode } from "./types";

export interface PlacesProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubPlacesProvider(): PlacesProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
