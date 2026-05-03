import Link from "next/link";

const NAVY = "#0a1628";
const GOLD = "#c4a574";

export function SiteHeader({
  phoneHref,
  phoneShort,
}: {
  phoneHref: string;
  phoneShort: string;
}) {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        /* Slightly inkier than hero NAVY so the bar reads as its own layer, not one slab with the scrim */
        backgroundColor: "rgba(6, 13, 22, 0.94)",
        borderBottom: "1px solid rgba(196, 165, 116, 0.42)",
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 10px 28px -8px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        className="layout-shell flex max-w-6xl items-center justify-between gap-4 py-4"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", paddingTop: "1rem", paddingBottom: "1rem" }}
      >
        <Link
          href="/"
          className="group flex flex-col leading-none outline-offset-4"
          style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
        >
          <span
            className="font-display text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[1.65rem]"
            style={{ color: "#ffffff" }}
          >
            Floss <span style={{ color: GOLD }}>&amp;</span> Gloss
          </span>
          <span
            className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "rgba(255, 255, 255, 0.58)" }}
          >
            Dentistry
          </span>
        </Link>

        <nav
          className="site-header-nav hidden items-center gap-8 font-sans text-[13px] font-medium md:flex"
          aria-label="Primary"
        >
          <a href="#services">Services</a>
          <a href="#treatments">Treatments</a>
          <a href="#team">Our team</a>
          <a href="#visit">Visit</a>
        </nav>

        <div
          className="flex shrink-0 items-center gap-2 md:gap-3"
          style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: "0.75rem" }}
        >
          <a
            href={phoneHref}
            className="hidden rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition hover:bg-white/[0.08] sm:inline-block"
            style={{
              color: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
            }}
          >
            Call {phoneShort}
          </a>
          <a
            href="#book"
            className="rounded-full px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider shadow-lg transition hover:opacity-95"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Book
          </a>
        </div>
      </div>
    </header>
  );
}
