import type { CheerioAPI } from "cheerio";

// Lightweight readability-style text extraction. Removes nav/footer/aside/script
// noise and returns a plain-text approximation of the main content.

const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "header nav",
  "nav",
  "footer",
  "aside",
  ".cookie",
  ".cookies",
  '[role="navigation"]',
  '[aria-hidden="true"]',
];

export function extractMainText($: CheerioAPI): string {
  const $clone = $.root().clone();
  STRIP_SELECTORS.forEach((s) => $clone.find(s).remove());
  const main =
    $clone.find("main").first().text().trim() ||
    $clone.find("article").first().text().trim() ||
    $clone.find("body").first().text().trim() ||
    $clone.text().trim();
  return main.replace(/\s+/g, " ").trim();
}

export function extractHeadings($: CheerioAPI): string[] {
  const headings: string[] = [];
  $("h1,h2,h3").each((_, el) => {
    const t = $(el).text().trim();
    if (t) headings.push(t);
  });
  return headings.slice(0, 30);
}
