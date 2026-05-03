import type { DesignWorkflowBundle } from "@/lib/renderer/demoConfig";
import { APP_CONFIG } from "@/lib/utils/config";

/** If non-null, automatic Stitch SDK must not run. */
export function getStitchAutoBlockReason(designWorkflow: DesignWorkflowBundle | undefined): string | null {
  if (!designWorkflow?.finalStitchPrompt?.trim()) {
    return "Run the Claude → Stitch Prompt Agent before automatic Stitch (no graded prompt on file).";
  }
  if ((designWorkflow.stitchPromptScore ?? 0) < APP_CONFIG.stitchPromptMinAutoScore) {
    return `Stitch prompt score ${designWorkflow.stitchPromptScore ?? 0} is below ${APP_CONFIG.stitchPromptMinAutoScore} (automatic Stitch blocked).`;
  }
  if (designWorkflow.stitchPromptBlocksAutoStitch) {
    return "Stitch prompt grader blocked automatic execution — resolve warnings or edit the prompt.";
  }
  return null;
}
