import { getNichePreset } from "@/lib/presets/niches";

export interface CompetitorGapOutput {
  competitorGap: string;
  differentiationAngle: string;
  competitors: { name: string; note: string }[];
}

export function inferCompetitorGap(args: {
  niche: string;
  city: string;
}): CompetitorGapOutput {
  const niche = getNichePreset(args.niche);
  return {
    competitorGap: `Most ${niche.label.toLowerCase()} sites in ${args.city} are basic brochure sites with no guided quote flow.`,
    differentiationAngle: `Position this business as the faster, more modern option — diagnostic lead magnet (${niche.leadMagnet}) + photo-upload quote path.`,
    competitors: [],
  };
}
