import type { DemoConfig } from "@/lib/renderer/demoConfig";

export interface ComplianceScanResult {
  warnings: string[];
  severeWarnings: string[];
  blockedClaims: string[];
}

export function scanCompliance(config: DemoConfig): ComplianceScanResult {
  const warnings: string[] = [];
  const severe: string[] = [];
  const blocked: string[] = [];
  const blob = JSON.stringify(config).toLowerCase();

  if (/best in (town|city)|#1 |guaranteed cure|pain-free guarantee/i.test(blob)) {
    severe.push("Remove superlative, guarantee, or outcome promises from copy.");
    blocked.push("unsupported superlative/guarantee");
  }
  if ((config.business.rating ?? 0) > 5 || (config.business.reviewCount ?? 0) < 0) {
    severe.push("Invalid rating or review count.");
  }

  const medical = ["dentists", "orthodontists", "med-spas", "cosmetic-clinics"].includes(
    config.business.category?.toLowerCase() ?? "",
  );
  if (medical && /diagnosis|clinical result guaranteed|zero risk/i.test(blob)) {
    severe.push("Medical/cosmetic copy may imply diagnosis or guaranteed results.");
  }

  if (severe.length === 0 && warnings.length === 0) {
    warnings.push("Re-scan after owner supplies legal/financing/emergency availability facts.");
  }

  return { warnings, severeWarnings: severe, blockedClaims: blocked };
}
