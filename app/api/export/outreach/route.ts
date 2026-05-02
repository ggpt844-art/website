import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return /[,"\n]/.test(s) ? `"${s}"` : s;
}

export async function GET() {
  const messages = await prisma.outreachMessage.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
  });
  const headers = [
    "businessName",
    "city",
    "niche",
    "phone",
    "email",
    "smsText",
    "emailSubject",
    "emailBody",
    "instagramDm",
    "callScript",
    "followUp1",
    "followUp2",
    "contactReason",
  ];
  const rows = messages.map((m) =>
    [
      m.business.name,
      m.business.city,
      m.business.niche,
      m.business.phone,
      m.business.email,
      m.smsText,
      m.emailSubject,
      m.emailBody,
      m.instagramDm,
      m.callScript,
      m.followUp1,
      m.followUp2,
      m.contactReason,
    ].map(csvCell).join(","),
  );
  return new NextResponse([headers.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="outreach.csv"',
    },
  });
}
