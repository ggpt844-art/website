import type {
  AssetStrategy,
  BrandPosition,
  BusinessMaturity,
  BuyerIntent,
  CompetitivePositioning,
  IntraNicheStrategy,
  PricePoint,
} from "./intraNicheTypes";
import type { NichePreset } from "@/lib/presets/types";
import type { AssetProfileJson } from "@/lib/assets/types";

export interface GenerateIntraNicheInput {
  niche: NichePreset;
  businessName: string;
  city: string;
  category: string | null;
  weaknesses: string[];
  rating: number | null;
  reviewCount: number | null;
  websiteUrl: string | null;
  assetProfile: AssetProfileJson | null;
  /** Optional audit / packet string context */
  intelligenceSummary?: string | null;
}

function textBlob(i: GenerateIntraNicheInput): string {
  const packet = i.intelligenceSummary ?? "";
  return [i.businessName, i.category ?? "", i.niche.label, ...i.weaknesses, packet]
    .join(" ")
    .toLowerCase();
}

function inferMaturity(i: GenerateIntraNicheInput): BusinessMaturity {
  const rc = i.reviewCount ?? 0;
  const cat = (i.category ?? "").toLowerCase();
  if (/multi|locations|franchise/i.test(cat) || /multiple locations/i.test(textBlob(i))) {
    return "multi_location";
  }
  if (rc >= 120 && (i.rating ?? 0) >= 4.3) return "established_local";
  if (rc >= 40) return "small_local";
  if (rc > 0 && rc < 15) return "solo_operator";
  return "unknown";
}

function inferPricePoint(t: string): PricePoint {
  if (/luxury|high.end|executive/i.test(t)) return "luxury";
  if (/premium|boutique/i.test(t)) return "premium";
  if (/budget|affordable|cheap|discount/i.test(t)) return "budget";
  return "mid-market";
}

function buildAssetStrategy(profile: AssetProfileJson | null): AssetStrategy {
  if (!profile) {
    return {
      assetQuality: "none",
      assetTypesAvailable: [],
      visualApproach: "abstract_cinematic",
      proofPlacement: "Defer heavy proof to trust strip; cinematic hero for mood.",
      assetRisks: ["No verified gallery — avoid fake project photos."],
      recommendedAssetRequests: ["Logo", "one hero still", "3 real job photos if allowed"],
    };
  }
  const q = profile.assetQualityScore ?? 0;
  const gal = profile.galleryImages?.length ?? 0;
  const ba = profile.beforeAfterCandidates?.length ?? 0;
  const types: string[] = [];
  if (profile.logoUrl) types.push("logo");
  if (gal) types.push("gallery");
  if (ba) types.push("beforeAfterCandidates");
  const quality: AssetStrategy["assetQuality"] =
    q >= 75 ? "strong" : q >= 50 ? "decent" : q >= 25 ? "weak" : "none";
  let visualApproach: AssetStrategy["visualApproach"] = "hybrid_photo_cinematic";
  if (quality === "strong" && gal >= 3) visualApproach = "real_photo_led";
  else if (quality === "weak" || quality === "none") visualApproach = "abstract_cinematic";

  return {
    assetQuality: quality,
    assetTypesAvailable: types,
    visualApproach,
    proofPlacement:
      quality === "strong"
        ? "Lead with real proof/gallery early after hero."
        : "Cinematic hero; proof as cards — no fabricated before/after.",
    assetRisks:
      quality === "weak"
        ? ["Weak assets — do not fabricate jobs or results."]
        : [],
    recommendedAssetRequests:
      quality === "strong" ? [] : ["Request 3–5 dated project photos with permission"],
  };
}

function competitive(
  sub: string,
  pattern: string,
  different: string,
  cliches: string[],
  angle: string,
  gap: string,
  risk: string,
): CompetitivePositioning {
  return {
    competitorPattern: pattern,
    howThisDemoShouldFeelDifferent: different,
    overusedNicheClichesToAvoid: cliches,
    uniqueAngle: angle,
    marketGap: gap,
    positioningRisk: risk,
  };
}

