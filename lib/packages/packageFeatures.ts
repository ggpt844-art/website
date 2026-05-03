import type { PackageConfig } from "@/lib/growth/schemas";

export function defaultFeatureFlagsForTier(
  tier: PackageConfig["tier"],
): Record<string, boolean> {
  const starter = {
    premiumLanding: true,
    quoteForm: true,
    stickyMobileCta: true,
    seoFoundation: true,
    aiSearchBasic: true,
    leadInbox: true,
    diagnosticQuiz: false,
    photoUploadFlow: false,
    leadScoring: false,
    urgencyRouting: false,
    localSeoPlan: false,
    aiDirectAnswers: false,
    gbpChecklist: false,
    biWeeklyReport: false,
    serviceCityPagePlans: false,
    croLoop: false,
    reviewFlow: false,
    followUpWorkflow: false,
    caseStudyBuilder: false,
    advancedReporting: false,
    llmsTxtLaunch: false,
    aiCrawlerControls: false,
    bingAiReporting: false,
    freshnessMonitoring: false,
  };

  if (tier === "starter") return starter;

  const growth = {
    ...starter,
    diagnosticQuiz: true,
    photoUploadFlow: true,
    leadScoring: true,
    urgencyRouting: true,
    localSeoPlan: true,
    aiDirectAnswers: true,
    gbpChecklist: true,
    biWeeklyReport: true,
  };

  if (tier === "growth") return growth;

  return {
    ...growth,
    serviceCityPagePlans: true,
    croLoop: true,
    reviewFlow: true,
    followUpWorkflow: true,
    caseStudyBuilder: true,
    advancedReporting: true,
    llmsTxtLaunch: true,
    aiCrawlerControls: true,
    bingAiReporting: true,
    freshnessMonitoring: true,
  };
}
