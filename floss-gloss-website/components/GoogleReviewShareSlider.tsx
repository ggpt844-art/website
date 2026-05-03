"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CuratedGoogleShareSlide } from "@/lib/curatedGoogleReviewShares";

const STAR = "★";
const AUTO_ADVANCE_MS = 7000;

function letterFromName(authorName: string): string {
  const head = authorName.split("·")[0].trim();
  if (!head) return "?";
  const m = head.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/u);
  return (m?.[0] ?? head[0]).toUpperCase();
}

type Props = {
  slides: CuratedGoogleShareSlide[];
  googleListingUrl: string | null;
  navy: string;
  gold: string;
  ink65: string;
  sea: string;
};

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleReviewShareSlider({ slides, googleListingUrl, navy, gold, ink65, sea }: Props) {
  const [index, setIndex] = useState(0);
  const pauseAutoRef = useRef(false);
  const n = slides.length;
  const current = slides[index] ?? slides[0];

  const goPrev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);
  const goNext = useCallback(() => setIndex((i) => (i + 1) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    if (n <= 1) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      if (pauseAutoRef.current || document.hidden) return;
      setIndex((i) => (i + 1) % n);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [n]);

  if (n === 0 || !current) return null;

  const ctaHref = current.shareUrl ?? googleListingUrl;
  const initial = letterFromName(current.authorName);

  return (
    <div className="mt-12">
      <p
        className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.28em]"
        style={{ color: sea }}
      >
        Featured Google reviews
      </p>

      <div
        className="relative mx-auto max-w-3xl rounded-sm border border-black/[0.08] shadow-card"
        style={{ backgroundColor: "#ffffff" }}
        onMouseEnter={() => {
          pauseAutoRef.current = true;
        }}
        onMouseLeave={() => {
          pauseAutoRef.current = false;
        }}
        onFocusCapture={() => {
          pauseAutoRef.current = true;
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            pauseAutoRef.current = false;
          }
        }}
      >
        <div className="min-w-0 px-6 pb-8 pt-8 md:px-12 md:pb-10 md:pt-10">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
              style={{ backgroundColor: `${gold}33`, color: navy }}
              aria-hidden
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span style={{ color: gold, letterSpacing: "0.06em" }} aria-hidden>
                  {STAR.repeat(5)}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ink65 }}>
                  Google
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold leading-snug" style={{ color: navy }}>
                {current.authorName}
              </p>
            </div>
          </div>

          <blockquote
            className="review-slider-quote mt-5 border-l-2 pl-4 text-left text-sm leading-relaxed md:text-[0.95rem]"
            style={{ borderColor: `${gold}55`, color: ink65 }}
            aria-live="polite"
          >
            <span className="sr-only">Review: </span>
            &ldquo;{current.excerpt.trim()}&rdquo;
          </blockquote>

          <div className="mt-8 flex justify-center">
            {ctaHref ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-sm px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-92 sm:w-auto"
                style={{ backgroundColor: navy, color: "#ffffff" }}
              >
                {current.shareUrl ? "Open this review on Google" : "See reviews on Google"}
              </a>
            ) : null}
          </div>
        </div>

        <div className="review-slider-nav">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-black/[0.08] transition hover:bg-black/[0.03]"
            style={{ color: navy }}
            aria-label="Previous review"
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-black/[0.08] transition hover:bg-black/[0.03]"
            style={{ color: navy }}
            aria-label="Next review"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed" style={{ color: ink65 }}>
        Names and quotes reflect patient feedback shared on Google. Button opens Google Maps in a new tab.
      </p>
    </div>
  );
}
