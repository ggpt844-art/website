import type { AdapterHealth, IntegrationMode } from "./types";

export interface BingWebmasterProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubBingWebmasterProvider(): BingWebmasterProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
