/**
 * HTML search "research" discovery — no paid API keys.
 *
 * DuckDuckGo often returns an "anomaly" / bot wall (HTTP 202, no organic HTML) for
 * server-side fetch; we use Bing SERP HTML first (mkt=en-CA), then DDG HTML as fallback.
 * Unwraps Bing ck/a `u=a1<base64>` redirects and DDG `uddg=` links.
 */
import * as cheerio from "cheerio";
import { APP_CONFIG } from "@/lib/utils/config";
import type { DiscoveredBusiness, DiscoverySource, DiscoverySourceContext } from "../types";

/** Real browser UA — bot-style strings tend to get empty / challenge pages. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function regionKl(country?: string): string {
  const c = (country ?? "CA").toUpperCase();
  if (c === "US") return "us-en";
  if (c === "CA") return "ca-en";
  if (c === "GB" || c === "UK") return "uk-en";
  return "ca-en";
}

/** Bing /ck/a links store the target in `u=a1` + base64 (no padding). */
function decodeBingCkHref(href: string): string | null {
  try {
    if (!href.includes("bing.com/ck/a")) return null;
    const url = new URL(href.startsWith("http") ? href : `https:${href}`);
    const u = url.searchParams.get("u");
    if (!u) return null;
    if (u.startsWith("a1")) {
      const b64 = u.slice(2);
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      if (decoded.startsWith("http")) return decoded;
    }
  } catch {
    return null;
  }
  return null;
}

function unwrapDdgLink(href: string): string | null {
  const h = href.trim();
  try {
    let full = h;
    if (full.startsWith("//")) full = `https:${full}`;
    if (full.startsWith("/")) return null;
    const url = new URL(full);
    if (url.hostname.includes("duckduckgo.com") && url.pathname.startsWith("/l/")) {
      const uddg = url.searchParams.get("uddg");
      if (uddg) return decodeURIComponent(uddg);
    }
    return full;
  } catch {
    return null;
  }
}

/** encyclopedia / drug guides / health Q&A — not business homepages for our demos */
function isReferenceOrDrugGuideHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    /(^|\.)drugs\.com$/i.test(h) ||
    /(^|\.)webmd\.com$/i.test(h) ||
    /(^|\.)healthline\.com$/i.test(h) ||
    /(^|\.)mayoclinic\.org$/i.test(h) ||
    /(^|\.)rxlist\.com$/i.test(h) ||
    /(^|\.)medlineplus\.gov$/i.test(h) ||
    /(^|\.)fda\.gov$/i.test(h) ||
    /(^|\.)drugwatch\.com$/i.test(h) ||
    /(^|\.)verywellhealth\.com$/i.test(h) ||
    /(^|\.)goodrx\.com$/i.test(h) ||
    /(^|\.)singlecare\.com$/i.test(h) ||
    /(^|\.)clevelandclinic\.org$/i.test(h)
  );
}

/** SERP article / drug-guide titles — skip; don’t use “side effects” alone (too many legit spa/blog titles). */
function isEncyclopediaStyleSerpTitle(title: string): boolean {
  const t = title.replace(/\s+/g, " ").trim();
  const lower = t.toLowerCase();
  if (/\s+-\s*drugs\.com\s*$/i.test(t) || /\s+-\s*webmd\s*$/i.test(t)) return true;
  if (/\buses,?\s+dosage\b/i.test(lower) || /\bcost\s+and\s+how\b/i.test(lower)) return true;
  if (/\bdrug interactions\b/i.test(lower) || /\bprescribing information\b/i.test(lower) || /\bmedication guide\b/i.test(lower))
    return true;
  if (
    /\bdosage\b/i.test(lower) &&
    (/\bside effects\b/i.test(lower) || /\buses warnings\b/i.test(lower))
  )
    return true;
  return false;
}

function isLikelyBusinessHomepage(hostname: string, pathname: string): boolean {
  const h = hostname.toLowerCase();
  /** Federal / institutional — not local service businesses (NIH slipped through old regex). */
  if (
    h.endsWith(".gov") ||
    h.endsWith(".mil") ||
    h.endsWith(".gc.ca") ||
    h.endsWith(".gov.uk") ||
    h.endsWith(".edu") ||
    h === "who.int" ||
    h.endsWith(".who.int")
  ) {
    return false;
  }
  if (isReferenceOrDrugGuideHost(h)) return false;
  const junk =
    /(^|\.)youtube\.com$|(^|\.)redd?it\.com$|(^|\.)youtu\.be$|(^|\.)wikipedia\.org$|(^|\.)linkedin\.com$|(^|\.)facebook\.com$|(^|\.)instagram\.com$|(^|\.)tiktok\.com$|(^|\.)twitter\.com$|(^|\.)x\.com$|(^|\.)pinterest\.com$|(^|\.)reddit\.com$|(^|\.)zhihu\.com$|(^|\.)baidu\.|(^|\.)quora\.com$|^maps\.google\.|^google\.com$/i;
  if (junk.test(h)) return false;
  if ((h.includes("yelp.") || h.includes("bbb.org")) && pathname.length > 2) return true;
  if (h.includes("yellowpages.")) return true;
  if (h.includes("homestars.com")) return true;
  return true;
}

function titleToBusinessName(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s*[\u2013\u2014|]\s*.+$/, "")
    .replace(/\s+-\s+.+$/, "")
    .replace(/\s+-\s+Facebook$/i, "")
    .replace(/\s+on\s+LinkedIn$/i, "")
    .trim()
    .slice(0, 160);
}

