/**
 * STITCH BOUNDARY — FRONTEND DESIGN ONLY
 *
 * Google Stitch is ONLY a frontend design / art-direction provider. It must NOT
 * control or define production business logic.
 *
 * Allowed influence (DESIGN INPUT):
 * - Visual direction, hero layout, section composition (order/flow for rendering)
 * - Color / typography mood, UI component style, design variants, DESIGN.md-style notes
 * - Cinematic front-end direction, mobile visual layout, spacing / card / CTA styling
 *
 * Not allowed (our app owns these — never overwrite from Stitch):
 * - Database schema, discovery, scraping, auditing, SEO / AI-SEO logic, lead scoring
 * - CRM, analytics, form handling, quote funnel logic, routing, follow-up, reports
 * - Outreach, compliance rules, launch/deploy, auth, payments, API keys, server actions
 *
 * Production source of truth stays in: DemoConfig (business, strategy, conversion, SEO,
 * aiSearch, trust, compliance, analytics, package, quoteFlow, etc.), Prisma models for CRM/reports.
 *
 * Stitch output → parse only into: designMd, visualDirection, sceneSpec, section order/sections,
 * DesignVariant rows. Ignore unsafe suggestions (fake metrics, fake reviews, invented claims).
 *
 * Renderer: Next.js uses our components + configs; Stitch HTML is reference only, not pasted as prod.
 */

/** Short block to append to Stitch / cinematic prompts so models respect the boundary. */
export const STITCH_BOUNDARY_PROMPT_APPEND = `
STITCH BOUNDARY (mandatory):
Stitch is FRONTEND DESIGN / ART DIRECTION ONLY. Output visual layout, composition, mood, variants, and DESIGN.md-style guidance.
Do NOT specify database schema, SEO implementation, analytics, CRM, server logic, auth, payments, scraping, or compliance engine rules.
Do NOT invent business facts, metrics, reviews, or certifications. Our app owns conversion config, quote flows, tracking, and data writes — your output is design input for our renderer only.
`.trim();
