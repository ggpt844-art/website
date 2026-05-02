export interface AuditExplanation {
  positiveFoundation: string[];
  missedOpportunities: string[];
  howNewVersionFixes: string[];
  clientFacingExplanation: string;
}

const POLITE_OPPORTUNITY_MAP: Record<string, string> = {
  "Phone is not tap-to-call": "Phone number isn't one-tap dialable on mobile",
  "No contact form on page": "No quick contact form on the main page",
  "No photo upload path for faster quotes":
    "No photo-upload option to speed up estimates",
  "No guided quote flow / diagnostic":
    "No guided quote flow that walks visitors through a request",
  "No sticky mobile CTA":
    "No persistent mobile call-to-action while scrolling",
  "Trust signals are weak / not visible":
    "Trust proof (reviews, licensing, warranties) is hard to find",
  "Page copy is very thin": "Limited copy makes it harder for visitors to commit",
  "Page is overloaded with copy":
    "Heavy walls of copy create friction on mobile",
  "Heavy slider/builder code may slow it down":
    "Heavy page builder code can slow first paint on mobile",
};

export function explainAudit(args: {
  positives: string[];
  weaknesses: string[];
}): AuditExplanation {
  const polite = args.weaknesses.map(
    (w) => POLITE_OPPORTUNITY_MAP[w] ?? w,
  );
  const fixes = polite.map((w) => {
    if (/photo/i.test(w))
      return "Demo adds a photo-upload step inside the quote flow.";
    if (/sticky|mobile/i.test(w))
      return "Demo adds a sticky mobile CTA so the path to a quote is always one tap away.";
    if (/quote flow|guided/i.test(w))
      return "Demo introduces a step-by-step quote flow that captures real job details.";
    if (/trust|review|licen/i.test(w))
      return "Demo surfaces trust proof above the fold and again near the CTA.";
    if (/copy|thin|overloaded/i.test(w))
      return "Demo restructures copy into scannable sections built around the buyer's question.";
    if (/slow|builder|slider/i.test(w))
      return "Demo replaces heavy components with optimized motion that doesn't block first paint.";
    return "Demo addresses this with a focused, conversion-first redesign.";
  });

  return {
    positiveFoundation:
      args.positives.length > 0
        ? args.positives
        : ["You already have a presence — that's the foundation we're building on."],
    missedOpportunities: polite.length
      ? polite
      : ["Most of the value is in tightening the path from visitor to quote."],
    howNewVersionFixes: fixes.length
      ? fixes
      : ["The new version focuses entirely on capturing better quote requests."],
    clientFacingExplanation:
      "Your current site has a solid foundation — this version focuses on capturing more of the visitors who are already landing on it, with a clearer path, mobile-first CTA, and a guided quote flow.",
  };
}
