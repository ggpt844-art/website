import type { AdapterHealth, IntegrationMode } from "./types";

export interface SearchConsoleProvider {
  mode: IntegrationMode;
  health(): AdapterHealth;
}

export function createStubSearchConsoleProvider(): SearchConsoleProvider {
  return {
    mode: "disabled",
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
