import { PrismaClient } from "@prisma/client";
import { DEFAULT_CITIES, NICHE_LIST } from "../lib/presets/niches";
import { buildDemoConfig } from "../lib/renderer/buildDemoConfig";
import { gradeDemo, applyConfigPatch } from "../lib/qa/critic";
import { writeOutreach } from "../lib/agents/outreachWriter";
import { slugify } from "../lib/utils/slug";
import { APP_CONFIG } from "../lib/utils/config";

const prisma = new PrismaClient();

async function seedTargets() {
  for (const c of DEFAULT_CITIES) {
    await prisma.targetCity.upsert({
      where: {
        name_region_country: { name: c.name, region: c.region, country: c.country },
      },
      create: { ...c, enabled: true },
      update: { enabled: true },
    });
  }
  for (const n of NICHE_LIST) {
    await prisma.targetNiche.upsert({
      where: { slug: n.slug },
      create: {
        name: n.label,
        slug: n.slug,
        categoryGroup: n.categoryGroup,
        estimatedLeadValue: n.estimatedLeadValue,
        enabled: true,
      },
      update: {
        name: n.label,
        categoryGroup: n.categoryGroup,
        estimatedLeadValue: n.estimatedLeadValue,
        enabled: true,
      },
    });
  }
}

interface SampleSpec {
  name: string;
  city: string;
  niche: string;
  phone: string;
  websiteStatus:
    | "no_website"
    | "outdated_website"
    | "decent_but_low_conversion";
  websiteUrl?: string;
  rating?: number;
  reviewCount?: number;
  weaknesses: string[];
}

const SAMPLES: SampleSpec[] = [
  {
    name: "Northline Roofing & Restoration",
    city: "Mississauga",
    niche: "roofing",
    phone: "+19055551234",
    websiteStatus: "outdated_website",
    websiteUrl: "https://example-northline.local",
    rating: 4.7,
    reviewCount: 132,
    weaknesses: [
      "No guided quote flow / diagnostic",
      "No photo upload path for faster quotes",
      "No sticky mobile CTA",
      "Trust signals are weak / not visible",
    ],
  },
  {
    name: "Stonebridge Insulation",
    city: "Vaughan",
    niche: "attic-insulation",
    phone: "+19055559876",
    websiteStatus: "no_website",
    rating: undefined,
    reviewCount: undefined,
    weaknesses: ["No website found"],
  },
  {
    name: "Maple Hill Dental Studio",
    city: "Oakville",
    niche: "dentists",
    phone: "+19055557890",
    websiteStatus: "decent_but_low_conversion",
    websiteUrl: "https://example-maplehill-dental.local",
    rating: 4.9,
    reviewCount: 88,
    weaknesses: [
      "No guided consultation flow",
      "Trust signals are weak / not visible",
      "No sticky mobile CTA",
    ],
  },
];

