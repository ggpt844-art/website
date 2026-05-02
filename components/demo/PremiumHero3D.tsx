"use client";

import { motion } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { ThreeSceneRouter } from "@/components/three/ThreeSceneRouter";
import { cn } from "@/lib/utils/cn";

export function PremiumHero3D({ config }: { config: DemoConfig }) {
  const { copy, design, business, strategy, assets } = config;
  const dark = design.backgroundMode === "dark";
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <div className="absolute inset-0">
        {assets.use3DFallback ? (
          <ThreeSceneRouter
            scene={design.threeDPreset}
            accentColor={design.accentColor}
            backgroundColor="transparent"
            quality="high"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assets.heroAssetUrl}
            alt={`${business.name} hero`}
            className="h-full w-full object-cover"
          />
        )}
        <div
          className={cn(
            "absolute inset-0",
            dark
              ? "bg-gradient-to-b from-[var(--bg)]/40 via-[var(--bg)]/60 to-[var(--bg)]"
              : "bg-gradient-to-b from-white/30 via-white/50 to-[var(--bg)]",
          )}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs uppercase tracking-wider text-[var(--text-dim)] backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: design.accentColor }}
            />
            {business.category} · {business.city}
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
}
