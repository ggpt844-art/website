import type { DiscoverySource, DiscoveredBusiness } from "../types";
import { APP_CONFIG } from "@/lib/utils/config";

// V1 deterministic stub source. Generates plausible local-business shapes for the
// requested niche/city without hitting any external service. Replace later with
// real source implementations (SERP via Playwright, directories, etc.)
//
// All discovered records are flagged with low confidence and "manual" source so
// that nothing flows to outreach without a human pass.

const NAME_SEEDS = [
  "Northline", "Maple Hill", "Oakridge", "Lakeshore", "Crestmont", "Ironwood",
  "Heritage", "Stonebridge", "Summit", "Canopy", "True North", "Foxhaven",
];

const SUFFIXES_BY_NICHE: Record<string, string[]> = {
  roofing: ["Roofing", "Roofing & Restoration", "Exteriors", "Roof Co"],
  "attic-insulation": ["Insulation", "Attic Pros", "Energy Solutions"],
  hvac: ["HVAC", "Heating & Cooling", "Mechanical"],
  landscaping: ["Landscaping", "Outdoor Living", "Gardens"],
  interlock: ["Interlock", "Stonework", "Hardscapes"],
  concrete: ["Concrete", "Foundations", "Pours"],
  "windows-doors": ["Windows & Doors", "Glass Co", "Window Centre"],
  "pest-control": ["Pest Control", "Pest Services", "Pest Solutions"],
  cleaning: ["Cleaning Co", "Home Clean", "Cleaning Services"],
  dentists: ["Dental", "Family Dental", "Dental Studio"],
  orthodontists: ["Orthodontics", "Smile Studio", "Ortho"],
  "med-spas": ["Med Spa", "Skin & Beauty", "Aesthetics"],
  "tattoo-shops": ["Tattoo Co", "Ink Studio", "Tattoo Studio"],
  barbers: ["Barbers", "Barbershop", "Cuts"],
  "cosmetic-clinics": ["Cosmetic", "Aesthetic Clinic", "Cosmetic Studio"],
  "basement-renovation": ["Basements", "Renovations", "Home Builds"],
  "kitchen-renovation": ["Kitchens", "Renovations", "Cabinet Co"],
  "bathroom-renovation": ["Bathrooms", "Renovations", "Bath Studio"],
};

function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const stubSource: DiscoverySource = {
  name: "stub",
  available: APP_CONFIG.enableStubDiscovery,
  rateLimitMs: 100,
  async search(ctx) {
    const rng = seededRand(`${ctx.city}-${ctx.niche}-${ctx.query}`);
    const suffixes = SUFFIXES_BY_NICHE[ctx.niche] ?? ["Services"];
    const out: DiscoveredBusiness[] = [];
    const count = Math.min(ctx.limit, 12);
    for (let i = 0; i < count; i++) {
      const name = `${NAME_SEEDS[Math.floor(rng() * NAME_SEEDS.length)]} ${
        suffixes[Math.floor(rng() * suffixes.length)]
      }`;
      const hasWebsite = rng() > 0.45;
      const hasSocial = rng() > 0.3;
      out.push({
        name,
        niche: ctx.niche,
        city: ctx.city,
        region: ctx.region ?? "ON",
        country: ctx.country ?? "CA",
        phone: `+1${Math.floor(4000000000 + rng() * 999999999)}`.slice(0, 12),
        websiteUrl: hasWebsite
          ? `https://example-${ctx.niche}-${i}.${ctx.city.toLowerCase().replace(/\s+/g, "")}.local`
          : undefined,
        socialLinks: hasSocial
          ? { facebook: `https://facebook.com/${ctx.niche}-${i}` }
          : undefined,
        rating: 3 + Math.round(rng() * 20) / 10,
        reviewCount: Math.floor(rng() * 200),
        category: ctx.niche,
        source: "manual",
        sourceUrl: `local://stub/${ctx.city}/${ctx.niche}/${i}`,
        confidence: 0.4,
      });
    }
    return out;
  },
};
