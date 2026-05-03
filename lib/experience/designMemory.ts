import type {
  DesignFingerprint,
  FlowArchetype,
} from "@/lib/experience/experienceSchemas";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

/** Deterministic short hash for section order comparisons (no Node crypto). */
export function hashSectionOrder(order: string[]): string {
  let h = 0;
  const s = order.join("|");
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
  return `s${Math.abs(h).toString(36)}`;
}

export function similarityScore(a: DesignFingerprint, b: DesignFingerprint): number {
  let s = 0;
  if (a.flowArchetype === b.flowArchetype) s += 2;
  if (a.sectionOrderHash === b.sectionOrderHash) s += 5;
  if (a.sceneType === b.sceneType) s += 3;
  if (a.colorFamily === b.colorFamily) s += 1;
  if (a.ctaPattern === b.ctaPattern) s += 1;
  if (a.motionPattern === b.motionPattern) s += 1;
  if (a.heroLayoutType === b.heroLayoutType) s += 2;
  if (a.trustPattern === b.trustPattern) s += 1;
  return s;
}

/** True when candidate is dangerously close to a recent shipping pattern. */
export function isFingerprintTooSimilar(
  candidate: DesignFingerprint,
  recent: DesignFingerprint[],
  threshold = 9,
): boolean {
  return recent.some((r) => similarityScore(candidate, r) >= threshold);
}

export function extractFingerprint(config: DemoConfig): DesignFingerprint | null {
  return config.designFingerprint ?? null;
}

export async function getRecentDesignFingerprints(limit = 18): Promise<DesignFingerprint[]> {
  const rows = await prisma.demoConfig.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { baseConfigJson: true },
  });
  const out: DesignFingerprint[] = [];
  for (const r of rows) {
    const cfg = r.baseConfigJson as unknown as DemoConfig;
    const fp = extractFingerprint(cfg);
    if (fp) out.push(fp);
  }
  return out;
}

/** Nudge section order when anti-repeat triggers — keeps niche logic, changes rhythm. */
export function varySectionOrderForAntiRepeat(
  order: string[],
  flowArchetype: FlowArchetype,
  seed: string,
): string[] {
  const next = [...order];
  const idx = (n: string) => next.indexOf(n);
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const variant = Math.abs(h) % 3;

  if (variant === 0) {
    const a = idx("proof");
    const b = idx("services");
    if (a > 0 && b > 0 && a !== b) {
      [next[a], next[b]] = [next[b]!, next[a]!];
    }
  } else if (variant === 1 && flowArchetype !== "fast_quote_first") {
    const p = idx("process");
    const f = idx("faq");
    if (p > 0 && f > 0) {
      [next[p], next[f]] = [next[f]!, next[p]!];
    }
  } else {
    const d = idx("diagnosticTool");
    const s = idx("services");
    if (d > 0 && s > 0 && Math.abs(d - s) === 1) {
      const t = idx("trustStrip");
      if (t >= 0 && t < Math.min(d, s)) {
        const item = next.splice(t, 1)[0]!;
        const ins = Math.min(next.indexOf("services") + 1, next.length);
        next.splice(ins, 0, item);
      }
    }
  }
  return next;
}

export function colorFamilyFromAccent(hex: string): string {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length < 6) return "neutral-warm";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (r > 200 && g > 120 && b < 100) return "amber-warning";
  if (b > r && b > g) return "cool-depth";
  if (g > r && g > b) return "clinical-calm";
  if (r > 180 && g < 120 && b < 120) return "ember-urgent";
  return "balanced-neutrals";
}
