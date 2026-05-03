import type { IntraNicheStrategy } from "./intraNicheTypes";

/** Deep-merge manual dashboard overrides onto generated strategy. */
export function mergeIntraNicheStrategy(
  base: IntraNicheStrategy,
  manual: Partial<IntraNicheStrategy> | null | undefined,
): IntraNicheStrategy {
  if (!manual) return base;
  const { competitivePositioning, assetStrategy, ...rest } = manual;
  return {
    ...base,
    ...rest,
    secondaryServiceFocuses: manual.secondaryServiceFocuses ?? base.secondaryServiceFocuses,
    sectionsToPrioritize: manual.sectionsToPrioritize ?? base.sectionsToPrioritize,
    sectionsToAvoid: manual.sectionsToAvoid ?? base.sectionsToAvoid,
    assumptions: manual.assumptions ?? base.assumptions,
    competitivePositioning: competitivePositioning
      ? { ...base.competitivePositioning, ...competitivePositioning }
      : base.competitivePositioning,
    assetStrategy: assetStrategy ? { ...base.assetStrategy, ...assetStrategy } : base.assetStrategy,
  };
}
