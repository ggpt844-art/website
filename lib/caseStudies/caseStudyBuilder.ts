import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { Prisma } from "@prisma/client";

export interface CaseStudyDraftInput {
  businessName: string;
  city: string;
  niche: string;
  demoSlug: string | null;
  websiteQualityScore: number | null;
  demoTotalScore: number | null;
  config: DemoConfig | null;
}

export function buildCaseStudyDraftJson(input: CaseStudyDraftInput): Prisma.InputJsonValue {
  const cfg = input.config;
  return {
    headline: `${input.businessName} — local funnel upgrade (${input.city})`,
    summary: [
      `Niche: ${input.niche}. Prior site quality score (latest audit): ${input.websiteQualityScore ?? "n/a"}.`,
      `Demo QA score (latest version): ${input.demoTotalScore ?? "n/a"}.`,
      cfg?.seo
        ? `SEO foundation after upgrade (config): ${cfg.seo.seoFoundationScore}/100.`
        : "Regenerate demo for SEO scoring in case study.",
      cfg?.aiSearch
        ? `AI search readiness (config): ${cfg.aiSearch.aiSearchScore}/100.`
        : null,
      "Conversion: guided quote/diagnostic, optional photos, lead scoring, CRM capture, thank-you flow.",
    ].filter(Boolean),
    demoUrl: input.demoSlug ? `/demo/${input.demoSlug}` : null,
    disclosures: [
      "Figures are internal demo-factory metrics unless backed by client-reported results.",
      "Do not imply guaranteed rankings or AI placement.",
    ],
  };
}

export function defaultCaseStudyTitle(input: CaseStudyDraftInput): string {
  return `${input.businessName} · ${input.city} · growth funnel`;
}
