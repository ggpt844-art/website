import { getNichePreset } from "@/lib/presets/niches";
import type { IntraNicheStrategy } from "@/lib/strategy/intraNicheTypes";

export function buildComparisonBlocks(
  nicheSlug: string,
  city: string,
  intra?: IntraNicheStrategy | null,
) {
  const n = getNichePreset(nicheSlug);
  const blocks: { title: string; body: string; visibleOnPage: boolean }[] = [];
  const sub = intra?.subNiche ?? "";

  if (sub === "emergency_roof_repair") {
    blocks.push({
      title: "Tarp vs repair vs replacement after a leak",
      body: `Temporary protection can buy time, but hidden deck damage matters. In ${city}, an inspection after photos helps choose the right scope — this demo emphasizes triage and clarity rather than jumping to a full replacement pitch.`,
      visibleOnPage: true,
    });
  } else if (sub === "metal_roofing") {
    blocks.push({
      title: "Metal vs asphalt for longevity",
      body: `Metal can excel on durability and weathering; asphalt remains common for budget and aesthetics. Honest comparison depends on your roof geometry and goals — consult-led, not one-size-fits-all.`,
      visibleOnPage: true,
    });
  } else if (sub === "dental_implants") {
    blocks.push({
      title: "Implants vs bridges (high level)",
      body: `Both can replace missing teeth; implants anchor in bone while bridges rely on adjacent teeth. Suitability, timeline, and cost depend on clinical assessment — the site routes to consultation, not DIY diagnosis.`,
      visibleOnPage: true,
    });
  } else if (sub === "invisalign_orthodontics") {
    blocks.push({
      title: "Clear aligners vs braces",
      body: `Aligners fit some bite cases beautifully; others need traditional mechanics. A clinical exam determines fit — education-first copy avoids promising outcomes from a short quiz.`,
      visibleOnPage: true,
    });
  } else if (sub === "heat_pump_installation") {
    blocks.push({
      title: "Heat pump vs furnace for your home",
      body: `Climate, insulation, and incentives change the math. This flow favors education: what a heat pump does well, what to verify with an on-site assessment in ${city}.`,
      visibleOnPage: true,
    });
  } else if (nicheSlug === "roofing") {
    blocks.push({
      title: "Roof repair vs roof replacement",
      body: `Repair can extend life when damage is localized. Replacement may be safer when decking, widespread leaks, or age suggest systemic failure. In ${city}, the right path depends on inspection — this demo routes you to that step without guessing outcomes.`,
      visibleOnPage: true,
    });
  } else if (nicheSlug === "hvac") {
    blocks.push({
      title: "Furnace repair vs replacement",
      body: `Repairs fix specific failures; replacement can make sense for older systems with rising cost or reliability issues. The guided flow on this site collects symptoms and urgency so ${city} homeowners get appropriate options.`,
      visibleOnPage: true,
    });
  } else if (nicheSlug === "dentists" || nicheSlug === "orthodontists") {
    blocks.push({
      title: "Consultation-first approach",
      body:
        "Treatment choices depend on your goals and clinical assessment — not a website quiz. The flow here captures your concerns so the practice can guide you at the consult.",
      visibleOnPage: true,
    });
  } else if (nicheSlug === "med-spas" || nicheSlug === "cosmetic-clinics") {
    blocks.push({
      title: "Botox vs filler (general)",
      body:
        "These address different concerns — one relaxes expression lines; the other restores volume. A consult determines suitability; results vary by individual.",
      visibleOnPage: true,
    });
  } else {
    blocks.push({
      title: `Choosing the right ${n.label.toLowerCase()} approach`,
      body: `Compare options with a specialist in ${city}. This site focuses on capturing your situation clearly before a consult.`,
      visibleOnPage: true,
    });
  }
  return blocks;
}
