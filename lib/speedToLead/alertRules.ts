import type { LeadPriority } from "@prisma/client";

export function shouldDashboardAlertForLead(args: {
  priority: LeadPriority;
  leadScore: number;
  urgencyText: string | null | undefined;
}): { alert: boolean; label: string } {
  const u = (args.urgencyText ?? "").toLowerCase();
  if (args.priority === "hot" || /\btoday\b|emergency|asap|no heat|no cooling|active leak/i.test(u)) {
    return { alert: true, label: "Hot / urgent — speed-to-lead" };
  }
  if (args.leadScore >= 75) {
    return { alert: true, label: "High score lead — follow up" };
  }
  return { alert: false, label: "" };
}
