import { prisma } from "@/lib/db/prisma";
import { activeSources } from "@/lib/discovery/sources";
import { buildQueries } from "@/lib/discovery/queries";
import { dedupe } from "@/lib/discovery/dedupe";
import { classifyWebsite } from "@/lib/discovery/classify";
import { normalizeBusinessName, slugify, uniqueSlug } from "@/lib/utils/slug";
import type { DiscoveredBusiness } from "@/lib/discovery/types";

export interface DiscoveryJobPayload {
  jobId: string;
}

export async function runDiscoveryJob({ jobId }: DiscoveryJobPayload): Promise<void> {
  const job = await prisma.discoveryJob.findUnique({
    where: { id: jobId },
    include: { city: true, niche: true },
  });
  if (!job) return;

  await prisma.discoveryJob.update({
    where: { id: jobId },
    data: { status: "running", startedAt: new Date() },
  });

  try {
    const sources = activeSources();
    const queries = buildQueries(job.niche.slug, job.city.name);
    const all: DiscoveredBusiness[] = [];

    for (const query of queries) {
      for (const source of sources) {
        const results = await source.search({
          city: job.city.name,
          region: job.city.region,
          country: job.city.country,
          niche: job.niche.slug,
          query,
          limit: Math.ceil(job.batchSize / queries.length),
        });
        all.push(...results);
        if (source.rateLimitMs) {
          await new Promise((r) => setTimeout(r, source.rateLimitMs));
        }
      }
    }

    const merged = dedupe(all).slice(0, job.batchSize);
    let saved = 0;

    const existingSlugs = new Set(
      (await prisma.business.findMany({ select: { slug: true } })).map((b) => b.slug),
    );

    for (const rec of merged) {
      const normalized = normalizeBusinessName(rec.name);
      const existing = await prisma.business.findFirst({
        where: {
          OR: [
            { phone: rec.phone ?? "__none__" },
            { websiteUrl: rec.websiteUrl ?? "__none__" },
            { normalizedName: normalized, city: rec.city },
          ],
        },
      });
      if (existing) continue;

      const slugBase = slugify(`${rec.name}-${rec.city}`);
      const slug = uniqueSlug(slugBase, existingSlugs);
      existingSlugs.add(slug);

      const status = classifyWebsite({
        websiteUrl: rec.websiteUrl,
        socialLinks: rec.socialLinks,
        directoryLinks: rec.directoryLinks,
      });

      await prisma.business.create({
        data: {
          name: rec.name,
          normalizedName: normalized,
          slug,
          niche: rec.niche,
          category: rec.category ?? null,
          city: rec.city,
          region: rec.region ?? null,
          country: rec.country ?? "CA",
          phone: rec.phone ?? null,
          email: rec.email ?? null,
          address: rec.address ?? null,
          websiteUrl: rec.websiteUrl ?? null,
          websiteStatus: status,
          rating: rec.rating ?? null,
          reviewCount: rec.reviewCount ?? null,
          socialLinksJson: rec.socialLinks ?? undefined,
          directoryLinksJson: rec.directoryLinks ?? undefined,
          sourceUrlsJson: { urls: rec.sourceUrls } as object,
          sourceConfidenceJson: rec.sourceConfidences as object,
          sources: {
            create: rec.sourceUrls.map((url) => ({
              sourceType: rec.source,
              sourceUrl: url,
              confidence: rec.sourceConfidences[url] ?? rec.confidence,
              extractedDataJson: (rec.rawJson as object) ?? undefined,
            })),
          },
        },
      });
      saved++;
    }

    await prisma.discoveryJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        completedAt: new Date(),
        businessesFound: all.length,
        businessesSaved: saved,
      },
    });
  } catch (err) {
    await prisma.discoveryJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: (err as Error).message,
      },
    });
    throw err;
  }
}
