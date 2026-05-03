import { NextResponse } from "next/server";
import { persistAnalyticsEvent } from "@/lib/analytics/persistEvent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const slug = String(body.slug ?? "");
    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug_required" }, { status: 400 });
    }
    const eventType = String(body.eventType ?? "");
    if (!eventType) {
      return NextResponse.json({ ok: false, error: "event_type_required" }, { status: 400 });
    }

    const result = await persistAnalyticsEvent({
      slug,
      eventType,
      pagePath: body.pagePath != null ? String(body.pagePath) : undefined,
      deviceType: body.deviceType != null ? String(body.deviceType) : undefined,
      referrer: body.referrer != null ? String(body.referrer) : undefined,
      utmSource: body.utmSource != null ? String(body.utmSource) : undefined,
      utmMedium: body.utmMedium != null ? String(body.utmMedium) : undefined,
      utmCampaign: body.utmCampaign != null ? String(body.utmCampaign) : undefined,
      ctaLabel: body.ctaLabel != null ? String(body.ctaLabel) : undefined,
      stepId: body.stepId != null ? String(body.stepId) : undefined,
      leadId: body.leadId != null ? String(body.leadId) : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
