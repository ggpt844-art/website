import type { AdapterHealth, IntegrationMode } from "./types";

export interface SmsProvider {
  mode: IntegrationMode;
  send(_to: string, _body: string): Promise<{ ok: boolean; error?: string }>;
  health(): AdapterHealth;
}

export function createStubSmsProvider(): SmsProvider {
  return {
    mode: "disabled",
    async send() {
      return { ok: false, error: "SMS disabled until provider configured and manually approved." };
    },
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
