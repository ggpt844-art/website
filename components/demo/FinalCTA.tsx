"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function FinalCTA({ config }: { config: DemoConfig }) {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", lineHeight: 1.02 }}
        >
          {config.copy.finalCtaTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-[var(--text-dim)]">
          {config.copy.finalCtaBody}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#quote"
            className="rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight transition hover:brightness-110"
            style={{
              background: config.design.accentColor,
              color: config.design.backgroundMode === "dark" ? "#000" : "#fff",
            }}
          >
            {config.strategy.primaryCTA}
          </a>
          {config.business.phone && (
            <a
              href={`tel:${config.business.phone}`}
              className="rounded-full border border-[var(--border)] px-7 py-3.5 text-sm font-medium hover:bg-[var(--surface)]"
            >
              Call {config.business.phone}
            </a>
          )}
        </div>
        <p className="mt-8 text-xs uppercase tracking-wider text-[var(--text-dim)]">
          {config.business.name} · {config.business.city} ·{" "}
          {config.business.category}
        </p>
      </div>
    </section>
  );
}
