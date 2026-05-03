import { Hero } from "@/components/Hero";

const SITE = {
  name: "Floss & Gloss Dentistry",
  legalLine: "Independent practice — replace with real legal footer copy.",
  headline: "Dentistry that feels local, calm, and clear.",
  subline:
    "Serving Mississauga families near Streetsville and Meadowvale — preventive care, cosmetic touches, and honest consults without the jargon. New patients welcome.",
  phoneDisplay: "(905) 555-1425",
  phoneHref: "tel:+19055551425",
  email: "hello@flossandglossdentistry.example",
  addressLine: "265 Queen St S #1",
  cityLine: "Mississauga, ON L5M 1L9",
  mapQuery: "265+Queen+St+S+Mississauga+L5M+1L9",
};

const SERVICES = [
  {
    title: "Family & preventive",
    body: "Exams, hygiene, kids’ visits, and clear recall rhythm so small issues stay small.",
  },
  {
    title: "Cosmetic & smile refresh",
    body: "Whitening, bonding, veneers discussion — goals first, options explained plainly.",
  },
  {
    title: "Restorative consults",
    body: "Crowns, fillings, and replacements framed with timelines you can plan around.",
  },
];

const TEAM = [
  {
    role: "Lead Dentist — placeholder",
    name: "Dr. Jordan Lee",
    note: "Demo bio only. Replace with verified credentials and photo before production.",
  },
  {
    role: "Associate Dentist — placeholder",
    name: "Dr. Priya Shah",
    note: "Prevention-forward care and treatment clarity. Not a real patient endorsement.",
  },
  {
    role: "Registered Dental Hygienist — placeholder",
    name: "Taylor Nguyen, RDH",
    note: "Focus on gentle cleanings, gum health, and at-home routines that stick.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero
        businessName={SITE.name}
        headline={SITE.headline}
        subline={SITE.subline}
        phoneDisplay={SITE.phoneDisplay}
        phoneHref={SITE.phoneHref}
      />

      <section className="border-b border-black/5 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-sea">
            Why patients choose us
          </p>
          <ul className="mt-10 flex flex-col gap-6 md:flex-row md:justify-center md:gap-12">
            {[
              "Consult-first — no pressure scripts",
              "Mississauga roots, Streetsville-adjacent convenience",
              "Modern, unfussy care for busy families",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-ink/85 md:max-w-xs">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            What we do
          </h2>
          <p className="mt-4 max-w-2xl text-ink/70">
            Straightforward service buckets — your actual clinical menu belongs here once the
            practice approves copy.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="rounded-2xl border border-black/8 bg-white/90 p-8 shadow-sm backdrop-blur"
              >
                <h3 className="font-display text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="border-y border-black/5 bg-mist/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Meet the team
          </h2>
          <p className="mt-4 max-w-2xl text-ink/70">
            Placeholder names and bios for layout. Swap for real clinicians and compliance-approved
            text.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TEAM.map((m) => (
              <article key={m.name} className="rounded-2xl bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-sea">{m.role}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{m.name}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/68">{m.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 md:flex md:items-start md:justify-between md:gap-16">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Visit us
            </h2>
            <p className="mt-4 text-ink/70">
              Queen St S visibility with easy ties to Streetsville’s village energy and quick
              access for Meadowvale and Churchill Meadows — replace with verified directional copy.
            </p>
            <address className="mt-8 not-italic text-ink">
              <strong className="block">{SITE.name}</strong>
              <span className="mt-2 block">{SITE.addressLine}</span>
              <span className="block">{SITE.cityLine}</span>
              <a
                className="mt-4 block text-sea underline-offset-4 hover:underline"
                href={SITE.phoneHref}
              >
                {SITE.phoneDisplay}
              </a>
            </address>
          </div>
          <div className="mt-12 md:mt-0 md:w-[420px]">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${SITE.mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink shadow-sm transition hover:border-sea/40"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>

      <section id="book" className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Ready when you are</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            This block stands in for your real booking widget or PMS link — wire it when you go
            live.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={SITE.phoneHref}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ink"
            >
              Call to schedule
            </a>
            <a
              href={`mailto:${SITE.email}?subject=Appointment%20request`}
              className="rounded-full border border-white/35 px-8 py-3.5 text-sm font-semibold text-white"
            >
              Email us
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink py-10 text-sm text-white/55">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. {SITE.legalLine}
          </p>
          <p className="text-white/45">
            Standalone marketing site — no shared backend with other projects.
          </p>
        </div>
      </footer>
    </>
  );
}
