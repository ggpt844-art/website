"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { ensureLaunchChecklist, parseChecklistItems } from "@/lib/launch/dbLaunchChecklist";
import { buildGrowthReportPayload } from "@/lib/reports/buildGrowthReport";
import {
  buildCaseStudyDraftJson,
  defaultCaseStudyTitle,
} from "@/lib/caseStudies/caseStudyBuilder";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { isSuppressed } from "@/lib/outreach/suppressionList";
import type {
  FollowUpTaskStatus,
  LaunchChecklistStatus,
  OutreachContactStatus,
  Prisma,
} from "@prisma/client";

export async function toggleLaunchChecklistItem(formData: FormData) {
  const businessId = String(formData.get("businessId"));
  const itemId = String(formData.get("itemId"));
  const lc = await ensureLaunchChecklist(businessId);
  const items = parseChecklistItems(lc.itemsJson);
  const next = items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i));
  const status: LaunchChecklistStatus = next.every((x) => x.done) ? "completed" : "in_progress";
  await prisma.launchChecklist.update({
    where: { id: lc.id },
    data: {
      itemsJson: { items: next } as unknown as Prisma.InputJsonValue,
      status,
    },
  });
  revalidatePath(`/business/${businessId}`);
}

export async function generateGrowthReportDraft(formData: FormData) {
  const businessId = String(formData.get("businessId"));
  const end = new Date();
  const start = new Date(end.getTime() - 14 * 86400000);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return;

  const demo = await prisma.demoConfig.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { versions: { orderBy: { totalScore: "desc" }, take: 1 } },
  });

  const cfg = demo?.baseConfigJson as unknown as DemoConfig | null;

  const eventGroups = await prisma.analyticsEvent.groupBy({
    by: ["eventType"],
    where: { businessId, createdAt: { gte: start, lte: end } },
    _count: true,
  });
  const counts: Record<string, number> = {};
  for (const g of eventGroups) counts[g.eventType] = g._count;

  const leadsInWindow = await prisma.crmLead.findMany({
    where: { businessId, createdAt: { gte: start, lte: end } },
    select: { status: true, priority: true },
  });

  const leadStats = {
    total: leadsInWindow.length,
    hot: leadsInWindow.filter((l) => l.priority === "hot").length,
    booked: leadsInWindow.filter((l) => l.status === "booked").length,
    new: leadsInWindow.filter((l) => l.status === "new").length,
  };

  const payload = buildGrowthReportPayload({
    businessName: business.name,
    periodStart: start,
    periodEnd: end,
    demoConfig: cfg,
    eventCounts: counts,
    leadStats,
  });

  await prisma.growthReport.create({
    data: {
      businessId,
      periodStart: start,
      periodEnd: end,
      reportJson: payload.reportJson as object,
      seoHealthScore: payload.seoHealthScore,
      aiSearchScore: payload.aiSearchScore,
      gbpHealthScore: payload.gbpHealthScore,
      napConsistencyScore: payload.napConsistencyScore,
      croScore: payload.croScore,
      leadSummaryJson: payload.leadSummaryJson as object,
      recommendationsJson: payload.recommendationsJson as object,
      status: "draft",
    },
  });

  revalidatePath(`/business/${businessId}`);
  const key = `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`;
  revalidatePath(`/report/${businessId}/${encodeURIComponent(key)}`);
}

export async function createCaseStudyDraft(formData: FormData) {
  const businessId = String(formData.get("businessId"));
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return;

  const demo = await prisma.demoConfig.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { versions: { orderBy: { totalScore: "desc" }, take: 1 } },
  });
  const wc = await prisma.websiteCheck.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const cfg = demo?.baseConfigJson as unknown as DemoConfig | null;
  const top = demo?.versions[0];

  const input = {
    businessName: business.name,
    city: business.city,
    niche: business.niche,
    demoSlug: demo?.slug ?? null,
    websiteQualityScore: wc?.websiteQualityScore ?? null,
    demoTotalScore: top?.totalScore ?? null,
    config: cfg,
  };

  await prisma.caseStudy.create({
    data: {
      businessId,
      title: defaultCaseStudyTitle(input),
      caseStudyJson: buildCaseStudyDraftJson(input) as object,
      beforeScoresJson: {
        websiteQualityScore: wc?.websiteQualityScore,
        conversionScore: wc?.conversionScore,
      } as object,
      afterScoresJson: {
        demoVersionScore: top?.totalScore ?? null,
      } as object,
      seoMetricsJson: cfg?.seo
        ? ({ foundation: cfg.seo.seoFoundationScore } as object)
        : undefined,
      aiSearchMetricsJson: cfg?.aiSearch
        ? ({ score: cfg.aiSearch.aiSearchScore } as object)
        : undefined,
      status: "draft",
    },
  });

  revalidatePath(`/business/${businessId}`);
}

export async function addOutreachContact(formData: FormData) {
  const businessId = String(formData.get("businessId"));
  const name = String(formData.get("name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!email && !phone) return;

  const sup = await isSuppressed({ email, phone });
  if (sup.suppressed) return;

  await prisma.outreachContact.create({
    data: {
      businessId,
      name,
      email,
      phone,
      sourceUrl,
      notes,
      consentStatus: "unknown",
      outreachStatus: "not_contacted",
    },
  });
  revalidatePath(`/business/${businessId}`);
}

export async function updateOutreachContactStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const businessId = String(formData.get("businessId"));
  const status = String(formData.get("status")) as OutreachContactStatus;
  await prisma.outreachContact.update({
    where: { id },
    data: {
      outreachStatus: status,
      lastContactedAt: status === "contacted" ? new Date() : undefined,
    },
  });
  revalidatePath(`/business/${businessId}`);
}

export async function addSuppressionEntry(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const domain = String(formData.get("domain") ?? "").trim() || null;
  const reason = String(formData.get("reason") ?? "").trim() || "manual_opt_out";
  if (!email && !phone && !domain) return;
  await prisma.suppressionListEntry.create({
    data: { email, phone, domain, reason },
  });
  const businessId = String(formData.get("businessId") ?? "");
  if (businessId) revalidatePath(`/business/${businessId}`);
}

export async function dismissLeadNotification(formData: FormData) {
  const id = String(formData.get("id"));
  const businessId = String(formData.get("businessId"));
  await prisma.leadNotification.update({
    where: { id },
    data: { status: "skipped" },
  });
  revalidatePath("/leads");
  revalidatePath(`/business/${businessId}`);
}

export async function markFollowUpTask(formData: FormData) {
  const id = String(formData.get("id"));
  const businessId = String(formData.get("businessId"));
  const status = String(formData.get("taskStatus")) as FollowUpTaskStatus;
  await prisma.followUpTask.update({
    where: { id },
    data: { status },
  });
  revalidatePath(`/business/${businessId}`);
  revalidatePath("/leads");
}
