import type { DesignBrief } from "./designWorkflowTypes";
import { STITCH_BOUNDARY_PROMPT_APPEND } from "./stitchDesignBoundary";

/**
 * Paste into Google Stitch (or any visual concept tool). No API — human-in-the-loop only.
 */
export function generateStitchPrompt(brief: DesignBrief): string {
  const requiredLines = brief.sectionsNeeded.map((s) => `- ${s}`).join("\n");
  const avoidLines = brief.mustAvoid.map((s) => `- ${s}`).join("\n");

  return `Title:
Premium Local Lead Funnel Design for ${brief.businessName}

Context:
${brief.businessName} is a ${brief.niche} business serving ${brief.city}. The page should help ${brief.targetCustomer} solve ${brief.mainBuyerPain} and request ${brief.primaryOffer}.

Goal:
Design a premium landing page concept that feels cinematic, trustworthy, and conversion-focused — not a generic AI template.

Visual concept:
${brief.visualMetaphor}

Conversion goal:
${brief.conversionGoal}

Required sections (adapt labels to your layout; preserve intent):
${requiredLines}

Design style:
- Premium, cinematic, concept-led
- Mobile-first hierarchy and tap targets
- High trust; avoid gimmicks and fake claims
- Not generic SaaS chrome; not a basic $99 local-business template
- Legible typography; accessible contrast

3D / motion direction:
${brief["3dSceneGoal"]}
${brief.motionGoal}

Avoid:
${avoidLines}

Generate 3 different design directions:
1. Safest high-conversion version
2. Most premium cinematic version
3. Boldest experimental version

For each direction, describe:
- Hero layout
- Section order
- Visual motif
- Color / motion style
- CTA treatment
- Trust / proof treatment
- Mobile approach

Also output a concise design-system summary (tokens, type mood, motion rules) suitable for a DESIGN.md handoff — no proprietary assets; direction only, not literal cloning.

${STITCH_BOUNDARY_PROMPT_APPEND}`;
}
