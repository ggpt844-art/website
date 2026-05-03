import { getNichePreset } from "@/lib/presets/niches";

export function buildManualAiTests(nicheSlug: string, city: string) {
  const n = getNichePreset(nicheSlug);
  return [
    {
      query: `${n.label.toLowerCase()} in ${city}`,
      platform: "Google",
      expectedSignal: "Business entity + service + city coherence",
      notes: "",
    },
    {
      query: `who does ${n.label.toLowerCase()} near ${city}`,
      platform: "Perplexity",
      expectedSignal: "Clear local relevance if indexed post-launch",
      notes: "Demo remains noindex — for future client monitoring only.",
    },
  ];
}
