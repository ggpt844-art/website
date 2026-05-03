"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Local storefront — `public/hero-storefront.png` (replace anytime). */
const LOCAL_HERO = "/hero-storefront.png";

export function Hero({
  headline,
  subline,
  phoneDisplay,
  phoneHref,
  kicker,
  trustLine,
}: {
  headline: string;
  subline: string;
  phoneDisplay: string;
  phoneHref: string;
  kicker: string;
  trustLine: string;
}) {
  const reduceMotion = useReducedMotion();
  const videoSrc =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim()) || "";
  const [videoOk, setVideoOk] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  useEffect(() => {
    setVideoOk(true);
    setVideoVisible(false);
  }, [videoSrc]);

  return (
    <section className="relative min-h-[min(92vh,900px)] overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? undefined : { scale: [1, 1.02] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 24, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOCAL_HERO}
            alt="Floss & Gloss Dentistry — practice exterior"
            className="h-full w-full object-cover object-center"
            style={{
              filter: "contrast(1.05) brightness(0.92) saturate(1.05)",
            }}
          />
        </motion.div>
        {videoSrc && videoOk ? (
          <video
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-1000"
            style={{ opacity: videoVisible ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            poster={LOCAL_HERO}
            aria-hidden
            onError={() => setVideoOk(false)}
            onPlaying={() => setVideoVisible(true)}
          >
            <source src={videoSrc} />
          </video>
        ) : null}
        {/* Readability: heavy left column for type; lighter right so the building stays visible */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/88 to-transparent sm:via-[#0a1628]/65"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1628]/75 via-transparent to-[#0a1628]/25"
          aria-hidden
        />
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" />
      </div>

      <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-6 pb-16 pt-12 md:justify-center md:pb-24 md:pt-20">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[40rem] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-6 h-px w-14 bg-[#c4a574]" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#e8d5b5]">
            {kicker}
          </p>
          <h1 className="mt-4 font-display text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-balance text-white md:text-5xl lg:text-[3.35rem]">
            {headline}
          </h1>
          <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {trustLine}
          </p>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/95 md:text-xl">
            {subline}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#book"
              className="inline-flex items-center justify-center rounded-sm bg-[#c4a574] px-9 py-4 text-xs font-bold uppercase tracking-widest text-[#0a1628] shadow-xl transition hover:bg-[#d4b78d]"
            >
              Book appointment
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center rounded-sm border border-white/50 bg-black/25 px-9 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-black/35"
            >
              Call now · {phoneDisplay}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
