import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { scoreLeadFromAnswers, parseContactBlob } from "@/lib/leads/scoreLeadFromAnswers";
import { persistAnalyticsEvent } from "@/lib/analytics/persistEvent";
import { categorizeTrafficSource } from "@/lib/analytics/attribution";
import { shouldDashboardAlertForLead } from "@/lib/speedToLead/alertRules";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      slug?: string;
      answers?: Record<string, string>;
      sourcePage?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      referrer?: string;
    };

    const slug = String(body.slug ?? "");
    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug_required" }, { status: 400 });
    }
    const answers = body.answers ?? {};
    if (Object.keys(answers).length === 0) {
      return NextResponse.json({ ok: false, error: "answers_required" }, { status: 400 });
    }

    const demo = await prisma.demoConfig.findUnique({
      where: { slug },
      include: { business: true },
    });
    if (!demo) {
      return NextResponse.json({ ok: false, error: "demo_not_found" }, { status: 404 });
    }

    const config = demo.baseConfigJson as unknown as DemoConfig;
    if (!("conversion" in config) || !config.conversion) {
      return NextResponse.json({ ok: false, error: "config_missing_conversion" }, { status: 422 });
    }

    const scored = scoreLeadFromAnswers(config.conversion, answers);
    const contact = parseContactBlob(answers.contact ?? "");

    const lead = await prisma.crmLead.create({
      data: {
        businessId: demo.businessId,
        demoConfigId: demo.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        serviceNeeded:
          answers.issue ?? answers.projectType ?? answers.pest ?? answers.product ?? answers.comfort ?? null,
        urgency: answers.urgency ?? answers.timeline ?? null,
        city: demo.business.city,
        formAnswersJson: answers as object,
        uploadedFilesJson:
          answers.photo && answers.photo !== "skipped"
            ? ([answers.photo] as unknown as object)
            : undefined,
        leadScore: scored.score,
        leadScoreReasonsJson: scored.reasons as object,
        estimatedValueRange: scored.estimatedValueRange,
        sourcePage: body.sourcePage ?? `/demo/${slug}`,
        trafficSource: categorizeTrafficSource({
          referrer: body.referrer,
          utmSource: body.utmSource,
          utmMedium: body.utmMedium,
        }),
        status: "new",
        priority: scored.priority,
        nextAction: "Contact lead using dashboard templates (manual).",
      },
    });

    await persistAnalyticsEvent({
      slug,
      eventType: "quote_form_submitted",
      pagePath: body.sourcePage ?? `/demo/${slug}`,
      leadId: lead.id,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      referrer: body.referrer,
      metadata: { leadId: lead.id, score: scored.score },
    });

    const speed = shouldDashboardAlertForLead({
      priority: scored.priority,
      leadScore: scored.score,
      urgencyText: lead.urgency,
    });
    if (
      speed.alert &&
      config.conversion.speedToLead?.enabled &&
      config.conversion.speedToLead.hotLeadDashboardAlert
    ) {
      await prisma.leadNotification.create({
        data: {
          leadId: lead.id,
          businessId: demo.businessId,
          type: "dashboard_alert",
          status: "pending",
          message: `${speed.label}: ${contact.name ?? "Lead"} — score ${scored.score}. Review in CRM.`,
          provider: "none",
        },
      });
    }

    if (config.conversion.followUp?.enabled && config.conversion.followUp.sequences?.length) {
      const now = Date.now();
      for (const seq of config.conversion.followUp.sequences) {
        const due = new Date(now + seq.afterMinutes * 60_000);
        await prisma.followUpTask.create({
          data: {
            leadId: lead.id,
            businessId: demo.businessId,
            taskType: seq.id,
            dueAt: due,
            status: "pending",
            messageTemplate: seq.template,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      thankYouPath: config.conversion.thankYouPath ?? `/thank-you/${slug}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
