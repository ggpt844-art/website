const GENERIC_PHRASES = [
  /modern clean website/i,
  /sleek and professional/i,
  /cutting[- ]edge/i,
  /world[- ]class/i,
  /best in class/i,
  /we are passionate/i,
  /quality service you can trust/i,
];

const WEAK_METAPHOR = [
  /generic (icon|stock)/i,
  /random 3d/i,
  /floating (cube|sphere)/i,
];

/** Phrases that often imply unverified claims when they appear in a Stitch prompt. */
const INVENTED_CLAIM_HINTS = [
  /guaranteed (results|outcome)/i,
  /lifetime warranty/i,
  /#\s*1\b/i,
  /same[- ]day service/i,
  /\b190%\s*faster\b/i,
];

export interface StitchPromptGradeResult {
  score: number;
  breakdown: Record<string, number>;
  blocksAutoStitch: boolean;
  reasons: string[];
}

/**
 * Rubric /100:
 * - business specificity: 15
 * - buyer psychology: 15
 * - visual metaphor strength: 15
 * - cinematic direction: 15
 * - conversion clarity: 15
 * - mobile clarity: 10
 * - anti-template constraints: 10
 * - compliance safety: 5
 */
export function gradeStitchPrompt(args: {
  finalStitchPrompt: string;
  businessName: string;
  city: string;
  nicheLabel: string;
  complianceWarnings: string[];
}): StitchPromptGradeResult {
  const p = args.finalStitchPrompt;
  const reasons: string[] = [];
  let hardBlock = false;

  const lower = p.toLowerCase();

  if (p.length < 500) {
    hardBlock = true;
    reasons.push("Prompt too short — likely incomplete.");
  }

  if (!p.includes(args.businessName)) {
    hardBlock = true;
    reasons.push("Business name missing from prompt — not specific enough.");
  }

  if (!/\bmobile\b/i.test(p) && !/thumb/i.test(p)) {
    hardBlock = true;
    reasons.push("Mobile-first requirements not clearly stated.");
  }

  if (!/variant/i.test(p) || (!/3\b/.test(p) && !/three/i.test(p))) {
    hardBlock = true;
    reasons.push("Must request three distinct visual variants.");
  }

  if (!/design\.md/i.test(p)) {
    reasons.push("DESIGN.md-style output not explicitly requested — minor gap.");
  }

  if (!/anti[- ]?ai|anti[- ]?template/i.test(p)) {
    hardBlock = true;
    reasons.push("Anti-template / anti-AI-slop rules missing.");
  }

  if (!/conversion|cta|call to action/i.test(p)) {
    hardBlock = true;
    reasons.push("Conversion requirements unclear.");
  }

  let genericHits = 0;
  for (const rx of GENERIC_PHRASES) {
    if (rx.test(p)) genericHits++;
  }
  if (genericHits >= 2) {
    hardBlock = true;
    reasons.push("Prompt reads generic (template phrases detected).");
  }

  for (const rx of INVENTED_CLAIM_HINTS) {
    if (rx.test(p)) {
      hardBlock = true;
      reasons.push("Possible invented or unverified claim language in prompt — remove or qualify.");
      break;
    }
  }

  const mCore = /core visual metaphor:([\s\S]*?)(?=\n\n[A-Za-z /]+:)/i.exec(p)?.[1] ?? "";
  const mHero = /cinematic hero direction:([\s\S]*?)(?=\n\n[A-Za-z /]+:)/i.exec(p)?.[1] ?? "";
  const metaphorCombined = `${mCore}\n${mHero}`.trim();

  let metaphorWeak = false;
  for (const rx of WEAK_METAPHOR) {
    if (rx.test(metaphorCombined)) metaphorWeak = true;
  }
  if (metaphorCombined.length < 70) metaphorWeak = true;

  if (metaphorWeak) {
    hardBlock = true;
    reasons.push("Visual metaphor / hero direction too weak or self-undermining.");
  }

  const complianceOk =
    /do not invent|claim safety|strict claim|fabricat/i.test(p) ||
    /only facts present/i.test(p);

  if (args.complianceWarnings.length > 0 && !complianceOk) {
    hardBlock = true;
    reasons.push("Compliance warnings present but prompt lacks explicit claim-safety instructions.");
  }

  // --- Scoring (soft rubric; capped by hard failures) ---

  let businessSpecificity = 0;
  if (p.includes(args.businessName)) businessSpecificity += 8;
  if (lower.includes(args.city.toLowerCase())) businessSpecificity += 4;
  if (lower.includes(args.nicheLabel.toLowerCase())) businessSpecificity += 3;
  businessSpecificity = Math.min(15, businessSpecificity);
  if (genericHits) businessSpecificity = Math.max(0, businessSpecificity - genericHits * 3);

  let buyerPsych = 0;
  if (/buyer psychology|pain|urgency|trust|objection/i.test(p)) buyerPsych += 10;
  if (/emotional|outcome|fear/i.test(p)) buyerPsych += 5;
  buyerPsych = Math.min(15, buyerPsych);

  let metaphor = metaphorWeak ? 4 : 0;
  if (!metaphorWeak) {
    metaphor += /metaphor|hero event|scene|lighting|camera|depth|composition/i.test(p) ? 10 : 5;
    metaphor += metaphorCombined.length > 200 ? 5 : 3;
  }
  metaphor = Math.min(15, metaphor);

  let cinematic = 0;
  if (/cinematic|parallax|dolly|rim light|negative space/i.test(p)) cinematic += 10;
  if (/motion|transition|ease/i.test(p)) cinematic += 5;
  cinematic = Math.min(15, cinematic);

  let conversion = 0;
  if (/primary cta|secondary cta|conversion/i.test(p)) conversion += 10;
  if (/quote|diagnostic|upload|next step/i.test(p)) conversion += 5;
  conversion = Math.min(15, conversion);

  let mobile = 0;
  if (/\bmobile/i.test(p)) mobile += 5;
  if (/sticky|thumb|48px|100vh|viewport/i.test(p)) mobile += 5;
  mobile = Math.min(10, mobile);

  let antiTemplate = 0;
  if (/anti[- ]?ai|anti[- ]?template|no lorem|no purple gradient|ornamental/i.test(p)) antiTemplate += 7;
  if (/no (generic|random)/i.test(p)) antiTemplate += 3;
  antiTemplate = Math.min(10, antiTemplate);

  let complianceScore = 0;
  if (complianceOk) complianceScore += 4;
  if (args.complianceWarnings.length && p.includes(args.complianceWarnings[0] ?? "")) complianceScore += 1;
  complianceScore = Math.min(5, complianceScore);

  const breakdown = {
    businessSpecificity,
    buyerPsychology: buyerPsych,
    visualMetaphorStrength: metaphor,
    cinematicDirection: cinematic,
    conversionClarity: conversion,
    mobileClarity: mobile,
    antiTemplateConstraints: antiTemplate,
    complianceSafety: complianceScore,
  } satisfies Record<string, number>;

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const blocksAutoStitch = hardBlock || score < 88;

  if (blocksAutoStitch && !reasons.length) {
    reasons.push(`Score ${score} is below the 88 threshold for automatic Stitch.`);
  }

  return { score, breakdown, blocksAutoStitch, reasons };
}
