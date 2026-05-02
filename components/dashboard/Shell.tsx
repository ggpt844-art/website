import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/targets", label: "Targets" },
  { href: "/discover", label: "Discover" },
  { href: "/review-queue", label: "Review Queue" },
];

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-root">
      <div className="dashboard-grid-bg">
        <header className="border-b border-white/5 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg bg-accent-orange text-sm font-semibold text-black"
                aria-hidden
              >
                LR
              </span>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">
                  Local Funnel Radar
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Private · Demo Factory
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3 py-1.5 text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm text-white/60">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-[11px] text-white/40">
          Local Funnel Radar · Manual review required before any outreach.
        </footer>
      </div>
    </div>
  );
}
