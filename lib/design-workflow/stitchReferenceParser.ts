import type { ParsedStitchReference } from "./designWorkflowTypes";

function linesFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function takeBullets(block: string[]): string[] {
  return block
    .filter((l) => l.startsWith("-") || l.startsWith("•") || /^\d+\./.test(l))
    .map((l) => l.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

/** Heuristic extraction — direction only, not literal cloning. */
export function parseStitchReference(rawText: string, selectedVariantName?: string): ParsedStitchReference {
  const lines = linesFromText(rawText);
  const lower = rawText.toLowerCase();
  const uncertainFields: string[] = [];

  let selectedDirection = selectedVariantName?.trim() || "";
  if (!selectedDirection) {
    uncertainFields.push("selectedDirection");
    selectedDirection = "imported_direction";
  }

  const sectionOrder: string[] = [];
  const orderIdx = lines.findIndex((l) => /section\s*order/i.test(l));
  if (orderIdx !== -1) {
    for (let i = orderIdx + 1; i < Math.min(orderIdx + 12, lines.length); i++) {
      const l = lines[i];
      if (/^#+\s/.test(l) || /^direction\s*\d/i.test(l)) break;
      if (l.startsWith("-") || /^\d+\./.test(l)) {
        sectionOrder.push(l.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim());
      }
    }
  }
  if (!sectionOrder.length) {
    const heroIdx = lines.findIndex((l) => /^#{1,3}\s*hero/i.test(l) || /^hero\s*layout/i.test(l));
    if (heroIdx >= 0) sectionOrder.push("Hero");
    const trustIdx = lines.findIndex((l) => /trust|proof/i.test(l));
    if (trustIdx >= 0) sectionOrder.push("Trust / proof");
    const faqIdx = lines.findIndex((l) => /faq/i.test(l));
    if (faqIdx >= 0) sectionOrder.push("FAQ");
    if (!sectionOrder.length) uncertainFields.push("sectionOrder");
  }

  let heroLayout = "";
  const hi = lines.findIndex((l) => /hero/i.test(l) && (l.length < 80 || /layout/i.test(l)));
  if (hi >= 0) {
    heroLayout = [lines[hi], lines[hi + 1], lines[hi + 2]].filter(Boolean).join(" · ").slice(0, 400);
  } else {
    uncertainFields.push("heroLayout");
    heroLayout = "Full-width hero with clear headline stack and primary CTA";
  }

  let visualMotif = "";
  if (/thermal|heat|insulation|flir/i.test(lower)) {
    visualMotif = "Thermal / heat-flow motif";
  } else if (/glass|clinical|smile|dental/i.test(lower)) {
    visualMotif = "Clinical glass / precision glow";
  } else if (/roof|storm|shingle/i.test(lower)) {
    visualMotif = "Protective roof plane / weather tension";
  } else {
    visualMotif = "Premium local-service motif derived from niche metaphor";
    uncertainFields.push("visualMotif");
  }

  const colorSystem: Record<string, string> = {};
  const colorLine = lines.find((l) => /color|palette|#[0-9a-f]{3,8}/i.test(l));
  if (colorLine) {
    colorSystem.primary = colorLine.slice(0, 160);
  } else {
    uncertainFields.push("colorSystem");
    colorSystem.note = "Infer from design system preset until tokens are set";
  }

  let typographyMood = "Modern grotesk / sturdy display for headlines";
  if (/serif|editorial/i.test(lower)) typographyMood = "Editorial serif for headings, neutral sans body";
  if (/mono|technical/i.test(lower)) typographyMood = "Technical sans with mono accents";

  let motionStyle = "Slow linear camera moves; scroll-scrub sparingly";
  if (/snap|crisp|fast/i.test(lower)) motionStyle = "Crisp, short easing; faster feedback loops";

  let scene3d = "";
  if (/cutaway|attic|thermal|heat/i.test(lower)) {
    scene3d = "thermal_house_cutaway — attic cutaway with heat-loss readout cards";
  } else if (/hvac|air|flow/i.test(lower)) {
    scene3d = "hvac_airflow_stack — layered airflow read";
  } else if (/roof/i.test(lower)) {
    scene3d = "roof_storm_hotspot — storm emphasis on roof plane";
  } else {
    scene3d = "Reuse niche library scene; reinforce metaphor without novelty for novelty’s sake";
    uncertainFields.push("3dSceneDirection");
  }

  const avoidStart = lines.findIndex((l) => /^avoid/i.test(l));
  const avoidList =
    avoidStart >= 0
      ? takeBullets(lines.slice(avoidStart, avoidStart + 12))
      : [];
  const finalAvoid =
    avoidList.length > 0
      ? avoidList
      : ["generic icon grids", "template hero with meaningless stock people", "unverified savings claims"];

  return {
    selectedDirection,
    heroLayout,
    sectionOrder: sectionOrder.length
      ? sectionOrder
      : ["hero", "problemVisualization", "diagnosticTool", "trustStrip", "finalCTA"],
    visualMotif,
    colorSystem,
    typographyMood,
    motionStyle,
    "3dSceneDirection": scene3d,
    cardStyle: lower.includes("glass")
      ? "Frosted glass panels with tight radius"
      : "High-contrast cards with thin borders",
    ctaStyle: lower.includes("sticky")
      ? "Sticky mobile CTA bar + in-hero primary"
      : "Primary pill CTA + secondary text link",
    trustStyle:
      "Proof row with logos, review stats, and explicit process guarantees (compliance-safe)",
    mobileNotes: "Thumb reach for CTA; collapse secondary proof into accordion",
    avoidList: finalAvoid,
    implementationNotes: [
      "Interpretation is directional; production uses existing React section components.",
      uncertainFields.length ? `Review fields: ${uncertainFields.join(", ")}` : "Parser confidence: moderate",
    ],
    uncertainFields: [...new Set(uncertainFields)],
  };
}
