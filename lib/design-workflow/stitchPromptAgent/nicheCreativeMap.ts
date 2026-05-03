export interface NicheCreativePreset {
  coreMetaphor: string;
  heroEvent: string;
  sceneMood: string;
  avoidVisuals: string[];
}

const DEFAULT: NicheCreativePreset = {
  coreMetaphor: "Local craft precision — the work speaks before the slogan",
  heroEvent:
    "A clear focal moment tied to the buyer problem, with a single diagnostic or CTA card that explains the next step",
  sceneMood: "Cinematic restraint — depth, contrast, and purpose; no decorative noise",
  avoidVisuals: [
    "Generic three-icon feature row with lorem",
    "Random floating 3D objects unrelated to the job",
    "Stock people pointing at nothing",
  ],
};

/** Niche-specific creative direction for cinematic Stitch prompts (reference only). */
export const NICHE_CREATIVE: Record<string, NicheCreativePreset> = {
  roofing: {
    coreMetaphor: "Protection against storm pressure — roof plane as shield",
    heroEvent:
      "Rain strikes an angled roof plane; a leak-risk hotspot reads as a subtle heat map; photo-upload / inspection card invites documented assessment",
    sceneMood: "Weather tension without panic — urgency from clarity, not fear-mongering",
    avoidVisuals: [
      "Generic house silhouette icon",
      "Random rain effects with no story",
      "Fake lifetime warranty or ‘#1 roofer’ badges",
      "Unverified same-day install claims",
    ],
  },
  "attic-insulation": {
    coreMetaphor: "Thermal containment — escaping heat becomes visible, then contained",
    heroEvent:
      "Heat trails escape the attic cutaway; an insulation layer visually contains warmth; energy-loss / efficiency card ties to diagnostic CTA",
    sceneMood: "Technical warmth — FLIR-adjacent readout, calm camera",
    avoidVisuals: [
      "Cartoon cutaway house",
      "Random orange heat blobs",
      "Fabricated savings percentages or guaranteed bill drops",
    ],
  },
  hvac: {
    coreMetaphor: "Comfort control — airflow finds balance through the home",
    heroEvent:
      "Airflow paths stabilize across a home silhouette; a comfort / diagnostic card anchors next step",
    sceneMood: "Clean mechanical clarity — breathable negative space",
    avoidVisuals: [
      "Generic fan or snowflake clipart",
      "Fake emergency ‘call now’ gimmicks unless verified in source data",
    ],
  },
  dentists: {
    coreMetaphor: "Precision confidence — light reveals structure, not fear",
    heroEvent:
      "Soft enamel / smile arc under controlled clinical light; consultation path card (never diagnosis claims)",
    sceneMood: "Calm clinical premium — glass, soft gradient, no horror tropes",
    avoidVisuals: [
      "Scary teeth macros",
      "Fake perfect celebrity smiles implied as results",
      "Guaranteed outcomes or medical promises",
    ],
  },
  orthodontists: {
    coreMetaphor: "Aligned confidence — disciplined progression",
    heroEvent:
      "Subtle arch / wire abstraction as sculptural light; consult booking card",
    sceneMood: "Clinical calm with editorial typography",
    avoidVisuals: ["Before/after without verified consent context", "‘Instant smile’ hype"],
  },
  "med-spas": {
    coreMetaphor: "Refined confidence — glow as discipline, not excess",
    heroEvent:
      "Soft sculptural light with treatment-match card; luxury motion without clutter",
    sceneMood: "Muted luxe — slow parallax, restrained palette",
    avoidVisuals: [
      "Fake before/after",
      "Exaggerated beauty claims",
      "Medical guarantees or treatment outcomes",
    ],
  },
  landscaping: {
    coreMetaphor: "Outdoor transformation — terrain and layers assemble into place",
    heroEvent:
      "Terrain / patio strata build toward a project estimate or consult card",
    sceneMood: "Golden-hour depth without postcard cliché",
    avoidVisuals: ["Generic lawn icon trio", "Fake portfolio photos"],
  },
  interlock: {
    coreMetaphor: "Structured outdoor craft — pattern and weight",
    heroEvent:
      "Interlock planes lock into perspective; quote or measurement card",
    sceneMood: "Material-forward — stone texture, low sun",
    avoidVisuals: ["Clip-art pavers", "Unverified ‘award-winning’ seals"],
  },
};

export function getNicheCreative(slug: string): NicheCreativePreset {
  return NICHE_CREATIVE[slug] ?? DEFAULT;
}
