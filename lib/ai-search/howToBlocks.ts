import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

export function buildHowToBlocks(nicheLabel: string, intra?: IntraNicheStrategy | null) {
  const label = intra?.primaryServiceFocus?.trim() || nicheLabel;
  const title =
    intra?.buyerIntent === "urgent"
      ? `How to get fast help: ${label}`
      : intra?.buyerIntent === "education-first"
        ? `How to explore options for ${label.toLowerCase()}`
        : `How to request a quote for ${nicheLabel}`;

  return [
    {
      title,
      steps: [
        "Choose the issue or goal from the guided form.",
        "Select urgency or timeline when asked.",
        "Upload photos if they help explain the situation.",
        "Submit contact details so the business can respond.",
        "Expect a follow-up with next steps — no obligation to proceed.",
      ],
    },
  ];
}
