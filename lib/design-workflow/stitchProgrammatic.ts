/**
 * Programmatic Google Stitch (Labs) via @google/stitch-sdk — server-only.
 * HTML/screenshots are reference-only; production stays on our renderer.
 */
import * as cheerio from "cheerio";

export interface StitchGenerationResult {
  projectId: string;
  screenId: string;
  htmlDownloadUrl: string;
  htmlSnippet: string;
  plainTextForParser: string;
  screenshotUrl: string;
}

function htmlToPlainText(html: string, maxLen = 14_000): string {
  try {
    const $ = cheerio.load(html);
    const t = $("body").text().replace(/\s+/g, " ").trim();
    return t.slice(0, maxLen);
  } catch {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLen);
  }
}

export async function runStitchScreenFromPrompt(input: {
  projectTitle: string;
  prompt: string;
  deviceType?: "MOBILE" | "DESKTOP" | "TABLET" | "AGNOSTIC";
}): Promise<StitchGenerationResult> {
  const { stitch } = await import("@google/stitch-sdk");
  const apiKey = process.env.STITCH_API_KEY?.trim();
  if (!apiKey) throw new Error("STITCH_API_KEY is not set");

  try {
    const project = await stitch.createProject(input.projectTitle.slice(0, 120));
    const screen = await project.generate(
      input.prompt,
      input.deviceType ?? "MOBILE",
    );
    const htmlUrl = await screen.getHtml();
    const shotUrl = await screen.getImage();

    let html = "";
    if (htmlUrl && /^https?:\/\//i.test(htmlUrl)) {
      const res = await fetch(htmlUrl, { headers: { Accept: "text/html,*/*" } });
      if (res.ok) html = await res.text();
    } else if (htmlUrl) {
      html = htmlUrl;
    }

    const plain = html ? htmlToPlainText(html) : "";
    const snippet = html.slice(0, 12_000);

    return {
      projectId: project.id,
      screenId: screen.id,
      htmlDownloadUrl: typeof htmlUrl === "string" ? htmlUrl : "",
      htmlSnippet: snippet,
      plainTextForParser: plain || input.prompt.slice(0, 8000),
      screenshotUrl: typeof shotUrl === "string" ? shotUrl : "",
    };
  } finally {
    try {
      await stitch.close();
    } catch {
      /* ignore */
    }
  }
}
