import type { WebsiteStatus } from "@prisma/client";

export interface OutreachInput {
  businessName: string;
  city: string;
  niche: string;
  websiteStatus: WebsiteStatus;
  demoUrl: string;
  auditUrl: string;
  contactReason: string;
}

export interface OutreachOutput {
  smsText: string;
  emailSubject: string;
  emailBody: string;
  instagramDm: string;
  callScript: string;
  followUp1: string;
  followUp2: string;
  contactReason: string;
}

function intro(status: WebsiteStatus, businessName: string): string {
  switch (status) {
    case "no_website":
      return `Hey — I noticed ${businessName} shows up locally but I couldn't find a proper website.`;
    case "social_only":
    case "directory_only":
      return `Hey — I noticed ${businessName} is mostly visible through social/directory listings right now.`;
    case "broken_website":
      return `Hey — I tried to load ${businessName}'s site and it was down/erroring.`;
    case "outdated_website":
    case "basic_brochure_site":
      return `Hey — I rebuilt ${businessName}'s current site as a quick lead-generation demo.`;
    case "decent_but_low_conversion":
    case "good_site_but_no_funnel":
      return `Your current site already has a solid foundation, so I made a quick demo focused specifically on increasing quote requests.`;
    default:
      return `Hey — I put together a quick lead-generation demo for ${businessName}.`;
  }
}

export function writeOutreach(input: OutreachInput): OutreachOutput {
  const lead = intro(input.websiteStatus, input.businessName);
  const sms = `${lead} Built a 60-second preview — quick look? ${input.demoUrl}`;
  const emailSubject = `Quick lead-gen demo for ${input.businessName}`;
  const emailBody =
    `${lead}\n\n` +
    `It keeps the core of what you offer but adds a stronger mobile layout, a guided quote flow, and a photo-upload path so quote requests come in with real details.\n\n` +
    `Live demo: ${input.demoUrl}\n` +
    `Side-by-side audit: ${input.auditUrl}\n\n` +
    `No pressure — happy to chat if it would be useful.`;
  const instagramDm = `${lead} Built a quick demo — link in DM if useful: ${input.demoUrl}`;
  const callScript =
    `Hi, is this ${input.businessName}? I'm reaching out because I built a quick lead-generation demo of what your site could look like with a guided quote flow. ` +
    `Would it be alright if I texted you the link to take a look?`;
  const followUp1 = `Following up on the demo I sent — did it land okay? ${input.demoUrl}`;
  const followUp2 = `Last bump on this — happy to walk through it together if useful, otherwise I'll leave it. ${input.demoUrl}`;

  return {
    smsText: sms,
    emailSubject,
    emailBody,
    instagramDm,
    callScript,
    followUp1,
    followUp2,
    contactReason: input.contactReason,
  };
}
