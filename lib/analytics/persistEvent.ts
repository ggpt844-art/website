import { prisma } from "@/lib/db/prisma";
import { categorizeTrafficSource } from "@/lib/analytics/attribution";

export interface PersistAnalyticsEventInput {
  slug: string;
  eventType: string;
  pagePath?: string;
  deviceType?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  ctaLabel?: string | null;
  stepId?: string | null;
  metadata?: Record<string, unknown>;
  leadId?: string | null;
}

export async function persistAnalyticsEvent(input: PersistAnalyticsEventInput) {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug: input.slug },
    select: { id: true, businessId: true },
  });
  if (!demo) return { ok: false as const, error: "demo_not_found" };

  const trafficSource = categorizeTrafficSource({
    referrer: input.referrer,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
  });

  await prisma.analyticsEvent.create({
    data: {
      businessId: demo.businessId,
      demoConfigId: demo.id,
      leadId: input.leadId ?? undefined,
      eventType: input.eventType,
      pagePath: input.pagePath ?? "/",
      deviceType: input.deviceType ?? undefined,
      trafficSource,
      referrer: input.referrer ?? undefined,
      utmSource: input.utmSource ?? undefined,
      utmMedium: input.utmMedium ?? undefined,
      utmCampaign: input.utmCampaign ?? undefined,
      ctaLabel: input.ctaLabel ?? undefined,
      stepId: input.stepId ?? undefined,
      metadataJson: input.metadata ? (input.metadata as object) : undefined,
    },
  });

  return { ok: true as const, businessId: demo.businessId, demoConfigId: demo.id };
}
