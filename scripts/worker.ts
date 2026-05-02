import { registerAllJobs } from "../lib/jobs/register";
import { jobRegistry } from "../lib/jobs/runner";

registerAllJobs();

console.log("[worker] Job registry online. Registered jobs:", jobRegistry.list());
console.log("[worker] v1 runs jobs in-process via the web app. This script");
console.log("[worker] keeps a process alive so you can later wire BullMQ /");
console.log("[worker] Inngest / Trigger.dev without changing call sites.");

setInterval(() => {
  const running = jobRegistry.runningJobs();
  if (running.length) {
    console.log(`[worker] running:`, running);
  }
}, 30_000);