async function seedSamples() {
  for (const s of SAMPLES) {
    const slug = slugify(`${s.name}-${s.city}`);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) continue;
    const b = await prisma.business.create({
      data: {
        name: s.name,
        normalizedName: s.name.toLowerCase(),
        slug,
        niche: s.niche,
        category: s.niche,
        city: s.city,
        region: "ON",
        country: "CA",
        phone: s.phone,
        websiteUrl: s.websiteUrl,
        websiteStatus: s.websiteStatus,
        rating: s.rating ?? null,
        reviewCount: s.reviewCount ?? null,
        sources: {
          create: {
            sourceType: "manual",
            sourceUrl: "local://seed",
            confidence: 1,
          },
        },
      },
    });

    await prisma.websiteCheck.create({
      data: {
        businessId: b.id,
        url: s.websiteUrl ?? "(none)",
        status: s.websiteStatus,
        loadsSuccessfully: !!s.websiteUrl,
        title: s.websiteUrl ? `${s.name} — ${s.city}` : null,
        visualQualityScore: s.websiteStatus === "decent_but_low_conversion" ? 65 : 35,
        conversionScore: s.websiteStatus === "decent_but_low_conversion" ? 50 : 25,
        trustScore: 40,
        mobileCtaScore: 30,
        speedScore: 60,
        leadFunnelScore: 25,
        websiteQualityScore: s.websiteStatus === "decent_but_low_conversion" ? 55 : 35,
        positivesJson:
          s.websiteStatus === "decent_but_low_conversion"
            ? ["Has a clear hero / page structure", "Modern typography"]
            : [],
        mainWeaknessesJson: s.weaknesses,
        auditJson: { wordCount: 400, formCount: 1 },
      },
    });

    await prisma.leadScore.create({
      data: {
        businessId: b.id,
        businessValueScore: 80,
        websiteWeaknessScore: s.websiteStatus === "no_website" ? 92 : 75,
        demoOpportunityScore: 90,
        outreachReadinessScore: 80,
        finalLeadScore: 84,
        priority: "hot",
        reason: "Seeded sample lead.",
      },
    });

    const config = await buildDemoConfig({
      businessName: b.name,
      city: b.city,
      niche: b.niche,
      phone: b.phone,
      category: b.category,
      rating: b.rating,
      reviewCount: b.reviewCount,
      websiteUrl: b.websiteUrl,
      weaknesses: s.weaknesses,
      slugOverride: b.slug,
      recentSameNicheFingerprints: [],
    });

    const demo = await prisma.demoConfig.create({
      data: {
        businessId: b.id,
        slug: b.slug,
        baseConfigJson: config as unknown as object,
        status: "qa_running",
      },
    });

    let current = config;
    let bestScore = -1;
    let bestVersionId: string | null = null;
    for (let i = 1; i <= 3; i++) {
      const grade = gradeDemo({
        config: current,
        iteration: i,
        currentSiteWeaknesses: s.weaknesses,
        currentSitePositives: [],
        currentSiteVisualScore: 35,
      });
      const v = await prisma.demoVersion.create({
        data: {
          demoConfigId: demo.id,
          businessId: b.id,
          versionNumber: i,
          demoConfigJson: current as unknown as object,
          totalScore: grade.totalScore,
          scoreBreakdownJson: grade.categoryScores as object,
          criticNotesJson: {
            critical: grade.criticalIssues,
            minor: grade.minorIssues,
            reasoning: grade.reasoningSummary,
          } as object,
          improvementPlanJson: grade.improvementPlan as object,
          configPatchJson: grade.configPatch as object,
          status: "graded",
        },
      });
      if (grade.totalScore > bestScore) {
        bestScore = grade.totalScore;
        bestVersionId = v.id;
      }
      if (grade.verdict === "approve" || grade.verdict === "reject") break;
      current = applyConfigPatch(current, grade.configPatch);
    }

    if (bestVersionId) {
      await prisma.demoVersion.update({
        where: { id: bestVersionId },
        data: { status: "winner" },
      });
    }

    await prisma.demoConfig.update({
      where: { id: demo.id },
      data: {
        status: bestScore >= APP_CONFIG.minDemoScore ? "approved" : "needs_manual_polish",
        winningVersionId: bestVersionId ?? undefined,
      },
    });

    const outreach = writeOutreach({
      businessName: b.name,
      city: b.city,
      niche: b.niche,
      websiteStatus: s.websiteStatus,
      demoUrl: `http://localhost:3000/demo/${b.slug}`,
      auditUrl: `http://localhost:3000/audit/${b.slug}`,
      contactReason: config.strategy.contactReason,
    });
    await prisma.outreachMessage.create({
      data: {
        businessId: b.id,
        demoConfigId: demo.id,
        smsText: outreach.smsText,
        emailSubject: outreach.emailSubject,
        emailBody: outreach.emailBody,
        instagramDm: outreach.instagramDm,
        callScript: outreach.callScript,
        followUp1: outreach.followUp1,
        followUp2: outreach.followUp2,
        contactReason: outreach.contactReason,
      },
    });

    if (bestScore >= APP_CONFIG.minDemoScore) {
      await prisma.reviewQueueItem.upsert({
        where: { id: `${demo.id}-review` },
        create: {
          id: `${demo.id}-review`,
          businessId: b.id,
          demoConfigId: demo.id,
          status: "pending",
        },
        update: { status: "pending" },
      });
    }
  }
}

async function main() {
  await seedTargets();
  await seedSamples();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
