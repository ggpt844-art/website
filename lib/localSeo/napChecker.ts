function norm(s?: string | null): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9+]/g, "");
}

export function analyzeNap(input: {
  businessName: string;
  phone?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  sources?: (Record<string, string> | null | undefined)[];
}) {
  const nameVariants = new Set<string>();
  const phoneVariants = new Set<string>();
  const addressVariants = new Set<string>();
  nameVariants.add(input.businessName.trim());
  if (input.phone) phoneVariants.add(norm(input.phone));
  if (input.address) addressVariants.add(input.address.trim());

  const sourceUrls: string[] = [];
  for (const src of input.sources ?? []) {
    if (!src) continue;
      for (const [k, v] of Object.entries(src)) {
      sourceUrls.push(v);
    }
  }

  let score = 70;
  const inconsistencies: string[] = [];
  if (phoneVariants.size > 1) {
    inconsistencies.push("Multiple phone formats detected across sources");
    score -= 15;
  }
  if (nameVariants.size > 1) {
    inconsistencies.push("Business name variants detected");
    score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    napConsistencyScore: score,
    nameVariants: Array.from(nameVariants),
    phoneVariants: Array.from(phoneVariants),
    addressVariants: Array.from(addressVariants),
    inconsistencies,
    recommendedFixes: inconsistencies.map((i) => `Align NAP: ${i}`),
    sourceUrls,
  };
}
