"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function TrustStrip({ config }: { config: DemoConfig }) {
  const items = config.copy.trustStrip ?? config.strategy.riskReducers;
  const rating = config.business.rating;
  const reviews = config.business.reviewCount;
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-5 text-sm text-[var(--text-dim)]">
        {rating && reviews ? (
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl text-[var(--text)]">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs uppercase tracking-wider">
              {reviews} reviews · {config.business.city}
            </span>
          </div>
        ) : (
          <span className="text-xs uppercase tracking-wider">
            Local crew · {config.business.city}
          </span>
        )}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
          {items.slice(0, 5).map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: config.design.accentColor }}
              />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
