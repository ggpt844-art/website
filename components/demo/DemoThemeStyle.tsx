"use client";

import { getDesignSystem } from "@/lib/presets/designSystems";
import type { DesignSystemId } from "@/lib/presets/types";
import type { VisualDirection } from "@/lib/experience/experienceSchemas";

export function DemoThemeStyle({
  designSystem,
  visualDirection,
}: {
  designSystem: DesignSystemId;
  visualDirection?: VisualDirection | null;
}) {
  const ds = getDesignSystem(designSystem);
  const vars = Object.entries(ds.cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");

  const motionEase =
    visualDirection?.motionLanguage?.toLowerCase().includes("snap") ||
    visualDirection?.motionLanguage?.toLowerCase().includes("crisp")
      ? "cubic-bezier(0.4, 0, 0.2, 1)"
      : "cubic-bezier(0.22, 1, 0.36, 1)";

  const conceptVars = visualDirection ? `  --motion-ease-premium: ${motionEase};\n` : "";

  /* Scope to .demo-root so tokens apply on SSR/first paint (see data-demo-theme on that node). */
  const css = `
.demo-root[data-demo-theme="${designSystem}"] {
${vars}
${conceptVars}
  --section-y: ${ds.spacing.sectionY};
  --container-x: ${ds.spacing.containerX};
  --gap: ${ds.spacing.gap};
  --radius-card: ${ds.radius.card};
  --radius-button: ${ds.radius.button};
  background: var(--bg);
  color: var(--text);
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
