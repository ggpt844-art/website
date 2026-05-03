export interface OutreachTouch {
  id: string;
  dayOffset: number;
  channel: "manual_email" | "manual_call" | "manual_sms";
  template: string;
}

/** Low-pressure, manual-only sequence templates — never auto-send. */
export function defaultOutreachSequence(businessName: string, demoUrl: string): OutreachTouch[] {
  return [
    {
      id: "t1",
      dayOffset: 0,
      channel: "manual_email",
      template: `Hi — I put together a short preview of a higher-converting funnel for ${businessName}. Demo (private): ${demoUrl}. If useful, reply and I’ll share the audit notes.`,
    },
    {
      id: "t2",
      dayOffset: 4,
      channel: "manual_email",
      template: `Quick follow-up on the ${businessName} preview. Happy to walk through the quote flow and lead dashboard on a 10-minute call — no pitch deck.`,
    },
    {
      id: "t3",
      dayOffset: 10,
      channel: "manual_call",
      template: `Call script: reference the demo link, ask if they saw the mobile quote path, offer to send the audit PDF.`,
    },
  ];
}
