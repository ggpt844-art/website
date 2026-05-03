export function generateLlmsTxt(args: {
  businessName: string;
  nicheLabel: string;
  city: string;
  services: string[];
  areas: string[];
  baseUrl: string;
  indexingMode: "demo_noindex" | "client_indexable";
  lastUpdated: string;
  /** Intra-niche differentiation — appended when indexable */
  positioningNote?: string;
}): string {
  if (args.indexingMode === "demo_noindex") {
    return `# ${args.businessName} (demo)\n\nThis is a private demo preview. llms.txt is not exposed for indexing until the client site is launched as indexable.\n`;
  }
  const areas = args.areas.length ? args.areas.join("\n- ") : args.city;
  const positioning = args.positioningNote
    ? `

## Positioning snapshot
${args.positioningNote}
`
    : "";
  return `# ${args.businessName}

${args.businessName} is a ${args.nicheLabel.toLowerCase()} serving ${args.city} and documented service areas.

## Services
${args.services.map((s) => `- ${s}`).join("\n")}

## Service areas
- ${areas}

## Key pages
- ${args.baseUrl}/
- ${args.baseUrl}/contact
${positioning}
## Contact
Visit the site contact section for phone/email.

Last updated: ${args.lastUpdated}
`;
}
