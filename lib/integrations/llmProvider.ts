import type { AdapterHealth, IntegrationMode } from "./types";

export interface LlmProvider {
  mode: IntegrationMode;
  complete(prompt: string): Promise<string | null>;
  health(): AdapterHealth;
}

export function createStubLlmProvider(): LlmProvider {
  return {
    mode: "disabled",
    async complete() {
      return null;
    },
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
