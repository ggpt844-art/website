"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function ProcessTimeline({ config }: { config: DemoConfig }) {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
        >
          {config.copy.processHeadline ?? "What happens after you click."}
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.process.map((step, i) => (
            <li
              key={step.step}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur"
            >
              <div
                className="absolute right-5 top-5 font-display text-3xl opacity-30"
                style={{ color: config.design.accentColor }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="font-display text-lg text-[var(--text)]">
                {step.step}
              </p>
              <p className="mt-2 text-sm text-[var(--text-dim)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
