"use client";

import { getDesignSystem } from "@/lib/presets/designSystems";
import type { DesignSystemId } from "@/lib/presets/types";

export function DemoThemeStyle({ designSystem }: { designSystem: DesignSystemId }) {
  const ds = getDesignSystem(designSystem);
  const vars = Object.entries(ds.cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");
  const css = `
:root[data-demo-theme="${designSystem}"] {
${vars}
  --section-y: ${ds.spacing.sectionY};
  --container-x: ${ds.spacing.containerX};
  --gap: ${ds.spacing.gap};
  --radius-card: ${ds.radius.card};
  --radius-button: ${ds.radius.button};
}
:root[data-demo-theme="${designSystem}"] .demo-root {
  background: var(--bg);
  color: var(--text);
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
