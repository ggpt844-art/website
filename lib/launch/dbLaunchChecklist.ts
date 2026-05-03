import { prisma } from "@/lib/db/prisma";
import { defaultLaunchChecklistItems, type LaunchChecklistItem } from "@/lib/launch/launchChecklist";

export async function ensureLaunchChecklist(businessId: string) {
  const existing = await prisma.launchChecklist.findFirst({
    where: { businessId },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  const items = defaultLaunchChecklistItems();
  return prisma.launchChecklist.create({
    data: {
      businessId,
      itemsJson: { items } as object,
      status: "in_progress",
    },
  });
}

export function parseChecklistItems(json: unknown): LaunchChecklistItem[] {
  const raw = json as { items?: LaunchChecklistItem[] } | null;
  if (raw?.items && Array.isArray(raw.items)) return raw.items;
  return defaultLaunchChecklistItems();
}
