"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";

function JsonLd({ data }: { data: object }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function GrowthContentBlocks({ config }: { config: DemoConfig }) {
  const seo = "seo" in config ? config.seo : undefined;
  const ai = "aiSearch" in config ? config.aiSearch : undefined;
  const trust = "trust" in config ? config.trust : undefined;
  const conversion = "conversion" in config ? config.conversion : undefined;
  const arch = trust?.architectureJson as
    | {
        riskReducers?: string[];
        whatHappensNextCopy?: string;
        noPressureCopy?: string;
      }
    | undefined;

  const cat = (config.business.category ?? "").toLowerCase();
  const showFinancing =
    /roof|hvac|insulation|window|door|dent|orthodont|spa|cosmetic|kitchen|bathroom|basement|renovation/i.test(
      cat,
    );

  const hasBlocks =
    !!seo ||
    !!ai?.entitySummary ||
    (ai?.directAnswerBlocks?.length ?? 0) > 0 ||
    (!!conversion?.proofSystem?.images?.length &&
      conversion?.proofSystem?.type === "before_after") ||
    showFinancing ||
    !!(arch?.riskReducers?.length || arch?.whatHappensNextCopy);

  if (!hasBlocks) return null;

  return (
    <>
      {seo && (
        <>
          <JsonLd data={seo.localBusinessSchemaJsonLd as object} />
          <JsonLd data={seo.faqSchemaJsonLd as object} />
          <JsonLd data={seo.websiteSchemaJsonLd as object} />
        </>
      )}

      {ai?.entitySummary ? (
        <section
          id="entity"
          className="border-b border-[var(--border)] bg-[var(--surface)]/40 py-16"
        >
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
              At a glance
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text)]">{ai.entitySummary}</p>
          </div>
        </section>
      ) : null}

      {ai?.directAnswerBlocks && ai.directAnswerBlocks.length > 0 ? (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
              Quick answers
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {ai.directAnswerBlocks.slice(0, 6).map((b) => (
                <div
                  key={b.question}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="font-display text-lg text-[var(--text)]">{b.question}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">{b.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {conversion?.proofSystem &&
      conversion.proofSystem.images.length > 0 &&
      conversion.proofSystem.type === "before_after" ? (
        <section className="border-y border-[var(--border)] bg-black/20 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
              Project proof
            </p>
            <p className="mt-3 font-display text-2xl text-[var(--text)]">Recent work</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {conversion.proofSystem.images.map((src) => (
                <li
                  key={src}
                  className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
            {conversion.proofSystem.safetyNotes?.length ? (
              <p className="mt-4 text-xs text-[var(--text-dim)]">
                {conversion.proofSystem.safetyNotes.join(" ")}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {showFinancing ? (
        <section className="py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
              Cost & options
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-dim)]">
              Ask about available payment or financing options during your consultation. You will get
              a clear estimate before deciding, and you can review choices before committing — no
              surprise fees in the first conversation.
            </p>
          </div>
        </section>
      ) : null}

      {arch?.riskReducers?.length || arch?.whatHappensNextCopy ? (
        <section className="border-t border-[var(--border)] py-20">
          <div className="mx-auto max-w-6xl px-6 lg:grid lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
                What to expect
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--text-dim)]">
                {(arch.riskReducers ?? []).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span style={{ color: config.design.accentColor }}>·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              {arch.whatHappensNextCopy ? (
                <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-relaxed text-[var(--text)]">
                  {arch.whatHappensNextCopy}
                </p>
              ) : null}
              {arch.noPressureCopy ? (
                <p className="mt-4 text-sm text-[var(--text-dim)]">{arch.noPressureCopy}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
