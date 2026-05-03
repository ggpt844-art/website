import { DemoConfigSchema, type DemoConfig } from "@/lib/renderer/demoConfig";

/**
 * If the stored config has `assets.heroLocked`, preserve operator-set hero presentation
 * (still, video, thermal mode, 3D toggle, GLB) while the rest of the config is rebuilt.
 */
export function applyLockedHeroFromPrevious(
  fresh: DemoConfig,
  previousRaw: unknown,
): DemoConfig {
  const parsed = DemoConfigSchema.safeParse(previousRaw);
  if (!parsed.success) return fresh;
  const prev = parsed.data;
  if (!prev.assets.heroLocked) return fresh;

  const a = prev.assets;
  return {
    ...fresh,
    assets: {
      ...fresh.assets,
      heroAssetUrl: a.heroAssetUrl,
      heroPosterUrl: a.heroPosterUrl,
      heroVideoUrl: a.heroVideoUrl,
      heroGlbUrl: a.heroGlbUrl,
      heroCinematic: a.heroCinematic,
      use3DFallback: a.use3DFallback,
      heroLocked: true,
    },
  };
}
