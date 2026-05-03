"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const PLATE =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2560&q=88";

export function Hero({
  businessName,
  headline,
  subline,
  phoneDisplay,
  phoneHref,
}: {
  businessName: string;
  headline: string;
  subline: string;
  phoneDisplay: string;
  phoneHref: string;
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
    <header className="relative min-h-[88vh] overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(PLATE)})` }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion ? undefined : { scale: [1, 1.03], x: ["0%", "-0.3%"] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 28, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLATE}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "saturate(1.02) contrast(1.04) brightness(0.92)" }}
          />
        </motion.div>
        {videoSrc && videoOk ? (
          <video
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700"
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink/75 via-ink/35 to-sea/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/20"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-28 md:pb-28">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-white"
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/65">
            {businessName}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/85 md:text-xl">{subline}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#book"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-lg transition hover:bg-mist"
            >
              Book a visit
            </a>
            <a
              href={phoneHref}
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Call {phoneDisplay}
            </a>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
