import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.business.findMany({
    where: { city: { contains: "Toronto", mode: "insensitive" } },
    take: 30,
    orderBy: { updatedAt: "desc" },
    include: {
      demoConfigs: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          status: true,
          createdAt: true,
          winningVersionId: true,
        },
      },
    },
  });

  if (!rows.length) {
    console.log("No businesses with city matching Toronto in this database.");
    return;
  }

  for (const b of rows) {
    const hasDemo = b.demoConfigs.length > 0;
    console.log("---");
    console.log("Business:", b.name, "|", b.city, "|", b.niche);
    console.log("  Demos:", hasDemo ? b.demoConfigs.length : 0);
    for (const d of b.demoConfigs) {
      console.log(
        `    slug=${d.slug} status=${d.status} created=${d.createdAt.toISOString().slice(0, 10)}`,
      );
    }
    if (hasDemo && b.demoConfigs[0]) {
      const slug = b.demoConfigs[0].slug;
      console.log(`    Local URL: /demo/${slug}`);
    }
  }

  const anyTorontoDemo = await prisma.demoConfig.findMany({
    where: {
      OR: [
        { slug: { contains: "toronto", mode: "insensitive" } },
        { business: { city: { contains: "Toronto", mode: "insensitive" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      slug: true,
      status: true,
      createdAt: true,
      business: { select: { name: true, city: true } },
    },
  });
  console.log("\nAll DemoConfig rows tied to Toronto or slug *toronto* (any):");
  console.log(JSON.stringify(anyTorontoDemo, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
