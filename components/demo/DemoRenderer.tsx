"use client";

import type { DemoConfig } from "@/lib/renderer/demoConfig";
import { DemoThemeStyle } from "./DemoThemeStyle";
import { PremiumHero3D } from "./PremiumHero3D";
import { TrustStrip } from "./TrustStrip";
import { ProblemVisualization } from "./ProblemVisualization";
import { DiagnosticTool } from "./DiagnosticTool";
import { ServiceCards } from "./ServiceCards";
import { ProofSection } from "./ProofSection";
import { ProcessTimeline } from "./ProcessTimeline";
import { PhotoUploadQuoteFlow } from "./PhotoUploadQuoteFlow";
import { FAQSection } from "./FAQSection";
import { FinalCTA } from "./FinalCTA";
import { StickyMobileCTA } from "./StickyMobileCTA";
import { CustomNicheSection } from "./CustomNicheSection";
import { DemoAnalytics, trackDemoEvent } from "./DemoAnalytics";
import { GrowthContentBlocks } from "./GrowthContentBlocks";
import { Fragment } from "react";

const SECTION_MAP: Record<
  string,
  React.ComponentType<{ config: DemoConfig }>
> = {
  hero: PremiumHero3D,
  trustStrip: TrustStrip,
  problemVisualization: ProblemVisualization,
  diagnosticTool: DiagnosticTool,
  services: ServiceCards,
  proof: ProofSection,
  process: ProcessTimeline,
  photoUploadQuoteFlow: PhotoUploadQuoteFlow,
  faq: FAQSection,
  finalCTA: FinalCTA,
  customNiche: CustomNicheSection,
};

export function DemoRenderer({ config }: { config: DemoConfig }) {
  const archetype = config.pageStrategy?.flowArchetype;

  return (
    <div
      className="demo-root min-h-screen font-body antialiased"
      data-demo-theme={config.design.designSystem}
      data-flow-archetype={archetype ?? undefined}
    >
      <DemoThemeStyle
        designSystem={config.design.designSystem}
        visualDirection={config.visualDirection}
      />
      <DemoAnalytics slug={config.slug} />
      {config.sections.map((s, i) => {
        const Cmp = SECTION_MAP[s];
        const insertGrowthAfter = i === Math.max(0, config.sections.indexOf("trustStrip"));
        return (
          <Fragment key={s}>
            {Cmp ? <Cmp config={config} /> : null}
            {insertGrowthAfter && <GrowthContentBlocks config={config} />}
          </Fragment>
        );
      })}
      <StickyMobileCTA config={config} trackEvent={(type, extra) => trackDemoEvent(config.slug, type, extra)} />
      <footer className="border-t border-[var(--border)] py-10 text-center text-xs text-[var(--text-dim)]">
        Demo for {config.business.name} · Built by Local Funnel Radar · Sample
        data only — not affiliated with the business unless approved.
      </footer>
    </div>
  );
}
