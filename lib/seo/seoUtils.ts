export function truncateMeta(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function safeKeywordPhrase(service: string, city: string): string {
  return `${service} ${city}`.replace(/\s+/g, " ").trim();
}
