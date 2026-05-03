export function gbpAlignmentChecklist(args: {
  hasPhone: boolean;
  hasWebsite: boolean;
  hasAddress: boolean;
  hasReviews: boolean;
}): string[] {
  const items: string[] = [];
  items.push("Primary category matches core service.");
  if (args.hasPhone) items.push("Phone matches website and NAP.");
  else items.push("Add phone to GBP when available.");
  if (args.hasWebsite) items.push("Website URL points to new lead-gen site after launch.");
  else items.push("Connect website URL after launch.");
  if (args.hasAddress) items.push("Address matches mailers and citations.");
  else items.push("Define service areas accurately in GBP.");
  if (args.hasReviews) items.push("Monitor review velocity and reply to new reviews.");
  else items.push("Build real review cadence — no incentives for fake reviews.");
  items.push("Upload recent project/team photos.");
  items.push("Keep hours accurate.");
  return items;
}
