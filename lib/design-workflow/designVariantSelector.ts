import type { DesignVariant } from "@prisma/client";
import { gradeDesignWorkflow } from "./designWorkflowGrader";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { mergeVariantRowIntoConfig } from "./mergeSelectedVariant";

export function pickHighestScoringVariant(variants: DesignVariant[]): DesignVariant | null {
  if (!variants.length) return null;
  return [...variants].sort((a, b) => b.score - a.score)[0];
}

export function scoreVariantAgainstConfig(variant: DesignVariant, baseConfig: DemoConfig): number {
  const merged = mergeVariantRowIntoConfig(baseConfig, variant);
  const g = gradeDesignWorkflow({ config: merged, designMd: variant.designMdJson as never });
  return g.designWorkflowScore;
}

/** Three rule-based internal variants (no Stitch) — persisted by caller. */
export function buildInternalVariantSeeds(): {
  name: string;
  variantType: "safe_conversion" | "premium_cinematic" | "bold_experimental";
  notes: string;
}[] {
  return [
    {
      name: "Safe conversion",
      variantType: "safe_conversion",
      notes: "Conservative hierarchy, proof-forward, minimal motion risk.",
    },
    {
      name: "Premium cinematic",
      variantType: "premium_cinematic",
      notes: "Deeper tone stack, slower motion language, stronger metaphor.",
    },
    {
      name: "Bold experimental",
      variantType: "bold_experimental",
      notes: "Asymmetric hero, higher contrast, tighter copy — still compliance-first.",
    },
  ];
}
