import { prisma } from "@/lib/db/prisma";

export async function isSuppressed(args: {
  email?: string | null;
  phone?: string | null;
}): Promise<{ suppressed: boolean; reason?: string }> {
  if (args.email) {
    const hit = await prisma.suppressionListEntry.findFirst({
      where: { email: args.email.toLowerCase().trim() },
    });
    if (hit) return { suppressed: true, reason: hit.reason };
    const domain = args.email.split("@")[1]?.toLowerCase();
    if (domain) {
      const dHit = await prisma.suppressionListEntry.findFirst({ where: { domain } });
      if (dHit) return { suppressed: true, reason: dHit.reason };
    }
  }
  if (args.phone) {
    const digits = args.phone.replace(/\D/g, "");
    if (digits.length >= 10) {
      const hit = await prisma.suppressionListEntry.findFirst({
        where: { phone: { contains: digits.slice(-10) } },
      });
      if (hit) return { suppressed: true, reason: hit.reason };
    }
  }
  return { suppressed: false };
}
