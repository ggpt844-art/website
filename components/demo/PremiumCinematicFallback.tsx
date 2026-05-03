"use client";

import type { SceneSpec, VisualDirection } from "@/lib/experience/experienceSchemas";

/** Premium static / reduced-motion hero backplate — not a cheap blank. */
export function PremiumCinematicFallback({
  sceneSpec,
  visualDirection,
  accentColor,
  mode,
}: {
  sceneSpec?: SceneSpec | null;
  visualDirection?: VisualDirection | null;
  accentColor: string;
  mode: "reduced_motion" | "static_performance";
}) {
  const label =
    mode === "reduced_motion"
      ? visualDirection?.lightingStyle ?? "Reduced motion — editorial still"
      : sceneSpec?.fallbacks?.staticCinematicTreatment ?? "Performance mode — cinematic still";

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#070910] via-[#0d1118] to-[#070910]" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 60% at 25% 25%, ${accentColor}40, transparent 55%),
            radial-gradient(ellipse 70% 50% at 75% 75%, ${accentColor}28, transparent 50%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-transparent to-transparent" />
      <p className="absolute bottom-10 left-6 right-6 max-w-xl text-[10px] uppercase leading-relaxed tracking-[0.22em] text-white/45">
        {sceneSpec?.sceneType?.replace(/_/g, " ")} · {label}
      </p>
    </div>
  );
}
