import type { z } from "zod";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";
import { KeywordIntentSchema } from "./seoTypes";

type Intent = z.infer<typeof KeywordIntentSchema>;

const SERVICE_LABELS: Record<string, string> = {
  roofing: "roof repair",
  "attic-insulation": "attic insulation",
  hvac: "HVAC repair",
  landscaping: "landscaping",
  interlock: "interlock",
  concrete: "concrete contractor",
  "windows-doors": "window replacement",
  "pest-control": "pest control",
  cleaning: "house cleaning",
  dentists: "dentist",
  orthodontists: "orthodontist",
  "med-spas": "med spa",
  "tattoo-shops": "tattoo shop",
  barbers: "barber shop",
  "cosmetic-clinics": "cosmetic clinic",
  "basement-renovation": "basement renovation",
  "kitchen-renovation": "kitchen renovation",
  "bathroom-renovation": "bathroom renovation",
};

function subNicheMoneyKeywords(subNiche: string, city: string): string[] {
  const c = city;
  const table: Record<string, string[]> = {
    emergency_roof_repair: [`emergency roof repair ${c}`, `roof leak ${c}`, `storm roof damage ${c}`],
    residential_roof_replacement: [`roof replacement ${c}`, `new roof ${c}`, `roofing contractor ${c}`],
    metal_roofing: [`metal roofing ${c}`, `standing seam roof ${c}`],
    commercial_roofing: [`commercial roofing ${c}`, `flat roof repair ${c}`],
    emergency_dentist: [`emergency dentist ${c}`, `urgent dental care ${c}`],
    dental_implants: [`dental implants ${c}`, `implant dentist ${c}`],
    cosmetic_dentist: [`cosmetic dentist ${c}`, `veneers ${c}`],
    family_dentist: [`family dentist ${c}`, `kids dentist ${c}`],
    pediatric_dentist: [`pediatric dentist ${c}`, `childrens dentist ${c}`],
    invisalign_orthodontics: [`Invisalign ${c}`, `clear aligners ${c}`, `orthodontist ${c}`],
    general_dentist: [`dentist ${c}`, `dental office ${c}`],
    emergency_furnace_repair: [`furnace repair ${c}`, `no heat ${c}`, `emergency HVAC ${c}`],
    emergency_ac_repair: [`AC repair ${c}`, `air conditioning repair ${c}`],
    heat_pump_installation: [`heat pump installation ${c}`, `heat pump ${c}`],
    maintenance_plan: [`HVAC maintenance ${c}`, `furnace tune up ${c}`],
    botox_injectables: [`Botox ${c}`, `injectables ${c}`],
    laser_treatments: [`laser skin treatment ${c}`, `IPL ${c}`],
    attic_insulation: [`attic insulation ${c}`, `blown in insulation ${c}`],
    landscaping_design_build: [`landscaping ${c}`, `landscape design ${c}`],
    interlock_hardscape: [`interlocking pavers ${c}`, `hardscape ${c}`],
  };
  return table[subNiche] ?? [];
}

export function buildKeywordStrategy(
  nicheSlug: string,
  city: string,
  businessName: string,
  intra?: IntraNicheStrategy | null,
) {
  const svc = SERVICE_LABELS[nicheSlug] ?? nicheSlug.replace(/-/g, " ");
  let primary = `${svc} ${city}`;
  const money: string[] = [];
  if (intra?.subNiche) {
    money.push(...subNicheMoneyKeywords(intra.subNiche, city));
  }
  if (nicheSlug === "roofing") {
    money.push(
      `emergency roof repair ${city}`,
      `roof leak repair ${city}`,
      `roof inspection ${city}`,
      `storm damage roof repair ${city}`,
      `shingle roof repair ${city}`,
    );
  } else if (nicheSlug === "hvac") {
    money.push(`furnace repair ${city}`, `AC repair ${city}`, `HVAC contractor ${city}`);
  } else if (nicheSlug === "dentists" || nicheSlug === "orthodontists") {
    money.push(`family dentist ${city}`, `dental clinic ${city}`);
  } else {
    money.push(`${svc} near me ${city}`, `${svc} ${city}`);
  }

  if (intra?.primaryServiceFocus?.trim()) {
    const focus = intra.primaryServiceFocus.trim();
    const focusKey = `${focus} ${city}`;
    if (!primary.toLowerCase().includes(focus.split(/\s+/)[0]!.toLowerCase())) {
      primary = focusKey;
    } else if (!money.some((m) => m.toLowerCase().includes(focus.toLowerCase().slice(0, 12)))) {
      money.unshift(focusKey);
    }
  }

  const secondary = [`${businessName} ${city}`, `${businessName} reviews`];
  const infoSvc = intra?.primaryServiceFocus?.trim() || svc;
  const informational = [
    `how to choose a ${infoSvc.toLowerCase()} in ${city}`,
    `${infoSvc.toLowerCase()} cost ${city}`,
  ];
  const cityKw = [`${city} ${svc}`, `local ${svc} ${city}`];
  const serviceArea = [`${city} area`, `${city} and surrounding communities`];

  const moneyUnique = [...new Set(money)];

  const intentMap: Intent[] = [
    { keyword: primary, intent: "local", targetPage: "homepage" },
    ...moneyUnique.slice(0, 4).map((k) => ({ keyword: k, intent: "quote" as const, targetPage: "servicePage" })),
    ...informational.map((k) => ({
      keyword: k,
      intent: "informational" as const,
      targetPage: "futureContent",
    })),
  ];

  return {
    primaryKeyword: primary,
    moneyKeywords: moneyUnique,
    secondaryKeywords: secondary,
    informationalKeywords: informational,
    cityKeywords: cityKw,
    serviceAreaKeywords: serviceArea,
    keywordIntentMap: intentMap,
  };
}
