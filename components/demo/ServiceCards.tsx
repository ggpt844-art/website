"use client";

import { motion } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function ServiceCards({ config }: { config: DemoConfig }) {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <h2
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
          >
            {config.copy.servicesHeadline ?? "What we actually do."}
          </h2>
          <a
            href="#quote"
            className="hidden rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)] sm:block"
          >
            Get a real quote →
          </a>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {config.services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur"
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: config.design.accentColor }}
              />
              <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Service
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--text)]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--text-dim)]">{s.description}</p>
              {s.problem && (
                <p className="mt-4 text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Solves: {s.problem}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
