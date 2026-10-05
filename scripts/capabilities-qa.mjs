import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseURL = process.env.NALT_QA_URL || "http://127.0.0.1:3400";
const output = "qa";
const titles = ["WEBSITES", "E-COMMERCE", "DIGITAL PRODUCTS", "CUSTOM PLATFORMS"];
const results = [];
const errors = [];
let scenario = "initialization";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const record = (name, evidence = {}) => results.push({ scenario: name, passed: true, ...evidence });
const monitor = (page) => {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
};

async function open(context) {
  const page = await context.newPage();
  monitor(page);
  await page.addInitScript(() => {
    const sample = () => {
      const section = document.querySelector("#capabilities");
      const stages = section?.querySelectorAll("[data-capability-stage]");
      if (stages?.length !== 4 || section.querySelectorAll('[data-system-shared="true"] [data-system-unit]').length !== 3) return;
      window.__qaCapabilitiesFirstLayout = {
        enhancedBeforeHydration: document.documentElement.classList.contains("capabilities-enhanced"),
        stages: [...stages].map((stage) => {
          const bounds = stage.getBoundingClientRect();
          return { top: bounds.top + scrollY, height: bounds.height };
        }),
      };
      observer.disconnect();
    };
    const observer = new MutationObserver(sample);
    observer.observe(document, { childList: true, subtree: true });
    sample();
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator('.intro-hero[data-intro-state="live"]').waitFor({ timeout: 12000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.querySelector("#capabilities")?.dataset.layout);
  return page;
}

async function centers(page) {
  return page.locator("[data-capability-node]").evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.top + scrollY + bounds.height / 2;
  }));
}

async function scrollPoint(page, documentPoint, settle = 650) {
  await page.evaluate((point) => window.scrollTo({ top: point - innerHeight * 0.46, behavior: "instant" }), documentPoint);
  await page.waitForTimeout(settle);
}

async function activation(page) {
  return page.locator("#capabilities").evaluate((section) => {
    const progress = section.querySelector("[data-capability-progress]");
    const parent = progress.parentElement.getBoundingClientRect();
    const bounds = progress.getBoundingClientRect();
    return {
      layout: section.dataset.layout,
      activeStage: Number(section.dataset.activeStage),
      activeIndices: [...section.querySelectorAll('[data-capability-stage][data-active="true"]')].map((stage) => Number(stage.dataset.stageIndex)),
      progress: parent.height > 0 ? bounds.height / parent.height : 0,
      progressEnd: bounds.bottom,
      progressBounds: { top: bounds.top, height: bounds.height },
      nodes: [...section.querySelectorAll("[data-capability-node]")].map((node) => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return { x: box.x + box.width / 2, y: box.y + box.height / 2, width: box.width, color: style.backgroundColor, border: style.borderColor };
      }),
    };
  });
}

async function expectActive(page, index) {
  await page.waitForFunction((active) => {
    const section = document.querySelector("#capabilities");
    const stages = [...section.querySelectorAll("[data-capability-stage]")];
    return Number(section.dataset.activeStage) === active
      && stages[active]?.dataset.active === "true"
      && stages.filter((stage) => stage.dataset.active === "true").length === 1;
  }, index);
  const state = await activation(page);
  assert.deepEqual(state.activeIndices, [index], `Only stage ${index + 1} should be dominant`);
  assert(state.progress >= -0.01 && state.progress <= 1.01, "Spine progress is outside its structural track");
  assert(Math.max(...state.nodes.map((node) => node.x)) - Math.min(...state.nodes.map((node) => node.x)) < 3, "Capability nodes do not share one vertical spine");
  assert(Math.abs(state.progressEnd - state.nodes[index].y) < 6, "Orange spine does not terminate at the current stage node");
  assert.equal(state.nodes[index].color, "rgb(255, 75, 0)", "Current registration node must use signal orange");
  return state;
}

async function mechanism(page, staticStage = null) {
  const selector = staticStage === null
    ? '[data-system-visual][data-system-shared="true"]'
    : `[data-capability-stage][data-stage-index="${staticStage}"] [data-system-visual]`;
  return page.locator(selector).evaluate((visual) => ({
    opacity: Number(getComputedStyle(visual).opacity),
    units: [...visual.querySelectorAll("[data-system-unit]")].map((unit) => {
      const transform = unit.transform.baseVal.consolidate()?.matrix || new DOMMatrix();
      const primitive = unit.matches("rect, ellipse, circle") ? unit : unit.querySelector("rect, ellipse, circle");
      const attribute = (name) => parseFloat(primitive?.getAttribute(name) || "0");
      const corners = [[attribute("x"), attribute("y")], [attribute("x") + attribute("width"), attribute("y") + attribute("height")]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(transform));
      return {
        geometry: [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f, ...["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r"].map(attribute)],
        bounds: { left: corners[0].x, top: corners[0].y, right: corners[1].x, bottom: corners[1].y },
        opacity: Number(getComputedStyle(unit).opacity),
      };
    }),
  }));
}

