/**
 * Default plate when no scraped hero: **installer / envelope work** read (dramatic practical light),
 * not abstract joists-only — closer to premium “technician at the building” art direction.
 * Swap per client: set `assets.heroAssetUrl` / `heroPosterUrl` from a real shoot or licensed buy.
 *
 * Unsplash License — free commercial use with attribution appreciated.
 */
export const HEAT_LOSS_CINEMATIC_PLATE =
  "https://images.unsplash.com/photo-1565008576389-9e35e6f11b71?auto=format&fit=crop&w=2560&q=88";
/** Optional: set in `.env` as `NEXT_PUBLIC_HEAT_HERO_VIDEO_URL` for a WebM/MP4 loop over the still. */
export function heatLossHeroVideoFromEnv(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return (
    process.env.NEXT_PUBLIC_HEAT_HERO_VIDEO_URL?.trim() ||
    process.env.HEAT_HERO_VIDEO_URL?.trim() ||
    undefined
  );
}
