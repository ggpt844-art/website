import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveDemoConfigFromSlug } from "@/lib/demo/resolveDemoConfig";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { ThankYouTracker } from "./ThankYouTracker";

export const dynamic = "force-dynamic";

function nicheCopy(config: DemoConfig): { headline: string; next: string; checklist: string[] } {
  const cat = (config.business.category ?? "").toLowerCase();
  if (/roof|gutter/.test(cat)) {
    return {
      headline: "Thanks — your roof request was received.",
      next:
        "Next, the team reviews your issue and any photos, confirms urgency, and contacts you to book an inspection when it makes sense.",
      checklist: [
        "Note where leaks show inside the home (if any)",
        "Keep photos handy in case they ask for another angle",
        "List any recent storms or dates the issue started",
      ],
    };
  }
  if (/dent|orthodont|smile/.test(cat)) {
    return {
      headline: "Thanks — your consultation request was received.",
      next:
        "Next, the clinic confirms your goals, answers questions, and helps you choose the right appointment — no pressure to decide immediately.",
      checklist: [
        "Write down your top concerns or questions",
        "Note any timing preferences for visits",
        "Bring insurance details if you want coverage context (optional)",
      ],
    };
  }
  if (/spa|cosmetic|med/.test(cat)) {
    return {
      headline: "Thanks — your consultation request was received.",
      next:
        "Next, the team reviews your goals and follows up with suitable options. Timelines depend on provider availability — you will get realistic next steps by phone or email.",
      checklist: [
        "List products or treatments you have tried before",
        "Note allergies or sensitivities if relevant",
        "Prepare questions about downtime or aftercare",
      ],
    };
  }
  return {
    headline: "Thanks — your request was received.",
    next:
      "Next, the business reviews what you submitted and follows up with clear options. Response timing depends on their hours and workload.",
    checklist: [
      "Keep your phone available for a quick callback",
      "Save any photos you uploaded",
      "Jot down questions you do not want to forget",
    ],
  };
}

export default async function ThankYouPage({ params }: { params: { slug: string } }) {
  const resolved = await resolveDemoConfigFromSlug(params.slug);
  if (!resolved) notFound();

  const config = resolved.config;
  const copy = nicheCopy(config);
  const phone = config.business.phone;

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-16 text-white">
      <ThankYouTracker slug={params.slug} />
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Thank you</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.headline}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/70">{copy.next}</p>

        {phone ? (
          <a
            href={`tel:${phone}`}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:brightness-110"
          >
            Call {config.business.name}
          </a>
        ) : null}

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-wider text-white/50">
            Before your visit / inspection
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {copy.checklist.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs text-white/45">
          This demo funnel routes requests internally for review. No specific response time is
          promised unless your team configures it.
        </p>

        <Link
          href={`/demo/${params.slug}`}
          className="mt-10 inline-block text-sm text-white/60 underline hover:text-white"
        >
          ← Back to demo
        </Link>
      </div>
    </main>
  );
}
