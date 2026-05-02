export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  const seed = slugify(base) || "demo";
  if (!existing.has(seed)) return seed;
  let i = 2;
  while (existing.has(`${seed}-${i}`)) i++;
  return `${seed}-${i}`;
}

export function normalizeBusinessName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(inc|incorporated|ltd|limited|llc|llp|corp|corporation|company|co)\b\.?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhone(input?: string | null): string | null {
  if (!input) return null;
  const digits = input.replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export function normalizeDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
