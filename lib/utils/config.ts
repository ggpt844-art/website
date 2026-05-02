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
  minDemoScore: num(process.env.MIN_DEMO_SCORE, 88),
  llmProvider: (process.env.LLM_PROVIDER ?? "rule_based_only") as
    | "rule_based_only"
    | "manual_composer_assisted"
    | "future_api_llm",
  enableSerpSource: bool(process.env.ENABLE_SERP_SOURCE, false),
  enableDirectorySources: bool(process.env.ENABLE_DIRECTORY_SOURCES, false),
};
