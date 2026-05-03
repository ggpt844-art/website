import type { DesignBrief, DesignMd, ParsedStitchReference } from "./designWorkflowTypes";

export function generateDesignMdFromReference(
  brief: DesignBrief,
  parsed: ParsedStitchReference,
  projectName: string,
): DesignMd {
  return {
    projectName,
    businessNiche: brief.niche,
    designIntent: `Premium conversion funnel for ${brief.businessName} — ${parsed.selectedDirection}`,
    emotionalGoal: brief.emotionalGoal,
    coreMetaphor: brief.visualMetaphor,
    targetUserFeeling: "In control, educated, and invited — not sold with hype",
    visualMotif: parsed.visualMotif,
    colorTokens: Object.entries(parsed.colorSystem).map(([k, v]) => `${k}: ${v}`),
    colorMeanings: {
      primary: "Authority + clarity",
      accent: "Action without gimmick",
      surface: "Depth without clutter",
    },
    typographyRules: [parsed.typographyMood, "Maintain AA contrast on dark cinematic backgrounds"],
    spacingRules: ["Generous section rhythm; avoid cramped contractor grids", "Mobile first: 16px minimum tap padding"],
    componentRules: [
      parsed.cardStyle,
      parsed.ctaStyle,
      "Use existing demo section components — restyle via tokens, not one-off DOM",
    ],
    motionRules: [parsed.motionStyle, brief.motionGoal, "Honor prefers-reduced-motion"],
    "3dSceneRules": [parsed["3dSceneDirection"], brief["3dSceneGoal"]],
    accessibilityRules: ["No essential info only in motion", "Focus states on all CTAs", parsed.mobileNotes],
    premiumQualityBar: [
      "One clear metaphor end-to-end",
      "Proof adjacent to claims",
      "No fake stock testimonials",
      brief.premiumReferenceStyle,
    ],
    avoidList: [...new Set([...brief.mustAvoid, ...parsed.avoidList])],
    copyToneExamples: [
      `${brief.businessName} — ${brief.mainBuyerPain.slice(0, 90)}`,
      `Start with: ${brief.primaryOffer}`,
    ],
    badGenericChoicesToAvoid: [
      "Gradient blobs with no meaning",
      "Three meaningless icons + lorem",
      "Generic 'Trusted by thousands' without proof",
    ],
  };
}

/** No-Stitch path: synthesize DESIGN.md from brief + niche metaphor only. */
export function generateDesignMdFromBriefOnly(brief: DesignBrief, projectName: string): DesignMd {
  const parsed: ParsedStitchReference = {
    selectedDirection: "internal_auto",
    heroLayout: "Preset hero stack from experience planner",
    sectionOrder: brief.sectionsNeeded,
    visualMotif: brief.visualMetaphor,
    colorSystem: { note: "From active design system preset" },
    typographyMood: "Preset from niche design system",
    motionStyle: brief.motionGoal,
    "3dSceneDirection": brief["3dSceneGoal"],
    cardStyle: "Token-based surfaces",
    ctaStyle: "Primary CTA from conversion strategist",
    trustStyle: brief.trustGoal,
    mobileNotes: "Sticky CTA + collapsible proof",
    avoidList: brief.mustAvoid,
    implementationNotes: ["Generated without Stitch import"],
    uncertainFields: [],
  };

  return generateDesignMdFromReference(brief, parsed, projectName);
}
