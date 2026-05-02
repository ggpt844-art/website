import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { DashboardShell } from "@/components/dashboard/Shell";
import { slugify } from "@/lib/utils/slug";
import { APP_CONFIG } from "@/lib/utils/config";

export const dynamic = "force-dynamic";

async function addCity(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const region = String(formData.get("region") ?? "ON").trim();
  const country = String(formData.get("country") ?? "CA").trim();
  if (!name) return;
  await prisma.targetCity.upsert({
    where: { name_region_country: { name, region, country } },
    create: { name, region, country, enabled: true },
    update: { enabled: true },
  });
  revalidatePath("/targets");
}

async function toggleCity(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const c = await prisma.targetCity.findUnique({ where: { id } });
  if (!c) return;
  await prisma.targetCity.update({ where: { id }, data: { enabled: !c.enabled } });
  revalidatePath("/targets");
}

async function addNiche(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const categoryGroup = String(formData.get("categoryGroup") ?? "general").trim();
  const estimatedLeadValue = Number(formData.get("estimatedLeadValue") ?? 500);
  if (!name) return;
  const slug = slugify(name);
  await prisma.targetNiche.upsert({
    where: { slug },
    create: { name, slug, categoryGroup, estimatedLeadValue, enabled: true },
    update: { enabled: true, name, categoryGroup, estimatedLeadValue },
  });
  revalidatePath("/targets");
}

async function toggleNiche(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const n = await prisma.targetNiche.findUnique({ where: { id } });
  if (!n) return;
  await prisma.targetNiche.update({ where: { id }, data: { enabled: !n.enabled } });
  revalidatePath("/targets");
}

export default async function TargetsPage() {
  const [cities, niches] = await Promise.all([
    prisma.targetCity.findMany({ orderBy: { name: "asc" } }),
    prisma.targetNiche.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardShell
      title="Targets"
      subtitle="Manage cities, niches, and discovery defaults."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="Cities">
          <form action={addCity} className="mb-4 flex flex-wrap gap-2">
            <input
              name="name"
              placeholder="City name"
              className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
              required
            />
            <input
              name="region"
              defaultValue="ON"
              className="w-20 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
            />
            <input
              name="country"
              defaultValue="CA"
              className="w-20 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
            />
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:brightness-110">
              Add
            </button>
          </form>
          <ul className="divide-y divide-white/5">
            {cities.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-white/50">
                    {c.region} · {c.country}
                  </p>
                </div>
                <form action={toggleCity}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    className={`rounded-full px-3 py-1 text-xs ${
                      c.enabled
                        ? "bg-accent-green/20 text-accent-green"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {c.enabled ? "Enabled" : "Disabled"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Niches">
          <form action={addNiche} className="mb-4 flex flex-wrap gap-2">
            <input
              name="name"
              placeholder="Niche label"
              className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
              required
            />
            <input
              name="categoryGroup"
              placeholder="Category group"
              defaultValue="general"
              className="w-44 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
            />
            <input
              name="estimatedLeadValue"
              type="number"
              defaultValue={500}
              className="w-28 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
            />
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:brightness-110">
              Add
            </button>
          </form>
          <ul className="divide-y divide-white/5">
            {niches.map((n) => (
              <li key={n.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{n.name}</p>
                  <p className="text-xs text-white/50">
                    {n.categoryGroup} · ~${n.estimatedLeadValue}/lead
                  </p>
                </div>
                <form action={toggleNiche}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    className={`rounded-full px-3 py-1 text-xs ${
                      n.enabled
                        ? "bg-accent-green/20 text-accent-green"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {n.enabled ? "Enabled" : "Disabled"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Discovery defaults">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Stat k="Discovery batch" v={APP_CONFIG.discoveryBatchSize} />
            <Stat k="Deep audit" v={APP_CONFIG.deepAuditLimit} />
            <Stat k="Demos / batch" v={APP_CONFIG.demoGenerationLimit} />
            <Stat k="QA iterations" v={APP_CONFIG.qaMaxIterations} />
            <Stat k="Min lead score" v={APP_CONFIG.minLeadScore} />
            <Stat k="Min demo score" v={APP_CONFIG.minDemoScore} />
            <Stat k="LLM mode" v={APP_CONFIG.llmProvider} />
            <Stat
              k="Worker"
              v={APP_CONFIG.workerEnabled ? "On" : "Off"}
            />
          </dl>
          <p className="mt-4 text-xs text-white/50">
            Edit these via .env (DISCOVERY_BATCH_SIZE, DEEP_AUDIT_LIMIT,
            DEMO_GENERATION_LIMIT, QA_MAX_ITERATIONS, MIN_LEAD_SCORE, MIN_DEMO_SCORE).
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <dt className="text-[11px] uppercase tracking-wider text-white/50">{k}</dt>
      <dd className="mt-1 font-display text-lg">{v}</dd>
    </div>
  );
}
