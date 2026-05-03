import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";

const SITE = {
  name: "Floss & Gloss Dentistry",
  legalLine: "© All rights reserved. Replace with privacy policy & accessibility links.",
  kicker: "Mississauga, Ontario",
  headline: "Trusted dentistry for your whole family",
  trustLine: "Independently owned · Patient-first care",
  subline:
    "Thoughtful family, cosmetic, and restorative dentistry near Streetsville and Meadowvale — unhurried visits, clear options, and a team that earns your trust visit by visit.",
  phoneDisplay: "(905) 555-1425",
  phoneShort: "905-555-1425",
  phoneHref: "tel:+19055551425",
  email: "hello@flossandglossdentistry.example",
  addressLine: "265 Queen St S #1",
  cityLine: "Mississauga, ON L5M 1L9",
  mapQuery: "265+Queen+St+S+Mississauga+L5M+1L9",
};

const TRUST_PILLARS = [
  { title: "Canadian practice", sub: "Locally led team you’ll recognize chair-side." },
  { title: "Transparent consults", sub: "Plans explained before you commit." },
  { title: "Calm, modern environment", sub: "Designed for focus — not noisy sales floors." },
];

const SERVICE_GROUPS = [
  {
    title: "Family & children",
    items: ["Check-ups & hygiene", "Kids’ first visits", "Preventive care plans"],
  },
  {
    title: "Cosmetic",
    items: ["Smile whitening", "Veneer consults", "Alignment co-ordination"],
  },
  {
    title: "Restorative",
    items: ["Crowns & bridges", "Fillings", "Replace missing teeth"],
  },
  {
    title: "Comfort & urgency",
    items: ["Same-week triage when available", "Gentle appointments", "Clear after-care"],
  },
];

const TREATMENTS = [
  "Dental implants",
  "Invisalign® consults",
  "Root canal therapy",
  "Extractions",
  "Sedation options",
  "Teeth whitening",
  "Dentures",
  "Periodontal care",
  "TMJ / bite discussion",
  "Surgical referrals when needed",
];

