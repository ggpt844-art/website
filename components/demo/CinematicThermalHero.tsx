"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { HEAT_LOSS_CINEMATIC_PLATE } from "@/lib/cinematic/heatLossHero";

function firstNonEmpty(...urls: (string | undefined)[]): string {
  for (const u of urls) {
    const t = u?.trim();
    if (t) return t;
  }
  return HEAT_LOSS_CINEMATIC_PLATE;
}

/**
 * Full-bleed “thermal camera + grade” hero for heat-loss / attic demos —
 * real plate, FLIR-style colormap read, film grain, letterbox, left readability falloff.
 */
export function CinematicThermalHero({ config }: { config: DemoConfig }) {
  const { business, design, assets } = config;
  const accent = design.accentColor;
  const reduceMotion = useReducedMotion();

  const poster = firstNonEmpty(assets.heroPosterUrl, assets.heroAssetUrl);
  const videoRaw = assets.heroVideoUrl?.trim();
  const videoSrc = videoRaw || undefined;
  const [videoBroken, setVideoBroken] = useState(false);
  /** Until the first frame plays, keep video transparent so a bad/black decode doesn't hide the still. */
  const [videoVisible, setVideoVisible] = useState(false);
  useEffect(() => {
    setVideoBroken(false);
    setVideoVisible(false);
  }, [videoSrc]);
  const [imgSrc, setImgSrc] = useState(poster);
  useEffect(() => {
    setImgSrc(poster);
  }, [poster]);

  const thermalStyle = useMemo(
    () => ({
      // Pseudo-FLIR: cold blues in shadows / sill, hot bloom toward roof gap & sky loss
      background: `
        radial-gradient(ellipse 125% 88% at 52% 118%, rgba(0, 24, 52, 0.55) 0%, transparent 50%),
        radial-gradient(ellipse 65% 50% at 82% 28%, color-mix(in srgb, ${accent} 55%, transparent) 0%, transparent 55%),
        radial-gradient(ellipse 45% 38% at 38% 18%, rgba(255, 145, 75, 0.28) 0%, transparent 48%),
        radial-gradient(circle at 55% -8%, rgba(255, 210, 140, 0.15) 0%, transparent 32%)
      `,
    }),
    [accent],
  );

  const plateBg = `url(${JSON.stringify(imgSrc)})`;

  return (
    <div className="absolute inset-0 bg-[#0a1424]">
      {/* Plate: video loop or cinematic still */}
      <div className="absolute inset-0 overflow-hidden">
        {/* CSS backdrop matches <img> so hero never reads as flat black while the image wiring catches up */}
        <div
          className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: plateBg }}
          aria-hidden
        />
        {/* Still plate always visible; video overlays only once frames are playing */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1, 1.05],
                  x: ["-1%", "0%", "-0.5%"],
                  y: ["0%", "-0.5%", "0%"],
                }
          }
          transition={
            reduceMotion
              ? {}
              : { duration: 28, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full min-h-full min-w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{
              filter: "saturate(1.06) contrast(1.08) brightness(0.96)",
            }}
            onError={() => setImgSrc(HEAT_LOSS_CINEMATIC_PLATE)}
          />
        </motion.div>
        {videoSrc && !videoBroken ? (
          <video
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700"
            style={{
              filter: "saturate(1.04) contrast(1.06) brightness(0.97)",
              opacity: videoVisible ? 1 : 0,
            }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
            aria-hidden
            onError={() => setVideoBroken(true)}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (!v.videoWidth || !v.videoHeight) setVideoBroken(true);
            }}
            onPlaying={() => setVideoVisible(true)}
          >
            <source src={videoSrc} />
          </video>
        ) : null}

        {/* Thermal analysis pass */}
        <div
          className="thermal-drift pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.22]"
          style={thermalStyle}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.11]"
          style={{
            background:
              "linear-gradient(105deg, rgba(0,70,110,0.38) 0%, transparent 38%, rgba(255,115,55,0.22) 72%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* Scan-line shimmer */}
        {!reduceMotion ? (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.065] thermal-scanlines"
            aria-hidden
          />
        ) : null}

        {/* Editorial readability: left column */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(2,4,10,0.72) 0%, rgba(2,4,10,0.32) 42%, transparent 74%)",
          }}
          aria-hidden
        />

        {/* Vignette + letterbox — avoid mix-blend-multiply here; it crushes stacked layers toward black */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(ellipse 78% 68% at 50% 45%, transparent 42%, rgba(0,0,0,0.45) 100%), linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 14%, transparent 86%, rgba(0,0,0,0.42) 100%)",
          }}
          aria-hidden
        />

        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.065] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        {/* HUD micro-text (optional world-building) */}
        <p
          className="pointer-events-none absolute right-6 top-6 max-w-[10rem] text-[9px] font-mono uppercase leading-relaxed tracking-[0.25em] text-white/25"
          aria-hidden
        >
          IDR MODE · LOSS MAP · {(business.city ?? "").slice(0, 3).toUpperCase() || "—"}
        </p>
      </div>
    </div>
  );
}
