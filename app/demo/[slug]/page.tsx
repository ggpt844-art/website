import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { DemoRenderer } from "@/components/demo/DemoRenderer";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export const dynamic = "force-dynamic";

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { version?: string };
}) {
  const demo = await prisma.demoConfig.findUnique({
    where: { slug: params.slug },
    include: { versions: { orderBy: { versionNumber: "asc" } } },
  });
  if (!demo) notFound();

  let config = demo.baseConfigJson as unknown as DemoConfig;
  if (searchParams.version) {
    const v = demo.versions.find(
      (vv) => vv.versionNumber === Number(searchParams.version),
    );
    if (v) config = v.demoConfigJson as unknown as DemoConfig;
  } else if (demo.winningVersionId) {
    const winner = demo.versions.find((v) => v.id === demo.winningVersionId);
    if (winner) config = winner.demoConfigJson as unknown as DemoConfig;
  }

  return <DemoRenderer config={config} />;
}
