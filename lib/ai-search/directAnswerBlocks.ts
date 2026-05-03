import { getNichePreset } from "@/lib/presets/niches";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

export function buildDirectAnswerBlocks(
  nicheSlug: string,
  city: string,
  businessName: string,
  intra?: IntraNicheStrategy | null,
) {
  const n = getNichePreset(nicheSlug);
  const focus = intra?.primaryServiceFocus?.trim() || n.label.toLowerCase();
  const quoteAnswer =
    intra?.funnelStyle === "emergency_call_first"
      ? `You can share what is going on (${city}) and optional photos so the team can respond with clear next steps. Nothing commits you to treatment or work until you confirm.`
      : intra?.funnelStyle === "education_first"
        ? `You get short, plain-language context first, then a lightweight form so ${businessName} can respond with options that fit your situation.`
        : "You answer a few short questions, optionally upload photos, and submit your contact details. The team uses that information to follow up with realistic next steps.";
  return [
    {
      question: "What does this business do?",
      answer: `${businessName} focuses on ${focus} for people in and around ${city}.`,
      targetIntent: "informational",
      visibleOnPage: true,
    },
    {
      question: "How does the quote or consult process work?",
      answer: quoteAnswer,
      targetIntent: "quote",
      visibleOnPage: true,
    },
    {
      question: "Can customers upload photos?",
      answer:
        "Yes. Photo upload is optional but helps the team understand the situation before the first conversation.",
      targetIntent: "service",
      visibleOnPage: true,
    },
  ];
}

export function buildFaqAnswerBlocks(faqs: { q: string; a: string }[]) {
  return faqs.map((f) => ({
    question: f.q,
    answer: f.a,
    targetIntent: "informational",
  }));
}
