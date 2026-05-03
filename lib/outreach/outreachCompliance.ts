/**
 * Outreach compliance guardrails — rule-based only. No automated sending.
 */

export function validateOutreachSubject(subject: string): { ok: boolean; reason?: string } {
  const s = subject.toLowerCase();
  if (/re:|fwd:/i.test(subject) && subject.length < 8) {
    return { ok: false, reason: "Avoid deceptive reply-style subjects." };
  }
  if (/guaranteed|100%|free money|act now|limited time offer/i.test(s)) {
    return { ok: false, reason: "Remove spam-style urgency or false guarantees." };
  }
  return { ok: true };
}

export function validateOutreachBody(body: string): { ok: boolean; reason?: string } {
  const b = body.trim();
  if (b.length < 20) {
    return {
      ok: false,
      reason: "Add enough context: who you are, why you're reaching out, and what the demo is.",
    };
  }
  const lower = b.toLowerCase();
  if (/you('ve| have) won|claim your prize|wire transfer|cryptocurrency investment/i.test(lower)) {
    return { ok: false, reason: "Remove deceptive financial/lottery patterns." };
  }
  return { ok: true };
}
