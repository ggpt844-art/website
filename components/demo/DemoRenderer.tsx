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
import { useEffect } from "react";

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
};

export function DemoRenderer({ config }: { config: DemoConfig }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-demo-theme", config.design.designSystem);
    return () => {
      document.documentElement.removeAttribute("data-demo-theme");
    };
  }, [config.design.designSystem]);

  return (
    <div className="demo-root min-h-screen font-body antialiased">
      <DemoThemeStyle designSystem={config.design.designSystem} />
      {config.sections.map((s) => {
        const Cmp = SECTION_MAP[s];
        return Cmp ? <Cmp key={s} config={config} /> : null;
      })}
      <StickyMobileCTA config={config} />
      <footer className="border-t border-[var(--border)] py-10 text-center text-xs text-[var(--text-dim)]">
        Demo for {config.business.name} · Built by Local Funnel Radar · Sample
        data only — not affiliated with the business unless approved.
      </footer>
    </div>
  );
}
