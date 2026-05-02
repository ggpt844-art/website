import * as cheerio from "cheerio";

export interface FetchedPage {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  html: string;
  $: cheerio.CheerioAPI;
  title: string | null;
  metaDescription: string | null;
  detectedPlatform: string | null;
  loadMs: number;
}

const UA = "LocalFunnelRadarBot/0.1 (+respectful; contact: operator)";

export async function fetchPage(url: string): Promise<FetchedPage | null> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" },
      signal: AbortSignal.timeout(15_000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    return {
      url,
      finalUrl: res.url || url,
      status: res.status,
      ok: res.ok,
      html,
      $,
      title: $("title").first().text().trim() || null,
      metaDescription:
        $('meta[name="description"]').attr("content")?.trim() ||
        $('meta[property="og:description"]').attr("content")?.trim() ||
        null,
      detectedPlatform: detectPlatform($, html),
      loadMs: Date.now() - start,
    };
  } catch {
    return null;
  }
}

function detectPlatform($: cheerio.CheerioAPI, html: string): string | null {
  const generator = $('meta[name="generator"]').attr("content");
  if (generator) {
    const g = generator.toLowerCase();
    if (g.includes("wordpress")) return "WordPress";
    if (g.includes("shopify")) return "Shopify";
    if (g.includes("squarespace")) return "Squarespace";
    if (g.includes("wix")) return "Wix";
    if (g.includes("webflow")) return "Webflow";
    if (g.includes("ghost")) return "Ghost";
    return generator;
  }
  if (html.includes("wp-content/") || html.includes("/wp-includes/")) return "WordPress";
  if (html.includes("cdn.shopify.com")) return "Shopify";
  if (html.includes("squarespace-cdn.com")) return "Squarespace";
  if (html.includes("wixstatic.com") || html.includes("wix-code")) return "Wix";
  if (html.includes("webflow")) return "Webflow";
  if (html.includes("__NEXT_DATA__")) return "Next.js";
  return null;
}
