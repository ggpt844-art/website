import type { CheerioAPI } from "cheerio";
import type { FetchedPage } from "@/lib/scraping/fetchPage";
import { extractHeadings, extractMainText } from "@/lib/scraping/readability";

export interface AuditResult {
  visualQualityScore: number;
  conversionScore: number;
  trustScore: number;
  mobileCtaScore: number;
  speedScore: number;
  leadFunnelScore: number;
  websiteQualityScore: number;
  positives: string[];
  weaknesses: string[];
  raw: Record<string, unknown>;
}

const TRUST_TERMS = [
  "licensed",
  "insured",
  "warranty",
  "guarantee",
  "BBB",
  "certified",
  "google review",
  "5-star",
  "5 star",
];

const CONVERSION_TERMS = [
  "free quote",
  "free estimate",
  "book now",
  "schedule",
  "get a quote",
  "request a quote",
  "free consultation",
  "call now",
];

const FUNNEL_TERMS = [
  "upload photo",
  "upload a photo",
  "diagnostic",
  "calculator",
  "quiz",
  "step 1",
  "1 of",
  "tell us about your project",
];

function countMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  let count = 0;
  for (const t of terms) if (lower.includes(t)) count++;
  return count;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function auditPage(page: FetchedPage): AuditResult {
  const $ = page.$;
  const text = extractMainText($);
  const headings = extractHeadings($);
  const lowerHtml = page.html.toLowerCase();

  // Visual signals
  const heroLikely =
    $("section").length > 0 || $("header").length > 0 || $("h1").length > 0;
  const imageCount = $("img").length;
  const sections = $("section,div").length;
  const wordCount = text.split(/\s+/).length;
  const tooLittleCopy = wordCount < 80;
  const tooMuchCopy = wordCount > 4500;
  const headingScale = $("h1").length >= 1 && $("h2").length >= 1;
  const modernFonts =
    lowerHtml.includes("font-display") ||
    lowerHtml.includes("inter") ||
    lowerHtml.includes("space grotesk") ||
    lowerHtml.includes("satoshi");

  let visual = 50;
  if (heroLikely) visual += 8;
  if (headingScale) visual += 7;
  if (modernFonts) visual += 8;
  if (imageCount >= 4 && imageCount <= 40) visual += 5;
  if (sections >= 5) visual += 4;
  if (tooLittleCopy) visual -= 12;
  if (tooMuchCopy) visual -= 8;
  if (page.detectedPlatform === "WordPress" && !modernFonts) visual -= 4;

  // Conversion signals
  const convMatches = countMatches(text, CONVERSION_TERMS);
  const phoneLink = $('a[href^="tel:"]').length > 0;
  const formCount = $("form").length;
  const ctaButtons = $('a,button').filter((_, el) => {
    const t = ($(el).text() || "").trim().toLowerCase();
    return /quote|estimate|book|schedule|consult|call/.test(t);
  }).length;

  let conversion = 35;
  conversion += Math.min(20, convMatches * 4);
  if (phoneLink) conversion += 10;
  if (formCount >= 1) conversion += 12;
  if (ctaButtons >= 2) conversion += 12;
  if (ctaButtons === 0) conversion -= 10;

  // Trust
  const trustMatches = countMatches(text, TRUST_TERMS);
  const reviewMentions = /\b(\d+(\.\d)?\s*\/\s*5|\b\d+\s*reviews?)/i.test(text);
  let trust = 35;
  trust += Math.min(25, trustMatches * 5);
  if (reviewMentions) trust += 12;
  if (/license[d]?\s*#?\s*\d+/i.test(text)) trust += 6;
  if ($('img[alt*="team" i]').length > 0) trust += 5;

  // Mobile CTA / mobile-friendliness signals
  const viewportMeta = $('meta[name="viewport"]').attr("content") || "";
  const hasViewport = /width=device-width/i.test(viewportMeta);
  const stickyHints =
    lowerHtml.includes("sticky") || lowerHtml.includes("fixed bottom");
  const tapTargets = $('a[href^="tel:"], a[href^="sms:"]').length > 0;
  let mobile = 30;
  if (hasViewport) mobile += 25;
  if (stickyHints) mobile += 15;
  if (tapTargets) mobile += 15;
  if ($("input,select,textarea").length > 0) mobile += 5;

  // Speed proxy
  const heavyHints =
    /slider|carousel|revslider|elementor|fullpage/i.test(lowerHtml);
  const tooManyImages = imageCount > 60;
  let speed = 70;
  if (heavyHints) speed -= 15;
  if (tooManyImages) speed -= 15;
  if (page.loadMs && page.loadMs > 4000) speed -= 10;
  if (page.loadMs && page.loadMs < 1500) speed += 8;
  if (page.detectedPlatform === "Next.js") speed += 5;

  // Lead funnel
  const funnelMatches = countMatches(text, FUNNEL_TERMS);
  const fileUpload = $('input[type="file"]').length > 0;
  const stepIndicators = /step\s*\d+|question\s*\d+/i.test(text);
  let funnel = 25;
  funnel += Math.min(35, funnelMatches * 8);
  if (fileUpload) funnel += 18;
  if (stepIndicators) funnel += 12;
  if (formCount >= 1 && convMatches >= 2) funnel += 8;
  if (formCount === 0) funnel -= 8;

  visual = clamp(visual);
  conversion = clamp(conversion);
  trust = clamp(trust);
  mobile = clamp(mobile);
  speed = clamp(speed);
  funnel = clamp(funnel);

  const websiteQuality = clamp(
    (visual * 0.25 +
      conversion * 0.2 +
      trust * 0.15 +
      mobile * 0.15 +
      speed * 0.1 +
      funnel * 0.15),
  );

  const positives: string[] = [];
  const weaknesses: string[] = [];
  if (heroLikely) positives.push("Has a clear hero / page structure");
  if (modernFonts) positives.push("Modern typography");
  if (phoneLink) positives.push("Phone is tap-to-call");
  if (formCount >= 1) positives.push("Has at least one contact form");
  if (reviewMentions) positives.push("Mentions reviews / ratings on site");
  if (hasViewport) positives.push("Mobile viewport configured");

  if (!phoneLink) weaknesses.push("Phone is not tap-to-call");
  if (formCount === 0) weaknesses.push("No contact form on page");
  if (!fileUpload) weaknesses.push("No photo upload path for faster quotes");
  if (funnelMatches === 0) weaknesses.push("No guided quote flow / diagnostic");
  if (!stickyHints) weaknesses.push("No sticky mobile CTA");
  if (trustMatches < 2) weaknesses.push("Trust signals are weak / not visible");
  if (tooLittleCopy) weaknesses.push("Page copy is very thin");
  if (tooMuchCopy) weaknesses.push("Page is overloaded with copy");
  if (heavyHints) weaknesses.push("Heavy slider/builder code may slow it down");

  return {
    visualQualityScore: visual,
    conversionScore: conversion,
    trustScore: trust,
    mobileCtaScore: mobile,
    speedScore: speed,
    leadFunnelScore: funnel,
    websiteQualityScore: websiteQuality,
    positives,
    weaknesses,
    raw: {
      headings: headings.slice(0, 12),
      wordCount,
      formCount,
      ctaButtons,
      imageCount,
      hasViewport,
      tapTargets,
      detectedPlatform: page.detectedPlatform,
      loadMs: page.loadMs,
    },
  };
}

export function emptyAudit(): AuditResult {
  return {
    visualQualityScore: 0,
    conversionScore: 0,
    trustScore: 0,
    mobileCtaScore: 0,
    speedScore: 0,
    leadFunnelScore: 0,
    websiteQualityScore: 0,
    positives: [],
    weaknesses: ["No website found"],
    raw: {},
  };
}

// Re-export for convenience.
export type { CheerioAPI };
