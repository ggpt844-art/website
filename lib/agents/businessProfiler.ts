import { getNichePreset } from "@/lib/presets/niches";

export interface BusinessProfileInput {
  name: string;
  niche: string;
  city: string;
  websiteText?: string;
  rating?: number | null;
  reviewCount?: number | null;
}

export interface BusinessProfileOutput {
  businessType: string;
  targetCustomer: string;
  highValueServices: string[];
  serviceArea: string;
  trustNeeds: string[];
  likelyBuyerIntent: string;
}

export function profileBusiness(input: BusinessProfileInput): BusinessProfileOutput {
  const preset = getNichePreset(input.niche);
  return {
    businessType: preset.label,
    targetCustomer: `Local ${input.city} homeowners and property owners with active needs around ${preset.label.toLowerCase()}.`,
    highValueServices: preset.highValueServices,
    serviceArea: `${input.city} and surrounding area`,
    trustNeeds: preset.trustPoints,
    likelyBuyerIntent: preset.buyerPains.slice(0, 3).join("; "),
  };
}
