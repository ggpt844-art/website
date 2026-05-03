import Link from "next/link";
import type {
  CaseStudy,
  FollowUpTask,
  GrowthReport,
  LaunchChecklist,
  LeadNotification,
  OutreachContact,
} from "@prisma/client";
import { parseChecklistItems } from "@/lib/launch/dbLaunchChecklist";
import {
  addOutreachContact,
  addSuppressionEntry,
  createCaseStudyDraft,
  dismissLeadNotification,
  generateGrowthReportDraft,
  markFollowUpTask,
  toggleLaunchChecklistItem,
  updateOutreachContactStatus,
} from "@/lib/actions/businessGrowth";
import { defaultOutreachSequence } from "@/lib/outreach/outreachSequences";
import { OUTREACH_STATUS_LABELS } from "@/lib/outreach/outreachStatus";
import { reviewStrategyBullets } from "@/lib/reviews/reviewStrategy";
import { APP_CONFIG } from "@/lib/utils/config";

export function LaunchChecklistPanel({
  checklist,
  businessId,
  demoPath,
}: {
  checklist: LaunchChecklist;
  businessId: string;
  demoPath: string | null;
}) {
  const items = parseChecklistItems(checklist.itemsJson);
  const sampleReportKey = encodeURIComponent("2026-01-01_2026-01-14");
  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">
          Handoff checklist ({checklist.status})
        </p>
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 text-xs text-white/75">
              <span className={i.done ? "text-accent-green" : "text-white/40"}>
                {i.done ? "yes" : "no"}
              </span>
              <span className="flex-1">{i.label}</span>
              <form action={toggleLaunchChecklistItem}>
                <input type="hidden" name="businessId" value={businessId} />
                <input type="hidden" name="itemId" value={i.id} />
                <button
                  type="submit"
                  className="rounded-full border border-white/15 px-3 py-1 text-[11px] hover:bg-white/5"
                >
                  Toggle
                </button>
              </form>
            </li>
          ))}
        </ul>
        {demoPath ? (
          <Link href={demoPath} className="mt-4 inline-block text-xs underline text-white/60">
            Open demo for QA
          </Link>
        ) : null}
        <Link
          href={`/report/${businessId}/${sampleReportKey}`}
          className="mt-2 block text-xs underline text-white/50"
        >
          Sample report URL
        </Link>
      </div>
    </div>
  );
}

