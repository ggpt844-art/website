import { Hero } from "@/components/Hero";
import { PatientReviews } from "@/components/PatientReviews";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchPlaceReviews } from "@/lib/googlePlacesReviews";

const SITE = {
  name: "Floss & Gloss Dentistry",
  legalLine: "© Floss & Gloss Dentistry. All rights reserved.",
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
  /** Full line for Google Maps search + embed */
  mapAddressLine: "265 Queen St S #1, Mississauga, ON L5M 1L9, Canada",
  /** Public listing — “Read on Google,” Reviews fallback CTA */
  googleMapsListingUrl: "https://maps.app.goo.gl/a8Aoz3bX3pVVWnFT7",
  /** Placeholder — replace with real hours before launch */
  hours: [
    { day: "Monday", hours: "9am — 5pm (placeholder)" },
    { day: "Tuesday", hours: "9am — 5pm (placeholder)" },
    { day: "Wednesday", hours: "9am — 5pm (placeholder)" },
    { day: "Thursday", hours: "9am — 5pm (placeholder)" },
    { day: "Friday", hours: "9am — 4pm (placeholder)" },
    { day: "Saturday", hours: "By appointment (placeholder)" },
    { day: "Sunday", hours: "Closed" },
  ],
};

/** Hex/rgba only — survives builds where Tailwind color utilities don’t apply */
const C = {
  ink: "#0d1a1f",
  ink65: "rgba(13, 26, 31, 0.65)",
  ink68: "rgba(13, 26, 31, 0.68)",
  ink75: "rgba(13, 26, 31, 0.75)",
  ink50: "rgba(13, 26, 31, 0.5)",
  ink55: "rgba(13, 26, 31, 0.55)",
  ink80: "rgba(13, 26, 31, 0.8)",
  navy: "#0a1628",
  sea: "#1f5c5f",
  gold: "#c4a574",
  cream: "#fffcf8",
  paper: "#f7f5f2",
  white: "#ffffff",
  white90: "rgba(255, 255, 255, 0.9)",
  white40: "rgba(255, 255, 255, 0.4)",
  white45: "rgba(255, 255, 255, 0.45)",
} as const;

const TRUST_PILLARS = [
  { title: "Canadian practice", sub: "Locally led team you’ll recognize chair-side." },
  { title: "Transparent consults", sub: "Plans explained before you commit." },
  { title: "Calm, modern environment", sub: "Designed for focus — not noisy sales floors." },
];

