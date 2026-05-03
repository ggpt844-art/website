import type {
  BuyerPsychology,
  ConversionStrategy,
  CreativeStrategy,
  SectionStrategy,
  StitchPromptAgentInput,
  StitchPromptPlan,
} from "./types";
import { getNicheCreative } from "./nicheCreativeMap";

function packetStrategyInputs(packet: Record<string, unknown> | null) {
  const s = packet?.strategyInputs as Record<string, unknown> | undefined;
  return {
    mainBuyerPain: typeof s?.mainBuyerPain === "string" ? s.mainBuyerPain : "",
    moneyAngle: typeof s?.moneyAngle === "string" ? s.moneyAngle : "",
    conversionGap: typeof s?.conversionGap === "string" ? s.conversionGap : "",
    contactReason: typeof s?.contactReason === "string" ? s.contactReason : "",
  };
}

function siteWeaklines(packet: Record<string, unknown> | null): string[] {
  const cw = packet?.currentWebsite as Record<string, unknown> | undefined;
  const w = cw?.weaknesses;
  if (!Array.isArray(w)) return [];
  return w.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 6);
}

export function buildBuyerPsychology(input: StitchPromptAgentInput): BuyerPsychology {
  const { business, businessIntelligencePacket, pageStrategy, demoConfig, trustArchitecture } = input;
  const packet = businessIntelligencePacket;
  const si = packetStrategyInputs(packet);
  const strategy = demoConfig.strategy;
  const weak = siteWeaklines(packet);

  const fears: string[] = [];
  if (si.conversionGap) fears.push(si.conversionGap);
  if (weak.length) fears.push(`Site / experience gaps noted in audit: ${weak[0]}`);
  if (!fears.length) fears.push("Uncertainty about who to trust and whether the job will be done right the first time");

  const objections: string[] = [];
  if (pageStrategy.trustType) objections.push(`Trust mode: ${pageStrategy.trustType.replace(/_/g, " ")}.`);
  const risk = strategy.riskReducers?.filter(Boolean) ?? [];
  if (risk.length) objections.push(`Typical friction: ${risk[0]}`);

  const trustBarriers: string[] = [...(input.complianceWarnings ?? [])];
  const proofHints = trustArchitecture as { proofStrip?: string[]; badges?: string[] };
  if (Array.isArray(proofHints?.proofStrip) && proofHints.proofStrip.length) {
    trustBarriers.push("Prove credibility with only assets and facts already in the brief — no invented awards.");
  }

  return {
    targetCustomer: `${input.nichePreset.label} buyers researching providers in and around ${business.city}.`,
    currentPain: si.mainBuyerPain || strategy.primaryPain,
    urgencyLevel: pageStrategy.urgencyLevel,
    fears: fears.slice(0, 5),
    objections: objections.slice(0, 5),
    desiredOutcome: si.contactReason || strategy.contactReason,
    trustBarriers: trustBarriers.slice(0, 8),
    emotionalHook: si.moneyAngle || strategy.moneyAngle,
  };
}

export function buildCreativeStrategy(input: StitchPromptAgentInput): CreativeStrategy {
  const vd = input.demoConfig.visualDirection;
  const ss = input.demoConfig.sceneSpec;
  const niche = getNicheCreative(input.business.niche);

  const conceptName = vd?.conceptName ?? `${input.nichePreset.label} · cinematic local proof`;
  const coreMetaphor = vd?.coreMetaphor ?? niche.coreMetaphor;
  const visualStory =
    vd?.visualMotif && vd?.emotionalTone
      ? `${vd.visualMotif} — ${vd.emotionalTone}`
      : niche.coreMetaphor;
  const heroEvent = niche.heroEvent;
  const sceneMood = vd?.emotionalTone ?? niche.sceneMood;
  const lightingDirection = vd?.lightingStyle ?? "Soft key + rim; readable UI contrast; no blown highlights on text cards";
  const depthDirection =
    vd?.depthStyle ?? "Layered planes — foreground interface, midground subject, shallow ambient background";
  const motionDirection =
    vd?.motionLanguage ?? "Slow dolly-in on hero focal point; micro-parallax on cards; 200–400ms ease UI transitions";
  const cameraFeel = vd?.typographyMood ? `Editorial lens feel; typography mood: ${vd.typographyMood}` : "35–50mm storytelling lens — intimate, not surveillance-wide";
  const premiumSignals = [
    ...(vd?.premiumSignals ?? []),
    "Glass-surface cards with crisp type hierarchy",
    "Purposeful negative space — every element earns its place",
  ].slice(0, 8);
  const avoidVisuals = [...new Set([...(vd?.avoidList ?? []), ...niche.avoidVisuals])].slice(0, 12);

  const sceneNote =
    ss && typeof ss.sceneType === "string"
      ? `Align 3D/scene language with sceneType "${ss.sceneType}" if a WebGL plate appears — still no decorative clutter.`
      : "";

  return {
    conceptName,
    coreMetaphor,
    visualStory: sceneNote ? `${visualStory}. ${sceneNote}` : visualStory,
    heroEvent,
    sceneMood,
    lightingDirection,
    depthDirection,
    motionDirection,
    cameraFeel,
    premiumSignals,
    avoidVisuals,
  };
}

