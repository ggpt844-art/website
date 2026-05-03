import type { ConversionConfig } from "@/lib/growth/schemas";

export function missedCallDashboardLines(cfg: ConversionConfig["missedCallTextBack"]): string[] {
  return [
    cfg.enabled ? "Module enabled in config." : "Module disabled — enable only when SMS provider + policy approved.",
    `Provider: ${cfg.provider}.`,
    cfg.quoteFlowLink ? `Quote link: ${cfg.quoteFlowLink}` : "Set quote flow link in config.",
    "Template preview:",
    cfg.messageTemplate,
  ];
}
