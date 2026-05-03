"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/* Premium streetscape plate — neutral, not competitor assets */
const PLATE =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2560&q=88";

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
    <section className="relative min-h-[min(92vh,880px)] overflow-hidden bg-navy">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(PLATE)})` }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion ? undefined : { scale: [1, 1.035], x: ["0%", "-0.25%"] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 32, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLATE}
            alt=""
            className="h-full w-full object-cover"
            style={{
              filter: "saturate(0.92) contrast(1.08) brightness(0.78)",
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
            poster={PLATE}
            aria-hidden
            onError={() => setVideoOk(false)}
            onPlaying={() => setVideoVisible(true)}
          >
            <source src={videoSrc} />
          </video>
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy/88 via-navy/55 to-sea/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/30"
          aria-hidden
        />
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-90 mix-blend-overlay" />
      </div>

      <div className="relative mx-auto flex min-h-[min(92vh,880px)] max-w-6xl flex-col justify-end px-6 pb-16 pt-12 md:justify-center md:pb-24 md:pt-20">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[40rem] text-white"
        >
          <div className="mb-6 h-px w-14 bg-gold" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-gold/95">{kicker}</p>
          <h1 className="mt-4 font-display text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-[3.35rem]">
            {headline}
          </h1>
          <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/55">
            {trustLine}
          </p>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/88 md:text-xl">
            {subline}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#book"
              className="inline-flex items-center justify-center rounded-sm bg-gold px-9 py-4 text-xs font-bold uppercase tracking-widest text-navy shadow-xl transition hover:bg-[#d4b78d]"
            >
              Book appointment
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center rounded-sm border border-white/35 bg-white/5 px-9 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-white/10"
            >
              Call now · {phoneDisplay}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
