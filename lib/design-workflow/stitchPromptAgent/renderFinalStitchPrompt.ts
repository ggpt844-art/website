import type { StitchPromptPlan } from "./types";

/** Renders the canonical multi-block Stitch prompt (Google Stitch / API ready). */
export function renderFinalStitchPromptFromPlan(args: {
  businessName: string;
  nicheLabel: string;
  city: string;
  region: string | null;
  country: string;
  plan: StitchPromptPlan;
}): string {
  const { businessName, nicheLabel, city, region, country, plan } = args;
  const area = region ? `${city}, ${region}` : city;
  const titleLine = `Create a premium cinematic landing page concept for ${businessName}, a ${nicheLabel.toLowerCase()} business serving ${area} (${country}).`;

  return [
    "Title:",
    titleLine,
    "",
    "Project Context:",
    plan.projectContext,
    "",
    "Buyer Psychology:",
    plan.buyerPsychologyBlock,
    "",
    "Core Visual Metaphor:",
    plan.visualMetaphorBlock,
    "",
    "Cinematic Hero Direction:",
    plan.cinematicHeroBlock,
    "",
    "Camera / Depth / Composition:",
    plan.cameraDepthBlock,
    "",
    "Motion Direction:",
    plan.motionBlock,
    "",
    "UI / Component Style:",
    plan.uiStyleBlock,
    "",
    "Section Flow:",
    plan.sectionFlowBlock,
    "",
    "Conversion Requirements:",
    plan.conversionBlock,
    "",
    "Mobile Requirements:",
    plan.mobileBlock,
    "",
    "Compliance / Claim Safety:",
    plan.complianceBlock,
    "",
    "Anti-AI / Anti-Template Rules:",
    plan.antiTemplateBlock,
    "",
    "Variant Requirements:",
    plan.variantRequestBlock,
    "",
    "Output Requirements:",
    plan.outputRequirementsBlock,
  ].join("\n");
}
