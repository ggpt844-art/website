/** Config-driven review strategy notes — no automated review requests without approval. */
export function reviewStrategyBullets(): string[] {
  return [
    "Ask only verified customers after service — never buy or fake reviews.",
    "Make the Google review link easy to find; avoid misleading “review gating.”",
    "Track monthly goal in config; report velocity against honest targets only.",
  ];
}
