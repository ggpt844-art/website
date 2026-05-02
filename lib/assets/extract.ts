import type { CheerioAPI, Cheerio } from "cheerio";
import type { Element as DomElement } from "domhandler";
import type { AssetCandidate } from "./types";

function basename(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.split("/").filter(Boolean).pop() || url;
  } catch {
    return url;
  }
}

function abs(base: string, src: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function nearbyHeadingsFor(
  $: CheerioAPI,
  el: Cheerio<DomElement>,
): string[] {
  const out: string[] = [];
  el.parents().each((_i: number, parent: DomElement) => {
    const $p = $(parent);
    $p.find("h1,h2,h3").each((_j, h) => {
      const t = $(h).text().trim();
      if (t && !out.includes(t)) out.push(t);
    });
    if (out.length >= 3) return false;
    return undefined;
  });
  return out.slice(0, 5);
}

function decodeNextImage(src: string): string {
  try {
    const u = new URL(src, "https://example.com");
    if (u.pathname.includes("/_next/image")) {
      const inner = u.searchParams.get("url");
      if (inner) return decodeURIComponent(inner);
    }
  } catch {
    /* ignore */
  }
  return src;
}

export function extractAssetCandidates(
  $: CheerioAPI,
  pageUrl: string,
  pageType: AssetCandidate["sourcePageType"],
): AssetCandidate[] {
  const out: AssetCandidate[] = [];
  const seen = new Set<string>();

  const push = (
    raw: string | undefined,
    method: AssetCandidate["extractionMethod"],
    el?: Cheerio<DomElement>,
  ) => {
    if (!raw) return;
    if (raw.startsWith("data:")) return;
    const resolved = abs(pageUrl, decodeNextImage(raw));
    if (!resolved) return;
    if (seen.has(resolved)) return;
    seen.add(resolved);
    const altText = el?.attr("alt")?.trim();
    const titleAttr = el?.attr("title")?.trim();
    const widthAttr = el?.attr("width");
    const heightAttr = el?.attr("height");
    out.push({
      url: resolved,
      sourcePageUrl: pageUrl,
      sourcePageType: pageType,
      filename: basename(resolved),
      altText,
      titleAttr,
      nearbyHeadings: el ? nearbyHeadingsFor($, el) : [],
      width: widthAttr ? Number(widthAttr) || undefined : undefined,
      height: heightAttr ? Number(heightAttr) || undefined : undefined,
      extractionMethod: method,
      sourceConfidence: 0.6,
      category: "unknown",
      qualityScore: 0,
      businessRelevanceScore: 0,
      authenticityScore: 0,
      heroSuitabilityScore: 0,
      proofSuitabilityScore: 0,
    });
  };

  $("img").each((_, img) => {
    const $img = $(img);
    push($img.attr("src") || undefined, "img-src", $img);
    const srcset = $img.attr("srcset");
    if (srcset) {
      srcset.split(",").forEach((part) => {
        const url = part.trim().split(" ")[0];
        push(url, "img-srcset", $img);
      });
    }
    push($img.attr("data-src") || undefined, "data-src", $img);
    push($img.attr("data-lazy-src") || undefined, "data-src", $img);
    push($img.attr("data-original") || undefined, "data-src", $img);
  });

  $("picture source").each((_, src) => {
    const $src = $(src);
    const srcset = $src.attr("srcset");
    if (srcset) {
      srcset.split(",").forEach((part) => {
        const url = part.trim().split(" ")[0];
        push(url, "picture-source");
      });
    }
  });

  $("[data-bg]").each((_, el) => {
    push($(el).attr("data-bg") || undefined, "data-bg");
  });

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const m = style.match(/background(?:-image)?:[^;]*url\(['"]?([^'")]+)['"]?\)/i);
    if (m) push(m[1], "inline-bg");
  });

  push(
    $('meta[property="og:image"]').attr("content") || undefined,
    "og-image",
  );
  push(
    $('meta[name="twitter:image"]').attr("content") || undefined,
    "twitter-image",
  );

  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).contents().text();
    try {
      const data = JSON.parse(txt);
      const candidates = Array.isArray(data) ? data : [data];
      for (const item of candidates) {
        const img = item?.image;
        if (typeof img === "string") push(img, "json-ld");
        else if (Array.isArray(img))
          img.forEach((i) => typeof i === "string" && push(i, "json-ld"));
        else if (img && typeof img.url === "string") push(img.url, "json-ld");
      }
    } catch {
      /* ignore json-ld parse errors */
    }
  });

  push(
    $('link[rel="icon"]').attr("href") || undefined,
    "favicon",
  );
  push(
    $('link[rel="apple-touch-icon"]').attr("href") || undefined,
    "favicon",
  );

  return out;
}

export function inferPageType(url: string): AssetCandidate["sourcePageType"] {
  const path = url.toLowerCase();
  if (/(gallery|portfolio|projects|our-work|work|case-studies)/.test(path))
    return "gallery";
  if (/(about|team)/.test(path)) return "about";
  if (/(service)/.test(path)) return "service";
  if (/(contact)/.test(path)) return "contact";
  if (/(testimonial|review)/.test(path)) return "testimonials";
  if (path.endsWith("/") || /home|index/.test(path)) return "home";
  return "unknown";
}

export const PAGE_HINT_TEXTS = [
  "gallery",
  "portfolio",
  "projects",
  "our work",
  "before",
  "after",
  "testimonials",
  "reviews",
  "about",
  "services",
  "team",
  "contact",
];

export function findInternalLinks($: CheerioAPI, baseUrl: string): string[] {
  const out = new Set<string>();
  const baseHost = (() => {
    try {
      return new URL(baseUrl).host;
    } catch {
      return "";
    }
  })();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    const text = ($(a).text() || "").trim().toLowerCase();
    if (!href || !text) return;
    const matches = PAGE_HINT_TEXTS.some((h) => text.includes(h));
    if (!matches) return;
    try {
      const u = new URL(href, baseUrl);
      if (u.host === baseHost) out.add(u.toString().split("#")[0]);
    } catch {
      /* ignore bad hrefs */
    }
  });
  return Array.from(out).slice(0, 8);
}
