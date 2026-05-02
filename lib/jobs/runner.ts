// Lightweight in-process job runner for v1. Single source of truth so we can
// later swap to BullMQ / Inngest / Trigger.dev without touching call sites.

export type JobHandler<T = unknown, R = unknown> = (payload: T) => Promise<R>;

export interface JobDefinition<T = unknown, R = unknown> {
  name: string;
  handler: JobHandler<T, R>;
  concurrency?: number;
  timeoutMs?: number;
}

interface RunRecord<T> {
  id: string;
  name: string;
  payload: T;
  startedAt: number;
  promise: Promise<unknown>;
}

class JobRegistry {
  private defs = new Map<string, JobDefinition>();
  private running = new Map<string, RunRecord<unknown>>();

  register<T, R>(def: JobDefinition<T, R>) {
    this.defs.set(def.name, def as JobDefinition);
  }

  has(name: string) {
    return this.defs.has(name);
  }

  list(): string[] {
    return Array.from(this.defs.keys());
  }

  async enqueue<T, R>(name: string, payload: T): Promise<R> {
    const def = this.defs.get(name);
    if (!def) throw new Error(`Job not registered: ${name}`);
    const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();
    const promise = (async () => {
      try {
        const handler = def.handler as JobHandler<T, R>;
        if (def.timeoutMs) {
          return await Promise.race([
            handler(payload),
            new Promise<R>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Job timeout: ${name}`)),
                def.timeoutMs,
              ),
            ),
          ]);
        }
        return await handler(payload);
      } finally {
        this.running.delete(id);
      }
    })();
    this.running.set(id, { id, name, payload, startedAt, promise });
    return promise as Promise<R>;
  }

  runningJobs() {
    return Array.from(this.running.values()).map((r) => ({
      id: r.id,
      name: r.name,
      ageMs: Date.now() - r.startedAt,
    }));
  }
}

const globalForJobs = globalThis as unknown as { __jobRegistry?: JobRegistry };
export const jobRegistry = globalForJobs.__jobRegistry ?? new JobRegistry();
if (!globalForJobs.__jobRegistry) globalForJobs.__jobRegistry = jobRegistry;
