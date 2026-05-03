"use client";

import Image from "next/image";
import { useState } from "react";
const NAVY = "#0a1628";
const GOLD = "#c4a574";

const HERO_CACHE_BUST =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_HERO_BUST) || "10";

const heroUrl = (path: string) => `${path}?v=${HERO_CACHE_BUST}`;

/** Same order as before: listing photo hero, then optimize script JPEG, then PNG fallback */
const HERO_PRIMARY = heroUrl("/map-google-listing.jpg");
const HERO_LEGACY = heroUrl("/hero-cover.jpg");
const HERO_SRC = heroUrl("/hero-storefront.png");

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
  const [heroSrc, setHeroSrc] = useState(HERO_PRIMARY);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: NAVY,
        minHeight: "min(92vh, 900px)",
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={heroSrc}
            alt="Floss & Gloss Dentistry — practice exterior"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
            /* Crop: bias right & slightly up so left copy sits on scrim and window signage sits lower in frame */
            style={{ objectPosition: "75% 36%" }}
            onError={() =>
              setHeroSrc((prev) => {
                if (prev === HERO_PRIMARY) return HERO_LEGACY;
                if (prev === HERO_LEGACY) return HERO_SRC;
                return prev;
              })
            }
          />
        </div>
        {/* Wider, stronger left scrim so site copy separates from baked-in storefront text */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              to right,
              ${NAVY} 0%,
              ${NAVY}f2 18%,
              ${NAVY}d8 34%,
              ${NAVY}a0 48%,
              ${NAVY}55 62%,
              ${NAVY}18 76%,
              transparent 92%
            )`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${NAVY}d0 0%, transparent 38%, ${NAVY}35 100%)`,
          }}
          aria-hidden
        />
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay" />
      </div>

      <div
        className="layout-shell relative z-10 flex flex-col justify-center pb-16 pt-10 md:pb-24 md:pt-16"
        style={{ minHeight: "min(92vh, 900px)" }}
      >
        <div
          className="self-start -translate-y-7 md:-translate-y-10"
          style={{
            width: "100%",
            maxWidth: "min(100%, 36rem)",
          }}
        >
          <div className="hero-stagger hero-stagger-1">
            <div className="mb-2.5 h-px w-9" style={{ backgroundColor: GOLD }} aria-hidden />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.34em]"
              style={{ color: "#e8d5b5", lineHeight: 1.35 }}
            >
              {kicker}
            </p>
          </div>

          <h1
            className="hero-stagger hero-stagger-2 font-display font-semibold tracking-tight text-balance"
            style={{
              color: "#ffffff",
              marginTop: "0.4rem",
              fontSize: "clamp(1.65rem, 4.5vw, 3rem)",
              lineHeight: 1.05,
              textShadow: "0 2px 20px rgba(0,0,0,0.35)",
            }}
          >
            {headline}
          </h1>

          <p
            className="hero-stagger hero-stagger-3 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]"
            style={{
              color: "rgba(255,255,255,0.86)",
              marginTop: "0.65rem",
              lineHeight: 1.4,
            }}
          >
            {trustLine}
          </p>

          <p
            className="hero-stagger hero-stagger-4 font-light"
            style={{
              color: "rgba(255,255,255,0.92)",
              marginTop: "0.85rem",
              fontSize: "clamp(0.88rem, 1.85vw, 1.05rem)",
              lineHeight: 1.55,
              textShadow: "0 1px 12px rgba(0,0,0,0.25)",
            }}
          >
            {subline}
          </p>

          <div
            className="hero-stagger hero-stagger-5 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2.5"
            style={{ marginTop: "1rem" }}
          >
            <a
              href="#book"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-sm px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-md transition hover:opacity-95 sm:w-auto sm:flex-1"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              Book appointment
            </a>
            <a
              href={phoneHref}
              className="inline-flex w-full min-w-0 items-center justify-center rounded-sm px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition hover:opacity-95 sm:w-auto sm:flex-1"
              style={{
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.5)",
                backgroundColor: "rgba(0,0,0,0.18)",
              }}
            >
              Call now · {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
