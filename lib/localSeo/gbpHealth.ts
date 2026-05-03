export interface GbpHealthInput {
  businessName: string;
  phone?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  reviewCount?: number | null;
  rating?: number | null;
}

export function scoreGbpHealth(input: GbpHealthInput) {
  let score = 35;
  const missingItems: string[] = [];
  const recommendedActions: string[] = [];
  if (input.phone) score += 15;
  else missingItems.push("Phone not confirmed for GBP alignment");
  if (input.address) score += 12;
  else {
    missingItems.push("Street address missing — use service areas carefully");
    recommendedActions.push("Define service areas in GBP to match website copy");
  }
  if (input.websiteUrl) score += 10;
  else missingItems.push("Website link");
  if ((input.reviewCount ?? 0) > 5) score += 12;
  else recommendedActions.push("Grow legitimate reviews steadily");
  if ((input.rating ?? 0) >= 4) score += 8;
  recommendedActions.push("Match primary category to core money city keyword");
  recommendedActions.push("Add recent photos quarterly");
  score = Math.min(100, Math.round(score));

  return {
    gbpHealthScore: score,
    missingItems,
    recommendedActions,
    reviewStrategy: [
      "Reply within 24–48h",
      "Ask satisfied customers directly — no incentives",
    ],
    photoStrategy: ["Team", "Project completion", "Before/after only if real and approved"],
    serviceCategorySuggestions: [],
  };
}
