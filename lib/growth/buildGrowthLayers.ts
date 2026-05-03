import type {
  AnalyticsConfig,
  ConversionConfig,
  PackageConfig,
  ReportingConfig,
} from "@/lib/growth/schemas";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics/eventTypes";
import { buildPackageConfig } from "@/lib/packages/packages";

export interface BuildGrowthLayersInput {
  nicheSlug: string;
  demoSlug: string;
  packageTier: PackageConfig["tier"];
  proofImageUrls: string[];
}

function leadQualificationForNiche(nicheSlug: string): ConversionConfig["leadQualification"] {
  const base = {
    enabled: true,
    hotLeadThreshold: 80,
    warmLeadThreshold: 55,
    scoreLabels: {
      hot: "High-intent lead",
      warm: "Worth following up",
      low: "Needs nurturing",
    },
  };

  if (["roofing", "pest-control"].includes(nicheSlug)) {
    return {
      ...base,
      scoreRules: [
        { id: "emergency", when: "Emergency leak or storm issue", delta: 30 },
        { id: "photos", when: "Uploaded photos", delta: 20 },
        { id: "service_area", when: "Property in service area (confirmed)", delta: 15 },
        { id: "this_week", when: "Wants inspection this week", delta: 15 },
        { id: "phone", when: "Phone number provided", delta: 10 },
        { id: "roof_age_unknown", when: "Roof age unknown or older", delta: 10 },
        { id: "outside_area", when: "Outside service area", delta: -20 },
        { id: "no_phone", when: "No phone number", delta: -20 },
      ],
    };
  }

  if (nicheSlug === "hvac") {
    return {
      ...base,
      scoreRules: [
        { id: "no_heat_cool", when: "No heat / no cooling emergency", delta: 30 },
        { id: "system_old", when: "System older than 10 years (if stated)", delta: 20 },
        { id: "this_week", when: "Wants service this week", delta: 20 },
        { id: "photo_model", when: "Photo or model number shared", delta: 15 },
        { id: "phone", when: "Phone number provided", delta: 10 },
        { id: "outside_area", when: "Outside service area", delta: -20 },
      ],
    };
  }

  if (nicheSlug === "dentists" || nicheSlug === "orthodontists") {
    return {
      ...base,
      scoreRules: [
        { id: "cosmetic", when: "Cosmetic or treatment consultation interest", delta: 25 },
        { id: "within_30", when: "Wants appointment within 30 days", delta: 20 },
        { id: "financing", when: "Financing interest (if offered)", delta: 15 },
        { id: "phone", when: "Phone number provided", delta: 15 },
        { id: "concern", when: "Treatment concern selected", delta: 10 },
        { id: "no_contact", when: "No reliable contact method", delta: -20 },
      ],
    };
  }

  if (nicheSlug === "med-spas" || nicheSlug === "cosmetic-clinics") {
    return {
      ...base,
      scoreRules: [
        { id: "treatment", when: "Treatment interest selected", delta: 25 },
        { id: "soon", when: "Consultation requested soon", delta: 20 },
        { id: "natural", when: "Natural-results preference stated", delta: 15 },
        { id: "contact", when: "Phone or email provided", delta: 15 },
        { id: "timeline", when: "Budget or timeline entered", delta: 10 },
        { id: "no_contact", when: "No contact method", delta: -20 },
      ],
    };
  }

  return {
    ...base,
    scoreRules: [
      { id: "urgent", when: "Urgent or time-sensitive issue", delta: 25 },
      { id: "photos", when: "Photos or details uploaded", delta: 15 },
      { id: "phone", when: "Phone provided", delta: 15 },
      { id: "this_week", when: "Wants help this week", delta: 15 },
      { id: "no_contact", when: "Missing contact details", delta: -15 },
    ],
  };
}

