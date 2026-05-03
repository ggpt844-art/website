import { z } from "zod";

export const LeadQualificationConfigSchema = z.object({
  enabled: z.boolean(),
  scoreRules: z.array(
    z.object({ id: z.string(), when: z.string(), delta: z.number() }),
  ),
  hotLeadThreshold: z.number(),
  warmLeadThreshold: z.number(),
  scoreLabels: z.object({
    hot: z.string(),
    warm: z.string(),
    low: z.string(),
  }),
});

export const UrgencyRoutingConfigSchema = z.object({
  emergency: z.object({
    showCallNow: z.boolean(),
    phoneStep: z.string(),
    label: z.string(),
  }),
  thisWeek: z.object({ label: z.string() }),
  planning: z.object({ label: z.string() }),
});

export const SpeedToLeadConfigSchema = z.object({
  enabled: z.boolean(),
  hotLeadDashboardAlert: z.boolean(),
  overdueMinutes: z.number(),
  smsProvider: z.enum(["none", "twilio", "future"]),
  templates: z.record(z.string()),
});

export const FollowUpConfigSchema = z.object({
  enabled: z.boolean(),
  sequences: z.array(
    z.object({
      id: z.string(),
      afterMinutes: z.number(),
      template: z.string(),
      channel: z.enum(["dashboard", "email", "sms"]),
    }),
  ),
});

export const ReviewRequestFlowSchema = z.object({
  enabled: z.boolean(),
  gbpReviewLink: z.string(),
  messageTemplates: z.array(z.string()),
  recommendedTiming: z.string(),
  monthlyReviewGoal: z.number(),
  reviewVelocityNotes: z.array(z.string()),
});

export const MissedCallConfigSchema = z.object({
  enabled: z.boolean(),
  messageTemplate: z.string(),
  quoteFlowLink: z.string(),
  provider: z.enum(["none", "twilio", "future"]),
});

export const CtaVariantsSchema = z.object({
  ctaVariants: z.array(
    z.object({ id: z.string(), label: z.string(), isDefault: z.boolean() }),
  ),
});

export const ProofSystemSchema = z.object({
  type: z.enum(["before_after", "gallery", "process_proof", "trust_cards"]),
  images: z.array(z.string()),
  fallbackMode: z.boolean(),
  safetyNotes: z.array(z.string()),
});

export const ConversionConfigSchema = z.object({
  leadQualification: LeadQualificationConfigSchema,
  urgencyRouting: UrgencyRoutingConfigSchema,
  speedToLead: SpeedToLeadConfigSchema,
  followUp: FollowUpConfigSchema,
  reviewRequestFlow: ReviewRequestFlowSchema,
  missedCallTextBack: MissedCallConfigSchema,
  ctaVariants: CtaVariantsSchema,
  proofSystem: ProofSystemSchema,
  thankYouPath: z.string(),
});

export const AnalyticsConfigSchema = z.object({
  enabled: z.boolean(),
  measurementId: z.string().optional(),
  events: z.array(z.string()),
  trafficSourceExample: z.string().optional(),
});

export const PackageConfigSchema = z.object({
  tier: z.enum(["starter", "growth", "premium"]),
  featureFlags: z.record(z.boolean()),
});

export const ReportingConfigSchema = z.object({
  biWeeklyEnabled: z.boolean(),
  lastGeneratedAt: z.string().optional(),
  nextDueAt: z.string().optional(),
});

export const ComplianceConfigSchema = z.object({
  lastScanAt: z.string().optional(),
  warnings: z.array(z.string()),
  severeWarnings: z.array(z.string()),
});

export const TrustConfigSchema = z.object({
  architectureJson: z.record(z.unknown()),
});

export type ConversionConfig = z.infer<typeof ConversionConfigSchema>;
export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;
export type PackageConfig = z.infer<typeof PackageConfigSchema>;
export type ReportingConfig = z.infer<typeof ReportingConfigSchema>;
export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;
export type TrustConfig = z.infer<typeof TrustConfigSchema>;
