"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { QuoteFlowQuestion } from "@/lib/presets/types";

export function PhotoUploadQuoteFlow({ config }: { config: DemoConfig }) {
  const flow = config.quoteFlow;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const next = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (step < flow.length - 1) setStep(step + 1);
    else setDone(true);
  };

  return (
    <section id="quote" className="relative py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
            Real quote flow
          </p>
          <h2
            className="mt-3 font-display font-semibold tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
          >
            {config.strategy.primaryCTA}
          </h2>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-[var(--text-dim)]">
            A guided flow with a photo upload step. Better data, better quotes,
            shorter back-and-forth.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-[var(--text-dim)]">
            {[
              "Mobile-first, one question per step",
              "Optional photo upload for faster pricing",
              "Contact + address captured at the end",
              "No spam, no pressure",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: config.design.accentColor }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur sm:p-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-dim)]">
            <span>
              Step {Math.min(step + 1, flow.length)} of {flow.length}
            </span>
            <span>Avg time: 60s</span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full transition-all"
              style={{
                width: `${((done ? flow.length : step + 1) / flow.length) * 100}%`,
                background: config.design.accentColor,
              }}
            />
          </div>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-6"
              >
                <Step q={flow[step]} accent={config.design.accentColor} onAnswer={(v) => next(flow[step].id, v)} />
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl border border-[var(--border)] bg-black/20 p-6 text-center"
              >
                <p className="font-display text-2xl text-[var(--text)]">
                  Sent — we'll reply within 24 hours.
                </p>
                <p className="mt-2 text-sm text-[var(--text-dim)]">
                  This is a demo flow — answers aren't actually submitted.
                </p>
                <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-black/30 p-3 text-left text-[11px] text-[var(--text-dim)]">
                  {JSON.stringify(answers, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Step({
  q,
  accent,
  onAnswer,
}: {
  q: QuoteFlowQuestion;
  accent: string;
  onAnswer: (v: string) => void;
}) {
  if (q.type === "choice" && q.options) {
    return (
      <div>
        <p className="font-display text-xl text-[var(--text)]">{q.question}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => (
            <button
              key={o}
              onClick={() => onAnswer(o)}
              className="rounded-2xl border border-[var(--border)] px-4 py-3 text-left text-sm transition hover:border-[var(--text)] hover:bg-black/20"
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (q.type === "upload") {
    return (
      <div>
        <p className="font-display text-xl text-[var(--text)]">{q.question}</p>
        {q.helper && (
          <p className="mt-2 text-sm text-[var(--text-dim)]">{q.helper}</p>
        )}
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-black/10 px-6 py-8 text-sm text-[var(--text-dim)] transition hover:border-[var(--text)]">
          <span>Tap to add a photo</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) =>
              onAnswer(e.target.files?.[0]?.name ?? "photo-attached")
            }
          />
        </label>
        <button
          onClick={() => onAnswer("skipped")}
          className="mt-4 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/20"
        >
          Skip for now
        </button>
      </div>
    );
  }
  if (q.type === "contact") {
    return (
      <ContactForm onSubmit={onAnswer} accent={accent} label={q.question} />
    );
  }
  return (
    <TextStep
      label={q.question}
      onSubmit={onAnswer}
      accent={accent}
      placeholder={q.helper}
    />
  );
}

function TextStep({
  label,
  onSubmit,
  accent,
  placeholder,
}: {
  label: string;
  onSubmit: (v: string) => void;
  accent: string;
  placeholder?: string;
}) {
  const [v, setV] = useState("");
  return (
    <div>
      <p className="font-display text-xl text-[var(--text)]">{label}</p>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)]"
      />
      <button
        onClick={() => v.trim() && onSubmit(v.trim())}
        className="mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition disabled:opacity-50"
        style={{ background: accent, color: "#000" }}
        disabled={!v.trim()}
      >
        Continue
      </button>
    </div>
  );
}

function ContactForm({
  onSubmit,
  accent,
  label,
}: {
  onSubmit: (v: string) => void;
  accent: string;
  label: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  return (
    <div>
      <p className="font-display text-xl text-[var(--text)]">{label}</p>
      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)]"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
          className="w-full rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)]"
        />
      </div>
      <button
        onClick={() => name && contact && onSubmit(`${name} <${contact}>`)}
        className="mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition disabled:opacity-50"
        style={{ background: accent, color: "#000" }}
        disabled={!name || !contact}
      >
        Send my request
      </button>
    </div>
  );
}
