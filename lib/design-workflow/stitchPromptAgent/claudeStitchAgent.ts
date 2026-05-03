import type { DeterministicStitchBundle, StitchPromptAgentInput } from "./types";
import { STITCH_BOUNDARY_PROMPT_APPEND } from "../stitchDesignBoundary";

const SYSTEM = `You are a creative director, conversion strategist, local-services marketer, cinematic UI art director, and compliance-aware copywriter.
You refine landing-page generation prompts for Google Stitch.

Output ONLY valid JSON (no markdown fences). Use this exact top-level shape:
{
  "buyerPsychology": { ... },
  "creativeStrategy": { ... },
  "conversionStrategy": { ... },
  "sectionStrategy": { ... },
  "stitchPromptPlan": { ... },
  "finalStitchPrompt": "<full multi-section prompt string>",
  "warnings": [],
  "confidence": 0-100
}

Rules:
- Use ONLY facts from the provided business context. Never invent reviews, certifications, licenses, before/after results, service areas, same-day service, financing, response times, or guarantees.
- Every visual must explain customer problem, solution, trust, or CTA. No random decorative 3D.
- No generic "modern clean website" filler.
- stitchPromptPlan must include strong anti-AI-template constraints, mobile-first rules, conversion requirements, claim safety, three visually distinct variants (Safe Conversion / Premium Cinematic / Bold Experimental), DESIGN.md-style output request, and ask Stitch to recommend the best variant with rationale.
- finalStitchPrompt must use the user's section headings: Title, Project Context, Buyer Psychology, Core Visual Metaphor, Cinematic Hero Direction, Camera / Depth / Composition, Motion Direction, UI / Component Style, Section Flow, Conversion Requirements, Mobile Requirements, Compliance / Claim Safety, Anti-AI / Anti-Template Rules, Variant Requirements, Output Requirements.
- Preserve the business name and geography exactly as given.

Stitch scope (mandatory):
${STITCH_BOUNDARY_PROMPT_APPEND}`;

export async function callClaudeStitchPromptAgent(args: {
  input: StitchPromptAgentInput;
  deterministicBundle: DeterministicStitchBundle;
}): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) throw new Error("ANTHROPIC_API_KEY missing");

  const { input, deterministicBundle } = args;

  const payload = {
    business: input.business,
    nichePreset: { slug: input.nichePreset.slug, label: input.nichePreset.label },
    pageStrategy: input.pageStrategy,
    seoPrimary: input.seoConfig.primaryKeyword,
    conversionPrimaryCta: input.demoConfig.strategy.primaryCTA,
    complianceWarnings: input.complianceWarnings,
    availableAssets: input.availableAssets,
    desiredVariantCount: Math.max(3, input.desiredVariantCount),
    businessIntelligenceExcerpt: input.businessIntelligencePacket
      ? JSON.stringify(input.businessIntelligencePacket).slice(0, 12000)
      : null,
    deterministicStartingPoint: deterministicBundle,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Refine this Stitch prompt pipeline output into stronger niche-specific, cinematic, conversion-focused JSON as specified.\n\nCONTEXT:\n${JSON.stringify(payload)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 500)}`);
  }

  const body = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = body.content?.map((b) => (b.type === "text" ? b.text : "")).join("") ?? "";
  if (!text.trim()) throw new Error("Empty response from Anthropic");
  return text;
}
