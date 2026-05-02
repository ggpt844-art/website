import { tick, status } from "../lib/jobs/scheduler";
import { APP_CONFIG } from "../lib/utils/config";

async function main() {
  const s = await status();
  console.log("[scheduler]", s);
  if (!APP_CONFIG.workerEnabled) {
    console.log(
      "[scheduler] WORKER_ENABLED is false. Set it to true in .env to enable scheduled batches.",
    );
    return;
  }
  const intervalMs = APP_CONFIG.schedulerIntervalHours * 60 * 60 * 1000;
  await tick();
  setInterval(() => {
    tick().catch((err) => console.error("[scheduler]", err));
  }, intervalMs);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