/** M City–style “Why choose” pillars */
const WHY_CHOOSE = [
  {
    title: "Modern. Gentle. Thoughtfully designed.",
    body: "Digital workflows, advanced imaging when you need it, and minimally invasive options — visits stay efficient and low-stress.",
  },
  {
    title: "A team you can trust.",
    body: "We listen first, sequence treatment clearly, and only recommend care that fits your goals, timeline, and budget.",
  },
  {
    title: "Results that look natural — and feel effortless.",
    body: "Family, cosmetic, and restorative work planned around your bite and habits — so your smile fits your everyday life.",
  },
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

export default async function HomePage() {
  const reviewData = await fetchPlaceReviews();

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
      <section
        className="border-b border-black/[0.06] py-5"
        style={{ backgroundColor: C.cream, color: C.ink }}
      >
        <div className="layout-shell layout-trust-inner flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center md:justify-between md:text-left">
          {TRUST_PILLARS.map((p) => (
            <div key={p.title} className="max-w-xs">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.sea }}
              >
                {p.title}
              </p>
              <p className="mt-1 text-sm" style={{ color: C.ink65 }}>
                {p.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Family headline block — M City–style rhythm */}
      <section className="py-20 md:py-28" style={{ backgroundColor: C.paper, color: C.ink }}>
        <div className="layout-shell layout-split-2 layout-split-2--wide md:grid md:grid-cols-2 md:items-start md:gap-16 lg:gap-24">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.gold }}
            >
              For everyone you love
            </p>
            <h2
              className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl"
              style={{ color: C.navy }}
            >
              Simple, stress-free dentistry — start to finish
            </h2>
          </div>
          <div className="mt-10 md:mt-2">
            <p className="text-lg leading-relaxed" style={{ color: C.ink75 }}>
              From first cleanings to cosmetic refinements, we keep visits predictable: what we’re
              looking at, what we recommend, and what you can defer — with timelines that respect
              your calendar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#book"
                className="text-sm font-bold uppercase tracking-widest underline decoration-2 underline-offset-8 transition hover:opacity-90"
                style={{ color: C.sea, textDecorationColor: "rgba(196, 165, 116, 0.55)" }}
              >
                Schedule a visit
              </a>
              <a
                href={SITE.phoneHref}
                className="text-sm font-bold uppercase tracking-widest transition hover:opacity-80"
                style={{ color: C.ink50 }}
              >
                Prefer the phone? {SITE.phoneShort}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us — M City–style pillars */}
      <section id="why" className="border-t border-black/[0.05] py-20 md:py-28" style={{ backgroundColor: C.paper, color: C.ink }}>
        <div className="layout-shell">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.sea }}
            >
              Why choose us
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: C.navy }}
            >
              Dentistry that feels considered — not rushed
            </h2>
          </div>
          <div className="layout-grid-3-cols mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {WHY_CHOOSE.map((item, i) => (
              <div key={item.title} className="relative pl-6">
                <div
                  className="absolute left-0 top-1 h-full w-px"
                  style={{ backgroundColor: C.gold, opacity: 0.85 }}
                  aria-hidden
                />
                <span
                  className="font-display text-4xl font-semibold tabular-nums"
                  style={{ color: "rgba(196, 165, 116, 0.35)" }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug" style={{ color: C.navy }}>
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: C.ink68 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-black/[0.05] py-20 md:py-28" style={{ backgroundColor: C.cream, color: C.ink }}>
        <div className="layout-shell">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.sea }}
            >
              What we offer
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: C.navy }}
            >
              Services shaped around real life in Mississauga
            </h2>
            <p className="mt-4" style={{ color: C.ink65 }}>
              Curated for clarity — detailed clinical pages can follow as your practice approves
              copy.
            </p>
          </div>
          <div className="layout-services-grid mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_GROUPS.map((g, i) => (
              <article
                key={g.title}
                className="group relative overflow-hidden rounded-sm border border-black/[0.06] p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                style={{ backgroundColor: C.white, color: C.ink }}
              >
                <span
                  className="absolute right-6 top-6 font-display text-5xl font-semibold transition group-hover:opacity-90"
                  style={{ color: "rgba(196, 165, 116, 0.28)" }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold" style={{ color: C.navy }}>
                  {g.title}
                </h3>
                <ul className="mt-6 space-y-3 text-sm leading-relaxed" style={{ color: C.ink68 }}>
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: C.gold }}
                      />
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
        <div className="layout-shell">
          <div className="layout-treatments-head md:flex md:items-end md:justify-between md:gap-12">
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
          <ul className="layout-treatments-list mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <section id="team" className="border-t border-black/[0.05] py-20 md:py-28" style={{ backgroundColor: C.paper, color: C.ink }}>
        <div className="layout-shell">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.sea }}
            >
              Our clinicians
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: C.navy }}
            >
              Meet the team
            </h2>
            <p className="mt-4" style={{ color: C.ink65 }}>
              Portrait photography and full credentials belong here before you go live — these are
              layout placeholders only.
            </p>
          </div>
          <div className="layout-grid-3-cols mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {TEAM.map((m) => (
              <article
                key={m.name}
                className="flex flex-col overflow-hidden rounded-sm border border-black/[0.06] shadow-card"
                style={{ backgroundColor: C.white, color: C.ink }}
              >
                <div
                  className="relative aspect-[4/5]"
                  style={{
                    background: `linear-gradient(135deg, ${C.navy}e8 0%, ${C.navy}b0 45%, ${C.sea}55 100%)`,
                  }}
                >
                  <div className="absolute inset-0 grain-overlay opacity-40 mix-blend-soft-light" />
                  <span
                    className="absolute inset-0 flex items-center justify-center font-display text-6xl font-semibold"
                    style={{ color: "rgba(255,255,255,0.22)" }}
                  >
                    {m.initials}
                  </span>
                  <div
                    className="absolute inset-x-0 bottom-0 p-6"
                    style={{
                      background: `linear-gradient(to top, ${C.navy}e8, transparent)`,
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: "rgba(196, 165, 116, 0.95)" }}
                    >
                      {m.role}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold" style={{ color: C.white }}>
                      {m.name}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <p className="text-sm leading-relaxed" style={{ color: C.ink68 }}>
                    {m.note}
                  </p>
                  <span
                    className="mt-6 text-xs font-bold uppercase tracking-widest"
                    style={{ color: `${C.sea}cc` }}
                  >
                    Profile · placeholder
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance & plans */}
      <section id="insurance" className="border-t border-black/[0.05] py-20 md:py-28" style={{ backgroundColor: C.cream, color: C.ink }}>
        <div className="layout-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.sea }}
            >
              Payment & coverage
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: C.navy }}
            >
              We accept your insurance
            </h2>
            <p className="mt-4 text-lg" style={{ color: C.ink65 }}>
              Most major Canadian benefit plans — call us with your policy details and we’ll help you understand estimated coverage before treatment.
            </p>
            <a
              href={SITE.phoneHref}
              className="mt-8 inline-flex rounded-sm px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-92"
              style={{ backgroundColor: C.navy, color: C.white }}
            >
              Call to verify coverage
            </a>
          </div>
          <div className="layout-insurance-2 mt-14 grid gap-6 md:grid-cols-2">
            <div
              className="rounded-sm border border-black/[0.06] p-8 shadow-card"
              style={{ backgroundColor: C.white }}
            >
              <h3 className="font-display text-xl font-semibold" style={{ color: C.navy }}>
                Canada Dental Care Plan (CDCP)
              </h3>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: C.ink68 }}>
                Publicly funded dental benefits for eligible households without private insurance. Coverage and enrollment rules are set by the federal program — we can walk you through what to bring and how booking works.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: C.sea }}>
                Ask us about CDCP eligibility when you call
              </p>
            </div>
            <div
              className="rounded-sm border border-black/[0.06] p-8 shadow-card"
              style={{ backgroundColor: C.white }}
            >
              <h3 className="font-display text-xl font-semibold" style={{ color: C.navy }}>
                Interim Federal Health Program (IFHP)
              </h3>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: C.ink68 }}>
                Emergency dental coverage may be available for eligible newcomers under IFHP. Services are limited to what the program defines as urgent — contact us with your documentation and we’ll help coordinate.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: C.sea }}>
                IFHP — questions welcome at the front desk
              </p>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-xs" style={{ color: C.ink55 }}>
            Program names and eligibility are subject to government rules — confirm details with your insurer or program administrator. Replace this paragraph with your office’s verified billing and assignment policy.
          </p>
        </div>
      </section>

      <PatientReviews
        rating={reviewData.rating}
        userRatingsTotal={reviewData.userRatingsTotal}
        listingUrl={reviewData.listingUrl ?? SITE.googleMapsListingUrl}
        source={reviewData.source}
        brandName={SITE.name}
        ink={C.ink}
        ink65={C.ink65}
        navy={C.navy}
        gold={C.gold}
        cream={C.cream}
        sea={C.sea}
      />

      {/* Visit */}
      <section id="visit" className="border-t border-black/[0.05] py-20 md:py-28" style={{ backgroundColor: C.cream, color: C.ink }}>
        <div className="layout-shell layout-visit-split md:grid md:grid-cols-2 md:items-stretch md:gap-16">
          <div className="flex flex-col justify-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: C.sea }}
            >
              Location
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: C.navy }}
            >
              Visit us on Queen South
            </h2>
            <p className="mt-4" style={{ color: C.ink65 }}>
              Convenient for Streetsville village runs, Meadowvale commutes, and west Mississauga
              families — adjust directions with verified landmarks.
            </p>
            <address className="mt-10 not-italic">
              <strong className="font-display text-xl" style={{ color: C.navy }}>
                {SITE.name}
              </strong>
              <p className="mt-3" style={{ color: C.ink80 }}>
                {SITE.addressLine}
                <br />
                {SITE.cityLine}
              </p>
              <a
                className="mt-4 inline-block text-sm font-bold"
                style={{ color: C.sea }}
                href={SITE.phoneHref}
              >
                {SITE.phoneDisplay}
              </a>
            </address>
          </div>
          <div
            className="mt-12 flex flex-col overflow-hidden rounded-sm border border-black/[0.06] shadow-card md:mt-0"
            style={{ backgroundColor: C.white }}
          >
            <iframe
              title={`Map — ${SITE.name}`}
              className="aspect-[4/3] w-full min-h-[260px] shrink-0 border-0 bg-[#e8eaed] md:aspect-auto md:min-h-[400px]"
              style={{ width: "100%", minHeight: "280px", border: "none", display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapAddressLine)}&output=embed&z=16`}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-4">
              <p className="text-xs" style={{ color: C.ink55 }}>
                Interactive map · zoom and drag to explore the neighbourhood.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapAddressLine)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-sm border px-6 py-3 text-xs font-bold uppercase tracking-widest transition hover:opacity-92"
                style={{
                  borderColor: "rgba(10, 22, 40, 0.2)",
                  backgroundColor: C.navy,
                  color: C.white,
                }}
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Book — forced dark bg + explicit text colors (same Tailwind visibility issue as Treatments) */}
      <section
        id="book"
        className="relative overflow-hidden py-24 text-center"
        style={{ backgroundColor: "#0a1628", color: "#ffffff" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,165,116,0.18), transparent 55%)",
          }}
        />
        <div className="layout-book-inner relative text-center">
          <div className="mx-auto mb-8 h-px w-16" style={{ backgroundColor: "#c4a574" }} />
          <h2
            className="font-display text-4xl font-semibold md:text-5xl"
            style={{ color: "#ffffff" }}
          >
            Let us take care of your smile
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
            Wire your live scheduling link, PMS, or front-desk form here — this block is ready for a
            real booking button.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href={SITE.phoneHref}
              className="rounded-sm px-10 py-4 text-xs font-bold uppercase tracking-widest transition hover:opacity-95"
              style={{ backgroundColor: "#c4a574", color: "#0a1628" }}
            >
              Call {SITE.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.email}?subject=New%20patient%20appointment`}
              className="rounded-sm border-2 px-10 py-4 text-xs font-bold uppercase tracking-widest transition hover:opacity-90"
              style={{
                borderColor: "rgba(255,255,255,0.65)",
                color: "#ffffff",
                backgroundColor: "rgba(0,0,0,0.2)",
              }}
            >
              Email the desk
            </a>
          </div>
        </div>
      </section>

      <footer
        className="border-t py-16 text-sm"
        style={{
          borderColor: "rgba(255,255,255,0.1)",
          backgroundColor: "#060d16",
          color: C.white45,
        }}
      >
        <div className="layout-shell">
          <div className="layout-footer-grid grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <div>
              <p className="font-display text-xl" style={{ color: C.white90 }}>
                Floss <span style={{ color: C.gold }}>&amp;</span> Gloss
              </p>
              <p className="mt-3 leading-relaxed" style={{ color: C.white40 }}>
                {SITE.legalLine}
              </p>
              <p className="mt-6 text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                <a href="#" className="transition hover:text-white/80">
                  Privacy policy
                </a>
                <span className="mx-2" aria-hidden>
                  |
                </span>
                <a href="#" className="transition hover:text-white/80">
                  Terms of use
                </a>
                <span className="mx-2" aria-hidden>
                  |
                </span>
                <a href="#" className="transition hover:text-white/80">
                  Accessibility
                </a>
              </p>
              <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                (Placeholder links — replace with real URLs.)
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.white90 }}>
                Explore
              </h3>
              <ul className="mt-4 space-y-2">
                {[
                  ["Services", "#services"],
                  ["Treatments", "#treatments"],
                  ["Our team", "#team"],
                  ["Insurance", "#insurance"],
                  ["Reviews", "#reviews"],
                  ["Visit", "#visit"],
                  ["Book", "#book"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition hover:text-white/85">
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>Blog — placeholder</span>
                </li>
                <li>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>FAQ — placeholder</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.white90 }}>
                Hours
              </h3>
              <ul className="mt-4 space-y-2.5">
                {SITE.hours.map((row) => (
                  <li key={row.day} className="flex justify-between gap-4 border-b border-white/[0.06] pb-2 last:border-0">
                    <span style={{ color: C.white40 }}>{row.day}</span>
                    <span style={{ color: "rgba(255,255,255,0.72)" }}>{row.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.white90 }}>
                Contact
              </h3>
              <address className="mt-4 not-italic leading-relaxed">
                <p>{SITE.addressLine}</p>
                <p>{SITE.cityLine}</p>
                <p className="mt-3">
                  <a href={SITE.phoneHref} className="transition hover:text-white/85">
                    {SITE.phoneDisplay}
                  </a>
                </p>
                <p className="mt-1">
                  <a href={`mailto:${SITE.email}`} className="transition hover:text-white/85">
                    {SITE.email}
                  </a>
                </p>
              </address>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.white90 }}>
                Follow
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: C.white40 }}>
                Social links placeholder — add Instagram / Facebook URLs when ready.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
