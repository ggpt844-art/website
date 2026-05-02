"use client";

import { motion } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function ProblemVisualization({ config }: { config: DemoConfig }) {
  return (
    <section className="relative py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-[1fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
            The actual problem
          </p>
          <h2
            className="mt-3 font-display font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
          >
            {config.copy.problemTitle}
          </h2>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-[var(--text-dim)]">
            {config.copy.problemBody}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {[
            { k: "Cost of waiting", v: "Compounds quickly" },
            { k: "Avg quote time", v: "Under 24 hrs" },
            { k: "Real photos", v: "Every job documented" },
            { k: "First step", v: "Photo + 3 questions" },
          ].map((c) => (
            <div
              key={c.k}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                {c.k}
              </p>
              <p className="mt-2 font-display text-2xl text-[var(--text)]">{c.v}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
