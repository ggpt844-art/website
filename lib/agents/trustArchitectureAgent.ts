export interface TrustArchitectureInput {
  nicheSlug: string;
  buyerPain: string;
  services: string[];
  hasVerifiedLicense?: boolean;
  hasRealReviews: boolean;
}

export interface TrustArchitectureOutput {
  buyerFears: string[];
  trustProofNeeded: string[];
  safeClaims: string[];
  claimsToAvoid: string[];
  riskReducers: string[];
  proofPlacementPlan: string[];
  noPressureCopy: string;
  whatHappensNextCopy: string;
}

export function trustArchitectureAgent(input: TrustArchitectureInput): TrustArchitectureOutput {
  const contractor = [
    "roofing",
    "attic-insulation",
    "hvac",
    "landscaping",
    "interlock",
    "concrete",
    "windows-doors",
    "pest-control",
    "cleaning",
    "basement-renovation",
    "kitchen-renovation",
    "bathroom-renovation",
  ].includes(input.nicheSlug);

  const buyerFears = contractor
    ? [
        "Paying more than necessary",
        "Being pushed into work they do not need",
        "Slow callbacks after requesting a quote",
        "Messy or unclear process",
      ]
    : [
        "Uncertainty about options",
        "Pressure to decide too fast",
        "Cost surprises",
        "Not knowing what happens next",
      ];

  const trustProofNeeded = contractor
    ? ["Local proof of work", "Clear written quote path", "Process in plain language"]
    : ["Consultation-first language", "Clear next steps", "Honest scope discussion"];

  const safeClaims = [
    "Guided online flow to capture your situation",
    "No obligation to proceed after the first conversation",
  ];
  if (input.hasRealReviews) safeClaims.push("Customer reviews shown where available");
  if (input.hasVerifiedLicense) safeClaims.push("Licensing details provided where verified");

  const claimsToAvoid = [
    "Best in the city",
    "Guaranteed same-day service",
    "Guaranteed outcomes",
    "Pain-free results",
  ];
  if (!input.hasVerifiedLicense) claimsToAvoid.push("Licensed & insured (until verified with owner)");

  return {
    buyerFears,
    trustProofNeeded,
    safeClaims,
    claimsToAvoid,
    riskReducers: [
      "Photo upload is optional but helps accuracy",
      "You choose whether to book after you understand options",
    ],
    proofPlacementPlan: ["Hero micro-proof", "Mid-page process", "Pre-CTA reassurance"],
    noPressureCopy:
      "This is a consultation-first flow. You are not committing to work by submitting the form — you are asking for clarity on next steps.",
    whatHappensNextCopy:
      "The team reviews your answers and photos (if any), then follows up with realistic options — no surprises about how contact works.",
  };
}