function ctaVariantsForNiche(nicheSlug: string): ConversionConfig["ctaVariants"] {
  const roofing = [
    { id: "primary", label: "Get a roof inspection request", isDefault: true },
    { id: "leak", label: "Check my leak risk", isDefault: false },
    { id: "photos", label: "Upload photos for a roof quote", isDefault: false },
  ];
  const insulation = [
    { id: "primary", label: "Get an attic assessment request", isDefault: true },
    { id: "efficiency", label: "Check my home efficiency", isDefault: false },
    { id: "heat", label: "See where heat may be escaping", isDefault: false },
  ];
  const dentist = [
    { id: "primary", label: "Book a smile consultation", isDefault: true },
    { id: "options", label: "Find my treatment options", isDefault: false },
    { id: "quiz", label: "Start smile consultation quiz", isDefault: false },
  ];
  const medspa = [
    { id: "primary", label: "Find my treatment fit", isDefault: true },
    { id: "book", label: "Book a consultation", isDefault: false },
    { id: "quiz", label: "Start treatment match quiz", isDefault: false },
  ];

  if (nicheSlug === "roofing") return { ctaVariants: roofing };
  if (nicheSlug === "attic-insulation") return { ctaVariants: insulation };
  if (nicheSlug === "dentists" || nicheSlug === "orthodontists")
    return { ctaVariants: dentist };
  if (nicheSlug === "med-spas" || nicheSlug === "cosmetic-clinics")
    return { ctaVariants: medspa };

  return {
    ctaVariants: [
      { id: "primary", label: "Start the guided request", isDefault: true },
      { id: "alt", label: "Get a written quote request", isDefault: false },
    ],
  };
}

function proofSystem(input: BuildGrowthLayersInput): ConversionConfig["proofSystem"] {
  const hasApproved = input.proofImageUrls.length > 0;
  return {
    type: hasApproved ? "before_after" : "trust_cards",
    images: input.proofImageUrls.slice(0, 6),
    fallbackMode: !hasApproved,
    safetyNotes: hasApproved
      ? ["Only use approved owner-supplied project imagery."]
      : [
          "No approved before/after assets — using trust-focused proof instead.",
          "Never fabricate medical, dental, or med-spa outcome imagery.",
        ],
  };
}

export function buildGrowthLayers(input: BuildGrowthLayersInput): {
  conversion: ConversionConfig;
  analytics: AnalyticsConfig;
  package: PackageConfig;
  reporting: ReportingConfig;
} {
  const qualification = leadQualificationForNiche(input.nicheSlug);
  const ctas = ctaVariantsForNiche(input.nicheSlug);
  const proof = proofSystem(input);

  const conversion: ConversionConfig = {
    leadQualification: qualification,
    urgencyRouting: {
      emergency: {
        showCallNow: true,
        phoneStep: "contact_early",
        label: "Emergency — call or request immediate callback",
      },
      thisWeek: { label: "This week — book inspection or service" },
      planning: { label: "Planning ahead — get a clear estimate path" },
    },
    speedToLead: {
      enabled: true,
      hotLeadDashboardAlert: true,
      overdueMinutes: 45,
      smsProvider: "none",
      templates: {
        hot: "Hot lead: review dashboard and call back.",
        overdue: "Follow-up overdue — lead waiting.",
      },
    },
    followUp: {
      enabled: true,
      sequences: [
        {
          id: "biz_reminder",
          afterMinutes: 30,
          template: "Internal reminder: contact new lead from website.",
          channel: "dashboard",
        },
        {
          id: "customer_nudge",
          afterMinutes: 2880,
          template: "Optional check-in if appointment not booked (manual send only).",
          channel: "email",
        },
      ],
    },
    reviewRequestFlow: {
      enabled: false,
      gbpReviewLink: "",
      messageTemplates: [
        "If you are happy with the visit, a short Google review helps neighbours find us.",
      ],
      recommendedTiming: "After completed visit — only for real customers.",
      monthlyReviewGoal: 4,
      reviewVelocityNotes: ["Never incentivize fake reviews or gate honest feedback."],
    },
    missedCallTextBack: {
      enabled: false,
      messageTemplate:
        "Sorry we missed your call — you can also start a request here: ",
      quoteFlowLink: `/demo/${input.demoSlug}`,
      provider: "none",
    },
    ctaVariants: ctas,
    proofSystem: proof,
    thankYouPath: `/thank-you/${input.demoSlug}`,
  };

  const analytics: AnalyticsConfig = {
    enabled: true,
    events: [...ANALYTICS_EVENT_NAMES],
    trafficSourceExample: "?utm_source=google&utm_medium=organic&utm_campaign=local",
  };

  const reporting: ReportingConfig = {
    biWeeklyEnabled: true,
  };

  const pkg = buildPackageConfig(input.packageTier);

  return { conversion, analytics, package: pkg, reporting };
}
