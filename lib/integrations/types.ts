export type IntegrationMode = "disabled" | "manual" | "mock" | "api";

export interface AdapterHealth {
  mode: IntegrationMode;
  connected: boolean;
  lastError?: string;
}
