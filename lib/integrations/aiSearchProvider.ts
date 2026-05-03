import type { AdapterHealth, IntegrationMode } from "./types";

export interface AiSearchProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubAiSearchProvider(): AiSearchProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
