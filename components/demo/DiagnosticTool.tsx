"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function DiagnosticTool({ config }: { config: DemoConfig }) {
  const [score, setScore] = useState<number | null>(null);
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);

  const calc = () => {
    const s =
      (a === "yes" ? 35 : a === "sometimes" ? 20 : 5) +
      (b === "yes" ? 45 : b === "sometimes" ? 25 : 10) +
      Math.floor(Math.random() * 12);
    setScore(Math.min(98, s));
  };

  return (
    <section id="diagnostic" className="relative py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
            Lead magnet
          </p>
          <h2
            className="mt-3 font-display font-semibold tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
          >
            {config.strategy.leadMagnet}
          </h2>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-[var(--text-dim)]">
            Two questions. Get an instant indicator of how urgent your situation
            actually is — then choose whether to book a real assessment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-[var(--text-dim)]">
            {config.strategy.riskReducers.slice(0, 3).map((r) => (
              <span
                key={r}
                className="rounded-full border border-[var(--border)] px-3 py-1.5"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur sm:p-8">
          <Question
            label="Have you noticed any visible signs in the last 30 days?"
            value={a}
            set={setA}
          />
          <div className="mt-6">
            <Question
              label="Has it gotten worse over time?"
              value={b}
              set={setB}
            />
          </div>
          <button
            onClick={calc}
            disabled={!a || !b}
            className="mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition disabled:opacity-50"
            style={{ background: config.design.accentColor, color: "#000" }}
          >
            See my severity score
          </button>
          <AnimatePresence>
            {score !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-black/20 p-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                    Severity indicator
                  </p>
                  <p className="font-display text-3xl text-[var(--text)]">
                    {score}/100
                  </p>
                </div>
                <a
                  href="#quote"
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
                >
                  Book a real assessment →
                </a>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-3 text-[11px] text-[var(--text-dim)]">
            Sample diagnostic — replaced with real logic for production builds.
          </p>
        </div>
      </div>
    </section>
  );
}

function Question({
  label,
  value,
  set,
}: {
  label: string;
  value: string | null;
  set: (v: string) => void;
}) {
  const opts = [
    { v: "yes", l: "Yes" },
    { v: "sometimes", l: "Sometimes" },
    { v: "no", l: "No" },
  ];
  return (
    <div>
      <p className="text-sm font-medium text-[var(--text)]">{label}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => set(o.v)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              value === o.v
                ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]"
                : "border-[var(--border)] hover:bg-[var(--surface)]"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}
