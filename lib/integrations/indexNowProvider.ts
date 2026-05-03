import type { AdapterHealth, IntegrationMode } from "./types";

export interface IndexNowProvider {
  mode: IntegrationMode;
  pingUrls(_urls: string[]): Promise<{ ok: boolean }>;
  health(): AdapterHealth;
}

export function createStubIndexNowProvider(): IndexNowProvider {
  return {
    mode: "disabled",
    async pingUrls() {
      return { ok: false };
    },
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
