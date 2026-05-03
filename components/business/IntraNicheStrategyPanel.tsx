import { saveIntraNicheManualOverrides } from "@/lib/actions/intraNicheStrategyActions";
import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { INTRA_NICHE_GRADER_MIN_SCORE } from "@/lib/strategy/intraNicheGrader";

export function IntraNicheStrategyPanel({
  businessId,
  demoConfigId,
  config,
  approvalBlocked,
}: {
  businessId: string;
  demoConfigId: string | null;
  config: DemoConfig | null;
  approvalBlocked: boolean;
}) {
  if (!demoConfigId) {
    return <p className="text-sm text-white/50">Generate a demo to see intra-niche strategy.</p>;
  }
  if (!config?.intraNicheStrategy) {
    return (
      <p className="text-sm text-white/50">
        No intra-niche strategy on this demo config. Rebuild or regenerate the demo.
      </p>
    );
  }

  const intra = config.intraNicheStrategy;
  const meta = config.intraNicheDifferentiationMeta;
  const fp = config.sameNicheDesignFingerprint;
  const manual = config.intraNicheManualOverrides;

  return (
    <div className="space-y-8 text-sm">
      {approvalBlocked ? (
        <div className="rounded-xl border border-accent-orange/40 bg-accent-orange/10 p-4 text-accent-orange">
          Approval was blocked: intra-niche differentiation score or same-niche similarity failed QA. Adjust
          overrides below and rebuild, or regenerate the demo.
        </div>
      ) : null}

      {meta ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-wider text-white/50">QA · Intra-niche differentiation</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-4">
            <p className="font-display text-3xl text-white">{meta.intraNicheDifferentiationScore}</p>
            <span className="text-white/60">/ 100 · gate {INTRA_NICHE_GRADER_MIN_SCORE}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                meta.blocksApproval
                  ? "bg-accent-orange/20 text-accent-orange"
                  : "bg-accent-green/20 text-accent-green"
              }`}
            >
              {meta.blocksApproval ? "Blocks approval" : "Passes gate"}
            </span>
          </div>
          {meta.warnings?.length ? (
            <ul className="mt-3 space-y-1 text-xs text-white/70">
              {meta.warnings.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Strategy snapshot</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stat k="Parent niche" v={intra.parentNiche} />
          <Stat k="Sub-niche" v={intra.subNiche} />
          <Stat k="Buyer intent" v={intra.buyerIntent} />
          <Stat k="Urgency" v={intra.urgencyLevel} />
          <Stat k="Brand position" v={intra.brandPosition} />
          <Stat k="Business maturity" v={intra.businessMaturity} />
          <Stat k="Primary focus" v={intra.primaryServiceFocus} />
          <Stat k="CTA strategy" v={intra.ctaStrategy} />
          <Stat k="Flow archetype" v={intra.flowArchetype} />
          <Stat k="Funnel style" v={intra.funnelStyle} />
          <Stat k="Visual metaphor" v={intra.visualMetaphor} />
          <Stat k="Confidence" v={String(intra.confidence)} />
        </dl>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <List k="Sections to prioritize" items={intra.sectionsToPrioritize} />
          <List k="Sections to avoid" items={intra.sectionsToAvoid} />
        </div>
        <p className="mt-4 text-xs text-white/55">{intra.differentiationRationale}</p>
        {intra.assumptions?.length ? <List k="Assumptions" items={intra.assumptions} /> : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Competitive positioning</p>
        <dl className="mt-3 space-y-2 text-xs text-white/75">
          <dt className="text-white/45">Competitor pattern</dt>
          <dd>{intra.competitivePositioning.competitorPattern}</dd>
          <dt className="text-white/45">How this demo differs</dt>
          <dd>{intra.competitivePositioning.howThisDemoShouldFeelDifferent}</dd>
          <dt className="text-white/45">Unique angle</dt>
          <dd>{intra.competitivePositioning.uniqueAngle}</dd>
        </dl>
        {intra.competitivePositioning.overusedNicheClichesToAvoid?.length ? (
          <List k="Clichés to avoid" items={intra.competitivePositioning.overusedNicheClichesToAvoid} />
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Asset strategy</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
          <Stat k="Quality" v={intra.assetStrategy.assetQuality} />
          <Stat k="Visual approach" v={intra.assetStrategy.visualApproach} />
        </dl>
        <p className="mt-2 text-xs text-white/65">{intra.assetStrategy.proofPlacement}</p>
      </div>

      {fp ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-wider text-white/50">Same-niche design fingerprint</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-white/70">
            <Stat k="Scene type" v={fp.sceneType} />
            <Stat k="Section hash" v={fp.sectionOrderHash} />
            <Stat k="Hero composition" v={fp.heroComposition} />
            <Stat k="Lighting" v={fp.lightingPreset} />
          </dl>
        </div>
      ) : null}

      {manual && Object.keys(manual).length > 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-white/60">
          <p className="text-[11px] uppercase tracking-wider text-white/45">Active manual overrides</p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">
            {JSON.stringify(manual, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-wider text-white/50">Manual overrides</p>
        <p className="mt-2 text-xs text-white/55">
          Saves overrides, rebuilds demo config from business data, and re-runs planning + QA scores.
        </p>
        <form action={saveIntraNicheManualOverrides} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="demoConfigId" value={demoConfigId} />
          <input type="hidden" name="businessId" value={businessId} />
          <Field label="Sub-niche" name="subNiche" defaultValue={manual?.subNiche ?? intra.subNiche} />
          <Field label="Buyer intent" name="buyerIntent" defaultValue={manual?.buyerIntent ?? intra.buyerIntent} />
          <Field
            label="Brand position"
            name="brandPosition"
            defaultValue={manual?.brandPosition ?? intra.brandPosition}
          />
          <Field
            label="Business maturity"
            name="businessMaturity"
            defaultValue={manual?.businessMaturity ?? intra.businessMaturity}
          />
          <Field
            label="Primary service focus"
            name="primaryServiceFocus"
            defaultValue={manual?.primaryServiceFocus ?? intra.primaryServiceFocus}
          />
          <Field label="CTA strategy" name="ctaStrategy" defaultValue={manual?.ctaStrategy ?? intra.ctaStrategy} />
          <Field
            label="Flow archetype"
            name="flowArchetype"
            defaultValue={manual?.flowArchetype ?? intra.flowArchetype}
          />
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-white/45">Visual metaphor</label>
            <textarea
              name="visualMetaphor"
              rows={2}
              defaultValue={manual?.visualMetaphor ?? intra.visualMetaphor}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/45">Asset visual approach</label>
            <select
              name="assetVisualApproach"
              defaultValue={manual?.assetStrategy?.visualApproach ?? intra.assetStrategy.visualApproach}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm outline-none focus:border-white/30"
            >
              <option value="real_photo_led">real_photo_led</option>
              <option value="hybrid_photo_cinematic">hybrid_photo_cinematic</option>
              <option value="abstract_cinematic">abstract_cinematic</option>
              <option value="proof_card_led">proof_card_led</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:brightness-110"
            >
              Save overrides &amp; rebuild demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2">
      <dt className="text-[10px] uppercase tracking-wider text-white/45">{k}</dt>
      <dd className="mt-1 text-white/85">{v || "—"}</dd>
    </div>
  );
}

function List({ k, items }: { k: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2">
      <p className="text-[10px] uppercase tracking-wider text-white/45">{k}</p>
      <ul className="mt-2 space-y-0.5 text-xs text-white/70">
        {items?.length ? items.map((i) => <li key={i}>· {i}</li>) : <li className="text-white/40">—</li>}
      </ul>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-white/45">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm outline-none focus:border-white/30"
      />
    </div>
  );
}
