const NICHE_QUERY_VARIANTS: Record<string, string[]> = {
  roofing: ["{niche} contractor", "roof repair", "emergency roof repair", "roof replacement"],
  "attic-insulation": ["attic insulation", "insulation contractor", "spray foam attic"],
  hvac: ["HVAC repair", "furnace repair", "AC repair", "HVAC contractor"],
  landscaping: ["landscaping", "landscape designer", "backyard design"],
  interlock: ["interlock contractor", "interlock driveway", "interlock patio"],
  concrete: ["concrete contractor", "concrete driveway", "concrete steps"],
  "windows-doors": ["window replacement", "door installation", "windows and doors"],
  "pest-control": ["pest control", "exterminator", "wasp removal"],
  cleaning: ["house cleaning", "cleaning service", "move-in cleaning"],
  dentists: ["dentist", "family dentist", "cosmetic dentist"],
  orthodontists: ["orthodontist", "Invisalign", "braces"],
  "med-spas": ["med spa", "Botox", "skin clinic"],
  "tattoo-shops": ["tattoo shop", "custom tattoo", "tattoo artist"],
  barbers: ["barber shop", "men's haircut", "beard trim"],
  "cosmetic-clinics": ["cosmetic clinic", "aesthetic clinic", "skin clinic"],
  "basement-renovation": ["basement renovation", "basement contractor", "basement apartment"],
  "kitchen-renovation": ["kitchen renovation", "kitchen contractor", "kitchen remodel"],
  "bathroom-renovation": ["bathroom renovation", "bathroom remodel", "bathroom contractor"],
};

export function buildQueries(niche: string, city: string): string[] {
  const variants = NICHE_QUERY_VARIANTS[niche] ?? [niche];
  return variants.map((v) => `${v.replace("{niche}", niche)} ${city}`);
}
