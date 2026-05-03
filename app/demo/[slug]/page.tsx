import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DemoRenderer } from "@/components/demo/DemoRenderer";
import { resolveDemoConfigFromSlug } from "@/lib/demo/resolveDemoConfig";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const resolved = await resolveDemoConfigFromSlug(params.slug);
  if (!resolved) {
    return { title: "Demo" };
  }
  const { config } = resolved;
  const seo = "seo" in config ? config.seo : undefined;
  if (!seo) {
    return {
      title: `${config.business.name} — preview`,
    };
  }
  const noindex = seo.seoIndexingMode === "demo_noindex";
  return {
    title: seo.titleTag,
    description: seo.metaDescription,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
      images: seo.openGraphImage ? [seo.openGraphImage] : undefined,
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { version?: string };
}) {
  const resolved = await resolveDemoConfigFromSlug(params.slug, {
    versionNumber:
      searchParams.version != null && searchParams.version !== ""
        ? Number(searchParams.version)
        : undefined,
  });
  if (!resolved) notFound();

  return <DemoRenderer config={resolved.config} />;
}