function distance(first, second) {
  return first.units.reduce((sum, unit, index) => sum + unit.geometry.reduce((total, value, dimension) => total + Math.abs(value - second.units[index].geometry[dimension]), 0), 0);
}

async function layout(page) {
  return page.locator("#capabilities").evaluate((section) => {
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const visibility = (element) => {
      let opacity = 1;
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === "none" || style.visibility === "hidden") return 0;
        opacity *= Number(style.opacity);
      }
      return opacity;
    };
    const lines = (element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const boxes = [];
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        boxes.push(...[...range.getClientRects()].map((box) => ({ left: box.left, right: box.right, top: box.top, bottom: box.bottom })));
      }
      return boxes;
    };
    const shared = section.querySelector("[data-capability-shared]");
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewport: { width: innerWidth, height: innerHeight },
      layout: section.dataset.layout,
      section: rect(section),
      shared: { bounds: rect(shared), visibility: visibility(shared), position: getComputedStyle(shared).position },
      stages: [...section.querySelectorAll("[data-capability-stage]")].map((stage) => {
        const visual = stage.querySelector("[data-stage-visual]");
        const text = [...stage.querySelectorAll("[data-capability-title], [data-capability-copy], [data-capability-tags]")];
        return {
          bounds: rect(stage),
          documentTop: rect(stage).top + scrollY,
          text: text.map((element) => ({ bounds: rect(element), lines: lines(element), opacity: visibility(element), fontSize: parseFloat(getComputedStyle(element).fontSize), content: element.textContent.trim() })),
          visual: { bounds: rect(visual), visibility: visibility(visual), position: getComputedStyle(visual).position },
        };
      }),
      pinSpacers: document.querySelectorAll(".pin-spacer").length,
    };
  });
}

function inspectLayout(evidence, label, { animated = false } = {}) {
  const { viewport, stages } = evidence;
  assert(evidence.documentWidth <= viewport.width + 1, `Horizontal overflow: ${label}`);
  assert.equal(evidence.pinSpacers, 0, `Native scroll must remain unpinned: ${label}`);
  assert.equal(stages.length, 4);
  for (const [index, stage] of stages.entries()) {
    assert(stage.bounds.left >= -1 && stage.bounds.right <= viewport.width + 1, `Stage ${index + 1} exceeds viewport: ${label}`);
    for (const text of stage.text) {
      assert(text.opacity >= 0.3, `Capability content becomes unreadable: ${label}`);
      assert(text.lines.length > 0, `Capability text is absent: ${label}`);
      assert(text.lines.every((line) => line.left >= -1 && line.right <= viewport.width + 1), `Capability text is horizontally clipped: ${label}`);
      assert(text.lines.every((line) => line.left >= text.bounds.left - 1 && line.right <= text.bounds.right + 1), `Text exceeds its own column: ${label}`);
      const visual = evidence.layout === "desktop" ? evidence.shared : stage.visual;
      if (visual.visibility > 0 && text.bounds.bottom > visual.bounds.top && text.bounds.top < visual.bounds.bottom) {
        assert(text.lines.every((line) => line.right <= visual.bounds.left + 1 || line.left >= visual.bounds.right - 1 || line.bottom <= visual.bounds.top + 1 || line.top >= visual.bounds.bottom - 1), `Capability text overlaps its visual: ${label}`);
      }
    }
    if (evidence.layout !== "desktop") {
      assert(stage.visual.visibility > 0.95 && stage.visual.bounds.width > 100 && stage.visual.bounds.height > 70, `Inline visual is absent: ${label}`);
      assert.notEqual(stage.visual.position, "sticky", `Inline visual must not lock the viewport: ${label}`);
      assert(stage.visual.bounds.top >= Math.max(...stage.text.map((text) => text.bounds.bottom)) - 1, `Inline visual must follow the copy: ${label}`);
    }
  }
  if (animated && evidence.layout === "desktop") assert(evidence.shared.visibility > 0.95, `Shared system is hidden: ${label}`);
}

