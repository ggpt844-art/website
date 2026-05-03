/**
 * Cinematic plate for local dental / clinic-adjacent heroes — heritage main-street read
 * (Mississauga–Streetsville village vibe, not a competitor asset).
 *
 * Unsplash — free use; attribution appreciated.
 * Optional video: set NEXT_PUBLIC_DENTAL_HERO_VIDEO_URL or DENTAL_HERO_VIDEO_URL (MP4/WebM loop).
 */
export const DENTAL_LOCAL_CINEMATIC_PLATE =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2560&q=88";

export function dentalLocalHeroVideoFromEnv(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return (
    process.env.NEXT_PUBLIC_DENTAL_HERO_VIDEO_URL?.trim() ||
    process.env.DENTAL_HERO_VIDEO_URL?.trim() ||
    undefined
  );
}
