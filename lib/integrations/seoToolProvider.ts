import type { AdapterHealth, IntegrationMode } from "./types";

export interface SeoToolProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubSeoToolProvider(): SeoToolProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
