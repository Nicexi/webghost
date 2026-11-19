import { chromium } from "playwright";

export async function capturePage(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      userAgent: "WebGhostBot/0.1 (+manual website change monitor)"
    });
    await page.goto(parsed.href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1200);

    const result = await page.evaluate(() => ({
      title: document.title,
      text: document.body?.innerText?.replace(/\\s+/g, " ").trim() ?? "",
      url: location.href
    }));

    return { ...result, capturedAt: new Date().toISOString() };
  } finally {
    await browser.close();
  }
}
