import { jobRegistry } from "./runner";
import { runDiscoveryJob, type DiscoveryJobPayload } from "./discoveryJob";
import { runWebsiteVerificationJob, type WebsiteVerificationPayload } from "./websiteVerificationJob";
import { runDeepAuditJob, type DeepAuditPayload } from "./deepAuditJob";
import { runDemoGenerationJob, type DemoGenerationPayload } from "./demoGenerationJob";
import { runQaLoopJob, type QaLoopPayload } from "./qaLoopJob";

let registered = false;

export function registerAllJobs() {
  if (registered) return;
  registered = true;
  jobRegistry.register<DiscoveryJobPayload, void>({
    name: "discovery",
    handler: runDiscoveryJob,
    timeoutMs: 5 * 60_000,
  });
  jobRegistry.register<WebsiteVerificationPayload, void>({
    name: "website-verification",
    handler: runWebsiteVerificationJob,
    timeoutMs: 2 * 60_000,
  });
  jobRegistry.register<DeepAuditPayload, void>({
    name: "deep-audit",
    handler: runDeepAuditJob,
    timeoutMs: 3 * 60_000,
  });
  jobRegistry.register<DemoGenerationPayload, { demoConfigId: string; slug: string }>({
    name: "demo-generation",
    handler: runDemoGenerationJob,
    timeoutMs: 2 * 60_000,
  });
  jobRegistry.register<QaLoopPayload, void>({
    name: "qa-loop",
    handler: runQaLoopJob,
    timeoutMs: 4 * 60_000,
  });
}
