import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseURL = process.env.NALT_QA_URL || "http://127.0.0.1:3400";
const output = "qa";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const errors = [];
const record = (scenario, evidence = {}) => results.push({ scenario, passed: true, ...evidence });
const monitor = (page) => {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
};
const waitForLive = (page) => page.locator('.intro-hero[data-intro-state="live"]').waitFor({ timeout: 12000 });

// Test-only browser sampling ends at LIVE. Screenshot encoding cannot make the
// short massive-wordmark hold or the overlapping headline phase disappear.
async function instrumentOpening(page) {
  await page.addInitScript(() => {
    const boot = performance.now();
    const samples = {};
    const phases = [];
    let started, phaseStarted = boot, previousPhase, originalMark;
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right };
    };
    const matrix = (element) => {
      const value = getComputedStyle(element).transform;
      const transform = new DOMMatrixReadOnly(value === "none" ? undefined : value);
      return { x: transform.m41, y: transform.m42, scale: transform.a };
    };
    const snapshot = (scene) => {
      const mark = scene.querySelector(".hero-mark");
      const boxes = [mark, ...scene.querySelectorAll(".letter-mask")].map(rect);
      const left = Math.min(...boxes.map((box) => box.x));
      const right = Math.max(...boxes.map((box) => box.right));
      return {
        elapsedMs: performance.now() - started,
        mark: rect(mark), markLayoutWidth: mark.offsetWidth,
        mainOutline: { opacity: Number(getComputedStyle(mark.querySelector(".mark-outline")).opacity), dashOffset: parseFloat(getComputedStyle(mark.querySelector(".mark-outline")).strokeDashoffset), length: mark.querySelector(".mark-outline").getTotalLength() },
        mainFillOpacity: Number(getComputedStyle(mark.querySelector(".mark-fill")).opacity),
        wordmark: { left, right, width: right - left, center: (left + right) / 2 },
        headlines: [...scene.querySelectorAll(".headline-line")].map((line) => {
          const mask = line.closest(".line-mask").getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(line);
          const text = range.getBoundingClientRect();
          return { ...matrix(line), height: line.offsetHeight, maskHeight: mask.height, visibleTextHeight: Math.max(0, Math.min(text.bottom, mask.bottom) - Math.max(text.top, mask.top)) };
        }),
        letters: ["n", "l", "t"].map((letter) => matrix(scene.querySelector(`.letter-${letter}`))),
        sameMark: originalMark === scene.querySelector(".hero-mark > svg"),
      };
    };
    const tick = () => {
      const scene = document.querySelector(".intro-hero");
      if (scene?.dataset.introState === "playing") {
        if (started === undefined) { started = performance.now(); originalMark = scene.querySelector(".hero-mark > svg"); }
        const phase = scene.dataset.introPhase;
        if (phase !== previousPhase) { previousPhase = phase; phaseStarted = performance.now(); if (phase && phase !== "init") phases.push(phase); }
        const elapsed = performance.now() - phaseStarted;
        const factor = innerWidth < 768 ? 1.2 : 1;
        if (phase === "draw" && elapsed >= 300 / factor && !samples.draw) samples.draw = snapshot(scene);
        if (phase === "massive" && elapsed >= 330 / factor && !samples.massive) samples.massive = snapshot(scene);
        if (phase === "break" && elapsed >= 280 / factor && !samples.break) samples.break = snapshot(scene);
        if (phase === "typography" && elapsed >= 100 / factor && !samples.overlap) samples.overlap = snapshot(scene);
      }
      if (scene?.dataset.introState === "live") {
        if (started !== undefined) samples.live = snapshot(scene);
        window.__qaOpening = { samples, phases, durationMs: started === undefined ? 0 : performance.now() - started };
        return;
      }
      if (performance.now() - boot < 15000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function openingEvidence(page, mobile = false) {
  await waitForLive(page);
  await page.waitForFunction(() => window.__qaOpening);
  const opening = await page.evaluate(() => window.__qaOpening);
  await fs.writeFile(`${output}/opening-${mobile ? "mobile" : "desktop"}.json`, JSON.stringify(opening, null, 2));
  const { samples } = opening;
  assert(samples.draw && samples.massive && samples.break && samples.overlap && samples.live, "A choreography phase was not recorded");
  assert.deepEqual(opening.phases, ["locate", "draw", "identify", "massive", "break", "expand", "typography", "resolve"], "Intro phases are out of order");
  assert(samples.draw.mainOutline.opacity > 0.9 && samples.draw.mainOutline.dashOffset > 0 && samples.draw.mainOutline.dashOffset < samples.draw.mainOutline.length, "The main A outline is not visibly drawing");
  assert(samples.draw.mainFillOpacity < 1, "The main A fill should still be resolving during draw");
  const width = page.viewportSize().width;
  const ratio = samples.massive.wordmark.width / width;
  assert(samples.draw.mark.width <= (mobile ? 110 : 190), "The opening A should begin restrained");
  assert(ratio >= (mobile ? 0.80 : 0.60) && ratio <= (mobile ? 0.90 : 0.75), `Unexpected large NALT reveal width: ${ratio}`);
  assert(Math.abs(samples.massive.wordmark.center - width / 2) < width * 0.03, "The complete NALT wordmark is not centered");
  assert(samples.break.letters[0].x < -20, "N must break left");
  assert(samples.break.letters[1].y > 20, "L must break downward");
  assert(samples.break.letters[2].x > 20 && samples.break.letters[2].y < -5, "T must break toward the upper right");
  assert(samples.overlap.mark.width < samples.overlap.markLayoutWidth * 0.995, "The A stopped before headline entry");
  assert(samples.overlap.headlines[0].y > 0 && samples.overlap.headlines[0].y < samples.overlap.headlines[0].maskHeight, "Headline must rise through its mask during expansion");
  assert(samples.overlap.headlines[0].visibleTextHeight > 0, "Headline glyphs do not intersect the mask while the A is still moving");
  assert(Object.values(samples).every((sample) => sample.sameMark), "The continuous A SVG was replaced");
  assert(samples.live.mark.right > width && samples.live.mark.width >= width * (mobile ? 1 : 0.60), "The resolved hero A should be large and cropped");
  assert(opening.durationMs > (mobile ? 2900 : 3500) && opening.durationMs < (mobile ? 4500 : 5500), `Unexpected intro duration: ${opening.durationMs}ms`);
  return opening;
}

async function transforms(page, selectors) {
  return page.evaluate((targets) => targets.map((selector) => {
    const value = getComputedStyle(document.querySelector(selector)).transform;
    const matrix = new DOMMatrixReadOnly(value === "none" ? undefined : value);
    return { x: matrix.m41, y: matrix.m42, scale: matrix.a };
  }), selectors);
}
async function activePreview(page, index) {
  const row = page.locator("[data-work-row]").nth(index);
  await page.waitForFunction((activeIndex) => {
    const rows = [...document.querySelectorAll("[data-work-row]")];
    return rows[activeIndex]?.dataset.active === "true" && rows.filter((element) => element.dataset.active === "true").length === 1;
  }, index);
  assert.equal(await row.locator("[data-work-action]").getAttribute("aria-expanded"), "true");
  const state = await row.locator("[data-work-preview]").evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: Number(style.opacity), clipPath: style.clipPath, width: element.getBoundingClientRect().width };
  });
  assert(state.width > 80, "The project preview is too small to be integrated into the row");
  return state;
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  monitor(desktop);
  await instrumentOpening(desktop);
  await desktop.goto(baseURL, { waitUntil: "domcontentloaded" });
  await desktop.locator('.intro-hero[data-intro-phase="draw"]').waitFor();
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: `${output}/desktop-draw.png` });
  await desktop.locator('.intro-hero[data-intro-phase="massive"]').waitFor();
  await desktop.waitForTimeout(330);
  await desktop.screenshot({ path: `${output}/desktop-massive.png` });
  const desktopOpening = await openingEvidence(desktop);
  await desktop.screenshot({ path: `${output}/desktop-live.png` });
  assert.equal(await desktop.locator(".studio-label").innerText(), "SOFTWARE\nDEVELOPMENT");
  assert.equal(await desktop.locator(".work-cta").getAttribute("href"), "#work");
  assert.equal(await desktop.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "WORK", exact: true }).getAttribute("href"), "#work");
  assert.equal(await desktop.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "CAPABILITIES", exact: true }).getAttribute("href"), "#capabilities");
  record("desktop choreography / massive NALT / directional exits / headline overlap / same SVG", { opening: desktopOpening });

  await desktop.mouse.move(720, 450);
  await desktop.waitForTimeout(550);
  const pointerBaseline = await transforms(desktop, [".hero-mark > svg", ".hero-heading"]);
  await desktop.mouse.move(1400, 100);
  await desktop.waitForTimeout(650);
  const pointer = await transforms(desktop, [".hero-mark > svg", ".hero-heading"]);
  assert(Math.abs(pointer[0].x) <= 4.1 && Math.abs(pointer[0].y) <= 4.1, "Hero A pointer movement exceeds its range");
  assert(Math.abs(pointer[1].x) <= 1.6 && Math.abs(pointer[1].y) <= 1.6, "Hero typography pointer movement exceeds its range");
  assert(Math.abs(pointer[0].x - pointerBaseline[0].x) > 0.5, "Desktop A did not respond to the pointer");
  assert(pointer[0].x * pointer[1].x <= 0, "Hero typography should respond in the opposite direction");
  await desktop.waitForTimeout(400);
  const idle = await transforms(desktop, [".hero-mark > svg", ".hero-heading"]);
  assert(idle.every((value, index) => Math.abs(value.x - pointer[index].x) < 0.05 && Math.abs(value.y - pointer[index].y) < 0.05), "Hero moves after pointer tween settles");
  record("desktop bounded pointer depth / opposing typography / settles without idle motion", { pointer });

  await desktop.evaluate(() => window.scrollTo({ top: document.querySelector(".intro-hero").clientHeight * 0.42, behavior: "instant" }));
  await desktop.waitForTimeout(400);
  const scrollTransition = await transforms(desktop, [".hero-mark-scroll", ".hero-content"]);
  assert(scrollTransition.some((value) => value.y < -1), "Hero layers do not continue upward into Work");
  assert.equal(await desktop.locator(".pin-spacer").count(), 0, "Normal scrolling must remain unpinned");
  await desktop.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await desktop.waitForTimeout(300);
  await desktop.locator(".work-cta").click();
  await desktop.waitForFunction(() => location.hash === "#work" && document.querySelector("#work").getBoundingClientRect().top < innerHeight * 0.3);
  assert.equal(await desktop.locator("[data-work-row]").count(), 4);
  await desktop.screenshot({ path: `${output}/work-entry.png`, fullPage: true });
  record("native Work anchors / hero scroll continuity / four rows", { scrollTransition });

  const actions = desktop.locator("[data-work-action]");
  await actions.nth(0).hover();
  await desktop.waitForTimeout(550);
  const firstPreview = await activePreview(desktop, 0);
  assert(firstPreview.opacity > 0.95 && !firstPreview.clipPath.includes("100%"), "Hovered preview stays transparent or clipped shut");
  await desktop.screenshot({ path: `${output}/work-hover-01.png` });
  await actions.nth(1).hover();
  await activePreview(desktop, 1);
  await desktop.waitForTimeout(550);
  await desktop.screenshot({ path: `${output}/work-hover-02.png` });
  const box = await actions.nth(1).boundingBox();
  await desktop.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7);
  await desktop.waitForTimeout(600);
  const imagePointer = await transforms(desktop, ['[data-work-row]:nth-child(2) [data-work-parallax]']);
  assert(Math.abs(imagePointer[0].x) <= 14.5 && Math.abs(imagePointer[0].y) <= 10.5, "Work parallax exceeds its range");
  await actions.nth(2).hover();
  await actions.nth(3).hover();
  await activePreview(desktop, 3);
  await desktop.waitForTimeout(500);
  record("masked hover / adjacent and rapid row switching / bounded image parallax", { firstPreview, imagePointer });

  await desktop.mouse.move(5, 5);
  await desktop.keyboard.press("Tab");
  await actions.nth(0).focus();
  await desktop.waitForTimeout(450);
  await activePreview(desktop, 0);
  await desktop.keyboard.press("Tab");
  assert(await actions.nth(1).evaluate((element) => element === document.activeElement), "Tab does not reach next project");
  await activePreview(desktop, 1);
  await desktop.keyboard.press("Escape");
  await desktop.waitForFunction(() => !document.querySelector('[data-work-row][data-active="true"]'));
  const placeholderURL = desktop.url();
  await desktop.keyboard.press("Enter");
  assert.equal(desktop.url(), placeholderURL, "Placeholder project navigates to an unavailable route");
  const semantics = await actions.evaluateAll((elements) => elements.map((element) => ({ name: element.textContent.trim(), hasPreview: !!document.getElementById(element.getAttribute("aria-controls")), expanded: element.getAttribute("aria-expanded") })));
  assert(semantics.every((row) => row.name && row.hasPreview && ["true", "false"].includes(row.expanded)), "Projects lack accessible names or controlled previews");
  record("keyboard equivalent preview / Tab / Escape / safe placeholder activation", { semantics });

  await desktop.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await desktop.waitForTimeout(350);
  await desktop.getByRole("link", { name: "NALT Studio home" }).click();
  await waitForLive(desktop);
  assert.equal(await desktop.locator(".intro-hero").getAttribute("data-intro-state"), "live", "Client home navigation replayed opening");
  await desktop.emulateMedia({ reducedMotion: "reduce" });
  await desktop.waitForTimeout(300);
  const reducedBefore = await transforms(desktop, [".hero-mark > svg", ".hero-heading"]);
  await desktop.mouse.move(50, 200);
  await desktop.waitForTimeout(350);
  assert.deepEqual(await transforms(desktop, [".hero-mark > svg", ".hero-heading"]), reducedBefore, "Reduced motion leaves pointer interaction enabled");
  await desktop.emulateMedia({ reducedMotion: "no-preference" });
  await waitForLive(desktop);
  record("client home navigation / runtime reduced-motion cleanup");
  await desktop.close();

  for (const [width, height] of [[1920,1080], [1440,900], [1024,768], [768,1024], [390,844], [320,640], [320,568], [844,390], [667,375]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    monitor(page);
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await waitForLive(page);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const rect = (selector) => { const box = document.querySelector(selector).getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom }; };
      const visibility = (element) => {
        let opacity = 1;
        for (let current = element; current; current = current.parentElement) {
          const style = getComputedStyle(current);
          if (style.display === "none" || style.visibility === "hidden") return 0;
          opacity *= Number(style.opacity);
        }
        return opacity;
      };
      const fill = document.querySelector(".hero-mark .mark-fill");
      const inverse = fill.getScreenCTM().inverse();
      let metadataOverOrange = false;
      for (const selector of [".global-metadata", ".description"]) {
        const nodes = document.createTreeWalker(document.querySelector(selector), NodeFilter.SHOW_TEXT);
        while (nodes.nextNode()) {
          if (!nodes.currentNode.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(nodes.currentNode);
          for (const box of range.getClientRects()) for (const fraction of [0.1, 0.5, 0.9]) {
            const point = new DOMPoint(box.x + box.width * fraction, box.y + box.height / 2).matrixTransform(inverse);
            if (fill.isPointInFill(point)) metadataOverOrange = true;
          }
        }
      }
      return {
        documentWidth: document.documentElement.scrollWidth, hero: rect(".intro-hero"), heading: rect(".hero-heading"),
        lines: [...document.querySelectorAll(".headline-line")].map((line) => { const range = document.createRange(); range.selectNodeContents(line); return { visible: getComputedStyle(line).transform === "none", textWidth: range.getBoundingClientRect().width }; }),
        cta: rect(".work-cta"), metadata: rect(".viewport-metadata"),
        decorationVisibility: [...document.querySelectorAll(".coordinate-system, .identity-fragments, .mark-ghost, .scan-line")].map(visibility),
        sectionCount: document.querySelectorAll("main section").length, rowCount: document.querySelectorAll("[data-work-row]").length, metadataOverOrange,
      };
    });
    assert(layout.documentWidth <= width, `Horizontal overflow at ${width}x${height}`);
    assert(layout.hero.height <= height + 1, `Hero exceeds viewport at ${width}x${height}`);
    assert(layout.lines.every((line) => line.visible && line.textWidth <= layout.heading.width + 1), `Headline clipped at ${width}x${height}`);
    assert(layout.cta.bottom + 12 < layout.metadata.y, `CTA collides with metadata at ${width}x${height}`);
    assert(layout.decorationVisibility.every((opacity) => opacity === 0), "Intro decoration remains visible after resolution");
    assert.equal(layout.sectionCount, 3, "Homepage must end after hero, Selected Work, and Capabilities");
    assert.equal(layout.rowCount, 4);
    assert.equal(layout.metadataOverOrange, false, `Supporting copy or metadata is over orange at ${width}x${height}`);
    await page.locator("#work").scrollIntoViewIfNeeded();
    const bounds = await page.locator("[data-work-row]").evaluateAll((elements) => elements.map((element) => {
      const action = element.querySelector("[data-work-action]");
      const title = element.querySelector("[data-work-title]");
      const row = element.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(title);
      return { left: row.left, right: row.right, targetHeight: action.getBoundingClientRect().height, titleWidth: range.getBoundingClientRect().width, availableTitleWidth: title.getBoundingClientRect().width };
    }));
    assert(bounds.every((row) => row.left >= -1 && row.right <= width + 1 && row.targetHeight >= 44 && row.titleWidth <= row.availableTitleWidth + 1), `Work layout or targets fail at ${width}x${height}`);
    await page.keyboard.press("Tab");
    await page.locator("[data-work-action]").nth(0).focus();
    const preview = await activePreview(page, 0);
    assert(preview.opacity > 0.95 && !preview.clipPath.includes("100%"), "Reduced motion preview should appear immediately");
    await page.screenshot({ path: `${output}/live-${width}x${height}.png`, fullPage: true });
    if (width < 768) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const menu = page.getByRole("button", { name: "MENU" });
      await menu.click();
      await page.getByRole("navigation", { name: "Primary" }).waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert(await menu.evaluate((element) => element === document.activeElement));
      await menu.click();
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "WORK", exact: true }).click();
      assert.equal(await menu.getAttribute("aria-expanded"), "false", "Menu stays open after choosing Work");
    }
    record(`${width}x${height} / reduced motion / responsive hero and Work${width < 768 ? " / menu" : ""}`, { layout, bounds });
    await context.close();
  }

  const skip = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  monitor(skip);
  await skip.goto(baseURL, { waitUntil: "domcontentloaded" });
  await skip.getByRole("button", { name: "SKIP INTRO" }).waitFor({ state: "visible" });
  await skip.getByRole("link", { name: "NALT Studio home" }).focus();
  assert.equal(await skip.locator(".navigation").evaluate((element) => getComputedStyle(element).opacity), "1", "Focused navigation must remain visible during opening");
  await skip.getByRole("button", { name: "SKIP INTRO" }).focus();
  await skip.keyboard.press("Enter");
  await waitForLive(skip);
  assert.equal(await skip.locator(".hero-mark").evaluate((element) => getComputedStyle(element).transform), "none");
  assert(await skip.getByRole("link", { name: "NALT Studio home" }).evaluate((element) => element === document.activeElement));
  record("keyboard skip / focused navigation / focus restoration");
  await skip.reload({ waitUntil: "domcontentloaded" });
  await skip.locator('.intro-hero[data-intro-state="playing"]').waitFor();
  await skip.setViewportSize({ width: 390, height: 844 });
  await waitForLive(skip);
  assert.equal(await skip.locator(".hero-mark").evaluate((element) => getComputedStyle(element).transform), "none");
  record("reload replay / resize during opening resolves");
  await skip.reload({ waitUntil: "domcontentloaded" });
  await skip.locator('.intro-hero[data-intro-state="playing"]').waitFor();
  await skip.emulateMedia({ reducedMotion: "reduce" });
  await waitForLive(skip);
  assert.equal(await skip.locator(".headline-line").first().evaluate((element) => getComputedStyle(element).transform), "none");
  record("reduced motion changed during opening resolves cleanly");
  await skip.close();

  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  monitor(touch);
  await instrumentOpening(touch);
  await touch.goto(baseURL, { waitUntil: "domcontentloaded" });
  const mobileOpening = await openingEvidence(touch, true);
  await touch.screenshot({ path: `${output}/mobile-live.png` });
  const touchBefore = await transforms(touch, [".hero-mark > svg", ".hero-heading"]);
  await touch.mouse.move(370, 100);
  await touch.waitForTimeout(350);
  assert.deepEqual(await transforms(touch, [".hero-mark > svg", ".hero-heading"]), touchBefore, "Touch devices must not run hero parallax");
  const touchActions = touch.locator("[data-work-action]");
  await touchActions.nth(0).tap();
  await touch.waitForTimeout(450);
  await activePreview(touch, 0);
  const touchURL = touch.url();
  await touchActions.nth(0).tap();
  await touch.waitForFunction(() => !document.querySelector('[data-work-row][data-active="true"]'));
  assert.equal(touch.url(), touchURL, "Second tap on placeholder must not navigate");
  await touchActions.nth(1).tap();
  await touchActions.nth(2).tap();
  await touch.waitForTimeout(450);
  await activePreview(touch, 2);
  const touchImage = await transforms(touch, ['[data-work-row]:nth-child(3) [data-work-parallax]']);
  assert(Math.abs(touchImage[0].x) < 0.01 && Math.abs(touchImage[0].y) < 0.01, "Touch imagery must not use pointer parallax");
  await touch.locator("[data-work-row]").nth(2).evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await touch.waitForTimeout(200);
  await touch.screenshot({ path: `${output}/mobile-work-tap.png` });
  record("mobile choreography / no parallax / first-tap reveal / second-tap close / row switching", { opening: mobileOpening });
  await touch.close();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noScript = await noScriptContext.newPage();
  monitor(noScript);
  await noScript.goto(baseURL);
  await noScript.getByRole("heading", { name: "Software for what’s next." }).waitFor({ state: "visible" });
  assert.equal(await noScript.locator("[data-work-row]").count(), 4);
  const previews = await noScript.locator("[data-work-preview]").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { visible: style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0, clipPath: style.clipPath };
  }));
  assert(previews.every((preview) => preview.visible && !preview.clipPath.includes("100%")), "Project visuals must remain available without JavaScript");
  const images = await noScript.locator("[data-work-image]").evaluateAll((elements) => elements.map((element) => {
    const image = element.querySelector("img");
    return image ? { loaded: image.complete && image.naturalWidth > 0, alt: image.getAttribute("alt"), source: image.getAttribute("src") } : { placeholder: element.textContent.includes("PREVIEW PENDING"), decorativeGeometry: element.querySelector('svg[aria-hidden="true"]') !== null };
  }));
  assert.equal(images.length, 4, "Each project needs an honest visual placeholder or supplied image");
  assert(images.every((image) => image.placeholder ? image.decorativeGeometry : image.loaded && image.alt !== null), "Project visuals are missing or not honestly labelled");
  await noScript.screenshot({ path: `${output}/no-javascript.png`, fullPage: true });
  record("server-rendered hero and four project visuals without JavaScript", { previews, images });
  await noScriptContext.close();

  assert.deepEqual(errors, [], "Browser console, page, or HTTP errors");
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ passed: results.length, errors, results }, null, 2));
  console.log(JSON.stringify({ passed: results.length, errors, screenshots: output, scenarios: results.map(({ scenario }) => scenario) }, null, 2));
} finally {
  await browser.close();
}
