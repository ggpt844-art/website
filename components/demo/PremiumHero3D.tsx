"use client";

import { motion } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { ThreeSceneRouter } from "@/components/three/ThreeSceneRouter";
import { RoofHeroScrollContext } from "@/components/three/RoofHeroScrollContext";
import { CinematicThermalHero } from "@/components/demo/CinematicThermalHero";
import { HEAT_LOSS_CINEMATIC_PLATE } from "@/lib/cinematic/heatLossHero";
import { cn } from "@/lib/utils/cn";
import { useHeroScrollProgress } from "@/lib/hooks/useHeroScrollProgress";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export function PremiumHero3D({ config }: { config: DemoConfig }) {
  const { copy, design, business, strategy, assets } = config;
  const dark = design.backgroundMode === "dark";
  const thermalCinematic = assets.heroCinematic === "thermal_loss";
  const staticHeroUrl =
    assets.heroAssetUrl?.trim() || HEAT_LOSS_CINEMATIC_PLATE;
  const roofScrollScene =
    design.threeDPreset === "roof-plane-rain" && assets.use3DFallback && !thermalCinematic;
  const reducedMotion = usePrefersReducedMotion();
  const { elementRef: heroRef, progressRef: roofScrollRef } = useHeroScrollProgress(
    roofScrollScene && !reducedMotion,
  );

  const inner = (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] overflow-hidden"
    >
      <div className="absolute inset-0">
        {thermalCinematic ? (
          <CinematicThermalHero config={config} />
        ) : assets.use3DFallback ? (
          <ThreeSceneRouter
            scene={design.threeDPreset}
            sceneSpec={config.sceneSpec}
            visualDirection={config.visualDirection}
            accentColor={design.accentColor}
            backgroundColor="transparent"
            quality="high"
            heroGlbUrl={assets.heroGlbUrl}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staticHeroUrl}
            alt={`${business.name} hero`}
            className="h-full w-full object-cover"
          />
        )}
        {!thermalCinematic ? (
          <>
            <div
              className={cn(
                "pointer-events-none absolute inset-0",
                dark
                  ? "bg-gradient-to-b from-[var(--bg)]/32 via-[var(--bg)]/52 to-[var(--bg)]"
                  : "bg-gradient-to-b from-white/20 via-white/38 to-[var(--bg)]",
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 mix-blend-multiply",
                dark ? "opacity-35" : "opacity-[0.18]",
              )}
              style={{
                background:
                  "radial-gradient(ellipse 72% 58% at 50% 36%, transparent 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />
          </>
        ) : (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]/55"
            aria-hidden
          />
        )}
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: config.visualDirection?.motionLanguage?.toLowerCase().includes("slow")
              ? 1.05
              : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs uppercase tracking-wider text-[var(--text-dim)] backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: design.accentColor }}
            />
            <span className="max-w-[min(100%,28rem)] truncate">
              {config.visualDirection?.conceptName ?? `${business.category} · ${business.city}`}
            </span>
          </div>
          <h1
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 6vw, 5.5rem)", lineHeight: 1.02 }}
          >
            {copy.heroHeadline}
          </h1>
          <p className="max-w-2xl text-[1.125rem] text-[var(--text-dim)] leading-relaxed">
            {copy.heroSubheadline}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#quote"
              className="rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight transition hover:brightness-110"
              style={{ background: design.accentColor, color: dark ? "#000" : "#fff" }}
            >
              {strategy.primaryCTA}
            </a>
            <a
              href="#diagnostic"
              className="rounded-full border border-[var(--border)] px-7 py-3.5 text-sm font-medium tracking-tight transition hover:bg-[var(--surface)]"
            >
              {strategy.secondaryCTA}
            </a>
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="text-sm text-[var(--text-dim)] underline-offset-4 hover:underline"
              >
                or call {business.phone}
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs uppercase tracking-wider text-[var(--text-dim)]">
            {(copy.trustStrip ?? strategy.riskReducers.slice(0, 4)).map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: design.accentColor }}
                />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );

  if (!roofScrollScene) return inner;

  return (
    <RoofHeroScrollContext.Provider value={{ progress: roofScrollRef }}>
      {inner}
    </RoofHeroScrollContext.Provider>
  );
}
