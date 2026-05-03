import type { FlowArchetype } from "@/lib/experience/experienceSchemas";
import { FlowArchetypeSchema } from "@/lib/experience/experienceSchemas";

/** Maps intra-niche / spec archetype strings onto planner enum. */
export function normalizeFlowArchetype(raw: string | undefined | null): FlowArchetype | null {
  if (!raw?.trim()) return null;
  const k = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, FlowArchetype> = {
    emergency_conversion: "emergency_conversion",
    premium_consultation: "premium_consultation",
    local_authority: "local_authority",
    education_first: "education_first",
    transformation_proof: "transformation_proof",
    portfolio_led: "portfolio_led",
    fast_quote_first: "fast_quote_first",
    high_trust_consultation: "premium_consultation",
    trust_first: "local_authority",
    comfort_first_consultation: "premium_consultation",
    new_patient_flow: "premium_consultation",
    technical_authority: "local_authority",
    maintenance_plan_flow: "education_first",
    project_planner: "portfolio_led",
    premium_authority: "premium_consultation",
  };
  const m = map[k];
  if (m) return m;
  const p = FlowArchetypeSchema.safeParse(k);
  return p.success ? p.data : null;
}
