import type { AdapterHealth, IntegrationMode } from "./types";

export interface EmailProvider {
  mode: IntegrationMode;
  send(_args: { to: string; subject: string; text: string }): Promise<{ ok: boolean; error?: string }>;
  health(): AdapterHealth;
}

export function createStubEmailProvider(): EmailProvider {
  return {
    mode: "disabled",
    async send() {
      return { ok: false, error: "Email disabled until provider configured and manually approved." };
    },
    health() {
      return { mode: "disabled", connected: false };
    },
  };
}
