import Link from "next/link";
import type { DemoConfig } from "@/lib/renderer/demoConfig";

export function TabBar({ businessId, tab }: { businessId: string; tab: string }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "strategy", label: "Strategy" },
    { id: "design-workflow", label: "Design workflow" },
    { id: "seo", label: "SEO" },
    { id: "ai-search", label: "AI Search" },
    { id: "conversion", label: "Conversion" },
    { id: "leads", label: "Leads" },
    { id: "analytics", label: "Analytics" },
    { id: "trust", label: "Trust / compliance" },
    { id: "gbp", label: "GBP / NAP" },
    { id: "reports", label: "Reports" },
    { id: "launch", label: "Launch" },
    { id: "outreach", label: "Outreach" },
    { id: "case-study", label: "Case study" },
  ] as const;
  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={`/business/${businessId}?tab=${t.id}`}
          className={`rounded-full px-3 py-1.5 text-xs ${
            tab === t.id
              ? "bg-white font-medium text-black"
              : "border border-white/10 text-white/65 hover:bg-white/5"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function SeoGrowthPanel({ config }: { config: DemoConfig | null }) {
  if (!config?.seo) {
    return <p className="text-sm text-white/50">No SEO layer on this demo. Regenerate.</p>;
  }
  const s = config.seo;
  return (
    <div className="space-y-6 text-sm">
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Scores</p>
        <p className="mt-2">Foundation: {s.seoFoundationScore} / 100</p>
        <p className="text-white/60">Indexing: {s.seoIndexingMode}</p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Primary keyword</p>
        <p className="mt-2">{s.primaryKeyword}</p>
        <p className="mt-4 text-xs text-white/50">Title</p>
        <p>{s.titleTag}</p>
        <p className="mt-4 text-xs text-white/50">Meta</p>
        <p>{s.metaDescription}</p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Checks</p>
        <ul className="mt-2 max-h-48 overflow-auto text-xs text-white/70">
          {s.gbpAlignmentChecklist.slice(0, 12).map((x) => (
            <li key={x}>· {x}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function AiSearchGrowthPanel({ config }: { config: DemoConfig | null }) {
  if (!config?.aiSearch) {
    return <p className="text-sm text-white/50">No AI search layer. Regenerate.</p>;
  }
  const a = config.aiSearch;
  return (
    <div className="space-y-6 text-sm">
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Score</p>
        <p className="mt-2">{a.aiSearchScore} / 100</p>
        <p className="mt-4 text-xs text-white/50">Warnings</p>
        <ul className="text-xs text-accent-orange/90">
          {a.aiSearchWarnings.map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Entity</p>
        <p className="mt-2 text-white/75">{a.entitySummary}</p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">llms.txt (preview)</p>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-xs text-white/65">
          {a.llmsTxtContent}
        </pre>
      </Card>
    </div>
  );
}

export function ConversionGrowthPanel({ config }: { config: DemoConfig | null }) {
  if (!config?.conversion) {
    return <p className="text-sm text-white/50">No conversion config. Regenerate.</p>;
  }
  const c = config.conversion;
  return (
    <div className="space-y-6 text-sm">
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Package tier</p>
        <p className="mt-2">{config.package?.tier ?? "—"}</p>
        <p className="mt-4 text-xs text-white/50">Thank-you path</p>
        <p>{c.thankYouPath}</p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">CTA variants</p>
        <ul className="mt-2 text-xs text-white/70">
          {c.ctaVariants.ctaVariants.map((v) => (
            <li key={v.id}>
              · {v.label} {v.isDefault ? "(default)" : ""}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Review requests</p>
        <p className="mt-2 text-white/70">
          {c.reviewRequestFlow.enabled ? "Enabled in config" : "Disabled — enable only with real GBP link + policy."}
        </p>
        {c.reviewRequestFlow.gbpReviewLink ? (
          <p className="mt-2 break-all text-xs text-white/50">{c.reviewRequestFlow.gbpReviewLink}</p>
        ) : null}
        <p className="mt-2 text-xs text-white/55">Monthly goal: {c.reviewRequestFlow.monthlyReviewGoal}</p>
      </Card>
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Missed-call text-back</p>
        <p className="mt-2 text-white/70">
          {c.missedCallTextBack.enabled ? "Flagged on — requires SMS provider + approval to send." : "Off (recommended until provider)."}
        </p>
        <p className="mt-2 text-xs text-white/55">Provider: {c.missedCallTextBack.provider}</p>
        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] text-white/60">
          {c.missedCallTextBack.messageTemplate}
          {c.missedCallTextBack.quoteFlowLink ? `\n${c.missedCallTextBack.quoteFlowLink}` : ""}
        </pre>
      </Card>
    </div>
  );
}

export function TrustCompliancePanel({ config }: { config: DemoConfig | null }) {
  if (!config) return null;
  return (
    <div className="space-y-6 text-sm">
      <Card>
        <p className="text-[11px] uppercase tracking-wider text-white/50">Compliance</p>
        <p className="mt-2 text-white/70">Severe: {(config.compliance?.severeWarnings ?? []).join("; ") || "—"}</p>
        <p className="mt-2 text-xs text-white/50">Warnings</p>
        <ul className="text-xs text-white/60">
          {(config.compliance?.warnings ?? []).map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function GbpNapPanel({ config }: { config: DemoConfig | null }) {
  if (!config?.seo?.gbpHealth && !config?.seo?.napCheck) {
    return <p className="text-sm text-white/50">No GBP/NAP data. Regenerate demo.</p>;
  }
  const g = config.seo.gbpHealth;
  const n = config.seo.napCheck;
  return (
    <div className="space-y-6 text-sm">
      {g && (
        <Card>
          <p className="text-[11px] uppercase tracking-wider text-white/50">GBP health</p>
          <p className="mt-2">Score: {g.gbpHealthScore}</p>
          <ul className="mt-2 text-xs text-white/65">
            {g.recommendedActions.slice(0, 8).map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </Card>
      )}
      {n && (
        <Card>
          <p className="text-[11px] uppercase tracking-wider text-white/50">NAP</p>
          <p className="mt-2">Score: {n.napConsistencyScore}</p>
          <ul className="mt-2 text-xs text-white/65">
            {n.inconsistencies.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">{children}</div>
  );
}
