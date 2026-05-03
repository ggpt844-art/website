import Link from "next/link";

export function SiteHeader({
  phoneHref,
  phoneShort,
}: {
  phoneHref: string;
  phoneShort: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
            Floss <span className="text-gold/90">&amp;</span> Gloss
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Dentistry
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 text-[13px] font-medium text-white/78 md:flex"
          aria-label="Primary"
        >
          <a href="#services" className="transition hover:text-white">
            Services
          </a>
          <a href="#treatments" className="transition hover:text-white">
            Treatments
          </a>
          <a href="#team" className="transition hover:text-white">
            Our team
          </a>
          <a href="#visit" className="transition hover:text-white">
            Visit
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <a
            href={phoneHref}
            className="hidden rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/5 sm:inline-block"
          >
            Call {phoneShort}
          </a>
          <a
            href="#book"
            className="rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy shadow-lg transition hover:bg-[#d4b78d]"
          >
            Book
          </a>
        </div>
      </div>
    </header>
  );
}
