"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { DENTAL_LOCAL_CINEMATIC_PLATE } from "@/lib/cinematic/dentalLocalHero";

function firstNonEmpty(...urls: (string | undefined)[]): string {
  for (const u of urls) {
    const t = u?.trim();
    if (t) return t;
  }
  return DENTAL_LOCAL_CINEMATIC_PLATE;
}

/** Full-bleed cinematic plate + optional loop — calm clinical grade, local-practice vibe. */
export function CinematicDentalLocalHero({ config }: { config: DemoConfig }) {
  const { business, design, assets } = config;
  const accent = design.accentColor;
  const reduceMotion = useReducedMotion();

  const poster = firstNonEmpty(assets.heroPosterUrl, assets.heroAssetUrl);
  const videoRaw = assets.heroVideoUrl?.trim();
  const videoSrc = videoRaw || undefined;
  const [videoBroken, setVideoBroken] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  useEffect(() => {
    setVideoBroken(false);
    setVideoVisible(false);
  }, [videoSrc]);
  const [imgSrc, setImgSrc] = useState(poster);
  useEffect(() => {
    setImgSrc(poster);
  }, [poster]);

  const gradeStyle = useMemo(
    () => ({
      background: `
        radial-gradient(ellipse 90% 70% at 50% 110%, rgba(0, 32, 48, 0.55) 0%, transparent 45%),
        radial-gradient(ellipse 55% 45% at 78% 22%, color-mix(in srgb, ${accent} 35%, transparent) 0%, transparent 58%),
        radial-gradient(ellipse 40% 35% at 18% 28%, rgba(255, 255, 255, 0.14) 0%, transparent 50%)
      `,
    }),
    [accent],
  );

  const plateBg = `url(${JSON.stringify(imgSrc)})`;

  return (
    <div className="absolute inset-0 bg-[#0c1520]">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: plateBg }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1, 1.04],
                  x: ["0%", "-0.5%", "0%"],
                  y: ["0%", "-0.4%", "0%"],
                }
          }
          transition={
            reduceMotion
              ? {}
              : { duration: 32, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
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
              filter: "saturate(1.02) contrast(1.04) brightness(0.94)",
            }}
            onError={() => setImgSrc(DENTAL_LOCAL_CINEMATIC_PLATE)}
          />
        </motion.div>
        {videoSrc && !videoBroken ? (
          <video
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700"
            style={{
              filter: "saturate(1.02) contrast(1.05) brightness(0.96)",
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

        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.2]"
          style={gradeStyle}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.08]"
          style={{
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.12) 0%, transparent 42%, rgba(0,80,90,0.15) 72%, transparent 100%)",
          }}
          aria-hidden
        />

        {!reduceMotion ? (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.04] thermal-scanlines"
            aria-hidden
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(8,12,18,0.78) 0%, rgba(8,12,18,0.38) 40%, transparent 72%)",
          }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.52]"
          style={{
            background:
              "radial-gradient(ellipse 80% 65% at 50% 42%, transparent 40%, rgba(0,0,0,0.5) 100%), linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.38) 100%)",
          }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        <p
          className="pointer-events-none absolute right-6 top-6 max-w-[11rem] text-[9px] font-mono uppercase leading-relaxed tracking-[0.22em] text-white/22"
          aria-hidden
        >
          LOCAL · CALM CLINIC · {(business.city ?? "").slice(0, 4).toUpperCase() || "—"}
        </p>
      </div>
    </div>
  );
}
