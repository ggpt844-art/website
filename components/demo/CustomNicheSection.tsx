"use client";

import { motion } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function CustomNicheSection({ config }: { config: DemoConfig }) {
  const customs = config.pageStrategy?.customSections ?? [];
  if (customs.length === 0) return null;

  return (
    <section
      id="niche-context"
      className="border-y border-[var(--border)] bg-[var(--surface)]/50 py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-dim)]">
          {config.visualDirection?.conceptName ?? "Why this page is built this way"}
        </p>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {customs.map((c, i) => (
            <motion.div
              key={`${c.title}-${i}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg)]/80 p-8"
            >
              <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--text)]">
                {c.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-dim)]">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
