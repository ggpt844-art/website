import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { DesignBrief, DesignMd, DesignWorkflowGradeResult, ParsedStitchReference } from "./designWorkflowTypes";
import type { DesignPatch } from "./designWorkflowTypes";

export interface GradeDesignWorkflowInput {
  config: DemoConfig;
  designBrief?: DesignBrief | null;
  parsedReference?: ParsedStitchReference | null;
  designMd?: DesignMd | null;
}

const MIN_APPROVAL = 88;

export function gradeDesignWorkflow(input: GradeDesignWorkflowInput): DesignWorkflowGradeResult {
  const warnings: string[] = [];
  const suggestedPatches: DesignPatch[] = [];
  let score = 72;

  const { config } = input;
  const compliance = config.compliance?.severeWarnings?.length ?? 0;
  if (compliance > 0) {
    warnings.push("Compliance severe warnings present — do not soften disclaimers for style.");
    score -= 15;
  }

  if (!config.pageStrategy) warnings.push("Missing pageStrategy");
  else {
    score += 6;
    if (config.pageStrategy.sectionOrder.length >= 5) score += 4;
    if (config.pageStrategy.mustIncludeSections.length) score += 2;
  }

  if (!config.visualDirection) warnings.push("Missing visualDirection");
  else {
    score += 6;
    if ((config.visualDirection.avoidList?.length ?? 0) > 0) score += 3;
    if (config.visualDirection.premiumSignals.length >= 2) score += 2;
  }

  if (!config.sceneSpec?.enabled) warnings.push("3D scene disabled");
  else {
    score += 4;
    if (config.sceneSpec.uiAnchors?.length) score += 2;
  }

  if (config.seo?.primaryKeyword) score += 4;
  if (config.strategy?.primaryCTA) score += 3;
  if (config.mobilePlan?.stickyCtaType) score += 3;
  if (config.trust?.architectureJson) score += 2;

  if (input.designBrief) {
    score += 4;
    if (input.designBrief.mustAvoid.length) score += 2;
  }

  if (input.parsedReference?.uncertainFields?.length) {
    warnings.push(`Imported reference has uncertain fields: ${input.parsedReference.uncertainFields.join(", ")}`);
    score -= 4;
  }

  if (input.designMd?.avoidList?.length) score += 3;

  const genericHits = [
    /lorem ipsum/i,
    /generic saas/i,
    /three columns with icons/i,
  ];
  const vdText = JSON.stringify(config.visualDirection ?? {});
  for (const g of genericHits) {
    if (g.test(vdText)) {
      warnings.push("Visual direction may read generic — tighten metaphor and premium signals.");
      score -= 6;
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let blocksApproval = score < MIN_APPROVAL;
  if (compliance > 0) blocksApproval = true;
  if (!config.pageStrategy || !config.visualDirection) blocksApproval = true;

  if (blocksApproval && score >= MIN_APPROVAL - 5) {
    suggestedPatches.push({
      target: "visualDirection",
      action: "update",
      patch: {
        premiumSignals: [
          ...(config.visualDirection?.premiumSignals ?? []),
          "Proof-adjacent headlines only",
        ],
      },
    });
  }

  return { designWorkflowScore: score, warnings, blocksApproval, suggestedPatches };
}

export { MIN_APPROVAL as DESIGN_WORKFLOW_MIN_SCORE };
