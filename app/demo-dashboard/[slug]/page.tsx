import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const SAMPLE_LEADS = [
  {
    name: "Sarah M.",
    service: "Active leak — kitchen ceiling",
    urgency: "Today",
    photo: true,
    value: 1800,
    status: "New",
    source: "Quote flow",
  },
  {
    name: "James K.",
    service: "Full attic top-up",
    urgency: "This week",
    photo: false,
    value: 2400,
    status: "Contacted",
    source: "Quote flow",
  },
  {
    name: "Priya R.",
    service: "Furnace not heating",
    urgency: "Today",
    photo: false,
    value: 950,
    status: "Booked",
    source: "Diagnostic",
  },
  {
    name: "Michael D.",
    service: "Driveway crack repair",
    urgency: "This month",
    photo: true,
    value: 1200,
    status: "New",
    source: "Quote flow",
  },
  {
    name: "Linh T.",
    service: "Backyard redesign",
    urgency: "This season",
    photo: true,
    value: 12500,
    status: "Sold",
    source: "Quote flow",
  },
  {
    name: "Daniel B.",
    service: "Cosmetic consult",
    urgency: "This month",
    photo: false,
    value: 600,
    status: "Contacted",
    source: "Quiz",
  },
];

const STATUS_COLOR: Record<string, string> = {
  New: "bg-accent-blue/20 text-accent-blue",
  Contacted: "bg-accent-orange/20 text-accent-orange",
  Booked: "bg-accent-green/20 text-accent-green",
  Sold: "bg-accent-gold/20 text-accent-gold",
};

export default async function DemoDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug: params.slug },
    include: { business: true },
  });
  if (!demo) notFound();

  const totalValue = SAMPLE_LEADS.reduce((s, l) => s + l.value, 0);

  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Lead dashboard mock
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {demo.business.name} · Lead pipeline
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sample data only — shows what the lead-management view would look like
          once the new site starts capturing requests.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total leads (sample)" value={SAMPLE_LEADS.length} />
          <Stat
            label="In pipeline value"
            value={`$${totalValue.toLocaleString()}`}
          />
          <Stat
            label="Photo-attached rate"
            value={`${Math.round(
              (SAMPLE_LEADS.filter((l) => l.photo).length / SAMPLE_LEADS.length) *
                100,
            )}%`}
          />
          <Stat
            label="Sold"
            value={SAMPLE_LEADS.filter((l) => l.status === "Sold").length}
          />
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 text-left">Lead</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Urgency</th>
                <th className="px-4 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-right">Est. value</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SAMPLE_LEADS.map((l) => (
                <tr key={l.name + l.service}>
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-white/80">{l.service}</td>
                  <td className="px-4 py-3 text-white/70">{l.urgency}</td>
                  <td className="px-4 py-3 text-white/60">
                    {l.photo ? "📎 Attached" : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${l.value.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white/70">{l.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        STATUS_COLOR[l.status] ?? "bg-white/5 text-white/70"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Sample / demo dashboard. No real data is captured here.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}
