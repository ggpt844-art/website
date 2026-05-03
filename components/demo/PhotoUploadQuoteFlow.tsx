"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import type { QuoteFlowQuestion } from "@/lib/presets/types";
import { trackDemoEvent } from "./DemoAnalytics";

export function PhotoUploadQuoteFlow({ config }: { config: DemoConfig }) {
  const router = useRouter();
  const flow = config.quoteFlow;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackDemoEvent(config.slug, "quote_form_started");
  }, [config.slug]);

  const runSubmit = async (merged: Record<string, string>) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const qs =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: config.slug,
          answers: merged,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : `/demo/${config.slug}`,
          utmSource: qs?.get("utm_source") ?? undefined,
          utmMedium: qs?.get("utm_medium") ?? undefined,
          utmCampaign: qs?.get("utm_campaign") ?? undefined,
          referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; thankYouPath?: string; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "request_failed");
      }
      const dest = data.thankYouPath ?? `/thank-you/${config.slug}`;
      router.push(dest);
    } catch {
      setSubmitError("Could not submit right now. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = (id: string, value: string) => {
    const merged = { ...answers, [id]: value };
    setAnswers(merged);
    trackDemoEvent(config.slug, "diagnostic_step_completed", { stepId: id });
    if (step < flow.length - 1) {
      setStep(step + 1);
      return;
    }
    void runSubmit(merged);
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
                width: `${((isSubmitting ? flow.length : step + 1) / flow.length) * 100}%`,
                background: config.design.accentColor,
              }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              {submitError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-[var(--text)]">
                  <p>{submitError}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="mt-4 rounded-full border border-[var(--border)] px-4 py-2 text-xs hover:bg-black/20"
                  >
                    Try again
                  </button>
                </div>
              ) : isSubmitting ? (
                <div className="py-12 text-center text-sm text-[var(--text-dim)]">
                  Sending your request…
                </div>
              ) : (
                <Step
                  q={flow[step]}
                  accent={config.design.accentColor}
                  slug={config.slug}
                  onAnswer={(v) => next(flow[step].id, v)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Step({
  q,
  accent,
  slug,
  onAnswer,
}: {
  q: QuoteFlowQuestion;
  accent: string;
  slug: string;
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
            onChange={(e) => {
              trackDemoEvent(slug, "photo_upload_clicked");
              const name = e.target.files?.[0]?.name ?? "photo-attached";
              trackDemoEvent(slug, "photo_uploaded", { metadata: { file: name } });
              onAnswer(name);
            }}
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
