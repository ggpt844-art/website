// Playwright wrapper that fails soft when browsers aren't installed.
// Use ensureBrowser() lazily so tests / dev environments without Playwright
// browsers still run.

let _playwright: typeof import("playwright") | null = null;
let _browserPromise: Promise<unknown> | null = null;

async function loadPlaywright() {
  if (_playwright) return _playwright;
  try {
    _playwright = await import("playwright");
    return _playwright;
  } catch {
    return null;
  }
}

export async function getBrowser() {
  const pw = await loadPlaywright();
  if (!pw) return null;
  if (!_browserPromise) {
    _browserPromise = pw.chromium
      .launch({ headless: true })
      .catch((err) => {
        console.warn("[scraping] failed to launch chromium:", err.message);
        _browserPromise = null;
        return null;
      });
  }
  return _browserPromise;
}

export async function withPage<T>(
  fn: (page: import("playwright").Page) => Promise<T>,
  opts: { viewport?: { width: number; height: number }; userAgent?: string } = {},
): Promise<T | null> {
  const browser = (await getBrowser()) as import("playwright").Browser | null;
  if (!browser) return null;
  const context = await browser.newContext({
    viewport: opts.viewport ?? { width: 1440, height: 900 },
    userAgent:
      opts.userAgent ??
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close().catch(() => undefined);
    await context.close().catch(() => undefined);
  }
}
