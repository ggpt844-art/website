import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  helper,
  accent = "text-white",
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
        {label}
      </p>
      <p className={`mt-3 font-display text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-white/50">{helper}</p>}
    </div>
  );
}
