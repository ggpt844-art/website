import type { AdapterHealth, IntegrationMode } from "./types";

export interface AnalyticsProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubAnalyticsProvider(): AnalyticsProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