export function buildConversionStrategy(input: StitchPromptAgentInput): ConversionStrategy {
  const { demoConfig } = input;
  const s = demoConfig.strategy;
  const mp = demoConfig.mobilePlan;
  const primary = s.primaryCTA;
  const secondary = s.secondaryCTA;

  return {
    primaryCTA: primary,
    secondaryCTA: secondary,
    diagnosticIdea:
      "Lead with a clear problem→path framing: one question or upload step that qualifies without overpromising results.",
    quoteFlowIdea:
      "Short quote path: intent → contact → optional photo/upload only when it reduces friction for this niche.",
    trustProofNearCTA: "Place verifiable proof adjacent to the primary CTA — real review counts, logos only if supplied, no fabricated badges.",
    whatHappensNextCopy: "Explicit 2–3 step 'what happens next' line under hero CTA — honest timing, no guaranteed response minutes unless in source data.",
    mobileCTAPlan: mp?.stickyCtaType
      ? `Sticky CTA pattern: ${mp.stickyCtaType} — keep primary action in the thumb zone on small viewports.`
      : "Sticky thumb-zone primary CTA on mobile; secondary as text link or outline button.",
  };
}

export function buildSectionStrategy(input: StitchPromptAgentInput): SectionStrategy {
  const ps = input.pageStrategy;
  const custom = ps.customSections?.map((c) => c.title) ?? [];
  return {
    recommendedFlow: ps.desiredStoryArc,
    sectionOrder: [...ps.sectionOrder],
    sectionsToAvoid: [...ps.forbiddenSections],
    customSections: custom,
    rationale: `Flow archetype: ${ps.flowArchetype}. Must include: ${ps.mustIncludeSections.join(", ")}.`,
  };
}

