"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function FAQSection({ config }: { config: DemoConfig }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
        >
          Common questions
        </h2>
        <ul className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {config.copy.faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="font-display text-lg text-[var(--text)]">
                    {f.q}
                  </span>
                  <span
                    className="text-2xl"
                    style={{ color: config.design.accentColor }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-[1.0625rem] leading-relaxed text-[var(--text-dim)]">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
