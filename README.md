# Local Funnel Radar + Cinematic Demo Factory

Private tool that:

1. **Discovers** local businesses (city + niche) via swappable sources.
2. **Audits** their current site/listing with rule-based scoring + asset extraction.
3. **Builds** a premium cinematic lead-gen demo site from a structured config.
4. **Grades** the demo via an internal QA loop (3 iterations max) and saves every version.
5. **Surfaces** everything to a manual review queue — nothing is sent automatically.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + PostgreSQL · Playwright · Cheerio · Framer Motion · React Three Fiber + Drei · Zod · in-process job runner with a clean abstraction.

> v1 runs with **no paid APIs**. The only source enabled by default is a deterministic stub that gives you realistic-looking data so the entire pipeline works end-to-end. Real source adapters (SERP, directories) are scaffolded with `available: false` until you opt in via `.env`.

---

## Local development

Prereqs: Node 20+, Docker (for Postgres) **or** any local Postgres.

```bash
# 1. Install
npm install

# 2. Start Postgres
docker compose up -d

# 3. Configure env
cp .env.example .env
# Edit .env if needed (defaults match docker-compose)

# 4. Migrate + seed
npm run db:migrate    # creates the schema
npm run seed          # cities, niches, 3 sample businesses + demos

# 5. Run the dashboard
npm run dev
# Open http://localhost:3000
```

Sample demos live at `/demo/<slug>`, audits at `/audit/<slug>`.

After seeding, try:

- `/dashboard` — counts, latest batches, top leads
- `/targets` — manage cities + niches
- `/discover` — run a full pipeline batch
- `/business/<id>` — full business profile + demo controls
- `/review-queue` — manual approval before any outreach

### Scripts

| script | what it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Prisma generate + Next build |
| `npm start` | Production server |
| `npm run worker` | Long-running worker process (placeholder for v1; jobs run in-process) |
| `npm run scheduler` | Periodic discovery scheduler (requires `WORKER_ENABLED=true`) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (used in Railway) |
| `npm run db:reset` | Drop + recreate DB |
| `npm run db:studio` | Prisma Studio |
| `npm run seed` | Seed cities, niches, sample businesses + demos |

### Optional: Playwright browsers (for real screenshots later)

```bash
npx playwright install chromium
```

The audit engine and asset extractor degrade gracefully when Playwright browsers aren't installed — they fall back to plain `fetch + cheerio`.

---

## Architecture

```
app/                Next.js routes (dashboard, targets, discover,
                    business/[id], demo/[slug], audit/[slug],
                    demo-dashboard/[slug], review-queue, api/*)
components/
  dashboard/        Internal dashboard chrome
  demo/             11 premium demo section components + StickyMobileCTA + DemoRenderer
  three/            7 reusable R3F scenes + ThreeSceneRouter
lib/
  agents/           10 agents — rule-based with LLM adapter abstraction
  assets/           Image extraction + classification (logo/hero/proof/etc.)
  audit/            Rule-based website audit engine
  discovery/        Source abstraction (stub + serp scaffold), queries, dedupe, classification
  jobs/             In-process job runner + 5 jobs + scheduler + pipeline
  presets/          Niches, design systems, motion, 3D, scoring
  qa/               Critic + config patcher
  renderer/         Demo config schema + builder
  scoring/          Lead scorer
  scraping/         fetchPage + readability + Playwright wrapper
  utils/            slug, cn, config
prisma/             Schema + seed
scripts/            worker + scheduler entry points
```

### Pipeline

`Scheduled discovery → Business extraction → Website detection → Screenshot
capture → Website audit → Asset intelligence → Competitor scan → Research
agents → Business Intelligence Packet → Demo config → Premium renderer → QA
grading loop (max 3 iterations) → Pick winner → Manual review queue →
Outreach copy ready (manual send)`

### Discovery sources

The discovery layer is **modular**. Add a new source by implementing `DiscoverySource` in `lib/discovery/sources/` and exporting it from `index.ts`. Real sources must:

- Respect rate limits (`rateLimitMs`).
- Never bypass CAPTCHAs.
- Degrade gracefully when blocked.
- Return source URLs + a `confidence` score for every record.

By default, only the stub source is active. Toggle real sources via `.env`:

```env
ENABLE_SERP_SOURCE=false
ENABLE_DIRECTORY_SOURCES=false
```

### LLM adapter

`lib/agents/llmAdapter.ts` exposes a `mode` and a `complete(prompt)` method. v1 ships in `rule_based_only`. All agents have **deterministic preset-based fallbacks** so the app works with no API keys.

Modes (set `LLM_PROVIDER` in `.env`):

- `rule_based_only` (default — no API)
- `manual_composer_assisted`
- `future_api_llm` (interface ready, real client to add)

### QA loop

- Generate v1 → grade → patch config → v2 → grade → v3 → pick highest score.
- Hard pass: `total >= 88`, `premiumVisual >= 17/20`, `leadConversion >= 17/20`, `mobile >= 8/10`, `demoDifference >= 8/10`.
- Anything below hard pass → `needs_manual_polish`. Nothing reaches the queue without passing.

---

## Railway deployment

Railway picks up `railway.json` + `nixpacks.toml`. Steps:

1. Create a Railway project + a Postgres plugin.
2. Set env vars (see `.env.example`). Set `DATABASE_URL` to the Postgres plugin URL and `APP_URL` to your Railway-issued domain.
3. Deploy — `npm run db:deploy && npm start` runs on boot.
4. (Optional) add a second service running `npm run scheduler` for periodic batches. Set `WORKER_ENABLED=true` for that service only.

---

## Safety & guardrails

- No CAPTCHA bypass.
- No scraping of login-only / private pages.
- Source URLs are stored for every extracted claim.
- Uncertain data is marked `unclear` / low confidence.
- No fake reviews, ratings, or testimonials in generated demos.
- Demo pages clearly avoid false claims (`Sample / demo` footer + sample-data labels).
- **No outreach is sent automatically.** Everything funnels through `/review-queue` with manual approve/reject.

---

## Status of v1

Built end-to-end and runnable. Areas intentionally scaffolded for you to extend without touching call sites:

- Real discovery sources (Playwright SERP, real directories) — interface is ready.
- Live screenshot capture (Playwright wrapper is in place; storage bucket integration is the next step).
- LLM-backed agent variants (adapter is ready, return values are wired through agents already).
- Inngest / BullMQ / Trigger.dev — swap by replacing `lib/jobs/runner.ts` while keeping the same `enqueue(name, payload)` signature.