export function buildStitchPromptPlan(
  input: StitchPromptAgentInput,
  bp: BuyerPsychology,
  cs: CreativeStrategy,
  conv: ConversionStrategy,
  sec: SectionStrategy,
): StitchPromptPlan {
  const { business, nichePreset, desiredVariantCount, availableAssets, seoConfig, aiSearchConfig, complianceWarnings } =
    input;
  const serviceArea = business.region ? `${business.city}, ${business.region}` : business.city;
  const assetLines: string[] = [];
  if (availableAssets.logoUrl) assetLines.push(`Logo URL available — use as brand anchor only, no fake redesign claims.`);
  if (availableAssets.heroAssetUrl) assetLines.push(`Hero still/video asset may exist — treat as optional plate, not a fake portfolio project.`);
  assetLines.push(`Gallery images in config: ${availableAssets.galleryCount}; proof images: ${availableAssets.proofCount}.`);
  if (availableAssets.use3DFallback) assetLines.push("3D fallback allowed — must map to the narrative scene, not random geometry.");

  const seoLine = seoConfig?.primaryKeyword
    ? `Primary keyword intent: ${seoConfig.primaryKeyword} — headings and hero must support this without keyword stuffing.`
    : "";
  const aiLine = [
    aiSearchConfig.entitySummary,
    aiSearchConfig.servicesSummary,
    aiSearchConfig.trustSummary,
  ]
    .filter((x) => typeof x === "string" && x.trim())
    .join(" ")
    .slice(0, 220);

  const complianceBlock =
    complianceWarnings.length > 0
      ? [
          "Strict claim safety:",
          ...complianceWarnings.map((w) => `- ${w}`),
          "Do not invent licenses, certifications, same-day guarantees, service radius, financing, response times, or review quotes.",
        ].join("\n")
      : [
          "Claim safety:",
          "Use only facts present in the business brief and intelligence packet.",
          "Do not invent licenses, certifications, same-day guarantees, service radius, financing, response times, review quotes, before/after outcomes, or financing.",
        ].join("\n");

  return {
    promptTitle: `${business.name} — ${nichePreset.label} cinematic landing`,
    projectContext: [
      `${business.name} is a ${nichePreset.label.toLowerCase()} business.`,
      `Focus geography: ${serviceArea} (${business.country}).`,
      ...assetLines,
      seoLine,
      aiLine ? `AI search layer: ${aiLine}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    buyerPsychologyBlock: [
      `Target: ${bp.targetCustomer}`,
      `Pain: ${bp.currentPain}`,
      `Urgency context: ${bp.urgencyLevel}`,
      `Desired outcome: ${bp.desiredOutcome}`,
      `Emotional hook (value frame): ${bp.emotionalHook}`,
      `Fears: ${bp.fears.join("; ")}`,
      `Objections to preempt: ${bp.objections.join("; ")}`,
      `Trust barriers / compliance: ${bp.trustBarriers.join("; ") || "Use only verified proof patterns from assets."}`,
    ].join("\n"),
    visualMetaphorBlock: [
      `Concept: ${cs.conceptName}`,
      `Core metaphor: ${cs.coreMetaphor}`,
      `Visual story: ${cs.visualStory}`,
      `Every visual element must explain problem, solution, trust, or CTA — no ornamental 3D clutter.`,
    ].join("\n"),
    cinematicHeroBlock: [
      `Hero event: ${cs.heroEvent}`,
      `Mood: ${cs.sceneMood}`,
      `Premium signals: ${cs.premiumSignals.join("; ")}`,
      `Explicitly avoid: ${cs.avoidVisuals.join("; ")}`,
    ].join("\n"),
    cameraDepthBlock: [
      `Lighting: ${cs.lightingDirection}`,
      `Depth / composition: ${cs.depthDirection}`,
      `Camera feel: ${cs.cameraFeel}`,
    ].join("\n"),
    motionBlock: cs.motionDirection,
    uiStyleBlock: [
      "Component language: floating glass cards, crisp labels, numeric stress on proof where appropriate.",
      "Typography: high-contrast display + readable body; avoid Inter-only AI slop stacks.",
      "Single accent discipline — derived from brand or neutral steel + one controlled chroma accent.",
    ].join("\n"),
    sectionFlowBlock: [
      `Flow: ${sec.recommendedFlow}`,
      `Section order: ${sec.sectionOrder.join(" → ")}`,
      sec.customSections.length ? `Custom blocks: ${sec.customSections.join(", ")}` : "",
      `Avoid sections: ${sec.sectionsToAvoid.join(", ") || "(none forbidden beyond generic template filler)"}`,
      `Rationale: ${sec.rationale}`,
    ]
      .filter(Boolean)
      .join("\n"),
    conversionBlock: [
      `Primary CTA: ${conv.primaryCTA}`,
      `Secondary CTA: ${conv.secondaryCTA}`,
      `Diagnostic / qualify: ${conv.diagnosticIdea}`,
      `Quote path: ${conv.quoteFlowIdea}`,
      `Trust at CTA: ${conv.trustProofNearCTA}`,
      `After CTA: ${conv.whatHappensNextCopy}`,
    ].join("\n"),
    mobileBlock: [
      "Mobile-first: thumb reach, 48px min tap targets, hero fits 100vh without horizontal scroll.",
      conv.mobileCTAPlan,
      "Reduce motion respects prefers-reduced-motion — swap parallax for opacity/scale micro transitions.",
    ].join("\n"),
    complianceBlock,
    antiTemplateBlock: [
      "Anti-AI-template rules:",
      "- No three generic icons + 'We provide quality service' triptych.",
      "- No purple gradient on white with fake metrics.",
      "- No random blobs, spheres, or 3D assets disconnected from the trade.",
      "- No lorem ipsum; use concise placeholder copy that reflects the actual niche verbs.",
      "- No 'modern clean website' filler — every line must map to buyer job-to-be-done.",
      "- Typography pairing must feel editorial / trade-specific, not default dashboard fonts.",
      "- Stitch / visual tools are design-direction only — not authority for SEO, CRM, analytics, forms, or compliance engines (see app merge layers).",
    ].join("\n"),
    variantRequestBlock: [
      `Generate exactly ${desiredVariantCount} visually distinct landing concepts (minimum 3). Name them:`,
      "1) Safe Conversion Variant — clarity-first, conservative motion.",
      "2) Premium Cinematic Variant — bolder depth/lighting while staying trustworthy.",
      "3) Bold Experimental Variant — unusual layout grid / asymmetry but still legible and on-brand.",
      "Each variant must differ in layout rhythm, hero composition, and accent treatment — not just hue swaps.",
    ].join("\n"),
    outputRequirementsBlock: [
      "Return a structured response with:",
      "- High-level design summary tying metaphor to CTA.",
      `- ${desiredVariantCount} design variants (visual + layout description per variant).`,
      "- Recommended best variant for this business with a short rationale.",
      "- Section-by-section layout notes following the prescribed flow.",
      "- Design-system notes (type, spacing, color logic).",
      "- Motion / 3D scene notes (only if narrative-driven).",
      "- Mobile-specific notes.",
      "- Anti-generic warnings (what to strip if the output feels templated).",
      "- DESIGN.md-style summary: H1 overview, principles, component inventory, responsive behavior, accessibility notes.",
      "End with which variant to build first and why it optimizes trust + conversion for this niche.",
    ].join("\n"),
  };
}

export function buildDeterministicBundle(input: StitchPromptAgentInput): {
  buyerPsychology: BuyerPsychology;
  creativeStrategy: CreativeStrategy;
  conversionStrategy: ConversionStrategy;
  sectionStrategy: SectionStrategy;
  stitchPromptPlan: StitchPromptPlan;
} {
  const buyerPsychology = buildBuyerPsychology(input);
  const creativeStrategy = buildCreativeStrategy(input);
  const conversionStrategy = buildConversionStrategy(input);
  const sectionStrategy = buildSectionStrategy(input);
  const stitchPromptPlan = buildStitchPromptPlan(
    input,
    buyerPsychology,
    creativeStrategy,
    conversionStrategy,
    sectionStrategy,
  );
  return { buyerPsychology, creativeStrategy, conversionStrategy, sectionStrategy, stitchPromptPlan };
}
