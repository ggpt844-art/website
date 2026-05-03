"use client";

import { useTransition } from "react";
import type { DemoConfig, DesignWorkflowBundle } from "@/lib/renderer/demoConfig";
import type { DesignMode } from "@/lib/design-workflow/designWorkflowTypes";
import type { DesignReference, DesignVariant } from "@prisma/client";
import {
  setDesignModeAction,
  regenerateDesignBriefAction,
  buildStitchPromptFromBriefAction,
  importDesignReferenceAction,
  pickVariantAction,
  seedInternalVariantsAction,
  gradeDesignOnlyAction,
  deleteVariantAction,
  runStitchSdkImportAction,
} from "@/lib/actions/designWorkflowActions";
import { ClaudeStitchAgentPanel } from "./ClaudeStitchAgentPanel";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{title}</p>
      {children}
    </div>
  );
}

export function DesignWorkflowDashboard({
  businessId,
  demoConfigId,
  config,
  variants,
  references,
  hasIntelligencePacket,
  stitchSdkEnabled,
  nicheLabel,
  stitchMinAutoScore,
}: {
  businessId: string;
  demoConfigId: string | null;
  config: DemoConfig | null;
  variants: DesignVariant[];
  references: DesignReference[];
  hasIntelligencePacket: boolean;
  stitchSdkEnabled: boolean;
  nicheLabel: string;
  stitchMinAutoScore: number;
}) {
  const [pending, start] = useTransition();
  const mode = (config?.designMode ?? "internal_auto") as DesignMode;
  const meta = config?.designWorkflowMeta;
  const brief = config?.designBrief as Record<string, unknown> | undefined;
  const designMd = config?.designMd as Record<string, unknown> | undefined;
  const stitchPrompt = (config as DemoConfig & { stitchPromptLast?: string })?.stitchPromptLast;

  const designWorkflow = config?.designWorkflow as DesignWorkflowBundle | undefined;
  const businessName = config?.business.name ?? "";
  const city = config?.business.city ?? "";

  return (
    <div className="space-y-6 text-sm">
      <ClaudeStitchAgentPanel
        businessId={businessId}
        demoConfigId={demoConfigId}
        businessName={businessName}
        city={city}
        nicheLabel={nicheLabel}
        designWorkflow={designWorkflow}
        stitchSdkEnabled={stitchSdkEnabled}
        stitchMinAutoScore={stitchMinAutoScore}
      />
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-white/70">
        <p className="text-xs font-medium text-white">Stitch-style workflow (no Stitch API)</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs">
          <li>Run audit to create a Business Intelligence Packet.</li>
          <li>Generate brief + page strategy (requires an existing demo config).</li>
          <li>Copy the Stitch prompt into Google Stitch manually.</li>
          <li>Paste output back — import creates a scored variant.</li>
          <li>Select variant — persists into demo JSON; live rebuild layers selection on top.</li>
        </ol>
      </div>

      <Panel title="Step 0 · Intelligence packet">
        <p className={hasIntelligencePacket ? "text-emerald-300/90" : "text-amber-200/90"}>
          {hasIntelligencePacket
            ? "Packet found — brief will use audit + profile context."
            : "No packet yet — run Re-verify / audit from Overview."}
        </p>
      </Panel>

      <Panel title="Design mode">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["internal_auto", "Internal auto"],
              ["stitch_assisted", "Stitch-assisted"],
              ["manual_reference", "Manual reference"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={!demoConfigId || pending}
              onClick={() =>
                demoConfigId &&
                start(async () => {
                  await setDesignModeAction(demoConfigId, value);
                })
              }
              className={`rounded-full px-3 py-1.5 text-xs ${
                mode === value
                  ? "bg-white font-medium text-black"
                  : "border border-white/15 text-white/70 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/45">
          Mode is stored on the demo config. Production rendering stays in Next.js — Stitch is reference only.
        </p>
      </Panel>

      <Panel title="Design brief & DESIGN.md (internal)">
        <button
          type="button"
          disabled={!demoConfigId || pending}
          onClick={() =>
            demoConfigId &&
            start(async () => {
              await regenerateDesignBriefAction(businessId, demoConfigId);
            })
          }
          className="rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/5"
        >
          Regenerate brief + internal DESIGN.md
        </button>
        {brief && Object.keys(brief).length > 0 ? (
          <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-white/65">
            {JSON.stringify(brief, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-white/45">No brief saved on this demo yet.</p>
        )}
      </Panel>

      <Panel title="Stitch SDK (Google Labs — programmatic)">
        <p className="text-xs text-white/55">
          Uses <code className="text-white/70">@google/stitch-sdk</code> with{" "}
          <code className="text-white/70">STITCH_API_KEY</code>. Output is parsed as reference text + HTML snippet —
          your Next renderer is unchanged.
        </p>
        <button
          type="button"
          disabled={!demoConfigId || !stitchSdkEnabled || pending}
          onClick={() =>
            demoConfigId &&
            start(async () => {
              await runStitchSdkImportAction(businessId, demoConfigId);
            })
          }
          className="rounded-full bg-violet-500/90 px-4 py-2 text-xs font-medium text-white hover:bg-violet-400 disabled:opacity-40"
        >
          Run Stitch SDK → import variant
        </button>
        {!stitchSdkEnabled && (
          <p className="text-xs text-amber-200/90">
            Enable <code className="text-white/80">ENABLE_STITCH_SDK=true</code> and set{" "}
            <code className="text-white/80">STITCH_API_KEY</code> in the server environment.
          </p>
        )}
      </Panel>

      <Panel title="Stitch prompt (copy/paste)">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!demoConfigId || pending}
            onClick={() =>
              demoConfigId &&
              start(async () => {
                await buildStitchPromptFromBriefAction(demoConfigId);
              })
            }
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:brightness-110"
          >
            Generate prompt from brief
          </button>
        </div>
        {stitchPrompt ? (
          <textarea
            readOnly
            className="mt-2 h-56 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/80"
            value={stitchPrompt}
          />
        ) : (
          <p className="text-xs text-white/45">Generate brief first, then build Stitch prompt.</p>
        )}
      </Panel>

      <Panel title="Import Stitch / manual reference">
        <ImportForm businessId={businessId} demoConfigId={demoConfigId} pending={pending} start={start} />
        {references.length > 0 && (
          <ul className="mt-2 space-y-2 text-xs text-white/60">
            {references.map((r) => (
              <li key={r.id} className="rounded-lg border border-white/10 bg-black/25 p-2">
                {r.sourceType} · {new Date(r.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Design variants">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!demoConfigId || pending}
            onClick={() =>
              demoConfigId &&
              start(async () => {
                await seedInternalVariantsAction(demoConfigId);
              })
            }
            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/5"
          >
            Seed 3 internal variants
          </button>
          <button
            type="button"
            disabled={!demoConfigId || pending}
            onClick={() =>
              demoConfigId &&
              start(async () => {
                await gradeDesignOnlyAction(demoConfigId);
              })
            }
            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/5"
          >
            Grade workflow (save meta)
          </button>
        </div>
        <p className="text-xs text-white/45">Approval bar: design workflow score ≥ 88 (rule-based).</p>
        <ul className="mt-3 space-y-2">
          {variants.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 p-3"
            >
              <div>
                <p className="font-medium text-white/90">
                  {v.name}{" "}
                  {v.selected && (
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">
                      active
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-white/50">
                  {v.variantType} · score {v.score}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!demoConfigId || pending}
                  onClick={() =>
                    demoConfigId &&
                    start(async () => {
                      await pickVariantAction(demoConfigId, v.id);
                    })
                  }
                  className="rounded-full border border-white/15 px-3 py-1 text-[11px] hover:bg-white/5"
                >
                  Select & merge into demo
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await deleteVariantAction(businessId, v.id);
                    })
                  }
                  className="rounded-full border border-red-500/30 px-3 py-1 text-[11px] text-red-200/90 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!variants.length && (
          <p className="text-xs text-white/45">Import a reference or seed internal variants.</p>
        )}
      </Panel>

      <Panel title="DESIGN.md preview">
        {designMd && Object.keys(designMd).length > 0 ? (
          <pre className="max-h-56 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-white/65">
            {JSON.stringify(designMd, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-white/45">Generate brief or import a reference.</p>
        )}
      </Panel>

      <Panel title="Visual direction & scene spec">
        <p className="text-xs text-white/45">Live values come from the demo config (Overview → Open demo).</p>
        {config?.visualDirection && (
          <pre className="max-h-40 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-white/65">
            {JSON.stringify(config.visualDirection, null, 2)}
          </pre>
        )}
        {config?.sceneSpec && (
          <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-white/65">
            {JSON.stringify(config.sceneSpec, null, 2)}
          </pre>
        )}
      </Panel>

      <Panel title="Design QA (workflow grader)">
        <p className="text-2xl font-display">{meta?.designWorkflowScore ?? "—"}</p>
        <p className="text-xs text-white/50">
          Blocks approval: {meta?.blocksApproval ? "yes" : "no"} · Min 88
        </p>
        <ul className="mt-2 text-xs text-amber-100/80">
          {(meta?.warnings ?? []).map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function ImportForm({
  businessId,
  demoConfigId,
  pending,
  start,
}: {
  businessId: string;
  demoConfigId: string | null;
  pending: boolean;
  start: (fn: () => void) => void;
}) {
  return (
    <form
      action={(fd) => {
        start(async () => {
          const rawText = String(fd.get("rawText") ?? "");
          const selectedVariantName = String(fd.get("selectedVariantName") ?? "");
          const codeSnippet = String(fd.get("codeSnippet") ?? "");
          const sourceType = String(fd.get("sourceType") ?? "stitch") as
            | "stitch"
            | "manual"
            | "screenshot"
            | "code"
            | "other";
          await importDesignReferenceAction({
            businessId,
            demoConfigId,
            sourceType,
            rawText,
            selectedVariantName: selectedVariantName || undefined,
            codeSnippet: codeSnippet || undefined,
          });
        });
      }}
      className="space-y-2"
    >
      <select
        name="sourceType"
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white"
      >
        <option value="stitch">Stitch output</option>
        <option value="manual">Manual notes</option>
        <option value="screenshot">Screenshot description</option>
        <option value="code">Code snippet</option>
        <option value="other">Other</option>
      </select>
      <input
        name="selectedVariantName"
        placeholder="Chosen direction label (e.g. Premium cinematic)"
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white placeholder:text-white/30"
      />
      <textarea
        name="rawText"
        required
        rows={6}
        placeholder="Paste Stitch output / notes / description…"
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white placeholder:text-white/30"
      />
      <textarea
        name="codeSnippet"
        rows={3}
        placeholder="Optional HTML/CSS/React snippet (direction only)"
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white placeholder:text-white/30"
      />
      <button
        type="submit"
        disabled={!demoConfigId || pending}
        className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:brightness-110 disabled:opacity-40"
      >
        Parse & create variant
      </button>
      {!demoConfigId && (
        <p className="text-xs text-amber-200/80">Generate a demo first so variants attach to a DemoConfig.</p>
      )}
    </form>
  );
}
