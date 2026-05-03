/**
 * Pull NAP-style contact data from a fetched homepage using schema.org JSON-LD,
 * tel:/mailto: links, and light regex fallbacks. Intended to run during website
 * verification so discovery + pipeline need less manual cleanup.
 */
import type { CheerioAPI } from "cheerio";
import type { FetchedPage } from "./fetchPage";
import { normalizeBusinessName, normalizePhone } from "@/lib/utils/slug";

export type ContactExtraction = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** JSON-LD present — prefer these values over noisy SERP titles */
  fromJsonLd: boolean;
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const NA_PHONE_RE = /(?:\+?1[-.\s]?)?(?:\(\s*\d{3}\s*\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

function flattenLdNodes(raw: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (Array.isArray(o["@graph"])) {
      for (const g of o["@graph"] as unknown[]) walk(g);
      return;
    }
    out.push(o);
    if (typeof o.parentOrganization === "object" && o.parentOrganization) {
      walk(o.parentOrganization);
    }
    if (Array.isArray(o.subOrganization)) {
      for (const s of o.subOrganization as unknown[]) walk(s);
    }
  }

  try {
    const data = raw as Record<string, unknown> | unknown[];
    if (Array.isArray(data)) {
      for (const item of data) walk(item);
    } else {
      walk(data);
    }
  } catch {
    /* ignore */
  }
  return out;
}

function interestedType(t: unknown): boolean {
  if (typeof t !== "string") return false;
  const u = t.toLowerCase();
  return (
    u.includes("localbusiness") ||
    u.includes("organization") ||
    u.includes("professional") ||
    u.includes("contractor") ||
    u.includes("store") ||
    u.includes("dentist") ||
    u.includes("homeandconstruction") ||
    u.includes("plumber") ||
    u.includes("electrician") ||
    u.includes("hvac") ||
    u.includes("roofing")
  );
}

function pickType(node: Record<string, unknown>): boolean {
  const t = node["@type"];
  if (Array.isArray(t)) return t.some((x) => interestedType(String(x)));
  return interestedType(t);
}

function stringifyAddress(addr: unknown): string | undefined {
  if (!addr || typeof addr !== "object") return undefined;
  const a = addr as Record<string, unknown>;
  const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
    .flatMap((x) => (typeof x === "string" ? x : null))
    .filter(Boolean) as string[];
  const s = parts.join(", ").replace(/\s+,/g, ",").trim();
  return s || undefined;
}

function extractFromJsonLd($: CheerioAPI): Omit<ContactExtraction, "fromJsonLd"> & { hit: boolean } {
  let name: string | undefined;
  let phone: string | undefined;
  let email: string | undefined;
  let address: string | undefined;
  let hit = false;

  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).contents().text().trim();
    if (!txt) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(txt);
    } catch {
      return;
    }
    const nodes = flattenLdNodes(parsed);
    for (const node of nodes) {
      if (!pickType(node)) continue;
      hit = true;
      if (!name && typeof node.name === "string" && node.name.trim()) name = node.name.trim();
      if (!phone) {
        const tel = node.telephone ?? node.phone;
        if (typeof tel === "string" && tel.trim()) phone = tel.trim();
      }
      if (!email && typeof node.email === "string" && node.email.includes("@")) {
        email = node.email.trim();
      }
      if (!address) {
        const ad = node.address as unknown;
        if (typeof ad === "string" && ad.trim()) address = ad.trim();
        else {
          const s = stringifyAddress(ad);
          if (s) address = s;
        }
      }
    }
  });

  return { name, phone, email, address, hit };
}

function extractFromDom($: CheerioAPI, html: string): Omit<ContactExtraction, "fromJsonLd"> {
  let phone: string | undefined;
  let email: string | undefined;

  $('a[href^="tel:"]').each((_, el) => {
    if (phone) return false;
    const raw = ($(el).attr("href") ?? "").replace(/^tel:/i, "");
    const decoded = decodeURIComponent(raw).trim();
    if (decoded) phone = decoded;
  });

  $('a[href^="mailto:"]').each((_, el) => {
    if (email) return false;
    const m = ($(el).attr("href") ?? "").replace(/^mailto:/i, "").split("?")[0];
    if (m && EMAIL_RE.test(m)) email = decodeURIComponent(m).trim();
  });

  if (!phone) {
    const body = $("body").text();
    const m = body.match(NA_PHONE_RE);
    if (m?.[0]) phone = m[0].trim();
  }

  if (!email) {
    const m = html.match(EMAIL_RE);
    if (m?.[0] && !m[0].toLowerCase().includes("example.com")) email = m[0];
  }

  const ogSite = $('meta[property="og:site_name"]').attr("content")?.trim();
  return { name: ogSite || undefined, phone, email, address: undefined };
}

/** Best-effort contact from homepage HTML (called after successful fetch). */
export function extractBusinessContactFromFetchedPage(page: FetchedPage): ContactExtraction {
  const ld = extractFromJsonLd(page.$);
  const dom = extractFromDom(page.$, page.html);

  const name = ld.name ?? dom.name;
  const rawPhone = ld.phone ?? dom.phone;
  const nPhone = normalizePhone(rawPhone ?? undefined);
  const phone = nPhone ?? (rawPhone ? rawPhone.slice(0, 32) : undefined);

  return {
    name: name?.slice(0, 200),
    phone: phone?.slice(0, 40),
    email: (ld.email ?? dom.email)?.slice(0, 120),
    address: ld.address?.slice(0, 300),
    fromJsonLd: ld.hit,
  };
}

/** Apply extraction to Prisma update payload: fill gaps or trust JSON-LD over thin SERP titles. */
export function mergeContactIntoBusinessUpdate(
  existing: { name: string; phone: string | null; email: string | null; address: string | null },
  ex: ContactExtraction,
): { name?: string; normalizedName?: string; phone?: string; email?: string; address?: string } {
  const updates: {
    name?: string;
    normalizedName?: string;
    phone?: string;
    email?: string;
    address?: string;
  } = {};

  if (ex.phone) {
    const norm = normalizePhone(ex.phone);
    if (norm && !existing.phone) updates.phone = norm;
    else if (norm && existing.phone && ex.fromJsonLd) updates.phone = norm;
  }

  if (ex.email && !existing.email) updates.email = ex.email;
  else if (ex.email && existing.email && ex.fromJsonLd) updates.email = ex.email;

  if (ex.address && !existing.address) updates.address = ex.address;

  if (ex.name) {
    const looksSerp = existing.name.includes(" | ") || existing.name.includes(" - ") || existing.name.length > 72;
    if (ex.fromJsonLd || looksSerp || existing.name.trim().length < 3) {
      updates.name = ex.name;
      updates.normalizedName = normalizeBusinessName(ex.name);
    }
  }

  return updates;
}
