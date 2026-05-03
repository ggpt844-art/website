import type { ConversionConfig } from "@/lib/growth/schemas";
import type { LeadPriority } from "@prisma/client";

/** Parse `Name <phoneOrEmail>` from quote flow contact step. */
export function parseContactBlob(raw: string): {
  name: string | null;
  phone: string | null;
  email: string | null;
} {
  const m = raw.match(/^(.+?)\s*<([^>]+)>\s*$/);
  const inner = (m?.[2] ?? raw).trim();
  const name = m?.[1]?.trim() || null;
  const email = inner.includes("@") ? inner : null;
  const phone = email ? null : inner || null;
  return { name, phone, email };
}

export function scoreLeadFromAnswers(
  conversion: ConversionConfig,
  answers: Record<string, string>,
): { score: number; reasons: string[]; priority: LeadPriority; estimatedValueRange: string } {
  const q = conversion.leadQualification;
  const blob = Object.entries(answers)
    .map(([k, v]) => `${k}:${v}`)
    .join(" ")
    .toLowerCase();
  const contactRaw = answers.contact ?? "";
  const { phone, email } = parseContactBlob(contactRaw);

  let score = 40;
  const reasons: string[] = [];

  for (const r of q.scoreRules) {
    let hit = false;
    switch (r.id) {
      case "emergency":
      case "no_heat_cool":
        hit =
          /\btoday\b/.test(blob) ||
          /active leak|storm|no heat|no cooling|heavy infestation|wasps/i.test(blob);
        break;
      case "photos":
      case "photo_model":
        hit = !!answers.photo && answers.photo !== "skipped";
        break;
      case "this_week":
      case "soon":
        hit =
          /\bthis week\b/.test(blob) ||
          answers.urgency === "This week" ||
          answers.timeline === "ASAP";
        break;
      case "phone":
        hit = !!phone && phone.replace(/\D/g, "").length >= 7;
        break;
      case "system_old":
      case "roof_age_unknown":
        hit = /not sure|15\+|10\+|old roof|never/i.test(blob);
        break;
      case "cosmetic":
      case "treatment":
        hit = /cosmetic|invisalign|whitening|botox|filler|treatment/i.test(blob);
        break;
      case "within_30":
      case "financing":
        hit =
          r.id === "financing"
            ? /financing|budget|payment plan/i.test(blob)
            : /within 30|this month|soon|this week/i.test(blob);
        break;
      case "concern":
      case "natural":
        hit = blob.length > 80;
        break;
      case "timeline":
        hit = !!answers.budget || !!answers.timeline;
        break;
      case "outside_area":
        hit = false;
        break;
      case "no_contact":
      case "no_phone":
        hit = !phone && !email;
        break;
      default:
        hit = r.when
          .split(/\s+/)
          .filter((w) => w.length > 4)
          .some((w) => blob.includes(w.toLowerCase()));
    }
    if (hit && r.delta !== 0) {
      score += r.delta;
      if (r.delta > 0) reasons.push(r.when);
      else reasons.push(`Flag: ${r.when}`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  let priority: LeadPriority = "low";
  if (score >= q.hotLeadThreshold) priority = "hot";
  else if (score >= q.warmLeadThreshold) priority = "warm";

  return {
    score,
    reasons,
    priority,
    estimatedValueRange: "Discuss scope on follow-up — demo estimates only",
  };
}
