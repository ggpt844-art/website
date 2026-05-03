"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function StickyMobileCTA({
  config,
  trackEvent,
}: {
  config: DemoConfig;
  trackEvent?: (eventType: string, extra?: Record<string, unknown>) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)]/95 p-1.5 shadow-2xl backdrop-blur">
        {config.business.phone ? (
          <a
            href={`tel:${config.business.phone}`}
            onClick={() => trackEvent?.("call_click", { ctaLabel: "sticky_call" })}
            className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 text-center text-sm font-medium text-[var(--text)]"
          >
            Call
          </a>
        ) : null}
        <a
          href="#quote"
          onClick={() => trackEvent?.("cta_click", { ctaLabel: "sticky_quote" })}
          className="flex-[1.5] rounded-full px-4 py-2 text-center text-sm font-semibold tracking-tight"
          style={{
            background: config.design.accentColor,
            color: config.design.backgroundMode === "dark" ? "#000" : "#fff",
          }}
        >
          {config.strategy.primaryCTA}
        </a>
      </div>
    </div>
  );
}
