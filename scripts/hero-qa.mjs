import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseURL = process.env.NALT_QA_URL || "http://127.0.0.1:3400";
const output = "qa";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const errors = [];
const monitor = (page) => {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
};
const waitForLive = (page) => page.locator('.intro-hero[data-intro-state="live"]').waitFor({ timeout: 10000 });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  monitor(page);
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.locator('.intro-hero[data-intro-state="playing"]').waitFor();
  await page.evaluate(() => { window.__qaOriginalMark = document.querySelector(".hero-mark > svg"); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/desktop-draw.png` });
  const initial = await page.locator(".hero-mark").boundingBox();
  assert(initial.width < 190, `Initial A should be about 11vw, got ${initial.width}`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/desktop-break.png` });
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${output}/desktop-expand.png` });
  await waitForLive(page);
  assert(await page.evaluate(() => window.__qaOriginalMark === document.querySelector(".hero-mark > svg")), "The intro SVG was replaced");
  const final = await page.locator(".hero-mark").boundingBox();
  assert(final.width > 900 && final.x + final.width > 1440, "The hero A should be large and cropped");
  await page.screenshot({ path: `${output}/desktop-live.png` });
  await page.getByRole("link", { name: "NALT Studio home" }).click();
  assert.equal(await page.locator(".intro-hero").getAttribute("data-intro-state"), "live", "Client home navigation replayed the opening");
  results.push({ scenario: "desktop opening / same SVG / client navigation", passed: true });
  await page.close();

  for (const [width, height] of [[1920,1080], [1440,900], [1024,768], [768,1024], [390,844], [320,640], [320,568], [844,390], [667,375]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", isMobile: width < 768, hasTouch: width < 768 });
    const current = await context.newPage();
    monitor(current);
    await current.goto(baseURL, { waitUntil: "networkidle" });
    await waitForLive(current);
    await current.evaluate(() => document.fonts.ready);
    const layout = await current.evaluate(() => {
      const rect = (selector) => { const box = document.querySelector(selector).getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom }; };
      const fill = document.querySelector(".hero-mark .mark-fill");
      const inverse = fill.getScreenCTM().inverse();
      let metadataOverOrange = false;
      for (const selector of [".global-metadata", ".description"]) {
        const textNodes = document.createTreeWalker(document.querySelector(selector), NodeFilter.SHOW_TEXT);
        while (textNodes.nextNode()) {
          if (!textNodes.currentNode.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(textNodes.currentNode);
          for (const box of range.getClientRects()) {
            for (const fraction of [0.1, 0.5, 0.9]) {
              const point = new DOMPoint(box.x + box.width * fraction, box.y + box.height / 2).matrixTransform(inverse);
              if (fill.isPointInFill(point)) metadataOverOrange = true;
            }
          }
        }
      }
      return {
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        heading: rect(".hero-heading"),
        lines: Array.from(document.querySelectorAll(".headline-line")).map((line) => ({ visible: getComputedStyle(line).transform === "none", textWidth: (() => { const range = document.createRange(); range.selectNodeContents(line); return range.getBoundingClientRect().width; })() })),
        cta: rect(".work-cta"),
        metadata: rect(".viewport-metadata"),
        decorationOpacity: getComputedStyle(document.querySelector(".coordinate-system")).opacity,
        sectionCount: document.querySelectorAll("main section").length,
        metadataOverOrange,
      };
    });
    assert(layout.documentWidth <= width, `Horizontal overflow at ${width}x${height}`);
    assert(layout.documentHeight <= height, `Hero exceeds the viewport at ${width}x${height}`);
    assert(layout.lines.every((line) => line.visible && line.textWidth <= layout.heading.width + 1), `Headline clipped at ${width}x${height}`);
    assert(layout.cta.bottom + 12 < layout.metadata.y, `CTA collides with bottom metadata at ${width}x${height}`);
    assert.equal(layout.decorationOpacity, "0", "Intro guides remain visible");
    assert.equal(layout.sectionCount, 1, "Additional homepage sections were added");
    assert.equal(layout.metadataOverOrange, false, `Supporting copy or metadata is over orange at ${width}x${height}`);
    await current.screenshot({ path: `${output}/live-${width}x${height}.png`, fullPage: true });
    if (width < 768) {
      const menu = current.getByRole("button", { name: "MENU" });
      await menu.click();
      await current.getByRole("navigation", { name: "Primary" }).waitFor({ state: "visible" });
      await current.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert(await menu.evaluate((element) => element === document.activeElement));
    }
    results.push({ scenario: `${width}x${height} / reduced motion / layout${width < 768 ? " / menu" : ""}`, passed: true, layout });
    await context.close();
  }

  const skipPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  monitor(skipPage);
  await skipPage.goto(baseURL, { waitUntil: "domcontentloaded" });
  await skipPage.getByRole("button", { name: "SKIP INTRO" }).waitFor({ state: "visible" });
  await skipPage.keyboard.press("Tab");
  assert(await skipPage.getByRole("link", { name: "NALT Studio home" }).evaluate((element) => element === document.activeElement));
  assert.equal(await skipPage.locator(".navigation").evaluate((element) => getComputedStyle(element).opacity), "1", "Focused navigation should be visible during the opening");
  await skipPage.keyboard.press("Tab");
  assert(await skipPage.getByRole("button", { name: "SKIP INTRO" }).evaluate((element) => element === document.activeElement));
  await skipPage.keyboard.press("Enter");
  await waitForLive(skipPage);
  assert.equal(await skipPage.locator(".hero-mark").evaluate((element) => getComputedStyle(element).transform), "none");
  assert(await skipPage.getByRole("link", { name: "NALT Studio home" }).evaluate((element) => element === document.activeElement));
  results.push({ scenario: "keyboard focus / skip opening / focus restoration", passed: true });
  await skipPage.reload({ waitUntil: "domcontentloaded" });
  await skipPage.locator('.intro-hero[data-intro-state="playing"]').waitFor();
  await skipPage.setViewportSize({ width: 390, height: 844 });
  await waitForLive(skipPage);
  assert.equal(await skipPage.locator(".hero-mark").evaluate((element) => getComputedStyle(element).transform), "none");
  results.push({ scenario: "reload replays / resize during opening settles", passed: true });
  await skipPage.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  monitor(mobile);
  await mobile.goto(baseURL, { waitUntil: "domcontentloaded" });
  await mobile.locator('.intro-hero[data-intro-state="playing"]').waitFor();
  const started = Date.now();
  await waitForLive(mobile);
  const elapsed = Date.now() - started;
  assert(elapsed < 3100 && elapsed > 1900, `Unexpected mobile intro duration: ${elapsed}ms`);
  await mobile.screenshot({ path: `${output}/mobile-live.png` });
  results.push({ scenario: "mobile motion", passed: true, observedDurationMs: elapsed });
  await mobile.close();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noScript = await noScriptContext.newPage();
  monitor(noScript);
  await noScript.goto(baseURL);
  await noScript.getByRole("heading", { name: "Software for what’s next." }).waitFor({ state: "visible" });
  await noScript.screenshot({ path: `${output}/no-javascript.png` });
  results.push({ scenario: "server-rendered hero without JavaScript", passed: true });
  await noScriptContext.close();

  assert.deepEqual(errors, [], "Browser console, page, or network errors");
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ passed: results.length, errors, results }, null, 2));
  console.log(JSON.stringify({ passed: results.length, errors, screenshots: output, scenarios: results.map(({ scenario }) => scenario) }, null, 2));
} finally {
  await browser.close();
}