export function ReportsPanel({
  businessId,
  reports,
}: {
  businessId: string;
  reports: GrowthReport[];
  reviewBullets?: string[];
}) {
  const bullets = reviewStrategyBullets();
  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">
          Generate draft report (last 14 days)
        </p>
        <form action={generateGrowthReportDraft} className="mt-4">
          <input type="hidden" name="businessId" value={businessId} />
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
          >
            Save GrowthReport draft
          </button>
        </form>
        <p className="mt-3 text-xs text-white/45">Creates a DB row. No email.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Review reminders</p>
        <ul className="mt-3 space-y-1 text-xs text-white/65">
          {bullets.map((b) => (
            <li key={b}> {b}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Saved reports</p>
        <ul className="mt-3 space-y-2 text-xs">
          {reports.length === 0 ? (
            <li className="text-white/45">None yet.</li>
          ) : (
            reports.map((r) => {
              const key = `${r.periodStart.toISOString().slice(0, 10)}_${r.periodEnd.toISOString().slice(0, 10)}`;
              return (
                <li key={r.id}>
                  <Link href={`/report/${businessId}/${encodeURIComponent(key)}`} className="underline">
                    {key} / {r.status} / CRO {r.croScore ?? "-"}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export function CaseStudyPanel({ businessId, studies }: { businessId: string; studies: CaseStudy[] }) {
  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Generate case study draft</p>
        <form action={createCaseStudyDraft} className="mt-4">
          <input type="hidden" name="businessId" value={businessId} />
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
          >
            Create CaseStudy draft
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Drafts</p>
        <ul className="mt-3 space-y-2 text-xs text-white/70">
          {studies.map((s) => (
            <li key={s.id}>
              <span className="font-medium text-white">{s.title}</span> {s.status}
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[10px] text-white/50">
                {JSON.stringify(s.caseStudyJson, null, 2).slice(0, 1000)}
              </pre>
            </li>
          ))}
          {studies.length === 0 ? <li className="text-white/45">No drafts.</li> : null}
        </ul>
      </div>
    </div>
  );
}

export function OutreachPanel({
  businessId,
  contacts,
  businessName,
  demoPath,
}: {
  businessId: string;
  contacts: OutreachContact[];
  businessName: string;
  demoPath: string | null;
}) {
  const base = APP_CONFIG.appUrl.replace(/\/$/, "");
  const fullDemo = demoPath ? `${base}${demoPath}` : `${base}/demo/...`;
  const touches = defaultOutreachSequence(businessName, fullDemo);

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-xs text-amber-100/90">
        Manual outreach only. No auto-send. Use suppression before sequences.
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Suggested copy</p>
        <ul className="mt-3 space-y-4 text-xs text-white/70">
          {touches.map((t) => (
            <li key={t.id} className="rounded-lg bg-black/30 p-3">
              <p className="text-white/50">
                day+{t.dayOffset} {t.channel}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{t.template}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Add prospect</p>
        <form action={addOutreachContact} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="businessId" value={businessId} />
          <input name="name" placeholder="Name" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="email" placeholder="Email" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="phone" placeholder="Phone" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="sourceUrl" placeholder="Source URL" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="notes" placeholder="Notes" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/5">
            Save
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Suppression</p>
        <form action={addSuppressionEntry} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="businessId" value={businessId} />
          <input name="email" placeholder="Email" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="phone" placeholder="Phone" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="domain" placeholder="Domain" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <input name="reason" placeholder="Reason" className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs" />
          <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/5">
            Add
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Contacts</p>
        <ul className="mt-3 space-y-3 text-xs">
          {contacts.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <p className="text-white/85">{c.name ?? "-"}</p>
                <p className="text-white/55">{c.email ?? c.phone ?? "-"}</p>
                <p className="text-white/40">{OUTREACH_STATUS_LABELS[c.outreachStatus]}</p>
              </div>
              <form action={updateOutreachContactStatus} className="flex flex-wrap gap-1">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="businessId" value={businessId} />
                {(["queued", "contacted", "replied", "opted_out", "lost"] as const).map((s) => (
                  <button
                    key={s}
                    type="submit"
                    name="status"
                    value={s}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] hover:bg-white/5"
                  >
                    {s}
                  </button>
                ))}
              </form>
            </li>
          ))}
          {contacts.length === 0 ? <li className="text-white/45">Empty.</li> : null}
        </ul>
      </div>
    </div>
  );
}

type LeadNotifWithLead = LeadNotification & { lead: { id: string; name: string | null } | null };
type TaskWithLead = FollowUpTask & { lead: { id: string; name: string | null } | null };

export function LeadOpsPanel({
  businessId,
  notifications,
  tasks,
}: {
  businessId: string;
  notifications: LeadNotifWithLead[];
  tasks: TaskWithLead[];
}) {
  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-2xl border border-accent-orange/30 bg-accent-orange/5 p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Speed-to-lead (dashboard)</p>
        <ul className="mt-3 space-y-3 text-xs">
          {notifications.map((n) => (
            <li key={n.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 pb-2">
              <p className="text-white/80">{n.message}</p>
              <form action={dismissLeadNotification}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="businessId" value={businessId} />
                <button type="submit" className="text-[10px] underline text-white/50">
                  Dismiss
                </button>
              </form>
            </li>
          ))}
          {notifications.length === 0 ? <li className="text-white/45">No pending alerts.</li> : null}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Follow-up tasks</p>
        <ul className="mt-3 space-y-3 text-xs">
          {tasks.map((t) => (
            <li key={t.id} className="border-b border-white/5 pb-2">
              <p className="text-white/55">{t.taskType}</p>
              <p className="text-white/70">{t.messageTemplate}</p>
              <p className="text-white/40">
                Due: {t.dueAt ? t.dueAt.toISOString().slice(0, 16) : "—"} · Lead:{" "}
                {t.lead?.name ?? t.leadId}
              </p>
              <div className="mt-2 flex gap-2">
                <form action={markFollowUpTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="businessId" value={businessId} />
                  <input type="hidden" name="taskStatus" value="done" />
                  <button type="submit" className="rounded-full border border-white/15 px-2 py-1 text-[10px]">
                    Done
                  </button>
                </form>
                <form action={markFollowUpTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="businessId" value={businessId} />
                  <input type="hidden" name="taskStatus" value="skipped" />
                  <button type="submit" className="rounded-full border border-white/15 px-2 py-1 text-[10px]">
                    Skip
                  </button>
                </form>
              </div>
            </li>
          ))}
          {tasks.length === 0 ? <li className="text-white/45">No pending tasks.</li> : null}
        </ul>
      </div>
    </div>
  );
}
