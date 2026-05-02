"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function ProofSection({ config }: { config: DemoConfig }) {
  const gallery = config.assets.galleryImages;
  const proof = config.assets.proofImages;
  const reviews = config.business.reviewCount;
  const rating = config.business.rating;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
        >
          {config.copy.proofHeadline ?? "Real work. Real clients."}
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(gallery.length > 0 ? gallery : proof).slice(0, 6).map((url, i) => (
              <div
                key={url + i}
                className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${config.business.name} project ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {gallery.length === 0 && proof.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-transparent"
                />
              ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur">
              {rating && reviews ? (
                <>
                  <p className="font-display text-3xl text-[var(--text)]">
                    {rating.toFixed(1)} / 5
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-dim)]">
                    {reviews} reviews · {config.business.city}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl text-[var(--text)]">
                    Locally trusted
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-dim)]">
                    Real {config.business.city} work, photo-documented.
                  </p>
                </>
              )}
            </div>
            <ul className="space-y-3">
              {config.strategy.riskReducers.map((r) => (
                <li
                  key={r}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] backdrop-blur"
                >
                  <span
                    className="mr-2 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full"
                    style={{ background: config.design.accentColor }}
                  />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
