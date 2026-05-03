import type { OutreachContactStatus } from "@prisma/client";

export const OUTREACH_STATUS_LABELS: Record<OutreachContactStatus, string> = {
  not_contacted: "Not contacted",
  queued: "Queued (manual)",
  contacted: "Contacted",
  replied: "Replied",
  bounced: "Bounced",
  opted_out: "Opted out",
  won: "Won",
  lost: "Lost",
};
