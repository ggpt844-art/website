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
  const items = await prisma.reviewQueueItem.findMany({
    where: { status: "approved" },
    include: {
      business: { include: { leadScores: { orderBy: { createdAt: "desc" }, take: 1 } } },
      demoConfig: true,
    },
  });
  const headers = [
    "name",
    "city",
    "niche",
    "phone",
    "email",
    "websiteUrl",
    "websiteStatus",
    "leadScore",
    "demoSlug",
  ];
  const rows = items.map((i) =>
    [
      i.business.name,
      i.business.city,
      i.business.niche,
      i.business.phone,
      i.business.email,
      i.business.websiteUrl,
      i.business.websiteStatus,
      i.business.leadScores[0]?.finalLeadScore ?? "",
      i.demoConfig.slug,
    ].map(csvCell).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="approved-leads.csv"',
    },
  });
}
