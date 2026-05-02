import type { NichePreset } from "@/lib/presets/types";
import type { ConversionStrategy } from "./conversionStrategist";

export interface DemoCopy {
  heroHeadline: string;
  heroSubheadline: string;
  problemTitle: string;
  problemBody: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  faqs: { q: string; a: string }[];
  trustStrip: string[];
  servicesHeadline: string;
  proofHeadline: string;
  processHeadline: string;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function writeCopy(args: {
  niche: NichePreset;
  city: string;
  businessName: string;
  strategy: ConversionStrategy;
}): DemoCopy {
  const { niche, city, businessName, strategy } = args;
  const vars = { city, businessName };
  return {
    heroHeadline: fill(niche.heroFormula.headline, vars),
    heroSubheadline: fill(niche.heroFormula.subheadline, vars),
    problemTitle: fill(niche.problem.title, vars),
    problemBody: fill(niche.problem.body, vars),
    finalCtaTitle: fill(niche.finalCta.title, vars),
    finalCtaBody: fill(niche.finalCta.body, vars),
    faqs: niche.faqs,
    trustStrip: [
      "Free written estimate",
      "Local crew",
      "Photo-documented work",
      strategy.riskReducers[0] ?? "No-pressure consult",
    ],
    servicesHeadline: `What ${businessName} actually does — clearly.`,
    proofHeadline: `Real work, real ${city.toLowerCase()} clients.`,
    processHeadline: "What happens after you click the button.",
  };
}