const TEAM = [
  {
    initials: "JL",
    role: "Lead dentist — placeholder",
    name: "Dr. Jordan Lee, DDS",
    note: "Replace with verified bio: gentle diagnostics, cosmetic planning, and family care.",
  },
  {
    initials: "PS",
    role: "Associate dentist — placeholder",
    name: "Dr. Priya Shah, DMD",
    note: "Placeholder: prevention-first philosophy and clear treatment sequencing.",
  },
  {
    initials: "TN",
    role: "Dental hygiene — placeholder",
    name: "Taylor Nguyen, RDH",
    note: "Placeholder: thorough hygiene, gum health coaching, recall you’ll keep.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader phoneHref={SITE.phoneHref} phoneShort={SITE.phoneShort} />
      <Hero
        kicker={SITE.kicker}
        headline={SITE.headline}
        trustLine={SITE.trustLine}
        subline={SITE.subline}
        phoneDisplay={SITE.phoneDisplay}
        phoneHref={SITE.phoneHref}
      />

      {/* Trust ribbon — premium strip */}
      <section className="border-b border-black/[0.06] bg-cream py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-center md:justify-between md:text-left">
          {TRUST_PILLARS.map((p) => (
            <div key={p.title} className="max-w-xs">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sea">{p.title}</p>
              <p className="mt-1 text-sm text-ink/65">{p.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Family headline block — M City–style rhythm */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:grid md:grid-cols-2 md:items-start md:gap-16 lg:gap-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">For everyone you love</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-navy md:text-5xl">
              Simple, stress-free dentistry — start to finish
            </h2>
          </div>
          <div className="mt-10 md:mt-2">
            <p className="text-lg leading-relaxed text-ink/75">
              From first cleanings to cosmetic refinements, we keep visits predictable: what we’re
              looking at, what we recommend, and what you can defer — with timelines that respect
              your calendar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#book"
                className="text-sm font-bold uppercase tracking-widest text-sea underline decoration-gold/50 decoration-2 underline-offset-8 transition hover:decoration-gold"
              >
                Schedule a visit
              </a>
              <a
                href={SITE.phoneHref}
                className="text-sm font-bold uppercase tracking-widest text-ink/50 transition hover:text-ink"
              >
                Prefer the phone? {SITE.phoneShort}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-black/[0.05] bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sea">What we offer</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy md:text-[2.75rem]">
              Services shaped around real life in Mississauga
            </h2>
            <p className="mt-4 text-ink/65">
              Curated for clarity — detailed clinical pages can follow as your practice approves
              copy.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_GROUPS.map((g, i) => (
              <article
                key={g.title}
                className="group relative overflow-hidden rounded-sm border border-black/[0.06] bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  className="absolute right-6 top-6 font-display text-5xl font-semibold text-gold/25 transition group-hover:text-gold/35"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold text-navy">{g.title}</h3>
                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink/68">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments — inline colors so dark band never renders as "ghost" on light bg */}
      <section
        id="treatments"
        className="py-20 md:py-28"
        style={{ backgroundColor: "#0a1628", color: "#ffffff" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="md:flex md:items-end md:justify-between md:gap-12">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.28em]"
                style={{ color: "#c4a574" }}
              >
                Clinical focus
              </p>
              <h2
                className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
                style={{ color: "#ffffff" }}
              >
                Treatments &amp; advanced care
              </h2>
              <p className="mt-4 max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                A sample clinical menu — align with your Chart of Services and regulatory copy
                before launch.
              </p>
            </div>
            <a
              href="#book"
              className="mt-8 inline-flex shrink-0 self-start rounded-sm border-2 px-7 py-3.5 text-xs font-bold uppercase tracking-widest transition md:mt-0"
              style={{
                borderColor: "rgba(255,255,255,0.55)",
                color: "#ffffff",
              }}
            >
              Request a consult
            </a>
          </div>
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TREATMENTS.map((t) => (
              <li
                key={t}
                className="border-l-2 py-2 pl-4 text-sm"
                style={{
                  borderLeftColor: "#c4a574",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="border-t border-black/[0.05] bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sea">Our clinicians</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy md:text-[2.75rem]">
              Meet the team
            </h2>
            <p className="mt-4 text-ink/65">
              Portrait photography and full credentials belong here before you go live — these are
              layout placeholders only.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {TEAM.map((m) => (
              <article
                key={m.name}
                className="flex flex-col overflow-hidden rounded-sm border border-black/[0.06] bg-white shadow-card"
              >
                <div className="relative aspect-[4/5] bg-gradient-to-br from-navy/90 via-navy/70 to-sea/30">
                  <div className="absolute inset-0 grain-overlay opacity-40 mix-blend-soft-light" />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-6xl font-semibold text-white/25">
                    {m.initials}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/90">
                      {m.role}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white">{m.name}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <p className="text-sm leading-relaxed text-ink/68">{m.note}</p>
                  <span className="mt-6 text-xs font-bold uppercase tracking-widest text-sea/80">
                    Profile · placeholder
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="border-t border-black/[0.05] bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:grid md:grid-cols-2 md:items-stretch md:gap-16">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sea">Location</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy md:text-[2.75rem]">
              Visit us on Queen South
            </h2>
            <p className="mt-4 text-ink/65">
              Convenient for Streetsville village runs, Meadowvale commutes, and west Mississauga
              families — adjust directions with verified landmarks.
            </p>
            <address className="mt-10 not-italic">
              <strong className="font-display text-xl text-navy">{SITE.name}</strong>
              <p className="mt-3 text-ink/80">
                {SITE.addressLine}
                <br />
                {SITE.cityLine}
              </p>
              <a className="mt-4 inline-block text-sm font-bold text-sea" href={SITE.phoneHref}>
                {SITE.phoneDisplay}
              </a>
            </address>
          </div>
          <div className="mt-12 flex min-h-[280px] flex-col justify-center rounded-sm border border-black/[0.06] bg-white p-8 shadow-card md:mt-0 md:min-h-[360px]">
            <p className="text-sm text-ink/55">
              Map preview — embed Google Maps or static hero image of the storefront.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${SITE.mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-sm border border-navy/15 bg-navy px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-navy/90"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </section>

      {/* Book */}
      <section id="book" className="relative overflow-hidden bg-navy py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(196,165,116,0.12),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="mx-auto mb-8 h-px w-16 bg-gold" />
          <h2 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Let us take care of your smile
          </h2>
          <p className="mt-5 text-lg text-white/65">
            Wire your live scheduling link, HealthKit, or front-desk form here — this is a premium
            placeholder block.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href={SITE.phoneHref}
              className="rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-widest text-navy transition hover:bg-[#d4b78d]"
            >
              Call {SITE.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.email}?subject=New%20patient%20appointment`}
              className="rounded-sm border border-white/30 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:border-gold/50 hover:text-gold"
            >
              Email the desk
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#060d16] py-14 text-sm text-white/45">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div>
              <p className="font-display text-xl text-white/90">
                Floss <span className="text-gold">&amp;</span> Gloss
              </p>
              <p className="mt-2 text-white/40">{SITE.legalLine}</p>
            </div>
            <div className="text-right md:text-right">
              <p>{SITE.addressLine}</p>
              <p>{SITE.cityLine}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
