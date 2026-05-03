import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "@/components/dashboard/Shell";
import { revalidatePath } from "next/cache";
import type { CrmLeadStatus, LeadPriority } from "@prisma/client";
import { dismissLeadNotification } from "@/lib/actions/businessGrowth";

export const dynamic = "force-dynamic";

async function updateLead(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as CrmLeadStatus;
  const priority = String(formData.get("priority")) as LeadPriority;
  const notes = String(formData.get("notes") ?? "");
  await prisma.crmLead.update({
    where: { id },
    data: {
      status,
      priority,
      ...(notes ? { notes } : {}),
    },
  });
  revalidatePath("/leads");
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const businessId =
    typeof searchParams.businessId === "string" ? searchParams.businessId : undefined;
  const status =
    typeof searchParams.status === "string" ? (searchParams.status as CrmLeadStatus) : undefined;
  const priority =
    typeof searchParams.priority === "string" ? (searchParams.priority as LeadPriority) : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const where = {
    ...(businessId ? { businessId } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, businesses, dashboardAlerts] = await Promise.all([
    prisma.crmLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { business: { select: { name: true, city: true } } },
    }),
    prisma.business.findMany({
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
      take: 500,
    }),
    prisma.leadNotification.findMany({
      where: { status: "pending", type: "dashboard_alert" },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        business: { select: { id: true, name: true, city: true } },
        lead: { select: { id: true, name: true } },
      },
    }),
  ]);

  const counts = await prisma.crmLead.groupBy({
    by: ["status"],
    _count: true,
    where: businessId ? { businessId } : undefined,
  });

  return (
    <DashboardShell
      title="Lead CRM"
      subtitle="Quote flow submissions from demos — update status manually. No external sending."
    >
      {dashboardAlerts.length > 0 ? (
        <div className="mb-8 rounded-2xl border border-accent-orange/30 bg-accent-orange/5 p-6 text-sm">
          <p className="text-[11px] uppercase tracking-wider text-white/50">Speed-to-lead alerts</p>
          <p className="mt-1 text-xs text-white/45">
            Hot or high-score leads that tripped dashboard alerts. Dismissing clears the banner only.
          </p>
          <ul className="mt-4 space-y-3 text-xs">
            {dashboardAlerts.map((n) => (
              <li
                key={n.id}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 pb-3"
              >
                <div>
                  <p className="text-white/85">{n.message}</p>
                  <p className="mt-1 text-white/45">
                    <Link href={`/business/${n.businessId}?tab=leads`} className="hover:underline">
                      {n.business.name}
                    </Link>
                    <span> · {n.business.city}</span>
                    {n.lead?.name ? <span> · {n.lead.name}</span> : null}
                  </p>
                </div>
                <form action={dismissLeadNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="businessId" value={n.businessId} />
                  <button type="submit" className="text-[10px] underline text-white/50 hover:text-white/70">
                    Dismiss
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap gap-3 text-sm">
        <FilterLink href="/leads" active={!businessId && !status}>
          All
        </FilterLink>
        {counts.map((c) => (
          <FilterLink
            key={c.status}
            href={`/leads?status=${c.status}${businessId ? `&businessId=${businessId}` : ""}`}
            active={status === c.status}
          >
            {c.status} ({c._count})
          </FilterLink>
        ))}
      </div>

      <form className="mb-8 flex flex-wrap items-end gap-3" action="/leads" method="get">
        <label className="text-sm text-white/60">
          Business
          <select
            name="businessId"
            defaultValue={businessId ?? ""}
            className="ml-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
          >
            <option value="">All</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.city}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white/60">
          Priority
          <select
            name="priority"
            defaultValue={priority ?? ""}
            className="ml-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
          >
            <option value="">Any</option>
            <option value="hot">hot</option>
            <option value="warm">warm</option>
            <option value="low">low</option>
          </select>
        </label>
        <label className="text-sm text-white/60">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="name, phone, email"
            className="ml-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5"
        >
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 text-left">When</th>
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Service / urgency</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => (
              <tr key={lead.id} className="text-white/80">
                <td className="px-4 py-3 text-xs text-white/50">
                  {lead.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/business/${lead.businessId}`} className="hover:underline">
                    {lead.business.name}
                  </Link>
                  <p className="text-xs text-white/45">{lead.business.city}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {lead.name ?? "—"}
                  <br />
                  {lead.phone ?? lead.email ?? "—"}
                </td>
                <td className="px-4 py-3">{lead.leadScore}</td>
                <td className="px-4 py-3">{lead.priority}</td>
                <td className="px-4 py-3 text-xs">
                  {lead.serviceNeeded ?? "—"}
                  <br />
                  {lead.urgency ?? ""}
                </td>
                <td className="px-4 py-3 text-xs">{lead.status}</td>
                <td className="px-4 py-3">
                  <form action={updateLead} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs"
                    >
                      {(["new", "contacted", "booked", "sold", "lost", "spam"] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                    <select
                      name="priority"
                      defaultValue={lead.priority}
                      className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs"
                    >
                      {(["hot", "warm", "low"] as const).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      name="notes"
                      placeholder="Notes"
                      defaultValue={lead.notes ?? ""}
                      className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <p className="mt-8 text-center text-sm text-white/50">
          No leads match. Submit a demo quote flow to create records.
        </p>
      )}
    </DashboardShell>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 ${
        active ? "bg-white text-black" : "border border-white/10 text-white/70 hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}
