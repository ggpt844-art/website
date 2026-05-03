export function sanitizeClaim(text: string): { ok: boolean; reason?: string } {
  if (/guaranteed |best in |#1 |risk-free$/i.test(text))
    return { ok: false, reason: "High-risk marketing language" };
  return { ok: true };
}
