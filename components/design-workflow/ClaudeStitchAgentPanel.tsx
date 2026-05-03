"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DesignWorkflowBundle } from "@/lib/renderer/demoConfig";
import {
  runClaudeStitchPromptAgentAction,
  saveManualStitchPromptFromWorkflowAction,
  runStitchSdkImportAction,
} from "@/lib/actions/designWorkflowActions";

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  if (data === undefined || data === null) return null;
  return (
    <details className="group rounded-xl border border-white/10 bg-black/30">
      <summary className="cursor-pointer select-none px-3 py-2 text-[11px] font-medium text-white/70 hover:text-white">
        {title}
      </summary>
      <pre className="max-h-48 overflow-auto border-t border-white/5 p-3 text-[10px] text-white/60">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

export function ClaudeStitchAgentPanel({
  businessId,
  demoConfigId,
  businessName,
  city,
  nicheLabel,
  designWorkflow,
  stitchSdkEnabled,
  stitchMinAutoScore,
}: {
  businessId: string;
  demoConfigId: string | null;
  businessName: string;
  city: string;
  nicheLabel: string;
  designWorkflow: DesignWorkflowBundle | undefined;
  stitchSdkEnabled: boolean;
  stitchMinAutoScore: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(designWorkflow?.finalStitchPrompt ?? "");

  useEffect(() => {
    setLocalPrompt(designWorkflow?.finalStitchPrompt ?? "");
  }, [designWorkflow?.finalStitchPrompt, designWorkflow?.lastStitchPromptAgentAt]);

  const score = designWorkflow?.stitchPromptScore;
  const blocks = designWorkflow?.stitchPromptBlocksAutoStitch;
  const usedClaude = designWorkflow?.stitchPromptUsedClaude;

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-violet-200/80">Claude → Stitch Prompt Agent</p>
          <p className="mt-1 text-xs text-white/55">
            Builds buyer/creative/conversion strategy objects and a graded cinematic Stitch prompt for{" "}
            <span className="text-white/85">{businessName}</span> · {nicheLabel} · {city}
          </p>
        </div>
        <div className="text-right text-[11px] text-white/50">
          {score != null && (
            <p>
              Prompt score:{" "}
              <span className={score >= stitchMinAutoScore ? "text-emerald-300" : "text-amber-200"}>{score}</span>
              /100 · auto Stitch ≥ {stitchMinAutoScore}
            </p>
          )}
          {usedClaude != null && <p>Claude refinement: {usedClaude ? "yes" : "no (deterministic)"}</p>}
          {blocks && <p className="text-amber-200/90">Blocks automatic Stitch until resolved</p>}
        </div>
      </div>

      {(designWorkflow?.stitchPromptAgentWarnings?.length ?? 0) > 0 && (
        <ul className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/85">
          {designWorkflow?.stitchPromptAgentWarnings?.map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <JsonBlock title="Buyer psychology" data={designWorkflow?.buyerPsychology} />
        <JsonBlock title="Creative strategy" data={designWorkflow?.creativeStrategy} />
        <JsonBlock title="Conversion strategy" data={designWorkflow?.conversionStrategy} />
        <JsonBlock title="Section strategy" data={designWorkflow?.sectionStrategy} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!demoConfigId || pending}
          onClick={() =>
            demoConfigId &&
            start(async () => {
              await runClaudeStitchPromptAgentAction(businessId, demoConfigId);
              router.refresh();
            })
          }
          className="rounded-full bg-violet-500 px-4 py-2 text-xs font-medium text-white hover:bg-violet-400 disabled:opacity-40"
        >
          Regenerate prompt
        </button>
        <button
          type="button"
          disabled={!localPrompt.trim() || pending}
          onClick={() => {
            void navigator.clipboard.writeText(localPrompt);
          }}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/5 disabled:opacity-40"
        >
          Copy prompt
        </button>
        <button
          type="button"
          disabled={!demoConfigId || pending}
          onClick={() => setEditing((e) => !e)}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/5"
        >
          {editing ? "Close editor" : "Edit prompt manually"}
        </button>
        <button
          type="button"
          disabled={!demoConfigId || !stitchSdkEnabled || pending}
          onClick={() =>
            demoConfigId &&
            start(async () => {
              await runStitchSdkImportAction(businessId, demoConfigId);
              router.refresh();
            })
          }
          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-40"
        >
          Run Stitch SDK
        </button>
      </div>

      {!stitchSdkEnabled && (
        <p className="text-[11px] text-white/45">
          Enable Stitch SDK in the environment to call the API from here. Manual Stitch still uses the prompt above.
        </p>
      )}

      {editing && demoConfigId && (
        <div className="space-y-2">
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[11px] text-white/85"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await saveManualStitchPromptFromWorkflowAction(demoConfigId, localPrompt);
                router.refresh();
                setEditing(false);
              })
            }
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:brightness-110"
          >
            Save and re-grade
          </button>
        </div>
      )}

      {!editing && localPrompt && (
        <textarea
          readOnly
          rows={10}
          value={localPrompt}
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-white/75"
        />
      )}

      {!demoConfigId && (
        <p className="text-xs text-amber-200/80">Generate a demo config first to run the agent.</p>
      )}
    </div>
  );
}