function normalizeHttpUrl(href: string): string | null {
  const raw = href.trim();
  try {
    let u = raw;
    if (u.startsWith("//")) u = `https:${u}`;
    const parsed = new URL(u);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (!isLikelyBusinessHomepage(parsed.hostname, parsed.pathname)) return null;
    return parsed.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Resolve SERP href → canonical https URL for dedupe / storage. */
function resolveResultHref(href: string): string | null {
  const bing = decodeBingCkHref(href);
  const afterBing = bing ?? unwrapDdgLink(href) ?? href.trim();
  if (afterBing.startsWith("//")) {
    return normalizeHttpUrl(`https:${afterBing}`);
  }
  if (afterBing.startsWith("http://") || afterBing.startsWith("https://")) {
    return normalizeHttpUrl(afterBing);
  }
  return null;
}

async function fetchBingHtml(query: string): Promise<string | null> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&mkt=en-CA&setlang=en-ca`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html",
        "Accept-Language": "en-CA,en;q=0.9",
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) return null;
    return r.text();
  } catch {
    return null;
  }
}

function parseBingOrganic(html: string, limit: number): { title: string; href: string }[] {
  const $ = cheerio.load(html);
  const rows: { title: string; href: string }[] = [];
  $("li.b_algo").each((_, li) => {
    if (rows.length >= limit) return false;
    const h2a = $(li).find("h2 a").first();
    const href = h2a.attr("href")?.trim();
    const title = h2a.text().replace(/\s+/g, " ").trim();
    if (href && title) rows.push({ title, href });
  });
  return rows;
}

async function fetchDdgHtmlPages(query: string, kl: string): Promise<string | null> {
  try {
    const post = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml",
        Referer: "https://html.duckduckgo.com/",
      },
      body: new URLSearchParams({ q: query, b: "", kl: kl }).toString(),
      signal: AbortSignal.timeout(25_000),
    });
    if (!post.ok) return null;
    const t = await post.text();
    if (t.includes("anomaly") && !t.includes("result__a")) return null;
    return t;
  } catch {
    return null;
  }
}

function parseDdgOrganic(html: string, limit: number): { title: string; href: string }[] {
  const $ = cheerio.load(html);
  const rows: { title: string; href: string }[] = [];

  $("a.result__a").each((_, el) => {
    if (rows.length >= limit) return false;
    const a = $(el);
    const href = a.attr("href")?.trim();
    const title = a.text().replace(/\s+/g, " ").trim();
    if (href && title) rows.push({ title, href });
  });

  if (rows.length === 0) {
    $("a[class*='result'], tr a.result-link").each((_, el) => {
      if (rows.length >= limit) return false;
      const a = $(el);
      const href = a.attr("href")?.trim();
      const title = a.text().replace(/\s+/g, " ").trim();
      if (
        href &&
        title &&
        href.includes("duckduckgo.com/l/") &&
        !title.toLowerCase().includes("next page")
      ) {
        rows.push({ title, href });
      }
    });
  }

  return rows;
}

/** Stronger locality for HTML SERPs (city-only queries often drift to Q&A / global results). */
function searchQueryWithRegion(ctx: DiscoverySourceContext): string {
  const tail = [ctx.region, ctx.country === "CA" ? "Canada" : ctx.country === "US" ? "USA" : ""]
    .filter(Boolean)
    .join(" ");
  return tail ? `${ctx.query} ${tail}` : ctx.query;
}

async function fetchOrganicRows(
  query: string,
  kl: string,
  limit: number,
): Promise<{ title: string; href: string }[]> {
  const bingHtml = await fetchBingHtml(query);
  if (bingHtml) {
    const bingRows = parseBingOrganic(bingHtml, limit);
    if (bingRows.length > 0) return bingRows;
  }
  const ddgHtml = await fetchDdgHtmlPages(query, kl);
  if (!ddgHtml) return [];
  return parseDdgOrganic(ddgHtml, limit);
}

export const webResearchSource: DiscoverySource = {
  name: "web_research",
  available: APP_CONFIG.enableWebResearchSource,
  rateLimitMs: 4_000,
  async search(ctx: DiscoverySourceContext): Promise<DiscoveredBusiness[]> {
    const kl = regionKl(ctx.country);
    const need = Math.max(8, ctx.limit * 2);
    const q = searchQueryWithRegion(ctx);
    const rows = await fetchOrganicRows(q, kl, need);
    const out: DiscoveredBusiness[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (out.length >= ctx.limit) break;
      if (isEncyclopediaStyleSerpTitle(row.title)) continue;
      const site = resolveResultHref(row.href);
      if (!site) continue;
      try {
        const host = new URL(site).hostname.toLowerCase();
        if (isReferenceOrDrugGuideHost(host)) continue;
      } catch {
        continue;
      }
      const key = site.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const name = titleToBusinessName(row.title);
      if (name.length < 2 || isEncyclopediaStyleSerpTitle(name)) continue;

      out.push({
        name,
        niche: ctx.niche,
        city: ctx.city,
        region: ctx.region,
        country: ctx.country ?? "CA",
        websiteUrl: site,
        category: ctx.niche,
        source: "directory",
        sourceUrl: site,
        confidence: 0.52,
        rawJson: {
          discovery: "web_research",
          query: q,
          serpTitle: row.title,
        },
      });
    }

    return out;
  },
};
