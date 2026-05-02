import type { AssetCandidate, AssetCategory, AssetProfileJson } from "./types";

const SOCIAL_ICON_HINTS = ["facebook", "instagram", "twitter", "tiktok", "linkedin", "youtube"];
const TRACKING_HINTS = ["pixel", "analytics", "doubleclick", "googletag", "fbevents"];
const LOGO_HINTS = ["logo", "brand", "wordmark"];
const TEAM_HINTS = ["team", "staff", "crew", "owner", "founder"];
const BEFORE_AFTER_HINTS = ["before", "after", "b&a"];
const PROJECT_HINTS = ["project", "gallery", "portfolio", "case-study"];
const INTERIOR_HINTS = ["interior", "shop", "lobby", "office", "studio"];

function lower(s?: string | null) {
  return (s ?? "").toLowerCase();
}

function context(c: AssetCandidate): string {
  return [
    lower(c.filename),
    lower(c.altText),
    lower(c.titleAttr),
    lower(c.parentLinkText),
    lower(c.nearbyText),
    lower(c.nearbyHeadings.join(" ")),
    lower(c.url),
  ].join(" ");
}

function categorize(c: AssetCandidate): AssetCategory {
  const ctx = context(c);
  if (TRACKING_HINTS.some((t) => ctx.includes(t))) return "trackingPixel";
  if (SOCIAL_ICON_HINTS.some((t) => ctx.includes(t)) && (c.width ?? 999) < 80)
    return "socialIcon";
  if (c.extractionMethod === "favicon") return "icon";
  if (LOGO_HINTS.some((t) => ctx.includes(t))) return "logo";
  if (BEFORE_AFTER_HINTS.some((t) => ctx.includes(t))) return "beforeAfter";
  if (TEAM_HINTS.some((t) => ctx.includes(t))) return "team";
  if (
    PROJECT_HINTS.some((t) => ctx.includes(t)) ||
    c.sourcePageType === "gallery"
  )
    return "galleryProject";
  if (INTERIOR_HINTS.some((t) => ctx.includes(t))) return "interior";
  if (c.sourcePageType === "service") return "service";
  if ((c.width ?? 0) >= 1200 && (c.height ?? 0) >= 600) return "heroCandidate";
  if ((c.width ?? 0) > 0 && (c.width ?? 0) < 200) return "icon";
  return "unknown";
}

function score(c: AssetCandidate, category: AssetCategory) {
  const w = c.width ?? 0;
  const h = c.height ?? 0;
  const area = w * h;
  const aspect = w && h ? w / h : 0;

  let quality = 50;
  if (area >= 1280 * 720) quality += 25;
  else if (area >= 800 * 450) quality += 12;
  else if (area > 0 && area < 200 * 200) quality -= 25;
  if (c.extractionMethod === "favicon") quality -= 30;

  let relevance = 40;
  if (c.sourcePageType !== "unknown") relevance += 20;
  if (c.altText) relevance += 5;
  if (category === "logo" || category === "team" || category === "galleryProject")
    relevance += 15;
  if (category === "trackingPixel" || category === "socialIcon") relevance -= 50;

  const authenticity = 60 + (c.altText ? 10 : 0) + (c.sourcePageType === "gallery" ? 10 : 0);

  let hero = 30;
  if (category === "heroCandidate") hero += 30;
  if (aspect >= 1.4 && aspect <= 2.4) hero += 15;
  if (area >= 1600 * 900) hero += 15;
  if (category === "icon" || category === "logo" || category === "trackingPixel") hero = 0;

  let proof = 30;
  if (category === "galleryProject" || category === "beforeAfter") proof += 30;
  if (category === "team" || category === "interior") proof += 15;
  if (c.altText) proof += 5;
  if (category === "trackingPixel" || category === "icon") proof = 0;

  return {
    qualityScore: Math.max(0, Math.min(100, Math.round(quality))),
    businessRelevanceScore: Math.max(0, Math.min(100, Math.round(relevance))),
    authenticityScore: Math.max(0, Math.min(100, Math.round(authenticity))),
    heroSuitabilityScore: Math.max(0, Math.min(100, Math.round(hero))),
    proofSuitabilityScore: Math.max(0, Math.min(100, Math.round(proof))),
  };
}

export function classifyAssets(candidates: AssetCandidate[]): AssetProfileJson {
  const enriched = candidates.map((c) => {
    const category = categorize(c);
    const scores = score(c, category);
    return { ...c, category, ...scores };
  });

  const accepted = enriched.filter(
    (c) =>
      c.category !== "trackingPixel" &&
      c.category !== "socialIcon" &&
      c.qualityScore >= 25 &&
      c.businessRelevanceScore >= 25,
  );
  const rejected = enriched.filter((c) => !accepted.includes(c));

  const logo =
    accepted.find((c) => c.category === "logo") ??
    accepted.find((c) => /logo/i.test(c.url));

  const heroCandidates = accepted
    .filter((c) => c.heroSuitabilityScore >= 60)
    .sort((a, b) => b.heroSuitabilityScore - a.heroSuitabilityScore)
    .slice(0, 6);

  const galleryImages = accepted
    .filter((c) => c.category === "galleryProject")
    .slice(0, 24);
  const teamImages = accepted.filter((c) => c.category === "team").slice(0, 8);
  const beforeAfterCandidates = accepted
    .filter((c) => c.category === "beforeAfter")
    .slice(0, 12);
  const serviceImages = accepted.filter((c) => c.category === "service").slice(0, 12);
  const interiorImages = accepted.filter((c) => c.category === "interior").slice(0, 8);

  const assetQualityScore =
    accepted.length === 0
      ? 0
      : Math.round(
          accepted.reduce((s, c) => s + c.qualityScore, 0) / accepted.length,
        );

  const fallbackNeeded =
    heroCandidates.length === 0 || (heroCandidates[0]?.heroSuitabilityScore ?? 0) < 75;

  return {
    logoUrl: logo?.url,
    heroCandidates,
    galleryImages,
    teamImages,
    beforeAfterCandidates,
    serviceImages,
    interiorImages,
    rejectedImages: rejected,
    screenshots: {},
    assetQualityScore,
    fallbackNeeded,
    notes: [
      fallbackNeeded
        ? "No image cleared 75 hero suitability — using cinematic 3D fallback hero."
        : "Real hero image available with high suitability.",
      `${galleryImages.length} gallery candidates, ${beforeAfterCandidates.length} before/after, ${teamImages.length} team.`,
    ],
  };
}
