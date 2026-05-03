import type { StitchPromptAgentInput, StitchPromptAgentResult } from "./types";
import { buildDeterministicBundle, buildStitchPromptPlan } from "./buildDeterministicBundle";
import { renderFinalStitchPromptFromPlan } from "./renderFinalStitchPrompt";
import { gradeStitchPrompt } from "./stitchPromptGrader";
import {
  extractJsonFromModelText,
  mergeBuyerPsychology,
  mergeConversionStrategy,
  mergeCreativeStrategy,
  mergeSectionStrategy,
  mergeStitchPromptPlan,
} from "./mergeAgentPartial";
import { callClaudeStitchPromptAgent } from "./claudeStitchAgent";
import type { BuyerPsychology, ConversionStrategy, CreativeStrategy, SectionStrategy } from "./types";

function selectFinalPrompt(args: {
  claudeFinal: string | undefined;
  businessName: string;
  rendered: string;
}): string {
  const c = args.claudeFinal?.trim() ?? "";
  if (
    c.length >= 900 &&
    c.includes(args.businessName) &&
    /Title:/i.test(c) &&
    /Buyer Psychology:/i.test(c) &&
    /Mobile Requirements:/i.test(c)
  ) {
    return c;
  }
  return args.rendered;
}

export async function runStitchPromptAgent(input: StitchPromptAgentInput): Promise<StitchPromptAgentResult> {
  const det = buildDeterministicBundle(input);
  let buyerPsychology: BuyerPsychology = det.buyerPsychology;
  let creativeStrategy: CreativeStrategy = det.creativeStrategy;
  let conversionStrategy: ConversionStrategy = det.conversionStrategy;
  let sectionStrategy: SectionStrategy = det.sectionStrategy;

  const warnings: string[] = [];
  let usedClaude = false;
  let confidence = 66;
  let claudeFinal: string | undefined;

  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    try {
      const rawText = await callClaudeStitchPromptAgent({ input, deterministicBundle: det });
      const json = extractJsonFromModelText(rawText) as Record<string, unknown>;
      buyerPsychology = mergeBuyerPsychology(buyerPsychology, json.buyerPsychology);
      creativeStrategy = mergeCreativeStrategy(creativeStrategy, json.creativeStrategy);
      conversionStrategy = mergeConversionStrategy(conversionStrategy, json.conversionStrategy);
      sectionStrategy = mergeSectionStrategy(sectionStrategy, json.sectionStrategy);
      if (typeof json.confidence === "number" && Number.isFinite(json.confidence)) {
        confidence = Math.min(100, Math.max(0, json.confidence));
      } else {
        confidence = 84;
      }
      if (Array.isArray(json.warnings)) {
        warnings.push(...json.warnings.filter((w): w is string => typeof w === "string"));
      }
      if (typeof json.finalStitchPrompt === "string") {
        claudeFinal = json.finalStitchPrompt;
      }
      usedClaude = true;

      let stitchPromptPlan = buildStitchPromptPlan(
        input,
        buyerPsychology,
        creativeStrategy,
        conversionStrategy,
        sectionStrategy,
      );
      stitchPromptPlan = mergeStitchPromptPlan(stitchPromptPlan, json.stitchPromptPlan);

      const rendered = renderFinalStitchPromptFromPlan({
        businessName: input.business.name,
        nicheLabel: input.nichePreset.label,
        city: input.business.city,
        region: input.business.region,
        country: input.business.country,
        plan: stitchPromptPlan,
      });

      const finalStitchPrompt = selectFinalPrompt({
        claudeFinal,
        businessName: input.business.name,
        rendered,
      });

      const graded = gradeStitchPrompt({
        finalStitchPrompt,
        businessName: input.business.name,
        city: input.business.city,
        nicheLabel: input.nichePreset.label,
        complianceWarnings: input.complianceWarnings,
      });
      warnings.push(...graded.reasons);

      return {
        buyerPsychology,
        creativeStrategy,
        conversionStrategy,
        sectionStrategy,
        stitchPromptPlan,
        finalStitchPrompt,
        warnings,
        confidence,
        stitchPromptScore: graded.score,
        stitchPromptBlocksAutoStitch: graded.blocksAutoStitch,
        stitchPromptGraderBreakdown: graded.breakdown,
        usedClaude,
      };
    } catch (e) {
      warnings.push(
        `Claude refinement failed — using deterministic bundle. (${e instanceof Error ? e.message : String(e)})`,
      );
    }
  }

  const stitchPromptPlan = det.stitchPromptPlan;
  const rendered = renderFinalStitchPromptFromPlan({
    businessName: input.business.name,
    nicheLabel: input.nichePreset.label,
    city: input.business.city,
    region: input.business.region,
    country: input.business.country,
    plan: stitchPromptPlan,
  });

  const finalStitchPrompt = selectFinalPrompt({
    claudeFinal,
    businessName: input.business.name,
    rendered,
  });

  const graded = gradeStitchPrompt({
    finalStitchPrompt,
    businessName: input.business.name,
    city: input.business.city,
    nicheLabel: input.nichePreset.label,
    complianceWarnings: input.complianceWarnings,
  });
  warnings.push(...graded.reasons);

  return {
    buyerPsychology,
    creativeStrategy,
    conversionStrategy,
    sectionStrategy,
    stitchPromptPlan,
    finalStitchPrompt,
    warnings,
    confidence,
    stitchPromptScore: graded.score,
    stitchPromptBlocksAutoStitch: graded.blocksAutoStitch,
    stitchPromptGraderBreakdown: graded.breakdown,
    usedClaude,
  };
}
