import type { AdapterHealth, IntegrationMode } from "./types";

export interface CallTrackingProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubCallTrackingProvider(): CallTrackingProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