try {
  scenario = "scope and semantics";
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await open(desktopContext);
  const structure = await desktop.evaluate(() => {
    const section = document.querySelector("#capabilities");
    const work = document.querySelector("#work");
    const stages = [...section.querySelectorAll("[data-capability-stage]")];
    const lastWorkRow = work.querySelectorAll("[data-work-row]")[3];
    return {
      sectionIds: [...document.querySelectorAll("main > section")].map((element) => element.id),
      previousIsWork: section.previousElementSibling === work,
      lastIsCapabilities: document.querySelector("main").lastElementChild === section,
      footerCount: document.querySelectorAll("footer").length,
      sectionLabel: document.getElementById(section.getAttribute("aria-labelledby"))?.textContent.trim(),
      stageTags: stages.map((stage) => stage.tagName),
      headings: stages.map((stage) => ({ tag: stage.querySelector("[data-capability-title]").tagName, text: stage.querySelector("[data-capability-title]").textContent.replace(/\s+/g, " ").trim().toUpperCase() })),
      descriptions: stages.map((stage) => stage.querySelectorAll("p[data-capability-copy]").length),
      svgSemantics: [...section.querySelectorAll("svg")].map((svg) => ({ hidden: svg.getAttribute("aria-hidden"), focusable: svg.getAttribute("focusable") })),
      junctionGap: section.getBoundingClientRect().top - work.getBoundingClientRect().bottom,
      labelGap: section.querySelector("h2").getBoundingClientRect().top - lastWorkRow.getBoundingClientRect().bottom,
    };
  });
  assert.equal(structure.sectionIds.length, 3, "Only Hero, Selected Work, and Capabilities should exist");
  assert(structure.previousIsWork && structure.lastIsCapabilities, "Capabilities must directly follow Work and end the homepage");
  assert.equal(structure.footerCount, 0, "Footer is outside this iteration");
  assert(structure.sectionLabel.includes("WHAT WE BUILD"), "Section lacks its technical label");
  assert.deepEqual(structure.stageTags, ["ARTICLE", "ARTICLE", "ARTICLE", "ARTICLE"]);
  assert.deepEqual(structure.headings, titles.map((text) => ({ tag: "H3", text })));
  assert(structure.descriptions.every((count) => count === 1), "Each capability should have one concise supporting sentence");
  assert(structure.svgSemantics.length >= 5 && structure.svgSemantics.every((svg) => svg.hidden === "true" && svg.focusable !== "true"), "System visuals must remain decorative");
  assert(Math.abs(structure.junctionGap) < 2 && structure.labelGap < 300, "Work-to-Capabilities has an unintended blank gap");
  record(scenario, { structure });

  scenario = "desktop forward progression and continuous system";
  assert.equal(await desktop.locator("#capabilities").getAttribute("data-layout"), "desktop");
  const points = await centers(desktop);
  const unitHandles = await desktop.locator('[data-system-visual][data-system-shared="true"] [data-system-unit]').elementHandles();
  assert.equal(unitHandles.length, 3, "The continuous mechanism should share three system primitives");
  const states = [];
  const endpoints = [];
  const stableBounds = [];
  for (let index = 0; index < 4; index++) {
    await scrollPoint(desktop, points[index]);
    states.push(await expectActive(desktop, index));
    endpoints.push(await mechanism(desktop));
    const staticReference = await mechanism(desktop, index);
    assert(distance(endpoints[index], staticReference) < 3, `Animated stage ${index + 1} does not match its supplied static geometry`);
    assert(endpoints[index].units.every((unit) => unit.bounds.left >= 0 && unit.bounds.top >= 0 && unit.bounds.right <= 600 && unit.bounds.bottom <= 440), "Shared geometry is displaced outside its SVG viewport");
    const evidence = await layout(desktop);
    inspectLayout(evidence, `desktop stage ${index + 1}`, { animated: true });
    stableBounds.push(evidence.stages.map((stage) => ({ top: stage.documentTop, height: stage.bounds.height })));
    await desktop.screenshot({ path: `${output}/capabilities-desktop-0${index + 1}.png` });
    for (const [unitIndex, handle] of unitHandles.entries()) {
      assert(await handle.evaluate((element, position) => element === document.querySelector('[data-system-visual][data-system-shared="true"]').querySelectorAll("[data-system-unit]")[position], unitIndex), "A system primitive was replaced between stages");
    }
  }
  assert(states.every((state, index) => index === 0 || state.progress > states[index - 1].progress + 0.1), "Orange spine does not advance through the four nodes");
  const firstPaint = await desktop.evaluate(() => window.__qaCapabilitiesFirstLayout);
  assert(firstPaint?.enhancedBeforeHydration, "Desktop enhancement must reserve its layout before hydration");
  for (const [index, bounds] of firstPaint.stages.entries()) {
    assert(Math.abs(bounds.top - stableBounds[0][index].top) < 1 && Math.abs(bounds.height - stableBounds[0][index].height) < 1, "Capabilities shifts from server markup to its animated desktop layout");
  }
  for (const bounds of stableBounds.slice(1)) for (let index = 0; index < 4; index++) {
    assert(Math.abs(bounds[index].top - stableBounds[0][index].top) < 1 && Math.abs(bounds[index].height - stableBounds[0][index].height) < 1, "Scroll activation changes section layout");
  }
  const transitions = [];
  for (let index = 0; index < 3; index++) {
    assert(distance(endpoints[index], endpoints[index + 1]) > 15, `System mechanisms ${index + 1} and ${index + 2} are not distinct`);
    await scrollPoint(desktop, (points[index] + points[index + 1]) / 2);
    const middle = await mechanism(desktop);
    assert(middle.opacity > 0.95 && middle.units.every((unit) => unit.opacity >= 0.1), "The shared system disappears during a transition");
    assert(distance(middle, endpoints[index]) > 3 && distance(middle, endpoints[index + 1]) > 3, "System geometry hard-cuts between endpoints rather than transforming continuously");
    transitions.push({ from: index, to: index + 1, startDistance: distance(middle, endpoints[index]), endDistance: distance(middle, endpoints[index + 1]), middle });
    await desktop.screenshot({ path: `${output}/capabilities-transform-0${index + 1}.png` });
  }
  record(scenario, { points, states, endpoints, transitions, stableBounds: stableBounds[0], firstPaint });

  scenario = "reverse progression and native anchors";
  const reversed = [];
  for (let index = 3; index >= 0; index--) {
    await scrollPoint(desktop, points[index]);
    reversed.push(await expectActive(desktop, index));
  }
  assert(reversed.every((state, index) => index === 0 || state.progress < reversed[index - 1].progress - 0.1), "Spine does not reverse with native scroll");
  await desktop.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await desktop.waitForTimeout(350);
  const desktopAnchor = desktop.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "CAPABILITIES", exact: true });
  assert.equal(await desktopAnchor.getAttribute("href"), "#capabilities");
  await desktopAnchor.focus();
  await desktop.keyboard.press("Enter");
  await desktop.waitForFunction(() => location.hash === "#capabilities" && document.querySelector("#capabilities").getBoundingClientRect().top < innerHeight * 0.25);
  record(scenario, { reversed });

  scenario = "dynamic reduced-motion cleanup and reinstallation";
  await scrollPoint(desktop, points[2]);
  await desktop.emulateMedia({ reducedMotion: "reduce" });
  await desktop.waitForFunction(() => document.querySelector("#capabilities").dataset.layout === "static");
  const reducedGeometry = await mechanism(desktop);
  const reduced = await layout(desktop);
  inspectLayout(reduced, "dynamic reduced motion");
  await scrollPoint(desktop, (await centers(desktop))[0]);
  assert.deepEqual(await mechanism(desktop), reducedGeometry, "A hidden scroll-scrubbed system remains animated in reduced motion");
  await desktop.emulateMedia({ reducedMotion: "no-preference" });
  await desktop.waitForFunction(() => document.querySelector("#capabilities").dataset.layout === "desktop");
  const restoredPoints = await centers(desktop);
  await scrollPoint(desktop, restoredPoints[1]);
  const restored = await expectActive(desktop, 1);
  await scrollPoint(desktop, restoredPoints[3]);
  await expectActive(desktop, 3);
  assert(distance(await mechanism(desktop), endpoints[3]) < 3, "Restored motion retains stale or duplicate transforms");
  record(scenario, { reducedLayout: reduced.layout, restored });

  scenario = "runtime desktop-to-tablet resize cleanup";
  await desktop.setViewportSize({ width: 1024, height: 768 });
  await desktop.waitForFunction(() => document.querySelector("#capabilities").dataset.layout === "inline");
  await scrollPoint(desktop, (await centers(desktop))[2]);
  const tabletState = await expectActive(desktop, 2);
  inspectLayout(await layout(desktop), "runtime tablet resize");
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.waitForFunction(() => document.querySelector("#capabilities").dataset.layout === "desktop");
  await scrollPoint(desktop, (await centers(desktop))[1]);
  const desktopState = await expectActive(desktop, 1);
  assert(distance(await mechanism(desktop), endpoints[1]) < 3, "Responsive restoration leaves stale system geometry");
  inspectLayout(await layout(desktop), "restored desktop resize", { animated: true });
  record(scenario, { tabletState, desktopState });
  await desktopContext.close();

  for (const [width, height] of [[1920,1080], [1100,800], [1024,768], [768,1024], [390,844], [320,640], [320,568], [844,390], [667,375]]) {
    scenario = `${width}x${height} native progression and layout`;
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1100, isMobile: width < 768 });
    const page = await open(context);
    const pagePoints = await centers(page);
    const statesAtSize = [];
    const expectedLayout = width >= 1100 ? "desktop" : "inline";
    assert.equal(await page.locator("#capabilities").getAttribute("data-layout"), expectedLayout);
    for (let index = 0; index < 4; index++) {
      await scrollPoint(page, pagePoints[index], 400);
      statesAtSize.push(await expectActive(page, index));
      inspectLayout(await layout(page), `${width}x${height} stage ${index + 1}`, { animated: true });
      if (index === 0 || index === 3 || width <= 390) await page.screenshot({ path: `${output}/capabilities-${width}x${height}-0${index + 1}.png` });
    }
    assert(statesAtSize.every((state, index) => index === 0 || state.progress > statesAtSize[index - 1].progress + 0.1), `Spine progression fails at ${width}x${height}`);
    if (width < 768) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(200);
      const menu = page.getByRole("button", { name: "MENU", exact: false });
      await menu.click();
      const nav = page.getByRole("navigation", { name: "Primary" });
      await nav.getByRole("link", { name: "CAPABILITIES", exact: true }).click();
      await page.waitForFunction(() => location.hash === "#capabilities" && document.querySelector("#capabilities").getBoundingClientRect().top < innerHeight * 0.25);
      assert.equal(await menu.getAttribute("aria-expanded"), "false", "Choosing Capabilities must close the mobile menu");
    }
    record(scenario, { layout: expectedLayout, states: statesAtSize });
    await context.close();
  }

  for (const [width, height] of [[1440,900], [1024,768], [390,844], [320,568]]) {
    scenario = `${width}x${height} reduced-motion static system`;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: width < 1100, isMobile: width < 768 });
    const page = await open(context);
    assert.equal(await page.locator("#capabilities").getAttribute("data-layout"), "static");
    const before = await mechanism(page);
    for (const [index, point] of (await centers(page)).entries()) {
      await scrollPoint(page, point, 150);
      inspectLayout(await layout(page), `reduced ${width}x${height} stage ${index + 1}`);
      assert.deepEqual(await mechanism(page), before, "Reduced motion contains a scrubbed transformation");
    }
    await page.screenshot({ path: `${output}/capabilities-reduced-${width}x${height}.png` });
    record(scenario);
    await context.close();
  }

  for (const [width, height] of [[1440,900], [320,568]]) {
    scenario = `${width}x${height} server-rendered static system without JavaScript`;
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: false });
    const page = await context.newPage();
    monitor(page);
    await page.goto(baseURL, { waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-capability-stage]").count(), 4);
    assert.equal(await page.locator("#capabilities").getAttribute("data-layout"), "static");
    await page.evaluate(() => document.fonts.ready);
    const snapshots = [];
    for (const [index, point] of (await centers(page)).entries()) {
      await scrollPoint(page, point, 50);
      const evidence = await layout(page);
      inspectLayout(evidence, `no JavaScript ${width}x${height} stage ${index + 1}`);
      snapshots.push({ stage: index, visualWidth: evidence.stages[index].visual.bounds.width, textOpacity: evidence.stages[index].text.map((text) => text.opacity) });
      if (index === 0 || index === 3) await page.screenshot({ path: `${output}/capabilities-no-js-${width}-0${index + 1}.png` });
    }
    record(scenario, { snapshots });
    await context.close();
  }

  scenario = "browser console, page, and HTTP errors";
  assert.deepEqual(errors, [], "Browser console, page, or HTTP errors");
  record(scenario);
  await fs.writeFile(`${output}/capabilities-results.json`, JSON.stringify({ passed: results.length, errors, results }, null, 2));
  console.log(JSON.stringify({ passed: results.length, errors, screenshots: output, scenarios: results.map((result) => result.scenario) }, null, 2));
} catch (error) {
  await fs.writeFile(`${output}/capabilities-results.json`, JSON.stringify({ passed: results.length, failedScenario: scenario, failure: error.message, errors, results }, null, 2));
  console.error(`Capabilities QA failed during ${scenario}: ${error.message}`);
  throw error;
} finally {
  await browser.close();
}
