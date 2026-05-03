function num(env: string | undefined, fallback: number): number {
  if (!env) return fallback;
  const n = Number(env);
  return Number.isFinite(n) ? n : fallback;
}

function bool(env: string | undefined, fallback: boolean): boolean {
  if (env === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(env.toLowerCase());
}

export const APP_CONFIG = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  workerEnabled: bool(process.env.WORKER_ENABLED, false),
  schedulerIntervalHours: num(process.env.SCHEDULER_INTERVAL_HOURS, 6),
  discoveryBatchSize: num(process.env.DISCOVERY_BATCH_SIZE, 30),
  deepAuditLimit: num(process.env.DEEP_AUDIT_LIMIT, 8),
  demoGenerationLimit: num(process.env.DEMO_GENERATION_LIMIT, 3),
  qaMaxIterations: num(process.env.QA_MAX_ITERATIONS, 3),
  minLeadScore: num(process.env.MIN_LEAD_SCORE, 75),
  minDemoScore: num(process.env.MIN_DEMO_SCORE, 80),
  llmProvider: (process.env.LLM_PROVIDER ?? "rule_based_only") as
    | "rule_based_only"
    | "manual_composer_assisted"
    | "future_api_llm",
  enableSerpSource: bool(process.env.ENABLE_SERP_SOURCE, false),
  enableDirectorySources: bool(process.env.ENABLE_DIRECTORY_SOURCES, false),
  /** DuckDuckGo HTML (no API key) — real URLs from public SERP HTML; see `lib/discovery/sources/webResearch.ts`. */
  enableWebResearchSource: bool(process.env.ENABLE_WEB_RESEARCH_SOURCE, false),
  /** Synthetic businesses for pipeline testing. Set false when using only scraped sources. */
  enableStubDiscovery: bool(process.env.ENABLE_STUB_DISCOVERY, true),
  /** Places API (New) text search — requires GOOGLE_MAPS_API_KEY (server-side). */
  enableGooglePlacesSource: bool(process.env.ENABLE_GOOGLE_PLACES_SOURCE, false),
  /**
   * After demo-generation: auto-run design brief + DESIGN.md, seed 3 internal variants,
   * rescore, merge best variant (see AUTO_SELECT_BEST_DESIGN_VARIANT).
   */
  automateDesignWorkflow: bool(process.env.AUTOMATE_DESIGN_WORKFLOW, false),
  /** When automation runs, pick highest-scoring variant and merge into demo JSON. */
  autoSelectBestDesignVariant: bool(process.env.AUTO_SELECT_BEST_DESIGN_VARIANT, true),
  /**
   * Call Google Stitch (Labs) via @google/stitch-sdk when STITCH_API_KEY is set.
   * See ENABLE_STITCH_SDK — generates reference HTML/text for the import pipeline.
   */
  enableStitchSdk: bool(process.env.ENABLE_STITCH_SDK, false),
  /** Minimum `stitchPromptScore` on `designWorkflow` before automated Stitch SDK may run. */
  stitchPromptMinAutoScore: num(process.env.STITCH_PROMPT_MIN_AUTO_SCORE, 88),
};