/** Classify and build full intra-niche strategy (deterministic; no invented business facts). */
export function generateIntraNicheStrategy(input: GenerateIntraNicheInput): IntraNicheStrategy {
  const t = textBlob(input);
  const assumptions: string[] = [];
  const parentSlug = input.niche.slug;
  let parentNiche = parentSlug;
  let subNiche = "unknown";
  let buyerIntent: BuyerIntent = "routine";
  let urgencyLevel = "exploratory";
  let trustBarrier = "Trust and clarity";
  let brandPosition: BrandPosition = "local-friendly";
  let proofTypeNeeded = "reviews";
  let offerType = "structured consultation";
  let funnelStyle = "consultation_first";
  let visualMetaphor = input.niche.visualDirection ?? "Concept-native local craft";
  let flowArchetype = "local_authority";
  let ctaStrategy = input.niche.primaryCTA;
  let sectionsToPrioritize: string[] = ["hero", "services", "trustStrip", "finalCTA"];
  let sectionsToAvoid: string[] = [];
  let copyTone = "direct, local, clear";
  let visualTone = "cinematic but grounded";
  let conversionAngle = "Qualified request with clear next step";
  let primaryServiceFocus = input.niche.label;
  const secondaryServiceFocuses: string[] = [];
  let positioning = competitive(
    "generic",
    "Many local sites reuse the same template order and CTAs.",
    "Differentiate by buyer moment, urgency, and proof style — not random visuals.",
    ["Generic three-icon rows", "stock smiles", "vague free quotes"],
    "Clarify the specific buyer job-to-be-done for this listing.",
    "Differentiation without invented claims.",
    "Overfitting to luxury tone when business is everyday local.",
  );

  const maturity = inferMaturity(input);
  const pricePoint = inferPricePoint(t);
  if (maturity === "unknown") assumptions.push("Business maturity inferred from review volume only.");

  // —— Dental ——
  if (parentSlug === "dentists" || parentSlug === "orthodontists") {
    parentNiche = "dental";
    if (/emergency|toothache|pain|knocked|urgent|bleeding/i.test(t)) {
      subNiche = "emergency_dentist";
      buyerIntent = "urgent";
      urgencyLevel = "emergency";
      trustBarrier = "Pain, speed, availability, anxiety";
      brandPosition = "comfort-first";
      proofTypeNeeded = "process clarity";
      funnelStyle = "emergency_call_first";
      flowArchetype = "emergency_conversion";
      visualMetaphor = "Calm relief / fast help pathway — no horror imagery";
      ctaStrategy = "Request Emergency Dental Help";
      sectionsToPrioritize = [
        "hero",
        "diagnosticTool",
        "photoUploadQuoteFlow",
        "trustStrip",
        "faq",
        "finalCTA",
      ];
      sectionsToAvoid = ["long luxury storytelling before CTA"];
      copyTone = "calm, direct, urgent, reassuring";
      positioning = competitive(
        subNiche,
        "Emergency dental pages either panic-stack or feel corporate.",
        "Immediate control: issue capture + what happens next + reassurance.",
        ["scary tooth macros", "unsupported same-day guarantees"],
        "Triage-first hero with empathetic copy.",
        "Parents and workers need fast clarity, not brand essays.",
        "Claiming response times not verified in data.",
      );
    } else if (/implant/i.test(t)) {
      subNiche = "dental_implants";
      buyerIntent = "high-trust";
      urgencyLevel = "planned";
      trustBarrier = "Cost, surgery anxiety, provider expertise";
      brandPosition = "clinical-expert";
      proofTypeNeeded = "provider credentials if verified";
      funnelStyle = "consultation_first";
      flowArchetype = "premium_consultation";
      visualMetaphor = "Stability / precision restoration — calm clinical depth";
      ctaStrategy = "Book an Implant Consultation";
      sectionsToPrioritize = ["hero", "problemVisualization", "services", "proof", "process", "faq", "finalCTA"];
      copyTone = "expert, calm, process-driven";
      positioning = competitive(
        subNiche,
        "Implant pages often vanity-smile or fear-sell.",
        "Process-led consult pathway; no fake outcomes.",
        ["guaranteed results", "fake before/after"],
        "Restoration story + consult steps + verified proof only.",
        "High-ticket buyers need mechanics, not hype.",
        "Overpromising on financing or timelines.",
      );
    } else if (/invisalign|clear aligner|brace/i.test(t) || parentSlug === "orthodontists") {
      subNiche = parentSlug === "orthodontists" ? "invisalign_orthodontics" : "invisalign_orthodontics";
      buyerIntent = "comparison-shopping";
      urgencyLevel = "exploratory";
      trustBarrier = "Cost, length of treatment, lifestyle fit";
      funnelStyle = "education_first";
      flowArchetype = "education_first";
      visualMetaphor = "Alignment journey / confident progress path";
      ctaStrategy = "Check If Invisalign Fits My Smile";
      copyTone = "clean, modern, confidence-building";
      positioning = competitive(
        subNiche,
        "Orthodontic landers look like appliance catalogs.",
        "Education-first: fit, lifestyle, honest timelines.",
        ["instant transformation promises"],
        "Fit quiz + compare + consult CTA.",
        "Buyers compare multiple providers — earn trust with clarity.",
        "Over-clinical jargon without human reassurance.",
      );
    } else if (/cosmetic|veneer|whitening|smile design/i.test(t)) {
      subNiche = "cosmetic_dentist";
      buyerIntent = "aspirational";
      flowArchetype = "premium_consultation";
      visualMetaphor = "Precision confidence / natural smile refinement";
      ctaStrategy = "Start My Smile Consultation";
      copyTone = "polished, reassuring, honest aspiration";
      positioning = competitive(
        subNiche,
        "Cosmetic dental sites use fake celebrity smiles.",
        "Natural-result reassurance + consult-led path.",
        ["fake perfect teeth", "pressure tactics"],
        "Smile goals module + options + provider proof if verified.",
        "Fear of looking overdone.",
        "Luxury tone when practice is family-first general.",
      );
    } else if (/pediatric|kids|children/i.test(t)) {
      subNiche = "pediatric_dentist";
      buyerIntent = "routine";
      brandPosition = "family-safe";
      flowArchetype = "premium_consultation";
      visualMetaphor = "Gentle care / kid-safe confidence";
      ctaStrategy = "Book a Child-Friendly Visit";
      copyTone = "warm, parent-focused, gentle";
      positioning = competitive(
        subNiche,
        "Pediatric pages can feel clinical or childish.",
        "Parent reassurance + gentle visual language.",
        ["scary instruments", "cold clinical stock"],
        "First-visit story + comfort + FAQ.",
        "Parents need safety and empathy signals.",
        "Infant-specific claims without verification.",
      );
    } else if (/family/i.test(t)) {
      subNiche = "family_dentist";
      buyerIntent = "routine";
      flowArchetype = "local_authority";
      visualMetaphor = "Warm local care / simple new patient path";
      ctaStrategy = "Book a New Patient Visit";
      copyTone = "friendly, local, simple";
      positioning = competitive(
        subNiche,
        "Family practices often read as generic corporate dental.",
        "Local trust + new-patient clarity.",
        ["luxury-only framing"],
        "New patient path + insurance/payment clarity if verified.",
        "Convenience and continuity matter more than gloss.",
        "Over-premium visuals for neighbourhood practice.",
      );
    } else {
      subNiche = "general_dentist";
      buyerIntent = "routine";
      flowArchetype = "premium_consultation";
      visualMetaphor = "Precision confidence under clean light";
      ctaStrategy = "Book a Dental Visit";
    }
  }

  // —— Roofing ——
  if (parentSlug === "roofing") {
    parentNiche = "roofing";
    if (/storm|leak|emergency|active leak|today|asap/i.test(t)) {
      subNiche = "emergency_roof_repair";
      buyerIntent = "urgent";
      urgencyLevel = "emergency";
      flowArchetype = "emergency_conversion";
      funnelStyle = "emergency_call_first";
      visualMetaphor = "Storm protection / leak containment narrative";
      ctaStrategy = "Upload Photos for a Roof Leak Check";
      sectionsToPrioritize = ["hero", "photoUploadQuoteFlow", "diagnosticTool", "trustStrip", "finalCTA"];
      positioning = competitive(
        subNiche,
        "Roofers use interchangeable storm stock and badges.",
        "Photo-led severity check + inspection path — no fake warranties.",
        ["fake lifetime badges", "unsubstantiated same-day"],
        "Leak check + transparency on next steps.",
        "Storm buyers need triage, not history essays.",
        "Emergency claims without verified service data.",
      );
    } else if (/metal|architectural shingle/i.test(t)) {
      subNiche = "metal_roofing";
      buyerIntent = "aspirational";
      flowArchetype = "portfolio_led";
      visualMetaphor = "Durable architectural upgrade / refined material depth";
      ctaStrategy = "Explore Metal Roofing Options";
      positioning = competitive(
        subNiche,
        "Metal roofing pages look like supplier brochures.",
        "Portfolio + benefit narrative with honest scope.",
        ["generic roof stock only"],
        "Material story + gallery + consult.",
        "Premium buyers compare longevity and noise.",
        "Overstating efficiency without data.",
      );
    } else if (/flat|commercial|tar/i.test(t)) {
      subNiche = "commercial_roofing";
      buyerIntent = "high-trust";
      brandPosition = "technical-authority";
      flowArchetype = "local_authority";
      funnelStyle = "consultation_first";
      visualMetaphor = "Technical waterproofing / membrane system clarity";
      ctaStrategy = "Request a Commercial Roof Assessment";
      positioning = competitive(
        subNiche,
        "Commercial roof pages echo residential storm rhetoric.",
        "Inspection + maintenance + downtime awareness.",
        ["residential storm hero on commercial pitch"],
        "Technical proof + SLA-style process wording (no false promises).",
        "Facility managers need competence signals.",
        "Blurring residential and commercial proof.",
      );
    } else {
      subNiche = "residential_roof_replacement";
      buyerIntent = "high-trust";
      flowArchetype = "education_first";
      visualMetaphor = "Long-term home protection / shield metaphor";
      ctaStrategy = "Get a Written Roof Replacement Estimate";
      positioning = competitive(
        subNiche,
        "Replacement roofers look identical — roof photo + form.",
        "Education on scope + warranty if verified + process gallery.",
        ["unverified award seals"],
        "Written estimate CTA + material clarity.",
        "Owners fear change orders — show process honesty.",
        "Fabricating warranty terms.",
      );
    }
  }

  // —— HVAC ——
  if (parentSlug === "hvac") {
    parentNiche = "hvac";
    if (/no heat|no cool|furnace down|ac down|emergency|same day/i.test(t)) {
      subNiche = "emergency_hvac";
      buyerIntent = "urgent";
      flowArchetype = "emergency_conversion";
      funnelStyle = "emergency_call_first";
      visualMetaphor = "Comfort recovery / temperature stabilizing";
      ctaStrategy = "Request Urgent HVAC Help";
      positioning = competitive(
        subNiche,
        "HVAC emergency pages spam RED CTAs.",
        "Calm triage + issue capture; verify emergency claims in copy.",
        ["fake 24/7 without proof"],
        "System context capture + realistic next step.",
        "Fear of surprise bills.",
        "Emergency rhetoric when business is install-only.",
      );
    } else if (/heat pump/i.test(t)) {
      subNiche = "heat_pump_installation";
      buyerIntent = "education-first";
      flowArchetype = "education_first";
      visualMetaphor = "Efficient comfort transition / home energy story";
      ctaStrategy = "Check If a Heat Pump Fits My Home";
      positioning = competitive(
        subNiche,
        "Heat pump landers overpromise savings.",
        "Fit education + incentive mention only if verified.",
        ["fake 40% savings"],
        "Climate fit framing + consult.",
        "Buyers fear wrong-size systems.",
        "Inventing rebate amounts.",
      );
    } else if (/maintenance|tune|plan/i.test(t)) {
      subNiche = "maintenance_plan";
      buyerIntent = "maintenance/prevention";
      flowArchetype = "education_first";
      funnelStyle = "maintenance_plan_flow";
      visualMetaphor = "Protection through disciplined upkeep";
      ctaStrategy = "Explore Maintenance Plans";
    } else {
      subNiche = "hvac_installation";
      flowArchetype = "education_first";
      visualMetaphor = "Comfort control / balanced airflow story";
      ctaStrategy = "Schedule a Home Comfort Assessment";
    }
  }

  // —— Med spa ——
  if (parentSlug === "med-spas" || parentSlug === "cosmetic-clinics") {
    parentNiche = "med_spa";
    if (/botox|inject|neurotoxin/i.test(t)) {
      subNiche = "botox_injectables";
      buyerIntent = "high-trust";
      flowArchetype = "premium_consultation";
      visualMetaphor = "Refined precision / subtle confidence";
      ctaStrategy = "Find My Treatment Fit";
      positioning = competitive(
        subNiche,
        "Injectables marketing uses frozen-face clichés.",
        "Natural movement + provider-led consult.",
        ["exaggerated beauty claims", "fake before/after"],
        "Treatment match + safety + consult-first.",
        "Fear of looking overfilled.",
        "Medical outcome guarantees.",
      );
    } else if (/laser|ipl|skin resurfac/i.test(t)) {
      subNiche = "laser_treatments";
      buyerIntent = "education-first";
      flowArchetype = "education_first";
      visualMetaphor = "Controlled light / skin clarity";
      ctaStrategy = "Start a Skin Consultation";
    } else {
      subNiche = "unknown_med_spa";
      flowArchetype = "premium_consultation";
      ctaStrategy = "Book a Consultation";
    }
  }

  // —— Attic insulation ——
  if (parentSlug === "attic-insulation") {
    parentNiche = "insulation";
    subNiche = "attic_insulation";
    buyerIntent = "education-first";
    flowArchetype = "education_first";
    funnelStyle = "education_first";
    visualMetaphor = "Thermal containment / escaping heat made visible";
    ctaStrategy = "Start My Attic Efficiency Check";
    positioning = competitive(
      subNiche,
      "Attic pages show cartoon heat blobs.",
      "Honest efficiency story + assessment CTA — rebates only if verified.",
      ["fake R-value savings percentages"],
      "Attic check + process + proof if photos exist.",
      "Homeowners confused about stack effect.",
      "Inventing utility savings.",
    );
  }

  // —— Landscaping / interlock ——
  if (parentSlug === "landscaping" || parentSlug === "interlock") {
    parentNiche = "landscaping";
    subNiche = parentSlug === "interlock" ? "interlock_hardscape" : "landscaping_design_build";
    buyerIntent = "transformation-focused";
    flowArchetype = "portfolio_led";
    visualMetaphor = "Outdoor transformation / terrain layers";
    ctaStrategy = "Plan My Outdoor Project";
    positioning = competitive(
      subNiche,
      "Landscaping sites are stock lawn icon rows.",
      "Planner + portfolio rhythm; real project proof when available.",
      ["fake portfolio renders passed as photos"],
      "Materials + timeline honesty.",
      "Fear of contractor ghosting.",
      "Showcasing projects not performed by business.",
    );
  }

  // Maturity tone nudges
  if (maturity === "solo_operator" && (brandPosition as BrandPosition) === "premium/luxury") {
    brandPosition = "local-friendly";
    assumptions.push("Downshifted brand position toward local-friendly for likely solo operator.");
  }
  if (maturity === "premium_authority") {
    brandPosition = brandPosition === "local-friendly" ? "premium/luxury" : brandPosition;
    visualTone = "editorial depth, calm premium";
  }

  const assetStrategy = buildAssetStrategy(input.assetProfile);
  let confidence = 72;
  if (assumptions.length) confidence -= 8 * assumptions.length;
  if (subNiche.startsWith("unknown")) {
    confidence -= 12;
    assumptions.push("Sub-niche inferred loosely from text; verify with owner.");
  }
  confidence = Math.max(38, Math.min(96, confidence));

  const differentiationRationale = `${subNiche} in ${input.city}: ${buyerIntent} intent, ${flowArchetype.replace(/_/g, " ")} flow, proof via ${proofTypeNeeded}.`;

  return {
    parentNiche,
    subNiche,
    primaryServiceFocus,
    secondaryServiceFocuses,
    buyerIntent,
    urgencyLevel,
    pricePoint,
    trustBarrier,
    brandPosition,
    proofTypeNeeded,
    offerType,
    funnelStyle,
    visualMetaphor,
    flowArchetype,
    ctaStrategy,
    sectionsToPrioritize,
    sectionsToAvoid,
    copyTone,
    visualTone,
    conversionAngle,
    differentiationRationale,
    assumptions,
    confidence,
    competitivePositioning: positioning,
    businessMaturity: maturity,
    assetStrategy,
  };
}
